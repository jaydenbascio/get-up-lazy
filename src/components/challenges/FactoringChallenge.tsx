import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';

import CountdownBar from './CountdownBar';
import { styles } from './FactoringChallenge.styles';
import { formatQuadratic, generateQuadratic, isCorrectAnswer, parseInteger } from './quadratic';
import { useCountdown } from './useCountdown';
import { useFlash } from './useFlash';

const TIME_LIMIT_MS = 20_000;

type Props = {
  /** How many quadratics must be solved in a row. */
  count: number;
  /** The player failed: start the alarm sound again. */
  onFail: () => void;
  /** After a failure, the player solved the quadratic: silence the alarm again. */
  onSilence: () => void;
  /** All the quadratics were solved. */
  onComplete: () => void;
};

/**
 * Asks the player to find the zeros of a quadratic within the time limit, `count` times in a row.
 * Running out of time or answering wrong is a failure: the alarm sounds again until
 * the current quadratic is solved (no time limit), then the count starts again at 1.
 */
export default function FactoringChallenge({ count, onFail, onSilence, onComplete }: Props) {
  const theme = useTheme();
  const secondInput = useRef<{ focus: () => void } | null>(null);

  const [quadratic, setQuadratic] = useState(generateQuadratic);
  const [number, setNumber] = useState(1);
  const [failed, setFailed] = useState(false);
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [message, setMessage] = useState('');

  const { flash, flashThen, overlay } = useFlash();
  const completing = useRef(false);

  const fail = (reason: string) => {
    flash('error');
    setFailed(true);
    setMessage(reason);
    onFail();
  };

  // Each quadratic gets its own time limit, and there is no limit after a fail.
  const remainingMs = useCountdown({
    limitMs: TIME_LIMIT_MS,
    running: !failed,
    resetKey: quadratic,
    onExpire: () => fail("Time's up!"),
  });

  const nextQuadratic = () => {
    setQuadratic(generateQuadratic());
    setFirst('');
    setSecond('');
  };

  const canSubmit = first.trim() !== '' && second.trim() !== '';

  const handleSubmit = () => {
    if (!canSubmit || completing.current) return;

    const answer = [parseInteger(first), parseInteger(second)];
    const correct =
      answer[0] !== null &&
      answer[1] !== null &&
      isCorrectAnswer(quadratic, [answer[0], answer[1]]);

    if (!correct) {
      if (!failed) {
        fail('Wrong answer!');
      } else {
        flash('error');
        setMessage('Not quite. Try again.');
      }
      setFirst('');
      setSecond('');
      return;
    }

    if (failed) {
      flash('success');
      setFailed(false);
      setNumber(1); // User has to start over if they fail just one
      setMessage('');
      nextQuadratic();
      onSilence();
    } else if (number >= count) {
      completing.current = true;
      flashThen('success', onComplete);
    } else {
      flash('success');
      setNumber((n) => n + 1);
      nextQuadratic();
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
            {message} Your neighbors will be awoken!
          </Text>
        ) : (
          <CountdownBar remainingMs={remainingMs} limitMs={TIME_LIMIT_MS} />
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
      {overlay}
    </View>
  );
}
