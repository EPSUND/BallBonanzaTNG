import Overlay from "./Overlay";
import "./HelpDialog.css";

interface Props {
  onClose: () => void;
}

/* Poängtabellen ur originalets "How to play" (BallBonanzaScoreKeeper). */
const SCORE_TABLE: Array<[number, number, number]> = [
  [5, 1, 2],
  [6, 3, 4],
  [7, 10, 11],
  [8, 15, 16],
  [9, 25, 26],
];

export default function HelpDialog({ onClose }: Props) {
  return (
    <Overlay>
      <h2>Hur man spelar</h2>
      <p>
        Flytta kulorna så att minst <b>fem kulor i samma färg</b> hamnar i rad – vågrätt,
        lodrätt eller diagonalt. Raden rensas då och ger poäng.
      </p>
      <p>
        Klicka på en kula för att välja den och sedan på en tom ruta för att flytta dit den.
        Kulan kan bara flyttas om det finns en <b>fri väg</b> mellan rutorna.
      </p>
      <p>
        Efter varje drag som inte ger poäng läggs <b>tre nya kulor</b> ut på brädet – rutan
        Nästa visar vilka färger som kommer. Blir brädet fullt är spelet över.
      </p>

      <h2 className="helprubrik">Poäng</h2>
      <table className="scoretable">
        <tbody>
          <tr>
            <th>Kulor i rad</th>
            <th>Rak rad</th>
            <th>Diagonal</th>
          </tr>
          {SCORE_TABLE.map(([len, straight, diag]) => (
            <tr key={len}>
              <td>{len}</td>
              <td>{straight}</td>
              <td>{diag}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: 10 }}>
        Rensas flera rader samtidigt ges 1 bonuspoäng per extra rad.
      </p>

      <div className="btnrow">
        <button className="primary" style={{ flex: 1 }} onClick={onClose}>
          Stäng
        </button>
      </div>
    </Overlay>
  );
}
