/** Färgindex 0..5 (se COLOR_CLASSES i engine/constants.ts) eller tom ruta. */
export type Cell = number | null;
export type Grid = Cell[][];

export interface GridPos {
  row: number;
  col: number;
}

/** En rad i topplistan (aliasnamnen sätts i Supabase-selecten, se scores.ts). */
export interface ScoreEntry {
  name: string;
  score: number;
  balls: number;
  created: string;
}
