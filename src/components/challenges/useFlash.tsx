import { useCallback, useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

export type FlashKind = 'success' | 'error';

const COLORS: Record<FlashKind, string> = { success: '#2ECC71', error: '#E53935' };

/** How opaque the overlay is at the start of a flash, before it fades out. */
const START_OPACITY = 0.45;
const FADE_MS = 700;

/** How long after the flash begins the callback for screen change should be called */
const PAUSE_MS = 450;

/** @brief A see-through green or red overlay that fades out gradually */
export function useFlash() {
  const opacities = useRef({
    success: new Animated.Value(0),
    error: new Animated.Value(0),
  }).current;

  const pending = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(pending.current), []);

  const flash = useCallback(
    (kind: FlashKind) => {
      const opacity = opacities[kind];
      opacity.stopAnimation();
      opacity.setValue(START_OPACITY);
      Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: false }).start();
    },
    [opacities],
  );

  /** Flashes, then calls @p callback a moment later */
  const flashThen = useCallback(
    (kind: FlashKind, callback: () => void) => {
      flash(kind);
      clearTimeout(pending.current);
      pending.current = setTimeout(callback, PAUSE_MS);
    },
    [flash],
  );

  const overlay = (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: COLORS.success, opacity: opacities.success },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.error, opacity: opacities.error }]}
      />
    </>
  );

  return { flash, flashThen, overlay };
}
