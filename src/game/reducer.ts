import type { Grid, GridPos } from "../lib/types";
import { NUM_BALLS_TO_ADD, NUM_COLORS, NUM_START_BALLS } from "../lib/engine/constants";
import { cloneGrid, emptyCells, isFull, makeEmptyGrid } from "../lib/engine/grid";
import { findPath } from "../lib/engine/pathfinder";
import { randInt } from "../lib/engine/rng";
import { ballsInRows, cellsToClear, findScoreRows, scoreForRows } from "../lib/engine/score";

export interface MovingBall {
  color: number;
  /** Hela vägen inkl. start och mål. */
  path: GridPos[];
  step: number;
}

export interface GameState {
  phase: "playing" | "over";
  grid: Grid;
  /** Färgerna på de kulor som läggs ut efter nästa poänglösa drag. */
  next: number[];
  score: number;
  /** Antal rensade kulor. */
  balls: number;
  selected: GridPos | null;
  moving: MovingBall | null;
  /** Rutor under rensningsanimation – kulorna ligger kvar i grid tills clearDone. */
  clearing: GridPos[] | null;
  /** Radlängder för ljudeffekterna, konsumeras av useGame när clearSeq ändras. */
  clearLengths: number[];
  clearSeq: number;
  /** "Ingen väg"-feedback: skaka den valda kulan. */
  shakeSeq: number;
  /** Ren PRNG – Math.random() i reducern hade brutit mot StrictMode-dubbelkörningen. */
  seed: number;
}

export type Action =
  | { type: "start"; seed: number }
  | { type: "cellClick"; pos: GridPos }
  | { type: "moveStep" }
  | { type: "clearDone" };

/** Lägger ut kulor med givna färger på slumpade tomma rutor. */
function spawnBalls(grid: Grid, colors: number[], seed: number): { seed: number; placedAll: boolean } {
  for (const color of colors) {
    const empties = emptyCells(grid);
    if (empties.length === 0) return { seed, placedAll: false };
    const [i, s] = randInt(seed, empties.length);
    seed = s;
    grid[empties[i].row][empties[i].col] = color;
  }
  return { seed, placedAll: true };
}

function randomColors(count: number, seed: number): { colors: number[]; seed: number } {
  const colors: number[] = [];
  for (let i = 0; i < count; i++) {
    const [c, s] = randInt(seed, NUM_COLORS);
    seed = s;
    colors.push(c);
  }
  return { colors, seed };
}

export function initState(seed: number): GameState {
  const grid = makeEmptyGrid();
  const start = randomColors(NUM_START_BALLS, seed);
  const spawned = spawnBalls(grid, start.colors, start.seed);
  const next = randomColors(NUM_BALLS_TO_ADD, spawned.seed);

  return {
    phase: "playing",
    grid,
    next: next.colors,
    score: 0,
    balls: 0,
    selected: null,
    moving: null,
    clearing: null,
    clearLengths: [],
    clearSeq: 0,
    shakeSeq: 0,
    seed: next.seed,
  };
}

/**
 * Efter att en kula landat eller nya kulor lagts ut: hitta poängrader och gå
 * in i rensningsfasen, annars lägg ut nya kulor. Ordningen följer originalet:
 * ett drag som ger poäng ger INGA nya kulor, och blir brädet fullt av de nya
 * kulorna är spelet över innan eventuella rader hinner räknas.
 */
function resolveBoard(state: GameState, grid: Grid, seed: number): GameState {
  const rows = findScoreRows(grid);
  if (rows.length > 0) {
    return {
      ...state,
      grid,
      seed,
      score: state.score + scoreForRows(rows),
      balls: state.balls + ballsInRows(rows),
      clearing: cellsToClear(rows),
      clearLengths: rows.map((r) => r.cells.length),
      clearSeq: state.clearSeq + 1,
    };
  }

  // Inga poäng → lägg ut nästa omgång kulor
  const spawned = spawnBalls(grid, state.next, seed);
  if (!spawned.placedAll || isFull(grid)) {
    return { ...state, grid, seed: spawned.seed, phase: "over" };
  }

  const next = randomColors(NUM_BALLS_TO_ADD, spawned.seed);
  const newRows = findScoreRows(grid);
  if (newRows.length > 0) {
    return {
      ...state,
      grid,
      next: next.colors,
      seed: next.seed,
      score: state.score + scoreForRows(newRows),
      balls: state.balls + ballsInRows(newRows),
      clearing: cellsToClear(newRows),
      clearLengths: newRows.map((r) => r.cells.length),
      clearSeq: state.clearSeq + 1,
    };
  }

  return { ...state, grid, next: next.colors, seed: next.seed };
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "start":
      return initState(action.seed);

    case "cellClick": {
      if (state.phase !== "playing" || state.moving || state.clearing) return state;
      const { pos } = action;
      const cell = state.grid[pos.row][pos.col];

      if (cell !== null) {
        // Klick på en kula: välj den (eller avmarkera vid klick på samma)
        const same = state.selected && state.selected.row === pos.row && state.selected.col === pos.col;
        return { ...state, selected: same ? null : pos };
      }

      if (!state.selected) return state;

      // Klick på en tom ruta med en vald kula: försök flytta
      const path = findPath(state.grid, state.selected, pos);
      if (!path || path.length < 2) {
        return { ...state, shakeSeq: state.shakeSeq + 1 };
      }

      const grid = cloneGrid(state.grid);
      const color = grid[state.selected.row][state.selected.col]!;
      grid[state.selected.row][state.selected.col] = null;
      return {
        ...state,
        grid,
        selected: null,
        moving: { color, path, step: 0 },
      };
    }

    case "moveStep": {
      if (!state.moving) return state;
      const { path, step, color } = state.moving;

      if (step < path.length - 2) {
        return { ...state, moving: { ...state.moving, step: step + 1 } };
      }

      // Sista steget: kulan landar
      const dest = path[path.length - 1];
      const grid = cloneGrid(state.grid);
      grid[dest.row][dest.col] = color;
      return resolveBoard({ ...state, moving: null }, grid, state.seed);
    }

    case "clearDone": {
      if (!state.clearing) return state;
      const grid = cloneGrid(state.grid);
      for (const cell of state.clearing) grid[cell.row][cell.col] = null;
      return { ...state, grid, clearing: null };
    }
  }
}
