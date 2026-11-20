import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';

/** Private app storage where every sound file lives. `sounds.file` is a name inside it. */
const SOUNDS_DIRECTORY = new Directory(Paths.document, 'sounds');

function soundFile(fileName: string): File {
  return new File(SOUNDS_DIRECTORY, fileName);
}

/** The playable URI of a stored sound. */
export function getSoundUri(fileName: string): string {
  return soundFile(fileName).uri;
}

/** Get a unique filename that does not overlap with existing sound files */
function uniqueFileName(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;
  const extension = dot > 0 ? fileName.slice(dot) : '';

  let candidate = fileName;
  for (let n = 1; soundFile(candidate).exists; n++) {
    candidate = `${base} (${n})${extension}`;
  }
  return candidate;
}

/** Copies a file picked by the user into private storage and return the stored file name */
export function storePickedSound(picked: File): string {
  SOUNDS_DIRECTORY.create({ intermediates: true, idempotent: true });

  const fileName = uniqueFileName(picked.name);
  picked.copy(soundFile(fileName));
  return fileName;
}

/** Copies a file bundled with the app into private storage, if not already there */
export async function storeBundledSound(fileName: string, source: number): Promise<void> {
  SOUNDS_DIRECTORY.create({ intermediates: true, idempotent: true });

  const destination = soundFile(fileName);
  if (destination.exists) return;

  const { localUri } = await Asset.fromModule(source).downloadAsync();
  if (!localUri) throw new Error(`Could not load the bundled sound "${fileName}"`);
  new File(localUri).copy(destination);
}

/** Delete a sound file */
export function deleteStoredSound(fileName: string): void {
  const file = soundFile(fileName);
  if (file.exists) file.delete();
}
