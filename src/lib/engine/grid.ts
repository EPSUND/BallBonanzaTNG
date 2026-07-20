import type { Grid, GridPos } from "../types";
import { COLS, ROWS } from "./constants";

export function makeEmptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array<null>(COLS).fill(null));
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.slice());
}

export function emptyCells(grid: Grid): GridPos[] {
  const cells: GridPos[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row][col] === null) cells.push({ row, col });
    }
  }
  return cells;
}

export function isFull(grid: Grid): boolean {
  return emptyCells(grid).length === 0;
}
