import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, View } from 'react-native';
import { Appbar, Card, Text, useTheme } from 'react-native-paper';

import { getAlarms } from '../data/alarms';
import type { RootStackParamList } from '../navigation/types';
import { formatDays } from '../utils/days';
import { formatTime } from '../utils/time';
import { styles } from './AlarmsScreen.styles';

export default function AlarmsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Alarms" />
      </Appbar.Header>

      <FlatList
        data={getAlarms()}
        keyExtractor={(alarm) => String(alarm.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card onPress={() => navigation.navigate('EditAlarm', { alarmId: item.id })} accessibilityLabel="Edit alarm">
            <Card.Content>
              <Text style={styles.time}>{formatTime(item.hour, item.minute)}</Text>
              <Text variant="bodyMedium">{formatDays(item.days)}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}
