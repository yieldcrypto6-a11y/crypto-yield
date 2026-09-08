// Progressive ban stages: 0=none, 1=24h, 2=7d, 3=30d, 4=permanent
export const BAN_STAGES = ["none", "24h", "7d", "30d", "permanent"];
export const BAN_DURATIONS_MS = {
  1: 24 * 60 * 60 * 1000,
  2: 7 * 24 * 60 * 60 * 1000,
  3: 30 * 24 * 60 * 60 * 1000,
  4: null // permanent
};

// Given a user doc, returns { isBanned, stageLabel, bannedUntil, reason } and
// auto-lifts the ban (sets status back to active) if a timed ban has expired.
export function evaluateBan(user) {
  if (user.banStage === 0) return { isBanned: false };
  if (user.banStage === 4) {
    return { isBanned: true, stageLabel: "permanent", bannedUntil: null, reason: user.banReason };
  }
  const until = user.bannedUntil ? new Date(user.bannedUntil) : null;
  if (until && until.getTime() <= Date.now()) {
    // Ban expired — lift it but KEEP the stage on record so the next
    // violation escalates to the next stage instead of resetting.
    return { isBanned: false, expired: true };
  }
  return { isBanned: true, stageLabel: BAN_STAGES[user.banStage], bannedUntil: until, reason: user.banReason };
}

// Escalates a user to the next ban stage (max = permanent) and returns the update payload.
export function nextBanStage(currentStage) {
  const stage = Math.min(currentStage + 1, 4);
  const duration = BAN_DURATIONS_MS[stage];
  return {
    banStage: stage,
    bannedUntil: duration ? new Date(Date.now() + duration) : null
  };
}

export function generateReferralCode(name = "") {
  const base = name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() || "USER";
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${base}${rand}`;
}
