import type { SQLiteDatabase } from 'expo-sqlite';

import type { NewWakeUp, WakeUp } from '../types/wakeUp';

/** @brief Save a completed alarm */
export async function recordWakeUp(db: SQLiteDatabase, wakeUp: NewWakeUp): Promise<void> {
  await db.runAsync(
    'INSERT INTO wake_ups (alarm_id, rang_at, phone_ms, total_ms) VALUES (?, ?, ?, ?)',
    wakeUp.alarmId,
    wakeUp.rangAt,
    wakeUp.phoneMs,
    wakeUp.totalMs,
  );
}

/** @brief Get every completed alarm, ordered by date (earliest first) */
export function getWakeUps(db: SQLiteDatabase): Promise<WakeUp[]> {
  return db.getAllAsync<WakeUp>(
    `SELECT id, alarm_id AS alarmId, rang_at AS rangAt, phone_ms AS phoneMs, total_ms AS totalMs
     FROM wake_ups ORDER BY rang_at, id`,
  );
}
