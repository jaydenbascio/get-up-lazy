import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import notifee from 'react-native-notify-kit';

import { Celebration, FactoringChallenge, QrChallenge } from '../components/challenges';
import { getAlarm } from '../data/alarms';
import { getSoundUri } from '../data/soundStorage';
import { getSound } from '../data/sounds';
import { recordWakeUp } from '../data/wakeUps';
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
  const [phase, setPhase] = useState<'ringing' | 'factoring' | 'scanning' | 'celebrating'>(
    'ringing',
  );


  const [result, setResult] = useState<{ phoneMs: number; totalMs: number } | null>(null);

  // For the report
  const rangAt = useRef(0);
  const phoneMs = useRef(0);
  const recorded = useRef(false);

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
      rangAt.current = Date.now();

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
    phoneMs.current = Date.now() - rangAt.current; // Got to the phone
    player.pause();
    setPhase('factoring');
  };

  const finish = () => {
    const totalMs = Date.now() - rangAt.current;
    setResult({ phoneMs: phoneMs.current, totalMs });
    setPhase('celebrating');

    if (testAlarm !== null || recorded.current || !alarm) return;
    recorded.current = true;

    recordWakeUp(db, {
      alarmId: alarm.id ?? null,
      rangAt: rangAt.current,
      phoneMs: phoneMs.current,
      totalMs,
    }).catch((error) => console.warn('Could not save the wake-up', error));
  };

  // Failing a challenge starts the alarm again. Solving it afterwards silences it again.
  const challengeProps = {
    onFail: () => player.play(),
    onSilence: () => player.pause(),
  };

  if (phase === 'factoring' && alarm) {
    return (
      <View style={[styles.challenge, { backgroundColor: theme.colors.background }]}>
        <FactoringChallenge
          {...challengeProps}
          count={alarm.quadraticCount}
          // The QR steps come next, if the alarm has any.
          onComplete={() => (alarm.steps.length > 0 ? setPhase('scanning') : finish())}
        />
      </View>
    );
  }

  if (phase === 'scanning' && alarm) {
    return (
      <View style={[styles.challenge, { backgroundColor: theme.colors.background }]}>
        <QrChallenge
          {...challengeProps}
          steps={alarm.steps}
          onComplete={finish}
        />
      </View>
    );
  }

  // Everything is done! The alarm is over when the user presses "finish" on the celebration page
  if (phase === 'celebrating' && result) {
    return (
      <View style={styles.challenge}>
        <Celebration
          phoneMs={result.phoneMs}
          totalMs={result.totalMs}
          // Real alarms send you to the graph tab
          onFinish={() =>
            testAlarm === null ? navigation.popTo('Tabs', { screen: 'Graph' }) : navigation.goBack()
          }
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
