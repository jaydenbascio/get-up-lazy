/** @brief The average of a list of numbers, or 0 if it's empty */
export function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}
