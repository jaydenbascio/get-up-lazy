import type { SQLiteDatabase } from 'expo-sqlite';

import type { Alarm, AlarmDraft, AlarmStep } from '../types/alarm';

type AlarmRow = {
  id: number;
  hour: number;
  minute: number;
  days: number;
  soundId: number;
  quadraticCount: number;
};

type StepRow = {
  id: number;
  alarmId: number;
  name: string;
  qrValue: string;
  timeLimitSeconds: number;
};

const SELECT_ALARM =
  'SELECT id, hour, minute, days, sound_id AS soundId, quadratic_count AS quadraticCount FROM alarms';

const SELECT_STEP =
  'SELECT id, alarm_id AS alarmId, name, qr_value AS qrValue, time_limit_seconds AS timeLimitSeconds FROM alarm_steps';

// Turn a list of days (0 = Sunday, 6 = Saturday) into a single 7 bit bitmask
const daysToMask = (days: number[]): number => days.reduce((mask, day) => mask | (1 << day), 0);

const maskToDays = (mask: number): number[] =>
  [0, 1, 2, 3, 4, 5, 6].filter((day) => mask & (1 << day));

const toStep = ({ id, name, qrValue, timeLimitSeconds }: StepRow): AlarmStep => ({
  key: `saved-${id}`,
  name,
  qrValue,
  timeLimitSeconds,
});

const toAlarm = ({ days, ...rest }: AlarmRow, steps: AlarmStep[]): Alarm => ({
  ...rest,
  days: maskToDays(days),
  steps,
});

/** @brief Create a new alarm with default values (for creating new alarms) */
export function createBlankAlarm(soundId: number): AlarmDraft {
  return { hour: 7, minute: 0, days: [], soundId, quadraticCount: 3, steps: [] };
}

/** @brief Get all alarms ordered by time */
export async function getAlarms(db: SQLiteDatabase): Promise<Alarm[]> {
  const rows = await db.getAllAsync<AlarmRow>(`${SELECT_ALARM} ORDER BY hour, minute, id`);
  const stepRows = await db.getAllAsync<StepRow>(`${SELECT_STEP} ORDER BY alarm_id, position`);

  const stepsByAlarm = new Map<number, AlarmStep[]>();
  for (const stepRow of stepRows) {
    const steps = stepsByAlarm.get(stepRow.alarmId) ?? [];
    steps.push(toStep(stepRow));
    stepsByAlarm.set(stepRow.alarmId, steps);
  }

  return rows.map((row) => toAlarm(row, stepsByAlarm.get(row.id) ?? []));
}

/** @brief Get an alarm given its database ID */
export async function getAlarm(db: SQLiteDatabase, id: number): Promise<Alarm | null> {
  const row = await db.getFirstAsync<AlarmRow>(`${SELECT_ALARM} WHERE id = ?`, id);
  if (!row) return null;

  const stepRows = await db.getAllAsync<StepRow>(`${SELECT_STEP} WHERE alarm_id = ? ORDER BY position`, id);
  return toAlarm(row, stepRows.map(toStep));
}

/**
 * @brief Updates the alarm if id is set, otherwise create a new one.
 * @return the saved alarm.
 */
export async function saveAlarm(db: SQLiteDatabase, alarm: AlarmDraft): Promise<Alarm> {
  const days = daysToMask(alarm.days);
  let id = alarm.id;

  await db.withTransactionAsync(async () => {
    if (id === undefined) {
      const result = await db.runAsync(
        'INSERT INTO alarms (hour, minute, days, sound_id, quadratic_count) VALUES (?, ?, ?, ?, ?)',
        alarm.hour,
        alarm.minute,
        days,
        alarm.soundId,
        alarm.quadraticCount,
      );
      id = result.lastInsertRowId;
    } else {
      await db.runAsync(
        'UPDATE alarms SET hour = ?, minute = ?, days = ?, sound_id = ?, quadratic_count = ? WHERE id = ?',
        alarm.hour,
        alarm.minute,
        days,
        alarm.soundId,
        alarm.quadraticCount,
        id,
      );
    }

    await db.runAsync('DELETE FROM alarm_steps WHERE alarm_id = ?', id);
    for (const [position, step] of alarm.steps.entries()) {
      await db.runAsync(
        'INSERT INTO alarm_steps (alarm_id, position, name, qr_value, time_limit_seconds) VALUES (?, ?, ?, ?, ?)',
        id,
        position,
        step.name,
        step.qrValue,
        step.timeLimitSeconds,
      );
    }
  });

  return { ...alarm, id: id! };
}

export async function deleteAlarm(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM alarms WHERE id = ?', id);
}
