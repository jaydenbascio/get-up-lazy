import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { styles } from './CountdownBar.styles';

type Props = {
  remainingMs: number;
  limitMs: number;
};

/** A line that shrinks as time runs out, with the seconds left beneath it. */
export default function CountdownBar({ remainingMs, limitMs }: Props) {
  const theme = useTheme();
  const fraction = Math.max(0, Math.min(1, remainingMs / limitMs));
  const almostOut = remainingMs < 3_000;

  return (
    <View style={styles.container}>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(fraction * 100) }}
        style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${fraction * 100}%`,
              backgroundColor: almostOut ? theme.colors.error : theme.colors.primary,
            },
          ]}
        />
      </View>
      <Text variant="labelMedium">{Math.ceil(remainingMs / 1000)} s</Text>
    </View>
  );
}
