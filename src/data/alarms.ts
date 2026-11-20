import type { SQLiteDatabase } from 'expo-sqlite';

import type { Alarm, AlarmDraft } from '../types/alarm';

type AlarmRow = { id: number; hour: number; minute: number; days: number };

// `days` is stored as a bitmask: Sunday = bit 0 ... Saturday = bit 6.
const daysToMask = (days: number[]): number => days.reduce((mask, day) => mask | (1 << day), 0);

const maskToDays = (mask: number): number[] =>
  [0, 1, 2, 3, 4, 5, 6].filter((day) => mask & (1 << day));

const toAlarm = ({ id, hour, minute, days }: AlarmRow): Alarm => ({
  id,
  hour,
  minute,
  days: maskToDays(days),
});

/** A new alarm with default values (for creating new alarms)*/
export function createBlankAlarm(): AlarmDraft {
  return { hour: 7, minute: 0, days: [] };
}

/** Get all alarms ordered by time */
export async function getAlarms(db: SQLiteDatabase): Promise<Alarm[]> {
  const rows = await db.getAllAsync<AlarmRow>(
    'SELECT id, hour, minute, days FROM alarms ORDER BY hour, minute, id',
  );
  return rows.map(toAlarm);
}

export async function getAlarm(db: SQLiteDatabase, id: number): Promise<Alarm | null> {
  const row = await db.getFirstAsync<AlarmRow>(
    'SELECT id, hour, minute, days FROM alarms WHERE id = ?',
    id,
  );
  return row && toAlarm(row);
}

/** Updates the alarm if id is set, otherwise create a new one */
export async function saveAlarm(db: SQLiteDatabase, alarm: AlarmDraft): Promise<void> {
  const days = daysToMask(alarm.days);

  if (alarm.id === undefined) {
    await db.runAsync(
      'INSERT INTO alarms (hour, minute, days) VALUES (?, ?, ?)',
      alarm.hour,
      alarm.minute,
      days,
    );
  } else {
    await db.runAsync(
      'UPDATE alarms SET hour = ?, minute = ?, days = ? WHERE id = ?',
      alarm.hour,
      alarm.minute,
      days,
      alarm.id,
    );
  }
}

export async function deleteAlarm(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM alarms WHERE id = ?', id);
}
