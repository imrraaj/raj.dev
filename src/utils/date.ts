/**
 * Parse DD-MM-YYYY date string to UTC Date object.
 */
export function parseDate(date: string): Date {
  const [day, month, year] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Format a DD-MM-YYYY date string to a readable IST date.
 * e.g. "Mar 22, 2026"
 */
export function formatDate(date: string): string {
  const utcDate = parseDate(date);
  return utcDate.toLocaleDateString("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

/**
 * Format a DD-MM-YYYY date string to a long readable IST date.
 * e.g. "March 22, 2026"
 */
export function formatDateLong(date: string): string {
  const utcDate = parseDate(date);
  return utcDate.toLocaleDateString("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

/**
 * Get ISO date string from DD-MM-YYYY format.
 */
export function getISODate(date: string): string {
  return parseDate(date).toISOString();
}
