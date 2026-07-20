import "./ControlsCard.css";

interface Props {
  onRestart: () => void;
  onHelp: () => void;
  /** Sätts bara när slutdialogen är stängd och kan öppnas igen. */
  onShowResult?: () => void;
}

export default function ControlsCard({ onRestart, onHelp, onShowResult }: Props) {
  return (
    <section className="card controls">
      <h2>Kontroller</h2>
      <div className="ctrlbtns">
        <button onClick={onRestart}>Ny omgång</button>
        <button onClick={onHelp}>Hur man spelar</button>
        {onShowResult && (
          <button className="primary" onClick={onShowResult}>
            Visa resultat
          </button>
        )}
      </div>
      <p className="hint">
        Klicka på en kula och sedan på en tom ruta – kulan rullar dit om vägen är fri.
      </p>
    </section>
  );
}
