import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { Appbar, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';

import { createBlankAlarm, deleteAlarm, getAlarm, saveAlarm } from '../data/alarms';
import type { RootStackParamList } from '../navigation/types';
import type { AlarmDraft } from '../types/alarm';
import { DAY_NAMES, DAY_ORDER } from '../utils/days';
import { formatTime } from '../utils/time';
import { styles } from './EditAlarmScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'EditAlarm'>;

export default function EditAlarmScreen({ navigation, route }: Props) {
  const db = useSQLiteContext();

  // No alarmId means we are creating a new alarm.
  const alarmId = route.params?.alarmId;
  const isNew = alarmId === undefined;

  const [initial, setInitial] = useState<AlarmDraft | null>(() =>
    isNew ? createBlankAlarm() : null,
  );

  useEffect(() => {
    if (alarmId === undefined) return;

    let active = true;
    getAlarm(db, alarmId).then((alarm) => {
      if (!active) return;
      if (alarm) setInitial(alarm);
      else navigation.goBack();
    });
    return () => {
      active = false;
    };
  }, [db, alarmId, navigation]);

  if (!initial) return null;

  return (
    <EditAlarmForm
      initial={initial}
      title={isNew ? 'New alarm' : 'Edit alarm'}
      onClose={navigation.goBack}
    />
  );
}

type FormProps = {
  initial: AlarmDraft;
  title: string;
  onClose: () => void;
};

function EditAlarmForm({ initial, title, onClose }: FormProps) {
  const theme = useTheme();
  const db = useSQLiteContext();

  // Draft of alarm before being saved
  const [draft, setDraft] = useState<AlarmDraft>(initial);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggleDay = (day: number) => {
    setDraft((current) => ({
      ...current,
      days: current.days.includes(day)
        ? current.days.filter((d) => d !== day)
        : [...current.days, day],
    }));
  };

  const handleSave = async () => {
    setBusy(true);
    await saveAlarm(db, draft);
    onClose();
  };

  const handleDelete = () => {
    Alert.alert('Delete alarm?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          await deleteAlarm(db, draft.id!);
          onClose();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={onClose} />
        <Appbar.Content title={title} />
        {draft.id !== undefined && (
          <Appbar.Action
            icon="delete"
            accessibilityLabel="Delete"
            disabled={busy}
            onPress={handleDelete}
          />
        )}
        <Appbar.Action icon="check" accessibilityLabel="Save" disabled={busy} onPress={handleSave} />
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
