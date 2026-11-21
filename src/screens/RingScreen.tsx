import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import notifee from 'react-native-notify-kit';

import { getAlarm } from '../data/alarms';
import { getSoundUri } from '../data/soundStorage';
import { getSound } from '../data/sounds';
import type { RootStackParamList } from '../navigation/types';
import type { Alarm } from '../types/alarm';
import { formatTime } from '../utils/time';
import { styles } from './RingScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Ring'>;

/** Shown while an alarm is going off. */
export default function RingScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const db = useSQLiteContext();
  const player = useAudioPlayer();
  const { alarmId } = route.params;
  const [alarm, setAlarm] = useState<Alarm | null>(null);

  // The alarm can only be stopped with "Next", so the back button does nothing here.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      // Silence the notification's own sound to play the alarm's sound instead
      await notifee.cancelDisplayedNotifications();

      const loaded = await getAlarm(db, alarmId);
      if (!active) return;
      if (!loaded) return navigation.goBack(); // The alarm was deleted before it rang.
      setAlarm(loaded);

      const sound = await getSound(db, loaded.soundId);
      if (!active || !sound) return;

      await setAudioModeAsync({ playsInSilentMode: true });
      player.loop = true;
      player.replace({ uri: getSoundUri(sound.file) });
      player.play();
    })();

    return () => {
      active = false;
      player.pause();
    };
  }, [db, alarmId, navigation, player]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={styles.label}>Alarm</Text>
      <Text style={[styles.time, { color: theme.colors.primary }]}>
        {alarm ? formatTime(alarm.hour, alarm.minute) : ''}
      </Text>
      <Button
        mode="contained"
        style={styles.button}
        contentStyle={styles.buttonContent}
        onPress={() => navigation.goBack()}
      >
        Next
      </Button>
    </View>
  );
}
