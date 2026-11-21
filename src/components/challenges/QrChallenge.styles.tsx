import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  heading: {
    alignItems: 'center',
    gap: 4,
  },
  stepName: {
    fontSize: 28,
    textAlign: 'center',
    color: 'white',
  },
  stepCount: {
    color: 'white',
  },
  message: {
    textAlign: 'center',
  },
});
