import "./ControlsCard.css";

interface Props {
  onHelp: () => void;
  /** Sätts bara när slutdialogen är stängd och kan öppnas igen. */
  onShowResult?: () => void;
}

export default function ControlsCard({ onHelp, onShowResult }: Props) {
  return (
    <section className="card controls">
      <h2>Alternativ</h2>
      <div className="ctrlbtns">
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
