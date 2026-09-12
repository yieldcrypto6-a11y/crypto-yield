import geoip from "geoip-lite";

// Restricts access to the platform's API to UK and US IP addresses only.
// Anyone outside those countries gets a 403 — the intended effect is that
// visitors elsewhere need a UK or US VPN/proxy to reach the site at all.
//
// Honest limitations, please read before relying on this for anything legal:
//  - geoip-lite ships a static, periodically-updated IP-to-country database.
//    It is NOT 100% accurate — some IP ranges are misattributed, and mobile
//    carrier / CGNAT ranges are sometimes wrong. Expect occasional false
//    positives/negatives.
//  - It CANNOT distinguish a real UK/US visitor from anyone else already
//    using a UK/US VPN or proxy — which is exactly what you asked for (VPN
//    users get through), but also means this blocks casual visitors, not
//    a determined bad actor.
//  - This checks the request's source IP. If you deploy behind a CDN/proxy
//    (Cloudflare, Nginx, a PaaS load balancer), you MUST configure Express's
//    "trust proxy" setting (already done in server.js) and ensure
//    X-Forwarded-For is set correctly by that proxy, or every request will
//    appear to come from the proxy's IP instead of the real visitor — which
//    would either block everyone or let everyone through.
//  - This is a soft geofence for audience/marketing purposes, not a security
//    or legal-compliance control. Don't rely on it alone if a specific
//    jurisdiction's law requires verified geo-restriction.

const ALLOWED_COUNTRIES = new Set(["GB", "US"]);

// Always allow local/dev traffic so `npm run dev` on your own machine works
// without needing a VPN.
function isPrivateOrLocalIp(ip) {
  if (!ip) return true;
  const clean = ip.replace("::ffff:", "");
  return (
    clean === "127.0.0.1" ||
    clean === "::1" ||
    clean.startsWith("10.") ||
    clean.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(clean)
  );
}

export function geoRestrict(req, res, next) {
  if (process.env.GEO_RESTRICT !== "true") return next(); // opt-in, off by default

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;

  if (isPrivateOrLocalIp(ip)) return next();

  const geo = geoip.lookup(ip);
  const country = geo?.country;

  if (country && ALLOWED_COUNTRIES.has(country)) return next();

  return res.status(403).json({
    message: "This service is only available from the United Kingdom or United States."
  });
}
