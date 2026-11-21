import type { BarcodeScanningResult } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { Modal, View } from 'react-native';
import { Button, IconButton, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CameraScanner from './CameraScanner';
import { styles } from './QrScannerModal.styles';

/**
 * The box is only drawn while the camera is currently seeing the code. The camera reports
 * about 10 times a second, so a longer wait would leave the box frozen over a spot the
 * moving camera has already left.
 */
const SHOW_BOX_MS = 300;

/** The code stays selectable for a bit longer, so a shaky hand can still press "Use". */
const KEEP_DETECTION_MS = 1_500;

type Props = {
  visible: boolean;
  /** Called with the text of the QR code when the user presses "Use". */
  onScanned: (value: string) => void;
  onCancel: () => void;
};

// Get the smallest box that contains all of @p cornerPoints
function boundingBox({ cornerPoints }: BarcodeScanningResult) {
  if (cornerPoints.length === 0) return null;

  const xs = cornerPoints.map((point) => point.x);
  const ys = cornerPoints.map((point) => point.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  const box = { left, top, width: Math.max(...xs) - left, height: Math.max(...ys) - top };

  return Object.values(box).every(Number.isFinite) && box.width > 8 && box.height > 8 ? box : null;
}

// Full-screen camera that outlines detected QR codes
export default function QrScannerModal({ visible, onScanned, onCancel }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [detected, setDetected] = useState<BarcodeScanningResult | null>(null);
  const [boxVisible, setBoxVisible] = useState(false);

  // Each time the camera sees the code, restart both countdowns.
  const hideBoxTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const forgetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(
    () => () => {
      clearTimeout(hideBoxTimer.current);
      clearTimeout(forgetTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (!visible) {
      setDetected(null);
      setBoxVisible(false);
    }
  }, [visible]);

  const handleScan = (result: BarcodeScanningResult) => {
    setDetected(result);
    setBoxVisible(true);

    clearTimeout(hideBoxTimer.current);
    hideBoxTimer.current = setTimeout(() => setBoxVisible(false), SHOW_BOX_MS);
    clearTimeout(forgetTimer.current);
    forgetTimer.current = setTimeout(() => setDetected(null), KEEP_DETECTION_MS);
  };

  const box = detected && boxVisible ? boundingBox(detected) : null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <CameraScanner onScan={handleScan} />

        {box && (
          <View pointerEvents="none" style={[styles.box, box, { borderColor: theme.colors.primary }]} />
        )}

        <IconButton
          icon="close"
          mode="contained"
          accessibilityLabel="Cancel scanning"
          style={[styles.close, { top: insets.top + 8 }]}
          onPress={onCancel}
        />

        <View style={styles.bottom}>
          <Text style={styles.text} numberOfLines={2}>
            {detected ? detected.data : 'Point the camera at a QR code'}
          </Text>
          {detected && (
            <Button mode="contained" style={styles.button} onPress={() => onScanned(detected.data)}>
              Use
            </Button>
          )}
        </View>
      </View>
    </Modal>
  );
}
