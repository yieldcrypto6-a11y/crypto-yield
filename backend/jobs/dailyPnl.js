import UserPackage from "../models/UserPackage.js";
import Earning from "../models/Earning.js";
import User from "../models/User.js";
import PlatformSettings from "../models/PlatformSettings.js";
import DailyPnl from "../models/DailyPnl.js";

/**
 * Distributes a single platform calendar day's REAL trading result to every
 * investor and referrer. This is the entire "income engine" — there is no
 * fixed/guaranteed payout anywhere. Everything flows from `pnlPercent`, which
 * an admin enters after the day's actual trading is known.
 *
 * Rules implemented (per platform design):
 *  - A package only earns starting the platform-day AFTER it was activated.
 *  - A user's daily result = their principal (summed across ALL their active
 *    packages) x investorShareRate x pnlPercent/100. Multiple simultaneously
 *    active packages simply stack — their principals add together.
 *  - On a loss day (pnlPercent < 0), investors' shares are negative — deducted
 *    from their balance — and referral bonuses for that day are 0, never negative.
 *  - A referral bonus is only computed off principal that itself got credited
 *    today, so a referrer's bonus naturally starts the same day their downline's
 *    own income starts (not at signup, not at purchase).
 *
 * @param {string} dateStr - platform calendar date "YYYY-MM-DD" this P&L is for
 * @param {number} pnlPercent - the real, admin-reported result for that day
 */
export async function processDailyPnl(dateStr, pnlPercent, adminId) {
  const record = await DailyPnl.findOne({ date: dateStr });
  if (record?.processed) throw new Error(`${dateStr} has already been processed`);

  const settings = await PlatformSettings.getSettings();
  const now = new Date();

  // Expire any package whose window has ended.
  const allActive = await UserPackage.find({ status: "active" });
  for (const up of allActive) {
    if (up.endDate && up.endDate.getTime() <= now.getTime()) {
      up.status = "expired";
      await up.save();
    }
  }

  // Eligible: active, earning window started, not already credited for this date.
  const candidates = await UserPackage.find({
    status: "active",
    startDate: { $lte: now },
    creditedDates: { $ne: dateStr }
  });

  let investorsCredited = 0;
  let totalInvestorPayout = 0;
  const creditedPrincipalByUser = new Map(); // userId -> principal credited today

  for (const up of candidates) {
    const shareRate = up.investorShareRate ?? settings.investorShareRate;
    const amount = +(up.pricePaid * (shareRate / 100) * (pnlPercent / 100)).toFixed(4);

    await Earning.create({
      user: up.user, userPackage: up._id, amount, type: "Daily P&L", pnlDate: dateStr,
      note: `${pnlPercent >= 0 ? "Profit" : "Loss"} share (${shareRate}% of ${pnlPercent}% platform result)`
    });
    await User.findByIdAndUpdate(up.user, { $inc: { availableBalance: amount, totalEarnings: amount } });

    up.totalCredited = +(up.totalCredited + amount).toFixed(4);
    up.daysCredited += 1;
    up.creditedDates.push(dateStr);
    await up.save();

    investorsCredited++;
    totalInvestorPayout += amount;

    const key = String(up.user);
    creditedPrincipalByUser.set(key, (creditedPrincipalByUser.get(key) || 0) + up.pricePaid);
  }

  // Referral bonuses: only on profit days, only on principal that was credited today,
  // only for users who have an upline referrer.
  let referralsCredited = 0;
  let totalReferralPayout = 0;

  if (pnlPercent > 0 && creditedPrincipalByUser.size) {
    const userIds = [...creditedPrincipalByUser.keys()];
    const downlineUsers = await User.find({ _id: { $in: userIds }, referredBy: { $ne: null } }).select("_id referredBy name");

    for (const downline of downlineUsers) {
      const principal = creditedPrincipalByUser.get(String(downline._id));
      const bonus = +(principal * (settings.referralShareRate / 100) * (pnlPercent / 100)).toFixed(4);
      if (bonus <= 0) continue;

      await Earning.create({
        user: downline.referredBy, amount: bonus, type: "Referral Bonus", pnlDate: dateStr,
        note: `Referral share from ${downline.name}'s active principal (profit day)`
      });
      await User.findByIdAndUpdate(downline.referredBy, {
        $inc: { availableBalance: bonus, totalEarnings: bonus, referralEarnings: bonus }
      });
      referralsCredited++;
      totalReferralPayout += bonus;
    }
  }

  totalInvestorPayout = +totalInvestorPayout.toFixed(4);
  totalReferralPayout = +totalReferralPayout.toFixed(4);

  await DailyPnl.findOneAndUpdate(
    { date: dateStr },
    {
      date: dateStr, pnlPercent, processed: true, createdBy: adminId,
      investorsCredited, referralsCredited, totalInvestorPayout, totalReferralPayout
    },
    { upsert: true, new: true }
  );

  return { investorsCredited, referralsCredited, totalInvestorPayout, totalReferralPayout };
}
