export const money = (n) => {
  const num = Number(n || 0);
  const sign = num < 0 ? "-" : "";
  return sign + "$" + Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const coinAmount = (n) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 8 });

export const dateFmt = (d) =>
  new Date(d).toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const dateShort = (d) =>
  new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

export const timeUntil = (d) => {
  if (!d) return "";
  const ms = new Date(d).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

export const BAN_STAGE_LABELS = {
  "24h": "24 Hours",
  "7d": "7 Days",
  "30d": "30 Days",
  permanent: "Permanent"
};
