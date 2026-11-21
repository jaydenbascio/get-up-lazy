import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, ProgressBar, Text, TextInput, useTheme } from 'react-native-paper';

import {
  formatQuadratic,
  generateQuadratic,
  isCorrectAnswer,
  parseInteger,
} from '../alarms/quadratic';
import { styles } from './FactoringChallenge.styles';

const TIME_LIMIT_MS = 20_000;

type Props = {
  count: number;
  onFail: () => void;
  onRestart: () => void;
  onComplete: () => void;
};

export default function FactoringChallenge({ count, onFail, onRestart, onComplete }: Props) {
  const theme = useTheme();
  const secondInput = useRef<{ focus: () => void } | null>(null);

  const [quadratic, setQuadratic] = useState(generateQuadratic);
  const [number, setNumber] = useState(1);
  const [failed, setFailed] = useState(false);
  const [remainingMs, setRemainingMs] = useState(TIME_LIMIT_MS);
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [message, setMessage] = useState('');

  const fail = (reason: string) => {
    setFailed(true);
    setMessage(reason);
    onFail();
  };

  useEffect(() => {
    if (failed) return;

    const deadline = Date.now() + TIME_LIMIT_MS;
    setRemainingMs(TIME_LIMIT_MS);

    const interval = setInterval(() => {
      const left = deadline - Date.now();
      if (left <= 0) {
        clearInterval(interval); // No time limit after a fail
        fail("Time's up!");
      } else {
        setRemainingMs(left);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [failed, quadratic]);

  const nextQuadratic = () => {
    setQuadratic(generateQuadratic());
    setFirst('');
    setSecond('');
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    const answer = [parseInteger(first), parseInteger(second)];
    const correct =
      answer[0] !== null &&
      answer[1] !== null &&
      isCorrectAnswer(quadratic, [answer[0], answer[1]]);

    if (!correct) {
      if (!failed) fail('Wrong answer!');
      else setMessage('Not quite. Try again.');
      setFirst('');
      setSecond('');
      return;
    }

    if (failed) {
      setFailed(false);
      setNumber(1); // User has to start over if they fail just one
      setMessage('');
      nextQuadratic();
      onRestart();
    } else if (number >= count) {
      onComplete();
    } else {
      setNumber((n) => n + 1);
      nextQuadratic();
    }
  };

  const canSubmit = first.trim() !== '' && second.trim() !== '';

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.center}>
        <Text>
          Question {number} of {count}
        </Text>
        <Text style={[styles.expression, { color: theme.colors.primary }]}>
          {formatQuadratic(quadratic)}
        </Text>
        <Text>Find the zeros</Text>
      </View>

      {failed ? (
        <Text style={[styles.message, { color: theme.colors.error }]}>
          {message} The alarm stays on until you solve this one.
        </Text>
      ) : (
        <View style={styles.center}>
          <ProgressBar
            progress={remainingMs / TIME_LIMIT_MS}
            color={remainingMs < 3_000 ? theme.colors.error : theme.colors.primary}
            style={styles.timer}
          />
          <Text>{Math.ceil(remainingMs / 1000)} s</Text>
        </View>
      )}

      <View style={styles.inputs}>
        <TextInput
          style={styles.input}
          mode="outlined"
          label="First zero"
          value={first}
          onChangeText={setFirst}
          keyboardType="numeric"
          autoFocus
          returnKeyType="next"
          onSubmitEditing={() => secondInput.current?.focus()}
        />
        <TextInput
          ref={(instance: any) => {
            secondInput.current = instance;
          }}
          style={styles.input}
          mode="outlined"
          label="Second zero"
          value={second}
          onChangeText={setSecond}
          keyboardType="numeric"
          onSubmitEditing={handleSubmit}
        />
      </View>

      <Button
        mode="contained"
        style={styles.button}
        contentStyle={styles.buttonContent}
        disabled={!canSubmit}
        onPress={handleSubmit}
      >
        Check
      </Button>
    </ScrollView>
  );
}
