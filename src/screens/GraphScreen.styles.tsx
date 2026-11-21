import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionTitle: {
    marginBottom: 12,
  },
});
