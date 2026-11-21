import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 72,
    lineHeight: 88,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
  },
  results: {
    flexDirection: 'row',
    gap: 32,
  },
  result: {
    alignItems: 'center',
    gap: 4,
  },
  resultValue: {
    fontSize: 28,
    fontWeight: '600',
  },
  button: {
    alignSelf: 'stretch',
  },
  buttonContent: {
    paddingVertical: 12,
  },
});
