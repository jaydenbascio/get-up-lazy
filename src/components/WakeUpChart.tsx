import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import type { WakeUp } from '../types/wakeUp';
import { formatShortDate } from '../utils/time';
import { CHART_HEIGHT, styles } from './WakeUpChart.styles';

type Props = {
  /** The wake-ups to draw, earliest first */
  wakeUps: WakeUp[];
};

/** A bar for each wake-up, distinguishing between time to phone and time to finish the routines */
export default function WakeUpChart({ wakeUps }: Props) {
  const theme = useTheme();
  const phoneColor = theme.colors.primary;
  const restColor = theme.colors.tertiary;

  // The tallest bar fills the chart
  const maxMs = Math.max(1, ...wakeUps.map((wakeUp) => wakeUp.totalMs));

  return (
    <View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: phoneColor }]} />
          <Text variant="labelMedium">To the phone</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: restColor }]} />
          <Text variant="labelMedium">Start of day</Text>
        </View>
      </View>

      <View style={styles.bars}>
        {wakeUps.map((wakeUp) => (
          <View key={wakeUp.id} style={styles.column}>
            <View style={[styles.barArea, { borderBottomColor: theme.colors.outline }]}>
              <View style={[styles.bar, { height: (wakeUp.totalMs / maxMs) * CHART_HEIGHT }]}>
                <View style={{ flex: wakeUp.totalMs - wakeUp.phoneMs, backgroundColor: restColor }} />
                <View style={{ flex: wakeUp.phoneMs, backgroundColor: phoneColor }} />
              </View>
            </View>
            <Text variant="labelSmall">{formatShortDate(wakeUp.rangAt)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
