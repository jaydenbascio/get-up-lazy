import { View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

import Confetti from '../Confetti';
import { styles } from './Celebration.styles';

type Props = {
  onFinish: () => void;
};

/** Shown when every challenge is done: confetti, congratulations, and a button to start the day. */
export default function Celebration({ onFinish }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Confetti />

      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={[styles.title, { color: theme.colors.primary }]}>Congratulations!</Text>
        <Text style={styles.subtitle}>You are ready to begin your day</Text>
      </View>

      <Button
        mode="contained"
        style={styles.button}
        contentStyle={styles.buttonContent}
        onPress={onFinish}
      >
        Start your morning
      </Button>
    </View>
  );
}
