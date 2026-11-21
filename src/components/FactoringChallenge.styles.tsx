import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  center: {
    alignItems: 'center',
    gap: 8,
  },
  expression: {
    fontSize: 44,
  },
  timer: {
    alignSelf: 'stretch',
    height: 8,
    borderRadius: 4,
  },
  inputs: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
