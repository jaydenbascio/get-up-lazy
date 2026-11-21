import { useState } from 'react';
import { Button, Dialog, Portal, Text, TextInput } from 'react-native-paper';

import {
  type AlarmStep,
  DEFAULT_STEP_TIME_LIMIT,
  MAX_STEP_TIME_LIMIT,
  MIN_STEP_TIME_LIMIT,
} from '../types/alarm';
import QrScannerModal from './QrScannerModal';
import { styles } from './StepDialog.styles';

type Props = {
  /** The step to edit, or undefined to make a new one */
  step?: AlarmStep;
  onCancel: () => void;
  onSave: (step: AlarmStep) => void;
};

const preview = (value: string) => (value.length > 40 ? `${value.slice(0, 40)}…` : value);

export default function StepDialog({ step, onCancel, onSave }: Props) {
  const [name, setName] = useState(step?.name ?? '');
  const [timeLimit, setTimeLimit] = useState(String(step?.timeLimitSeconds ?? DEFAULT_STEP_TIME_LIMIT));
  const [qrValue, setQrValue] = useState(step?.qrValue ?? '');
  const [scanning, setScanning] = useState(false);

  const seconds = Number(timeLimit);
  const timeLimitValid =
    Number.isInteger(seconds) && seconds >= MIN_STEP_TIME_LIMIT && seconds <= MAX_STEP_TIME_LIMIT;
  const canSave = name.trim() !== '' && qrValue !== '' && timeLimitValid;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      key: step?.key ?? `new-${Date.now()}`,
      name: name.trim(),
      qrValue,
      timeLimitSeconds: seconds,
    });
  };

  return (
    <>
      <Portal>
        <Dialog visible onDismiss={onCancel}>
          <Dialog.Title>{step ? 'Edit step' : 'New step'}</Dialog.Title>
          <Dialog.Content style={styles.content}>
            <TextInput
              mode="outlined"
              label="Name"
              placeholder="e.g. Bathroom mirror"
              value={name}
              onChangeText={setName}
              autoFocus={!step}
            />
            <TextInput
              mode="outlined"
              label="Time limit (seconds)"
              value={timeLimit}
              onChangeText={setTimeLimit}
              keyboardType="numeric"
              error={!timeLimitValid}
            />
            {!timeLimitValid && (
              <Text variant="bodySmall">
                Enter {MIN_STEP_TIME_LIMIT} to {MAX_STEP_TIME_LIMIT} seconds.
              </Text>
            )}

            <Text style={styles.qr}>
              {qrValue ? `QR code: ${preview(qrValue)}` : 'No QR code scanned yet'}
            </Text>
            <Button mode="outlined" icon="qrcode-scan" onPress={() => setScanning(true)}>
              {qrValue ? 'Scan again' : 'Scan QR code'}
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={onCancel}>Cancel</Button>
            <Button disabled={!canSave} onPress={handleSave}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <QrScannerModal
        visible={scanning}
        onScanned={(value) => {
          setQrValue(value);
          setScanning(false);
        }}
        onCancel={() => setScanning(false)}
      />
    </>
  );
}
