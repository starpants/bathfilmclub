export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * "YYYY-MM" for the month after `from` — the sensible default when adding a
 * theme. Anchored to the 1st so a 31-day month can't skip the short month
 * that follows it, and the year rolls over from December on its own.
 */
export function nextMonth(from: Date = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth() + 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
