import { useEffect, useState } from "react";
import type { ScoreEntry } from "../lib/types";
import { loadScores, submitScore } from "../lib/scores";
import HighscoreTable from "./HighscoreTable";
import Overlay from "./Overlay";
import "./EndDialog.css";

interface Props {
  score: number;
  balls: number;
  onAgain: () => void;
  onClose: () => void;
  /* saved ligger i App och inte här, eftersom dialogen kan stängas och öppnas
     igen – annars hade namnformuläret kommit tillbaka och man hade kunnat
     spara samma resultat till topplistan flera gånger. */
  saved: boolean;
  onSaved: () => void;
}

export default function EndDialog({ score, balls, onAgain, onClose, saved, onSaved }: Props) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [entries, setEntries] = useState<ScoreEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    loadScores()
      .then((list) => {
        if (alive) {
          setEntries(list);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (alive) {
          setError(e instanceof Error ? e.message : "Fel");
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  const onSave = async () => {
    const finalName = name.trim().slice(0, 18) || "Anonym";
    setSaving(true);
    setSaveError(null);
    try {
      await submitScore({ name: finalName, score, balls });
    } catch (e) {
      setSaveError((e instanceof Error ? e.message : "Fel") + " Försök igen.");
      setSaving(false);
      return;
    }
    onSaved();
    try {
      const list = await loadScores();
      const sorted = [...list].sort((a, b) => b.score - a.score);
      const idx = sorted.findIndex((e) => e.score === score && e.name === finalName);
      setEntries(list);
      setError(null);
      setHighlightIdx(idx >= 0 && idx < 10 ? idx : null);
    } catch (e) {
      setEntries(null);
      setError(e instanceof Error ? e.message : "Fel");
    }
    setSaving(false);
  };

  return (
    <Overlay>
      <h2>Spelet är slut!</h2>
      <div className="final">
        <div>
          <b>{score}</b>poäng
        </div>
        <div>
          <b>{balls}</b>rensade kulor
        </div>
      </div>

      {!saved && (
        <div>
          <p style={{ marginBottom: 6 }}>Skriv ditt namn för topplistan:</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              maxLength={18}
              placeholder="Ditt namn"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="primary" disabled={saving} onClick={onSave}>
              Spara
            </button>
          </div>
          {saveError && <div className="hserror">{saveError}</div>}
        </div>
      )}

      <div>
        <h2
          style={{
            fontFamily: "system-ui",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: ".14em",
            color: "var(--muted)",
            marginTop: 14,
          }}
        >
          Topplista
        </h2>
        <HighscoreTable entries={entries} loading={loading} error={error} highlightIdx={highlightIdx} />
      </div>

      <div className="btnrow" style={{ marginTop: 16 }}>
        {/* Stäng låter spelaren se på det färdiga brädet i stället för att
            tvingas starta om direkt. Ny omgång startas från huvudvyn. */}
        <button style={{ flex: 1 }} onClick={onClose}>
          Stäng
        </button>
        <button className="primary" style={{ flex: 1 }} onClick={onAgain}>
          Spela igen
        </button>
      </div>
    </Overlay>
  );
}
