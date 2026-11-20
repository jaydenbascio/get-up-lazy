import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    padding: 16,
    gap: 32,
  },
  timeButton: {
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  time: {
    fontSize: 64,
  },
  section: {
    gap: 12,
  },
  days: {
    flexDirection: 'row',
    gap: 8,
  },
  day: {
    flex: 1,
    minWidth: 0,
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLetter: {
    fontSize: 16,
    fontWeight: '600',
  },
});
