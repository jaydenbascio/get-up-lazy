/** A completed alarm: how long it took the user to get up and finish everything. */
export type WakeUp = {
  id: number;
  alarmId: number | null;
  /** When the alarm went off, unix timestamp */
  rangAt: number;
  /** How long it took to get to the phone (to press Next) */
  phoneMs: number;
  /** How long it took to get to the congratulations page */
  totalMs: number;
};

export type NewWakeUp = Omit<WakeUp, 'id'>;
