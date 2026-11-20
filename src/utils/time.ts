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
