/** A quadratic in standard form, x² + bx + c, whose zeros are always integers. */
export type Quadratic = {
  b: number;
  c: number;
  zeros: [number, number];
};

const MAX_ZERO = 9;

const randomInt = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max - min + 1));

/** A random non-zero integer */
const randomZero = (): number => {
  const value = randomInt(1, MAX_ZERO);
  return Math.random() < 0.5 ? -value : value;
};

/** Get a quadratic with 2 random non-zero integer zeros (may be perfect square) */
export function generateQuadratic(): Quadratic {
  const first = randomZero();
  const second = randomZero();

  // (x - first)(x - second) = x² - (first + second)x + first * second
  return { b: -(first + second), c: first * second, zeros: [first, second] };
}

/** Writes the quadratic in standard form, e.g. "x² - 5x + 6". */
export function formatQuadratic({ b, c }: Quadratic): string {
  const sign = (value: number) => (value < 0 ? '-' : '+');
  const magnitude = (value: number) => (Math.abs(value) === 1 ? '' : String(Math.abs(value)));

  let text = 'x²';
  if (b !== 0) text += ` ${sign(b)} ${magnitude(b)}x`;
  if (c !== 0) text += ` ${sign(c)} ${Math.abs(c)}`;
  return text;
}

/** Read an integer the user typed, null if invalid. */
export function parseInteger(text: string): number | null {
  const trimmed = text.replace('-', '-').trim();
  return /^-?\d+$/.test(trimmed) ? Number(trimmed) : null;
}

/** Check whether @p answer correctly lists the zeros of a quadratic */
export function isCorrectAnswer({ zeros }: Quadratic, answer: [number, number]): boolean {
  const [first, second] = zeros;
  return (
    (answer[0] === first && answer[1] === second) || (answer[0] === second && answer[1] === first)
  );
}
