import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAudioPlayer } from 'expo-audio';
import { File } from 'expo-file-system';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Appbar, Button, RadioButton, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';

import { createBlankAlarm, deleteAlarm, getAlarm, saveAlarm } from '../data/alarms';
import { getSoundUri } from '../data/soundStorage';
import { addSound, getSounds } from '../data/sounds';
import type { RootStackParamList } from '../navigation/types';
import type { AlarmDraft } from '../types/alarm';
import type { Sound } from '../types/sound';
import { DAY_NAMES, DAY_ORDER } from '../utils/days';
import { formatTime } from '../utils/time';
import { styles } from './EditAlarmScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'EditAlarm'>;

export default function EditAlarmScreen({ navigation, route }: Props) {
  const db = useSQLiteContext();

  // No alarmId means we are creating a new alarm.
  const alarmId = route.params?.alarmId;
  const isNew = alarmId === undefined;

  const [loaded, setLoaded] = useState<{ initial: AlarmDraft; sounds: Sound[] } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const sounds = await getSounds(db);
      // A new alarm defaults to the first sound
      const alarm =
        alarmId === undefined ? createBlankAlarm(sounds[0].id) : await getAlarm(db, alarmId);

      if (!active) return;
      if (alarm) setLoaded({ initial: alarm, sounds });
      else navigation.goBack();
    })();
    return () => {
      active = false;
    };
  }, [db, alarmId, navigation]);

  if (!loaded) return null;

  return (
    <EditAlarmForm
      initial={loaded.initial}
      initialSounds={loaded.sounds}
      title={isNew ? 'New alarm' : 'Edit alarm'}
      onClose={navigation.goBack}
    />
  );
}

type FormProps = {
  initial: AlarmDraft;
  initialSounds: Sound[];
  title: string;
  onClose: () => void;
};

function EditAlarmForm({ initial, initialSounds, title, onClose }: FormProps) {
  const theme = useTheme();
  const db = useSQLiteContext();
  const player = useAudioPlayer();

  // Draft of alarm before being saved
  const [draft, setDraft] = useState<AlarmDraft>(initial);
  const [sounds, setSounds] = useState<Sound[]>(initialSounds);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  // Selecting a sound also plays a preview of it
  const selectSound = (sound: Sound) => {
    setDraft((current) => ({ ...current, soundId: sound.id }));
    player.replace({ uri: getSoundUri(sound.file) });
    player.play();
  };

  // Add an audio file with the file picker
  const handleAddSound = async () => {
    try {
      const picked = await File.pickFileAsync({ mimeTypes: 'audio/*' });
      if (picked.canceled) return;

      const sound = await addSound(db, picked.result);
      setSounds((current) => [...current, sound]);
      selectSound(sound);
    } catch (error) {
      Alert.alert('Could not add the file', error instanceof Error ? error.message : String(error));
    }
  };

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

      <ScrollView contentContainerStyle={styles.body}>
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

        <View style={styles.section}>
          <Text variant="titleMedium">Sound</Text>
          <RadioButton.Group
            value={String(draft.soundId)}
            onValueChange={(value) => selectSound(sounds.find((s) => String(s.id) === value)!)}
          >
            {sounds.map((sound) => (
              <RadioButton.Item key={sound.id} label={sound.name} value={String(sound.id)} />
            ))}
          </RadioButton.Group>
          <Button mode="outlined" icon="plus" onPress={handleAddSound}>
            Add file
          </Button>
        </View>
      </ScrollView>

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
