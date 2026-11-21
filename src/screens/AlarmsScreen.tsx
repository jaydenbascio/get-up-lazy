import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Appbar, Card, FAB, Text, useTheme } from 'react-native-paper';

import { cancelAlarm } from '../alarms/scheduler';
import SwipeToDelete from '../components/SwipeToDelete';
import { deleteAlarm, getAlarms } from '../data/alarms';
import type { RootStackParamList } from '../navigation/types';
import type { Alarm } from '../types/alarm';
import { confirmDelete } from '../utils/confirm';
import { formatDays } from '../utils/days';
import { formatTime } from '../utils/time';
import { styles } from './AlarmsScreen.styles';

export default function AlarmsScreen() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  // Reload alarms whenever this screen comes into focus, e.g. after saving on the edit screen.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getAlarms(db).then((rows) => {
        if (active) setAlarms(rows);
      });
      return () => {
        active = false;
      };
    }, [db]),
  );

  const handleDelete = (alarm: Alarm) =>
    confirmDelete('Delete alarm?', async () => {
      await deleteAlarm(db, alarm.id);
      await cancelAlarm(alarm.id);
      setAlarms((current) => current.filter((a) => a.id !== alarm.id));
    });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Alarms" />
      </Appbar.Header>

      <FlatList
        data={alarms}
        keyExtractor={(alarm) => String(alarm.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No alarms yet. Tap + to add one.</Text>}
        renderItem={({ item }) => (
          <SwipeToDelete
            label="Delete alarm"
            borderRadius={theme.roundness * 3} // Matches the card's corners
            onDelete={() => handleDelete(item)}
          >
            <Card
              onPress={() => navigation.navigate('EditAlarm', { alarmId: item.id })}
              accessibilityLabel="Edit alarm"
            >
              <Card.Content>
                <Text style={styles.time}>{formatTime(item.hour, item.minute)}</Text>
                <Text variant="bodyMedium">{formatDays(item.days)}</Text>
              </Card.Content>
            </Card>
          </SwipeToDelete>
        )}
      />

      <FAB
        icon="plus"
        accessibilityLabel="Create alarm"
        style={styles.fab}
        onPress={() => navigation.navigate('EditAlarm')}
      />
    </View>
  );
}
