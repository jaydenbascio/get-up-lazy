import type { SQLiteDatabase } from 'expo-sqlite';

import type { Alarm, AlarmDraft } from '../types/alarm';

type AlarmRow = { id: number; hour: number; minute: number; days: number; soundId: number };

const SELECT_ALARM = 'SELECT id, hour, minute, days, sound_id AS soundId FROM alarms';

// Turn a list of days (0 = Sunday, 6 = Saturday) into a single 7 bit bitmask
const daysToMask = (days: number[]): number => days.reduce((mask, day) => mask | (1 << day), 0);

const maskToDays = (mask: number): number[] =>
  [0, 1, 2, 3, 4, 5, 6].filter((day) => mask & (1 << day));

const toAlarm = ({ days, ...rest }: AlarmRow): Alarm => ({
  ...rest,
  days: maskToDays(days),
});

/** @brief Create a new alarm with default values (for creating new alarms) */
export function createBlankAlarm(soundId: number): AlarmDraft {
  return { hour: 7, minute: 0, days: [], soundId };
}

/** @brief Get all alarms ordered by time */
export async function getAlarms(db: SQLiteDatabase): Promise<Alarm[]> {
  const rows = await db.getAllAsync<AlarmRow>(`${SELECT_ALARM} ORDER BY hour, minute, id`);
  return rows.map(toAlarm);
}

/** @brief Get an alarm given its database ID */
export async function getAlarm(db: SQLiteDatabase, id: number): Promise<Alarm | null> {
  const row = await db.getFirstAsync<AlarmRow>(`${SELECT_ALARM} WHERE id = ?`, id);
  return row && toAlarm(row);
}

/**
 * @brief Updates the alarm if id is set, otherwise create a new one.
 * @return the saved alarm.
 */
export async function saveAlarm(db: SQLiteDatabase, alarm: AlarmDraft): Promise<Alarm> {
  const days = daysToMask(alarm.days);

  if (alarm.id === undefined) {
    const { lastInsertRowId } = await db.runAsync(
      'INSERT INTO alarms (hour, minute, days, sound_id) VALUES (?, ?, ?, ?)',
      alarm.hour,
      alarm.minute,
      days,
      alarm.soundId,
    );
    return { ...alarm, id: lastInsertRowId };
  }

  await db.runAsync(
    'UPDATE alarms SET hour = ?, minute = ?, days = ?, sound_id = ? WHERE id = ?',
    alarm.hour,
    alarm.minute,
    days,
    alarm.soundId,
    alarm.id,
  );
  return { ...alarm, id: alarm.id };
}

export async function deleteAlarm(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM alarms WHERE id = ?', id);
}
