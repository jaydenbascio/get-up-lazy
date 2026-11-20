export type DefaultSound = {
  /** Display name */
  name: string;
  /** File name in private storage */
  file: string;
  /** The bundled audio file (Metro turns files into numeric file IDs) */
  source: number;
};

export const DEFAULT_SOUNDS: DefaultSound[] = [
  {
    name: 'Can-can music',
    file: 'can-can-music.mp3',
    source: require('../../assets/sounds/can-can-music.mp3'),
  },
  {
    name: 'Trumpets',
    file: 'trumpets-0.mp3',
    source: require('../../assets/sounds/trumpets-0.mp3'),
  },
];
