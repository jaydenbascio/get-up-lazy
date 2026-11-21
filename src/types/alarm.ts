/** One QR code to scan to turn off an alarm. */
export type AlarmStep = {
  key: string;
  name: string;
  /** The text of the QR code that must be scanned */
  qrValue: string;
  /** How long the player has to scan it before the alarm starts ringing again */
  timeLimitSeconds: number;
};

export const MIN_STEP_TIME_LIMIT = 5;
export const MAX_STEP_TIME_LIMIT = 600;
export const DEFAULT_STEP_TIME_LIMIT = 30;

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
  /** The QR codes to scan after the quadratics, in order. */
  steps: AlarmStep[];
};

export const MIN_QUADRATIC_COUNT = 1;
export const MAX_QUADRATIC_COUNT = 10;

/** An alarm being edited (id can be missing for new alarms) */
export type AlarmDraft = Omit<Alarm, 'id'> & { id?: number };
