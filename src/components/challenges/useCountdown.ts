import { useEffect, useRef, useState } from 'react';

type Options = {
  /** How long the countdown lasts. */
  limitMs: number;
  /** The countdown only runs while this is true. It starts over on rising edges */
  running: boolean;
  /** Changing this starts the countdown over, e.g. when a new question appears. */
  resetKey: unknown;
  /** Called once when the time runs out. */
  onExpire: () => void;
};

/** Counts down from `limitMs`, and returns the milliseconds that are left. */
export function useCountdown({ limitMs, running, resetKey, onExpire }: Options): number {
  const [remainingMs, setRemainingMs] = useState(limitMs);

  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!running) return;

    // Reset the timer
    const deadline = Date.now() + limitMs;
    setRemainingMs(limitMs);

    const interval = setInterval(() => {
      const left = deadline - Date.now();
      if (left <= 0) {
        clearInterval(interval);
        onExpireRef.current();
      } else {
        setRemainingMs(left);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [limitMs, running, resetKey]);

  return remainingMs;
}
