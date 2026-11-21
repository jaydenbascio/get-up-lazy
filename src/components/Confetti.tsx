import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions } from 'react-native';

const COLORS = ['#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#2196F3', '#00BCD4', '#4CAF50', '#FFEB3B', '#FF9800'];
const PIECE_COUNT = 70;

type Piece = {
  color: string;
  /** Where it starts along the width of the screen*/
  x: number;
  /** How much it drifts sideways while falling */
  drift: number;
  /** How many degrees it spins on the way down */
  spin: number;
  size: number;
  /** How long one fall takes */
  duration: number;
  /** How long to wait before the first fall, so the pieces don't all drop together */
  delay: number;
};

const random = (min: number, max: number) => min + Math.random() * (max - min);

function ConfettiPiece({ piece, height }: { piece: Piece; height: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(piece.delay),
      Animated.loop(
        Animated.timing(progress, {
          toValue: 1,
          duration: piece.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
    ]);
    animation.start();
    return () => animation.stop();
  }, [piece, progress]);

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: piece.x,
          width: piece.size,
          height: piece.size * 0.6,
          backgroundColor: piece.color,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-40, height + 40] }) },
            { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, piece.drift] }) },
            { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${piece.spin}deg`] }) },
          ],
        },
      ]}
    />
  );
}

/** Colorful paper constantly falling over the whole screen */
export default function Confetti() {
  const { width, height } = useWindowDimensions();

  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: PIECE_COUNT }, () => ({
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        x: random(0, width),
        drift: random(-80, 80),
        spin: random(360, 1080) * (Math.random() < 0.5 ? -1 : 1),
        size: random(8, 14),
        duration: random(2500, 4500),
        delay: random(0, 2500),
      })),
    [width],
  );

  return (
    <>
      {pieces.map((piece, index) => (
        <ConfettiPiece key={index} piece={piece} height={height} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
  },
});
