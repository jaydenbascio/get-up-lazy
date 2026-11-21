import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  close: {
    position: 'absolute',
    left: 8,
  },
  // Drawn over the detected QR code
  box: {
    position: 'absolute',
    borderWidth: 4,
    borderRadius: 12,
  },
  bottom: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 48,
    alignItems: 'center',
    gap: 12,
  },
  text: {
    textAlign: 'center',
    color: 'white',
  },
  button: {
    alignSelf: 'stretch',
  },
});
