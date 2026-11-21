import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Appbar, Card, List, Text, useTheme } from 'react-native-paper';

import WakeUpChart from '../components/WakeUpChart';
import { getWakeUps } from '../data/wakeUps';
import type { WakeUp } from '../types/wakeUp';
import { DAY_NAMES } from '../utils/days';
import { average } from '../utils/stats';
import { formatDuration, formatShortDate, formatTimeOfDay } from '../utils/time';
import { styles } from './GraphScreen.styles';

/** How many of the latest wake-ups are drawn in the chart and listed below it */
const CHART_COUNT = 14;
const RECENT_COUNT = 10;

/** A report on how long it takes to get up. */
export default function GraphScreen() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const [wakeUps, setWakeUps] = useState<WakeUp[]>([]);

  // Reload whenever this tab comes into focus, e.g. after finishing an alarm.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getWakeUps(db).then((rows) => {
        if (active) setWakeUps(rows);
      });
      return () => {
        active = false;
      };
    }, [db]),
  );

  const recent = wakeUps.slice(-CHART_COUNT);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Graph" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {wakeUps.length === 0 ? (
          <Text style={styles.empty}>
            No wake-ups yet. Finish an alarm to see how long it takes you to get up.
          </Text>
        ) : (
          <>
            <View style={styles.stats}>
              <Card style={styles.stat}>
                <Card.Content>
                  <Text variant="labelMedium">Wake-ups</Text>
                  <Text style={styles.statValue}>{wakeUps.length}</Text>
                </Card.Content>
              </Card>
              <Card style={styles.stat}>
                <Card.Content>
                  <Text variant="labelMedium">Avg. to phone</Text>
                  <Text style={styles.statValue}>
                    {formatDuration(average(wakeUps.map((w) => w.phoneMs)))}
                  </Text>
                </Card.Content>
              </Card>
              <Card style={styles.stat}>
                <Card.Content>
                  <Text variant="labelMedium">Avg. to finish</Text>
                  <Text style={styles.statValue}>
                    {formatDuration(average(wakeUps.map((w) => w.totalMs)))}
                  </Text>
                </Card.Content>
              </Card>
            </View>

            <Card>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Last {recent.length} wake-ups
                </Text>
                <WakeUpChart wakeUps={recent} />
              </Card.Content>
            </Card>

            <Card>
              <Card.Content>
                <Text variant="titleMedium">History</Text>
              </Card.Content>
              {wakeUps
                .slice(-RECENT_COUNT)
                .reverse()
                .map((wakeUp) => (
                  <List.Item
                    key={wakeUp.id}
                    title={`${DAY_NAMES[new Date(wakeUp.rangAt).getDay()]} ${formatShortDate(wakeUp.rangAt)} · ${formatTimeOfDay(wakeUp.rangAt)}`}
                    description={`To phone ${formatDuration(wakeUp.phoneMs)} · Finished in ${formatDuration(wakeUp.totalMs)}`}
                  />
                ))}
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}
