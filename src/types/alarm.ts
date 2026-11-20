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
};

/** An alarm being edited (id can be missing for new alarms) */
export type AlarmDraft = Omit<Alarm, 'id'> & { id?: number };
