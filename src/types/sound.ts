export type Sound = {
  id: number;
  /** Display name, e.g. "Chime" */
  name: string;
  /** Name of the audio file in the app's private sounds folder, e.g. "chime.mp3" */
  file: string;
};
