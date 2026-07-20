import type { Grid, GridPos } from "../types";
import { COLS, ROWS } from "./constants";

/**
 * Kortaste vägen från start till dest genom tomma rutor (4-grannskap).
 * Returnerar hela vägen inklusive start och mål, eller null om ingen väg finns.
 * Originalet använde A*; BFS ger samma kortaste väg på ett oviktat rutnät.
 */
export function findPath(grid: Grid, start: GridPos, dest: GridPos): GridPos[] | null {
  if (grid[dest.row][dest.col] !== null) return null;

  const key = (p: GridPos) => p.row * COLS + p.col;
  const cameFrom = new Map<number, number>();
  cameFrom.set(key(start), -1);

  const queue: GridPos[] = [start];
  let found = false;

  while (queue.length > 0 && !found) {
    const cur = queue.shift()!;
    const neighbors: GridPos[] = [
      { row: cur.row, col: cur.col - 1 },
      { row: cur.row, col: cur.col + 1 },
      { row: cur.row - 1, col: cur.col },
      { row: cur.row + 1, col: cur.col },
    ];
    for (const n of neighbors) {
      if (n.row < 0 || n.row >= ROWS || n.col < 0 || n.col >= COLS) continue;
      if (grid[n.row][n.col] !== null) continue;
      if (cameFrom.has(key(n))) continue;
      cameFrom.set(key(n), key(cur));
      if (n.row === dest.row && n.col === dest.col) {
        found = true;
        break;
      }
      queue.push(n);
    }
  }

  if (!found) return null;

  const path: GridPos[] = [];
  let k = key(dest);
  while (k !== -1) {
    path.push({ row: Math.floor(k / COLS), col: k % COLS });
    k = cameFrom.get(k)!;
  }
  path.reverse();
  return path;
}
