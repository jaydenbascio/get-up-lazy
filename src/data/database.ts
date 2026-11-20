import type { SQLiteDatabase } from 'expo-sqlite';

import { syncDefaultSounds } from './sounds';

export const DATABASE_NAME = 'get-up-lazy.sqlite';

/**
 * Schema migrations, applied in order
 */
const MIGRATIONS = [
  // 1: initial schema
  // - `sounds.file` is the name of the audio file in the app's private sounds folder.
  // - `alarms.days` is a bitmask (Sunday = bit 0 ... Saturday = bit 6).
  `CREATE TABLE sounds (
     id   INTEGER PRIMARY KEY,
     name TEXT NOT NULL,
     file TEXT NOT NULL UNIQUE
   );

   CREATE TABLE alarms (
     id       INTEGER PRIMARY KEY,
     hour     INTEGER NOT NULL CHECK (hour BETWEEN 0 AND 23),
     minute   INTEGER NOT NULL CHECK (minute BETWEEN 0 AND 59),
     days     INTEGER NOT NULL DEFAULT 0 CHECK (days BETWEEN 0 AND 127),
     sound_id INTEGER NOT NULL REFERENCES sounds (id)
   );`,
];

/** Brings the database up to the latest schema. */
async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;
  if (currentVersion >= MIGRATIONS.length) return;

  // Use one transaction so a failed migration does not corrupt the database
  await db.withTransactionAsync(async () => {
    for (const migration of MIGRATIONS.slice(currentVersion)) {
      await db.execAsync(migration);
    }
    await db.execAsync(`PRAGMA user_version = ${MIGRATIONS.length}`);
  });
}

/** Migrates the schema, then syncs the default data */
export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  await migrateDatabase(db);
  await syncDefaultSounds(db);
}
