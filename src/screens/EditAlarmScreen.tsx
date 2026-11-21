import Slider from '@react-native-community/slider';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAudioPlayer } from 'expo-audio';
import { File } from 'expo-file-system';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { Appbar, Button, RadioButton, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
import {
  NestedReorderableList,
  type ReorderableListReorderEvent,
  reorderItems,
  ScrollViewContainer,
} from 'react-native-reorderable-list';

import NameSoundDialog from '../components/NameSoundDialog';
import SoundRow from '../components/SoundRow';
import StepDialog from '../components/StepDialog';
import StepRow from '../components/StepRow';
import { cancelAlarm, scheduleAlarm } from '../alarms/scheduler';
import { createBlankAlarm, deleteAlarm, getAlarm, saveAlarm } from '../data/alarms';
import { getSoundUri } from '../data/soundStorage';
import { addSound, deleteSound, getSounds, isDefaultSound } from '../data/sounds';
import type { RootStackParamList } from '../navigation/types';
import {
  type AlarmDraft,
  type AlarmStep,
  MAX_QUADRATIC_COUNT,
  MIN_QUADRATIC_COUNT,
} from '../types/alarm';
import type { Sound } from '../types/sound';
import { DAY_NAMES, DAY_ORDER } from '../utils/days';
import { confirmDelete } from '../utils/confirm';
import { formatTime } from '../utils/time';
import { styles } from './EditAlarmScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'EditAlarm'>;

/** A gap between two steps in a list so they aren't cluttered */
const StepSeparator = () => <View style={styles.stepSeparator} />;

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
      onTest={(alarm) => navigation.navigate('Ring', { alarm })}
    />
  );
}

type FormProps = {
  initial: AlarmDraft;
  initialSounds: Sound[];
  title: string;
  onClose: () => void;
  onTest: (alarm: AlarmDraft) => void;
};

