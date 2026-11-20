import { File } from 'expo-file-system';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { Sound } from '../types/sound';
import { DEFAULT_SOUNDS } from './defaultSounds';
import { deleteStoredSound, storeBundledSound, storePickedSound } from './soundStorage';

export function getSounds(db: SQLiteDatabase): Promise<Sound[]> {
  return db.getAllAsync<Sound>('SELECT id, name, file FROM sounds ORDER BY id');
}

/**
 * Add every default sound to the database if not already there
 */
export async function syncDefaultSounds(db: SQLiteDatabase): Promise<void> {
  for (const { name, file, source } of DEFAULT_SOUNDS) {
    await storeBundledSound(file, source);
    await db.runAsync('INSERT OR IGNORE INTO sounds (name, file) VALUES (?, ?)', name, file);
  }
}

/** Copies a file the user picked into private storage and adds it to the database. */
export async function addSound(db: SQLiteDatabase, picked: File): Promise<Sound> {
  const file = storePickedSound(picked);
  const name = file.replace(/\.[^.]+$/, '');

  try {
    const { lastInsertRowId } = await db.runAsync(
      'INSERT INTO sounds (name, file) VALUES (?, ?)',
      name,
      file,
    );
    return { id: lastInsertRowId, name, file };
  } catch (error) {
    deleteStoredSound(file);
    throw error;
  }
}
