import { useEffect, useState } from "react";
import type { ScoreEntry } from "../lib/types";
import { loadScores } from "../lib/scores";
import HighscoreTable from "./HighscoreTable";
import Overlay from "./Overlay";

interface Props {
  onClose: () => void;
}

export default function HighscoreDialog({ onClose }: Props) {
  const [entries, setEntries] = useState<ScoreEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Overlay>
      <h2>Topplista</h2>
      <HighscoreTable entries={entries} loading={loading} error={error} />
      <div className="btnrow" style={{ marginTop: 16 }}>
        <button className="primary" style={{ flex: 1 }} onClick={onClose}>
          Stäng
        </button>
      </div>
    </Overlay>
  );
}
