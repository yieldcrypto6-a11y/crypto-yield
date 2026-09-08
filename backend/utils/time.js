// The whole platform runs its "day boundary" on a fixed clock (default GMT+1),
// regardless of where a given user or the server physically is. That means:
// "today" for income-crediting purposes is always computed in this timezone,
// using pure UTC arithmetic so it's correct no matter what timezone the server runs in.

export const DEFAULT_OFFSET_HOURS = 1; // GMT+1

// "YYYY-MM-DD" calendar date string in the platform timezone, for a given instant.
export function platformDateStr(instant = new Date(), offsetHours = DEFAULT_OFFSET_HOURS) {
  const shifted = new Date(instant.getTime() + offsetHours * 3600000);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// The real UTC instant of 00:00 platform-time on the day AFTER `instant`'s platform day.
// Used so a package activated at any time "today" only starts earning from the
// platform's next calendar day, never the day it was purchased/activated.
export function nextPlatformMidnightUTC(instant = new Date(), offsetHours = DEFAULT_OFFSET_HOURS) {
  const shifted = new Date(instant.getTime() + offsetHours * 3600000);
  const nextDayShiftedMidnight = Date.UTC(
    shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate() + 1, 0, 0, 0, 0
  );
  return new Date(nextDayShiftedMidnight - offsetHours * 3600000);
}

// Parse a "YYYY-MM-DD" platform-date string back into the UTC instant of its 00:00.
export function platformDateStrToUTCMidnight(dateStr, offsetHours = DEFAULT_OFFSET_HOURS) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const shiftedMidnight = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
  return new Date(shiftedMidnight - offsetHours * 3600000);
}
