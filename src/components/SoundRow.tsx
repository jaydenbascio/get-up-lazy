import { View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { IconButton, RadioButton, useTheme } from 'react-native-paper';

import type { Sound } from '../types/sound';
import { styles } from './SoundRow.styles';

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
    <ReanimatedSwipeable
      overshootLeft={false}
      renderLeftActions={() => (
        <View style={[styles.deleteAction, { backgroundColor: theme.colors.error }]}>
          <IconButton
            icon="delete"
            iconColor={theme.colors.onError}
            accessibilityLabel={`Delete ${sound.name}`}
            onPress={onDelete}
          />
        </View>
      )}
    >
      <View style={{ backgroundColor: theme.colors.background }}>{item}</View>
    </ReanimatedSwipeable>
  );
}
