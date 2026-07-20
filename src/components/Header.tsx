import { useState } from "react";
import { isSoundOn, toggleSound } from "../lib/sound";
import "./Header.css";

interface Props {
  onOpenHighscores: () => void;
  onNewGame: () => void;
}

const TITLE = "Ball Bonanza";
// Titelns bokstäver färgas i tur och ordning med spelets sex kulfärger, så att
// rubriken plockar upp de mångfärgade kulorna på brädet. Solida, klara varianter
// av gradienterna i base.css (.blue/.green/...).
const BALL_COLORS = ["#3f9bff", "#40c750", "#ff5341", "#f6cf2b", "#ec4fda", "#31ccc2"];

export default function Header({ onOpenHighscores, onNewGame }: Props) {
  const [on, setOn] = useState(isSoundOn());

  // Egen färgräknare som hoppar över mellanslaget, annars skulle färgcykeln
  // förskjutas av tecknet som inte får någon färg.
  let colorIdx = 0;

  return (
    <header>
      <h1 className="title" aria-label={TITLE}>
        {TITLE.split("").map((ch, i) => {
          if (ch === " ") return <span key={i} className="title-space" aria-hidden="true" />;
          const color = BALL_COLORS[colorIdx % BALL_COLORS.length];
          colorIdx++;
          return (
            <span
              key={i}
              className="ball-letter"
              aria-hidden="true"
              style={{ color, animationDelay: `${i * 55}ms` }}
            >
              {ch}
            </span>
          );
        })}
      </h1>
      <div className="header-btns">
        <button title="Ljud av/på" onClick={() => setOn(toggleSound())}>
          {on ? "🔊" : "🔇"}
        </button>
        <button onClick={onOpenHighscores}>🏆 Topplista</button>
        <button onClick={onNewGame}>Ny omgång</button>
      </div>
    </header>
  );
}
