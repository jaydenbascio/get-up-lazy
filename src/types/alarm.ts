export type Alarm = {
  id: number;
  /** 0-23 */
  hour: number;
  /** 0-59 */
  minute: number;
  /** Days the alarm is active, 0 = Sunday ... 6 = Saturday */
  days: number[];
};
