import type { Alarm } from '../types/alarm';

// Hard-coded until the SQLite database is set up.
const ALARMS: Alarm[] = [{ id: 1, hour: 7, minute: 30, days: [1, 2, 3, 4, 5] }];

export function getAlarms(): Alarm[] {
  return ALARMS;
}

export function getAlarm(id: number): Alarm | undefined {
  return ALARMS.find((alarm) => alarm.id === id);
}
