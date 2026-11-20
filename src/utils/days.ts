/** Indexed by day number, 0 = Sunday ... 6 = Saturday */
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Display order for the day picker and summaries (Sunday first) */
export const DAY_ORDER = [0, 1, 2, 3, 4, 5, 6];

const sameDays = (a: number[], b: number[]) =>
  a.length === b.length && b.every((day) => a.includes(day));

/**
 * @brief Get a short summary of the chosen days
 * @param List of the chosen days, with 0 representing Sunday and 6 being Saturday
 * @return String representing the summary of the days (e.g. "Weekdays" or "Every Day")
 */
export function formatDays(days: number[]): string {
  if (days.length === 0) return 'No days selected';
  if (days.length === 7) return 'Every day';
  if (sameDays(days, [1, 2, 3, 4, 5])) return 'Weekdays';
  if (sameDays(days, [0, 6])) return 'Weekends';
  return DAY_ORDER.filter((day) => days.includes(day))
    .map((day) => DAY_NAMES[day])
    .join(', ');
}
