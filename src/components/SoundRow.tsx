import { View } from 'react-native';
import { RadioButton, useTheme } from 'react-native-paper';

import type { Sound } from '../types/sound';
import SwipeToDelete from './SwipeToDelete';

type Props = {
  sound: Sound;
  onDelete?: () => void;
};

/** A radio button for a sound. Must be inside a `RadioButton.Group`. */
export default function SoundRow({ sound, onDelete }: Props) {
  const theme = useTheme();
  const item = <RadioButton.Item label={sound.name} value={String(sound.id)} />;

  if (!onDelete) return item;

  return (
    <SwipeToDelete label={`Delete ${sound.name}`} onDelete={onDelete}>
      <View style={{ backgroundColor: theme.colors.background }}>{item}</View>
    </SwipeToDelete>
  );
}
