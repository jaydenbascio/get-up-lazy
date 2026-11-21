import { type BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { Linking, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

import { styles } from './CameraScanner.styles';

type Props = {
  // Called with every detected QR code, called many times per frame
  onScan: (result: BarcodeScanningResult) => void;
};

/** Fills the parent with a camera that reads QR codes */
export default function CameraScanner({ onScan }: Props) {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) return <View style={StyleSheet.absoluteFill} />;

  if (!permission.granted) {
    return (
      <View style={[styles.prompt, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.promptText}>The camera is needed to scan QR codes.</Text>
        <Button
          mode="contained"
          onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
        >
          {permission.canAskAgain ? 'Allow camera' : 'Open settings'}
        </Button>
      </View>
    );
  }

  return (
    <CameraView
      style={StyleSheet.absoluteFill}
      facing="back"
      barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      onBarcodeScanned={onScan}
    />
  );
}
