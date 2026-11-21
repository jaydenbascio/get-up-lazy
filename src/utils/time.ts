/**
 * @brief Formats a 24h hour/minute pair as a 12h clock string, such as "7:05 AM".
 *
 * @param hour Hour of the day
 * @param minute Minutes into the hour (0 - 60)
 *
 * @return The 12h clock string
 */
export function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

/** @brief Get the date (such as "11/12") from a timestamp */
export function formatShortDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/** @brief Formats the time of day as a string (e.g. 11:12 AM) */
export function formatTimeOfDay(timestamp: number): string {
  const date = new Date(timestamp);
  return formatTime(date.getHours(), date.getMinutes());
}

/** @brief Formats a length of time, such as "45 s" or "2 min 5 s" */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds} s`;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} s`;
}