function EditAlarmForm({ initial, initialSounds, title, onClose, onTest }: FormProps) {
  const theme = useTheme();
  const db = useSQLiteContext();
  const player = useAudioPlayer();

  // Draft of alarm before being saved
  const [draft, setDraft] = useState<AlarmDraft>(initial);
  const [sounds, setSounds] = useState<Sound[]>(initialSounds);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editingStep, setEditingStep] = useState<AlarmStep | 'new' | null>(null);

  // Update an existing step or add one at the end
  const saveStep = (step: AlarmStep) => {
    setDraft((current) => ({
      ...current,
      steps: current.steps.some((s) => s.key === step.key)
        ? current.steps.map((s) => (s.key === step.key ? step : s))
        : [...current.steps, step],
    }));
    setEditingStep(null);
  };

  // Called when a step is dropped in a new place.
  const moveStep = ({ from, to }: ReorderableListReorderEvent) => {
    setDraft((current) => ({ ...current, steps: reorderItems(current.steps, from, to) }));
  };

  const handleDeleteStep = (step: AlarmStep) =>
    confirmDelete(`Delete "${step.name}"?`, () =>
      setDraft((current) => ({ ...current, steps: current.steps.filter((s) => s.key !== step.key) })),
    );

  // Selecting a sound also plays a preview of it
  const selectSound = (sound: Sound) => {
    setDraft((current) => ({ ...current, soundId: sound.id }));
    player.replace({ uri: getSoundUri(sound.file) });
    player.play();
  };

  // Rings the alarm immediately with its unsaved settings
  const handleTestAlarm = () => {
    player.pause(); // Stop any sound preview first.
    onTest(draft);
  };

  const handleAddSound = async () => {
    try {
      const picked = await File.pickFileAsync({ mimeTypes: 'audio/*' });
      if (!picked.canceled) setPendingFile(picked.result);
    } catch (error) {
      Alert.alert('Could not add the file', error instanceof Error ? error.message : String(error));
    }
  };

  const handleNameConfirmed = async (name: string) => {
    if (!pendingFile) return;
    const file = pendingFile;
    setPendingFile(null);

    try {
      const sound = await addSound(db, file, name);
      setSounds((current) => [...current, sound]);
      selectSound(sound);
    } catch (error) {
      Alert.alert('Could not add the file', error instanceof Error ? error.message : String(error));
    }
  };

  // Delete a sound the user added
  const handleDeleteSound = (sound: Sound) =>
    confirmDelete(`Delete "${sound.name}"?`, async () => {
      try {
        await deleteSound(db, sound);
      } catch (error) {
        Alert.alert('Could not delete the sound', error instanceof Error ? error.message : String(error));
        return;
      }

      player.pause();
      const remaining = sounds.filter((s) => s.id !== sound.id);
      setSounds(remaining);
      // This alarm's draft may have had the deleted sound selected so fall back to the first one
      setDraft((current) =>
        current.soundId === sound.id ? { ...current, soundId: remaining[0].id } : current,
      );
    });

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
    await scheduleAlarm(await saveAlarm(db, draft));
    onClose();
  };

  const handleDelete = () =>
    confirmDelete('Delete alarm?', async () => {
      setBusy(true);
      await deleteAlarm(db, draft.id!);
      await cancelAlarm(draft.id!);
      onClose();
    });

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

      <ScrollViewContainer contentContainerStyle={styles.body}>
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
          <Text variant="titleMedium">Quadratics to solve: {draft.quadraticCount}</Text>
          <Slider
            minimumValue={MIN_QUADRATIC_COUNT}
            maximumValue={MAX_QUADRATIC_COUNT}
            step={1}
            value={draft.quadraticCount}
            onValueChange={(value) => setDraft((current) => ({ ...current, quadraticCount: value }))}
            minimumTrackTintColor={theme.colors.primary}
            thumbTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.outline}
            accessibilityLabel="Number of quadratics to solve"
          />
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium">Steps</Text>
          <Text variant="bodySmall">
            After the quadratics, scan each QR code in order to turn the alarm off. Hold a step
            and drag it to change the order.
          </Text>
          <NestedReorderableList
            scrollEnabled={false}
            data={draft.steps}
            keyExtractor={(step) => step.key}
            onReorder={moveStep}
            ItemSeparatorComponent={StepSeparator}
            renderItem={({ item, index }) => (
              <StepRow
                step={item}
                index={index}
                onPress={() => setEditingStep(item)}
                onDelete={() => handleDeleteStep(item)}
              />
            )}
          />
          <Button mode="outlined" icon="plus" onPress={() => setEditingStep('new')}>
            Add step
          </Button>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium">Sound</Text>
          <RadioButton.Group
            value={String(draft.soundId)}
            onValueChange={(value) => selectSound(sounds.find((s) => String(s.id) === value)!)}
          >
            {sounds.map((sound) => (
              <SoundRow
                key={sound.id}
                sound={sound}
                onDelete={isDefaultSound(sound) ? undefined : () => handleDeleteSound(sound)}
              />
            ))}
          </RadioButton.Group>
          <Button mode="outlined" icon="plus" onPress={handleAddSound}>
            Add file
          </Button>
        </View>

        <Button mode="contained-tonal" icon="alarm" onPress={handleTestAlarm}>
          Test Alarm
        </Button>
      </ScrollViewContainer>

      {editingStep && (
        <StepDialog
          key={editingStep === 'new' ? 'new' : editingStep.key}
          step={editingStep === 'new' ? undefined : editingStep}
          onCancel={() => setEditingStep(null)}
          onSave={saveStep}
        />
      )}

      {pendingFile && (
        <NameSoundDialog
          key={pendingFile.uri}
          visible
          initialName={pendingFile.name.replace(/\.[^.]+$/, '')}
          onCancel={() => setPendingFile(null)}
          onConfirm={handleNameConfirmed}
        />
      )}

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
