import { File } from 'expo-file-system';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { Sound } from '../types/sound';
import { DEFAULT_SOUNDS } from './defaultSounds';
import { deleteStoredSound, storeBundledSound, storePickedSound } from './soundStorage';

export function getSounds(db: SQLiteDatabase): Promise<Sound[]> {
  return db.getAllAsync<Sound>('SELECT id, name, file FROM sounds ORDER BY id');
}

export function getSound(db: SQLiteDatabase, id: number): Promise<Sound | null> {
  return db.getFirstAsync<Sound>('SELECT id, name, file FROM sounds WHERE id = ?', id);
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

/** Copies a file the user picked into private storage and adds it to the database as `name`. */
export async function addSound(db: SQLiteDatabase, picked: File, name: string): Promise<Sound> {
  const file = storePickedSound(picked);

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

/** Default sounds are re-added on every launch, so they can't be deleted. */
export function isDefaultSound(sound: Sound): boolean {
  return DEFAULT_SOUNDS.some(({ file }) => file === sound.file);
}

/** Deletes a sound and its file, unless used by an alarm*/
export async function deleteSound(db: SQLiteDatabase, sound: Sound): Promise<void> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM alarms WHERE sound_id = ?',
    sound.id,
  );
  const count = row?.count ?? 0;
  if (count > 0) {
    throw new Error(`"${sound.name}" is used by ${count} ${count === 1 ? 'alarm' : 'alarms'}.`);
  }

  await db.runAsync('DELETE FROM sounds WHERE id = ?', sound.id);
  deleteStoredSound(sound.file);
}
