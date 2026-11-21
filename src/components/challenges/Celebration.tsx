import { View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatDuration } from '../../utils/time';
import Confetti from '../Confetti';
import { styles } from './Celebration.styles';

/** The space left under the "Start your day" button */
const BOTTOM_GAP = 48;

type Props = {
  /** How long it took to get to the phone */
  phoneMs: number;
  /** How long it took to finish everything */
  totalMs: number;
  onFinish: () => void;
};

/** Shown when every challenge is done */
export default function Celebration({ phoneMs, totalMs, onFinish }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + BOTTOM_GAP,
        },
      ]}
    >
      <Confetti />

      <View style={styles.main}>
        <View style={styles.content}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={[styles.title, { color: theme.colors.primary }]}>Congratulations!</Text>
        </View>

        <View style={styles.results}>
          <View style={styles.result}>
            <Text variant="labelMedium">Got to your phone</Text>
            <Text style={styles.resultValue}>{formatDuration(phoneMs)}</Text>
          </View>
          <View style={styles.result}>
            <Text variant="labelMedium">Finished everything</Text>
            <Text style={styles.resultValue}>{formatDuration(totalMs)}</Text>
          </View>
        </View>
      </View>

      <Button
        mode="contained"
        style={styles.button}
        contentStyle={styles.buttonContent}
        onPress={onFinish}
      >
        Start your morning
      </Button>
    </View>
  );
}
