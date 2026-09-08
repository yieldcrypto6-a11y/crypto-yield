# CryptoGrow — Transparent Profit-Share Platform

A full MERN-stack platform where users deposit crypto into admin-provided
addresses, get manually verified, then earn a real, transparent share of the
platform's actual daily trading result — never a fixed or guaranteed rate.
Includes phone/email registration with OTP, a referral program, a progressive
user-ban system, live market charts, and an admin control panel.

## Stack
- **Frontend:** React 18 + Vite + Tailwind CSS v4 + Framer Motion + React Router + TradingView widgets
- **Backend:** Node.js + Express + MongoDB (Mongoose) + JWT auth + Multer (file uploads)

## 1. Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env   # edit MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run seed             # creates your admin account + 4 default package tiers
npm run dev               # or: npm start
```
The API runs on `http://localhost:5000`.

`npm run seed` requires `ADMIN_EMAIL` and `ADMIN_PASSWORD` to be set in `.env`
— these become your real, live admin login. It is safe to re-run: it will not
duplicate an existing admin or existing packages.

**No deposit addresses or test accounts are created by seeding.** Add your own
real wallet addresses in **Admin → Deposit Addresses** before accepting any
deposits — this is a required step, not optional, since without it there's
nowhere for user funds to actually go.

> If you use MongoDB Atlas, make sure your current IP (or `0.0.0.0/0` for a
> hosted server) is added to the cluster's Network Access / IP Access List.

### Frontend
```bash
cd frontend
npm install
npm run build
```
For local development, `npm run dev` runs on `http://localhost:5173` and
proxies `/api` and `/uploads` to the backend (see `vite.config.js`). For
production, serve the built `dist/` folder from your web server or CDN, and
point it at your deployed API's URL.

## 2. Complete workflow

1. **Register** — email or phone (no OTP verification — phone numbers are
   stored but not verified, to avoid per-message SMS/WhatsApp costs),
   optionally with a
   referral code (or a `?ref=CODE` link), and instantly receives their own
   referral code.
2. **Choose & buy a package** — packages page shows price, this package's
   share of real daily P&L, and cycle length. Buying opens a 3‑step flow: coin
   (USDT/BTC/ETH) → admin's deposit address for that coin → screenshot upload
   + optional tx hash/note. This creates a `pending` `Payment`.
3. **Admin verification** — Admin → Payments shows every submission with the
   screenshot, amount and coin. Confirming activates the package with a
   `startDate` of the **next platform day** (GMT+1 by default) — income never
   starts the day it's bought.
4. **Daily P&L (the real income engine)** — Admin → Daily P&L is where you
   enter that day's actual trading result as a percentage (positive or
   negative). `backend/jobs/dailyPnl.js` then credits every active package a
   share of that real number, proportional to its principal — multiple
   simultaneously-active packages simply stack. Referral bonuses are computed
   the same way, off the downline's credited principal, and are always zero
   on loss days.
5. **Earnings / packages / transactions** — the user dashboard has dedicated
   pages: Overview (stats), My Packages (progress + real share rate),
   Transactions (payments/earnings/withdrawals tabs), Referrals (code, link,
   referred users, real profit-share explanation).
6. **Withdrawals (payouts)** — requesting a withdrawal deducts the amount from
   the wallet immediately. Admin can mark it **Completed**, **Failed**, or
   **Rejected** with remarks — failed/rejected amounts are intentionally
   **never** returned to the wallet (see `routes/admin.js` and `Withdrawal.js`).
7. **Progressive bans** — Admin → Users can ban an account; each click escalates
   `none → 24h → 7d → 30d → permanent`, storing a reason and a full history.
   Timed bans auto-lift when they expire. Any banned user who tries to log in
   sees a popup with their ban stage, reason and remaining time.
8. **Markets** — a dashboard page with live TradingView charts for BTC, ETH,
   Gold (XAUUSD), forex pairs, and stocks (TSLA, AAPL, NVDA, MSFT), plus a
   scrolling ticker tape on the landing page and Markets page.
