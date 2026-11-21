import { StyleSheet } from 'react-native';

export const CHART_HEIGHT = 160;

export const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  scale: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  bars: {
    flexDirection: 'row',
    gap: 4,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barArea: {
    height: CHART_HEIGHT,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
  },
  bar: {
    width: '70%',
    maxWidth: 28,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    overflow: 'hidden',
  },
});
