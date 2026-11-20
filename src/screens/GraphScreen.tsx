import { StyleSheet, View } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';

export default function GraphScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Graph" />
      </Appbar.Header>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
