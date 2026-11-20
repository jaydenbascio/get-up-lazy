import type { Alarm, AlarmDraft } from '../types/alarm';

// Hard-coded until the SQLite database is set up.
const ALARMS: Alarm[] = [{ id: 1, hour: 7, minute: 30, days: [1, 2, 3, 4, 5] }];

export function getAlarms(): Alarm[] {
  return ALARMS;
}

export function getAlarm(id: number): Alarm | undefined {
  return ALARMS.find((alarm) => alarm.id === id);
}

/** A new alarm with default values. */
export function createBlankAlarm(): AlarmDraft {
  return { hour: 7, minute: 0, days: [] };
}

/** Save an alarm, update it if it has an `id`, otherwise creates it. */
export function saveAlarm(_alarm: AlarmDraft): void {
  // TODO: persist once the SQLite database is set up.
}
