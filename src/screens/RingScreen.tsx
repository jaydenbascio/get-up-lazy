import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import notifee from 'react-native-notify-kit';

import FactoringChallenge from '../components/FactoringChallenge';
import { getAlarm } from '../data/alarms';
import { getSoundUri } from '../data/soundStorage';
import { getSound } from '../data/sounds';
import type { RootStackParamList } from '../navigation/types';
import type { AlarmDraft } from '../types/alarm';
import { formatTime } from '../utils/time';
import { styles } from './RingScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Ring'>;

/** Shown while an alarm is going off. */
export default function RingScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const db = useSQLiteContext();
  const player = useAudioPlayer();
  
  // Alarm data may be provided directly in params instead of database
  const alarmId = 'alarmId' in route.params ? route.params.alarmId : null;
  const testAlarm = 'alarm' in route.params ? route.params.alarm : null;
  const [alarm, setAlarm] = useState<AlarmDraft | null>(null);
  const [factoring, setFactoring] = useState(false);

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

      const loaded = testAlarm ?? (alarmId === null ? null : await getAlarm(db, alarmId));
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
  }, [db, alarmId, testAlarm, navigation, player]);

  const handleNext = () => {
    player.pause();
    setFactoring(true);
  };

  if (factoring && alarm) {
    return (
      <View style={[styles.challenge, { backgroundColor: theme.colors.background }]}>
        <FactoringChallenge
          count={alarm.quadraticCount}
          onFail={() => player.play()}
          onRestart={() => player.pause()}
          onComplete={() => navigation.goBack()}
        />
      </View>
    );
  }

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
        disabled={!alarm}
        onPress={handleNext}
      >
        Next
      </Button>
    </View>
  );
}
