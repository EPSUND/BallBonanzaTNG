import { useEffect, useState } from "react";
import { useGame } from "./hooks/useGame";
import { useTileSize } from "./hooks/useTileSize";
import Header from "./components/Header";
import Board from "./components/Board";
import StatusCard from "./components/StatusCard";
import ControlsCard from "./components/ControlsCard";
import HelpDialog from "./components/HelpDialog";
import EndDialog from "./components/EndDialog";
import HighscoreDialog from "./components/HighscoreDialog";

export default function App() {
  const { state, actions } = useGame();
  const tile = useTileSize();
  const [hsOpen, setHsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [endClosed, setEndClosed] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);

  // Nollställ slutdialogens tillstånd så fort ett nytt spel börjar. Täcker
  // alla vägar ut ur "over" (Spela igen, Ny omgång) på ett ställe.
  useEffect(() => {
    if (state.phase !== "over") {
      setEndClosed(false);
      setScoreSaved(false);
    }
  }, [state.phase]);

  return (
    <>
      <Header onOpenHighscores={() => setHsOpen(true)} onNewGame={actions.restart} />

      {/* DOM-ordningen är mobilens läsordning; .layout är ett grid som flyttar
          korten till en högerkolumn på skrivbord (grid-template-areas). */}
      <div className="layout">
        <StatusCard score={state.score} balls={state.balls} next={state.next} />

        <div className="boardwrap">
          <Board state={state} tile={tile} onCellClick={actions.cellClick} />
        </div>

        <ControlsCard
          onHelp={() => setHelpOpen(true)}
          onShowResult={state.phase === "over" && endClosed ? () => setEndClosed(false) : undefined}
        />
      </div>

      {helpOpen && <HelpDialog onClose={() => setHelpOpen(false)} />}

      {state.phase === "over" && !endClosed && !hsOpen && (
        <EndDialog
          score={state.score}
          balls={state.balls}
          onAgain={actions.restart}
          onClose={() => setEndClosed(true)}
          saved={scoreSaved}
          onSaved={() => setScoreSaved(true)}
        />
      )}

      {hsOpen && <HighscoreDialog onClose={() => setHsOpen(false)} />}
    </>
  );
}
