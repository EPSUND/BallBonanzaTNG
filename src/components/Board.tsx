import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { GameState } from "../game/reducer";
import type { GridPos } from "../lib/types";
import { COLOR_CLASSES, COLS, MOVE_STEP_MS, ROWS } from "../lib/engine/constants";
import "./Board.css";

interface Props {
  state: GameState;
  /** Rutstorleken i px, mätt från --tile-size (se useTileSize). */
  tile: number;
  onCellClick: (pos: GridPos) => void;
}

/* Kulornas transform byggs av --tx/--ty i stället för en inline-transform:
   rensnings- och skakanimationerna behöver kunna lägga scale/förskjutning
   OVANPÅ positionen, och @keyframes skriver annars över hela transformen. */
function posStyle(row: number, col: number, tile: number): CSSProperties {
  return { "--tx": `${col * tile}px`, "--ty": `${row * tile}px` } as CSSProperties;
}

export default function Board({ state, tile, onCellClick }: Props) {
  const { grid, selected, moving, clearing } = state;

  // "Ingen väg"-feedback: skaka den valda kulan en kort stund.
  const [shaking, setShaking] = useState(false);
  useEffect(() => {
    if (state.shakeSeq === 0) return;
    setShaking(true);
    const id = setTimeout(() => setShaking(false), 320);
    return () => clearTimeout(id);
  }, [state.shakeSeq]);

  const isClearing = (row: number, col: number) =>
    clearing !== null && clearing.some((p) => p.row === row && p.col === col);

  const cells = [];
  const balls = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      cells.push(
        <div
          key={`h${row}-${col}`}
          className="cellhit"
          style={posStyle(row, col, tile)}
          onClick={() => onCellClick({ row, col })}
        />,
      );

      const color = grid[row][col];
      if (color === null) continue;
      const sel = selected !== null && selected.row === row && selected.col === col;
      const cls = [
        "ball",
        COLOR_CLASSES[color],
        sel ? "sel" : "",
        sel && shaking ? "shake" : "",
        isClearing(row, col) ? "clearing" : "",
      ]
        .filter(Boolean)
        .join(" ");
      balls.push(<div key={`b${row}-${col}`} className={cls} style={posStyle(row, col, tile)} />);
    }
  }

  // Den rullande kulan: positionen uppdateras cell för cell av moveStep-timern
  // och CSS-transitionen glider mellan cellerna.
  let movingBall = null;
  if (moving) {
    const pos = moving.path[moving.step];
    movingBall = (
      <div
        className={`ball moving ${COLOR_CLASSES[moving.color]}`}
        style={{
          // Direkt transform (inte --tx/--ty): transitionen ska glida mellan
          // cellerna, och ändringar av oregistrerade custom properties
          // triggar inte transitions tillförlitligt i alla webbläsare.
          transform: `translate(${pos.col * tile}px, ${pos.row * tile}px)`,
          transition: `transform ${MOVE_STEP_MS}ms linear`,
        }}
      />
    );
  }

  return (
    <div className="board">
      <div className="gridlines" />
      {cells}
      {balls}
      {movingBall}
      {state.phase === "over" && <div className="gameover">GAME OVER</div>}
    </div>
  );
}
