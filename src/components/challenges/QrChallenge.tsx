import type { BarcodeScanningResult } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AlarmStep } from '../../types/alarm';
import CameraScanner from '../CameraScanner';
import CountdownBar from './CountdownBar';
import { styles } from './QrChallenge.styles';
import { useCountdown } from './useCountdown';
import { useFlash } from './useFlash';

/** After a code is accepted, don't detect QR codes for this long so one code isn't counted twice. */
const SCAN_COOLDOWN_MS = 1_500;
const WRONG_CODE_HINT_MS = 1_500;

type Props = {
  steps: AlarmStep[];
  /** The player ran out of time */
  onFail: () => void;
  /** After a failure, the player scanned the right code */
  onSilence: () => void;
  /** The last code was scanned. */
  onComplete: () => void;
};

export default function QrChallenge({ steps, onFail, onSilence, onComplete }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [wrongCode, setWrongCode] = useState(false);

  const { flash, flashThen, overlay } = useFlash();

  const step = steps[index];
  const limitMs = step.timeLimitSeconds * 1000;

  const remainingMs = useCountdown({
    limitMs,
    running: !failed,
    resetKey: index,
    onExpire: () => {
      flash('error');
      setFailed(true);
      onFail();
    },
  });

  const lastAccepted = useRef(0);
  const wrongTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrongHintShowing = useRef(false);
  useEffect(() => () => clearTimeout(wrongTimer.current), []);

  const handleScan = ({ data: value }: BarcodeScanningResult) => {
    if (Date.now() - lastAccepted.current < SCAN_COOLDOWN_MS) return;

    if (value !== step.qrValue) {
      if (!wrongHintShowing.current) flash('error');
      wrongHintShowing.current = true;

      setWrongCode(true);
      clearTimeout(wrongTimer.current);
      wrongTimer.current = setTimeout(() => {
        wrongHintShowing.current = false;
        setWrongCode(false);
      }, WRONG_CODE_HINT_MS);
      return;
    }

    lastAccepted.current = Date.now();
    wrongHintShowing.current = false;
    setWrongCode(false);
    if (failed) {
      setFailed(false);
      onSilence();
    }

    if (index + 1 >= steps.length) {
      flashThen('success', onComplete);
    } else {
      flash('success');
      setIndex(index + 1);
    }
  };

  return (
    <View style={styles.container}>
      <CameraScanner onScan={handleScan} />

      <View style={[styles.overlay, { paddingTop: insets.top + 16 }]}>
        <View style={styles.heading}>
          <Text variant="labelLarge" style={styles.stepCount}>
            Step {index + 1} of {steps.length}
          </Text>
          <Text style={styles.stepName}>{step.name}</Text>
        </View>

        {failed ? (
          <Text style={[styles.message, { color: theme.colors.error }]}>
            Hurry up! Your neighbors will be awoken!
          </Text>
        ) : (
          <CountdownBar remainingMs={remainingMs} limitMs={limitMs} />
        )}

        {wrongCode && (
          <Text style={[styles.message, { color: theme.colors.error }]}>
            That's not the right code.
          </Text>
        )}
      </View>

      {overlay}
    </View>
  );
}
