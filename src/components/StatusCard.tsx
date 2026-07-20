import { COLOR_CLASSES } from "../lib/engine/constants";
import "./StatusCard.css";

interface Props {
  score: number;
  /** Antal rensade kulor. */
  balls: number;
  /** Färgerna på nästa omgångs kulor. */
  next: number[];
}

export default function StatusCard({ score, balls, next }: Props) {
  return (
    <section className="card status">
      <div className="statgrid">
        <div className="stat">
          <h2>Poäng</h2>
          <b>{score}</b>
        </div>
        <div className="stat">
          <h2>Kulor</h2>
          <b>{balls}</b>
        </div>
        <div className="stat">
          <h2>Nästa</h2>
          <div className="nextballs">
            {next.map((color, i) => (
              <span key={i} className={`miniball ${COLOR_CLASSES[color]}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