9. **Transparency popup** — shown once per session on the landing page,
   explaining exactly how payouts are calculated (no fabricated statistics).
10. **Tutorial page** — a dashboard page with an `<iframe>` placeholder ready
    for a real video URL (`src="..."` in `frontend/src/pages/user/Tutorial.jsx`).
11. **Video tutorial** — served directly from this backend, not YouTube. Drop
    your video file at `backend/uploads/tutorial/tutorial.mp4` (create the
    folder if needed) — see `frontend/src/pages/user/Tutorial.jsx`.
12. **Geo-restriction (optional)** — set `GEO_RESTRICT=true` in `.env` to
    limit the whole site to UK/US IP addresses; visitors elsewhere need a
    UK/US VPN to reach it. See `backend/middleware/geoRestrict.js` for exactly
    how it works and its honest limitations (it's an offline IP database, not
    a legal-grade compliance control, and doesn't distinguish real UK/US
    traffic from anyone already using a UK/US VPN — which is the point).
13. **Design** — dark "trading terminal" theme with neon cyan/violet/green
    gradient borders, glassmorphism cards, animated hero, and Framer Motion
    transitions throughout (see `frontend/src/index.css`).

## 3. Key files to know

| Concern | File |
|---|---|
| Daily P&L distribution engine | `backend/jobs/dailyPnl.js` |
| Platform-wide share rates & timezone | `backend/models/PlatformSettings.js` |
| Daily result log | `backend/models/DailyPnl.js` |
| Progressive ban logic | `backend/utils/ban.js` |
| Phone/email registration (no OTP) | `routes/auth.js` |
| GMT+1 day-boundary helpers | `backend/utils/time.js` |
| Deposit-proof upload | `backend/middleware/upload.js`, `routes/platform.js` (`POST /buy`) |
| Payment review / package activation | `backend/routes/admin.js` (`PATCH /payments/:id`) |
| Withdrawal review (no-refund rule) | `backend/routes/admin.js` (`PATCH /withdrawals/:id`) |
| Ban popup on login | `frontend/src/components/BanPopup.jsx` |
| Transparency popup | `frontend/src/components/TrustPopup.jsx` |
| Trading charts | `frontend/src/components/TradingViewWidget.jsx`, `pages/user/Markets.jsx` |
| Admin Daily P&L UI | `frontend/src/pages/admin/AdminDailyPnl.jsx` |
| Neon design tokens | `frontend/src/index.css` |
| Video tutorial | `backend/uploads/tutorial/` (video file), `frontend/src/pages/user/Tutorial.jsx` |
| Geo-restriction (UK/US only) | `backend/middleware/geoRestrict.js` |
| Server crash safety net | `backend/server.js` (`express-async-errors` + error middleware) |

## 4. Before going live — required steps

- [ ] Set a strong, random `JWT_SECRET` (not a short/guessable string).
- [ ] Set `ADMIN_EMAIL`/`ADMIN_PASSWORD` to real, private credentials before
      running `npm run seed`, then rotate the password after first login if
      you ever shared this `.env` file with anyone.
- [ ] Add your **real** crypto deposit addresses in Admin → Deposit Addresses.
      None are seeded by default — nothing works until you do this.
- [ ] Put `backend/uploads` behind persistent storage (e.g. S3) if deploying
      to an ephemeral filesystem (Render, Railway, etc.) — screenshots are
      currently saved to local disk and served via `/uploads`.
- [ ] Add HTTPS (via your host or a reverse proxy like Nginx/Caddy) and basic
      rate limiting on `/api/auth/*` and `/api/admin/daily-pnl`.
- [ ] Confirm your MongoDB Atlas Network Access list allows your production
      server's IP (or use a private network / VPC peering).
- [ ] Given this platform pools and manages other people's money, confirm
      with a local securities lawyer / your financial regulator whether
      registration is required before accepting real deposits.
