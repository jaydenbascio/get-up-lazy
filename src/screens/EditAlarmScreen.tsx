import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Appbar, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';

import { getAlarm } from '../data/alarms';
import type { RootStackParamList } from '../navigation/types';
import type { Alarm } from '../types/alarm';
import { DAY_NAMES, DAY_ORDER } from '../utils/days';
import { formatTime } from '../utils/time';
import { styles } from './EditAlarmScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'EditAlarm'>;

export default function EditAlarmScreen({ navigation, route }: Props) {
  const alarm = getAlarm(route.params.alarmId);

  // If the alarm mysteriously disappears we should go back
  useEffect(() => {
    if (!alarm) navigation.goBack();
  }, [alarm, navigation]);

  if (!alarm) return null;

  return <EditAlarmForm alarm={alarm} onClose={navigation.goBack} />;
}

function EditAlarmForm({ alarm, onClose }: { alarm: Alarm; onClose: () => void }) {
  const theme = useTheme();
  const [draft, setDraft] = useState<Alarm>(alarm);
  const [pickerVisible, setPickerVisible] = useState(false);

  const toggleDay = (day: number) => {
    setDraft((current) => ({
      ...current,
      days: current.days.includes(day)
        ? current.days.filter((d) => d !== day)
        : [...current.days, day],
    }));
  };

  const handleSave = () => {
    // TODO: persist once the SQLite database is set up.
    onClose();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={onClose} />
        <Appbar.Content title="Edit alarm" />
        <Appbar.Action icon="check" accessibilityLabel="Save" onPress={handleSave} />
      </Appbar.Header>

      <View style={styles.body}>
        <TouchableRipple
          style={styles.timeButton}
          onPress={() => setPickerVisible(true)}
          accessibilityLabel="Change alarm time"
          borderless
        >
          <Text style={[styles.time, { color: theme.colors.primary }]}>
            {formatTime(draft.hour, draft.minute)}
          </Text>
        </TouchableRipple>

        <View style={styles.section}>
          <Text variant="titleMedium">Repeat</Text>
          <View style={styles.days}>
            {DAY_ORDER.map((day) => {
              const selected = draft.days.includes(day);
              return (
                <TouchableRipple
                  key={day}
                  onPress={() => toggleDay(day)}
                  accessibilityRole="button"
                  accessibilityLabel={DAY_NAMES[day]}
                  accessibilityState={{ selected }}
                  borderless
                  style={[
                    styles.day,
                    {
                      backgroundColor: selected ? theme.colors.primary : 'transparent',
                      borderColor: selected ? theme.colors.primary : theme.colors.outline,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayLetter,
                      { color: selected ? theme.colors.onPrimary : theme.colors.onSurface },
                    ]}
                  >
                    {DAY_NAMES[day][0]}
                  </Text>
                </TouchableRipple>
              );
            })}
          </View>
        </View>
      </View>

      <TimePickerModal
        visible={pickerVisible}
        onDismiss={() => setPickerVisible(false)}
        onConfirm={({ hours, minutes }) => {
          setDraft({ ...draft, hour: hours, minute: minutes });
          setPickerVisible(false);
        }}
        hours={draft.hour}
        minutes={draft.minute}
        use24HourClock={false}
      />
    </View>
  );
}
