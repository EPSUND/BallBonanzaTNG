import type { Grid, GridPos } from "../types";
import { BONUS_PER_EXTRA_ROW, COLS, MIN_ROW, ROWS, rowPoints } from "./constants";

export interface ScoreRow {
  cells: GridPos[];
  diagonal: boolean;
}

/* Sökriktningar: höger, ner, ner-höger, ner-vänster. Varje maximal följd av
   samma färg hittas exakt en gång genom att bara starta där föregående ruta i
   riktningen inte har samma färg. */
const DIRECTIONS = [
  { dr: 0, dc: 1, diagonal: false },
  { dr: 1, dc: 0, diagonal: false },
  { dr: 1, dc: 1, diagonal: true },
  { dr: 1, dc: -1, diagonal: true },
];

/** Alla maximala rader (vågrätt/lodrätt/diagonalt) med ≥ MIN_ROW kulor i samma färg. */
export function findScoreRows(grid: Grid): ScoreRow[] {
  const rows: ScoreRow[] = [];

  for (const { dr, dc, diagonal } of DIRECTIONS) {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const color = grid[row][col];
        if (color === null) continue;

        const prevRow = row - dr;
        const prevCol = col - dc;
        const hasSamePrev =
          prevRow >= 0 && prevRow < ROWS && prevCol >= 0 && prevCol < COLS &&
          grid[prevRow][prevCol] === color;
        if (hasSamePrev) continue; // inte början av följden

        const cells: GridPos[] = [];
        let r = row;
        let c = col;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c] === color) {
          cells.push({ row: r, col: c });
          r += dr;
          c += dc;
        }
        if (cells.length >= MIN_ROW) rows.push({ cells, diagonal });
      }
    }
  }

  return rows;
}

/** Total poäng för en uppsättning rader, inkl. bonus för extra rader. */
export function scoreForRows(rows: ScoreRow[]): number {
  if (rows.length === 0) return 0;
  let score = 0;
  for (const row of rows) score += rowPoints(row.cells.length, row.diagonal);
  score += (rows.length - 1) * BONUS_PER_EXTRA_ROW;
  return score;
}

/** Antal rensade kulor: räknas per rad precis som i originalet (delade rutor räknas två gånger). */
export function ballsInRows(rows: ScoreRow[]): number {
  return rows.reduce((sum, row) => sum + row.cells.length, 0);
}

/** De unika rutor som ska tömmas. */
export function cellsToClear(rows: ScoreRow[]): GridPos[] {
  const seen = new Set<number>();
  const cells: GridPos[] = [];
  for (const row of rows) {
    for (const cell of row.cells) {
      const k = cell.row * COLS + cell.col;
      if (!seen.has(k)) {
        seen.add(k);
        cells.push(cell);
      }
    }
  }
  return cells;
}
