export type Alarm = {
  id: number;
  /** 0-23 */
  hour: number;
  /** 0-59 */
  minute: number;
  /** Days the alarm is active, 0 = Sunday ... 6 = Saturday */
  days: number[];
  /** The `id` of the alarm's sound */
  soundId: number;
  /** How many quadratics must be factored in a row to turn the alarm off */
  quadraticCount: number;
};

export const MIN_QUADRATIC_COUNT = 1;
export const MAX_QUADRATIC_COUNT = 10;

/** An alarm being edited (id can be missing for new alarms) */
export type AlarmDraft = Omit<Alarm, 'id'> & { id?: number };
