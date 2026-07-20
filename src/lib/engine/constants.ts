/* Spelkonstanter – värdena kommer från original-appletens GameEngine och
   BallBonanzaScoreKeeper (EPSUND/BallBonanza) och ska inte ändras utan att
   spelet medvetet balanseras om. */

export const ROWS = 10;
export const COLS = 10;

export const NUM_COLORS = 6;
/** CSS-klassnamn per färgindex, samma färger som originalets bmp-texturer. */
export const COLOR_CLASSES = ["blue", "green", "red", "yellow", "magenta", "teal"] as const;

export const NUM_START_BALLS = 5;
export const NUM_BALLS_TO_ADD = 3;

/** Minsta radlängd som ger poäng. */
export const MIN_ROW = 5;

/** Poäng per radlängd (rak rad). Diagonal rad ger +1. Rader ≥9 räknas som 9. */
const ROW_SCORES: Record<number, number> = { 5: 1, 6: 3, 7: 10, 8: 15, 9: 25 };
export const BONUS_PER_EXTRA_ROW = 1;

export function rowPoints(length: number, diagonal: boolean): number {
  const capped = Math.min(Math.max(length, MIN_ROW), 9);
  return ROW_SCORES[capped] + (diagonal ? 1 : 0);
}

/* Animationstakter (ms). Originalet flyttade kulan en cell per 100 ms. */
export const MOVE_STEP_MS = 80;
export const CLEAR_MS = 380;
