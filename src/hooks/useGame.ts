import { useCallback, useEffect, useReducer } from "react";
import type { GridPos } from "../lib/types";
import { CLEAR_MS, MOVE_STEP_MS } from "../lib/engine/constants";
import { playCleared, unlockAudio } from "../lib/sound";
import { initState, reducer } from "../game/reducer";

/** Limmar ihop den rena reducern med sidoeffekterna: timers för kulans
 *  förflyttning och rensningsanimationen, ljud och ljudupplåsning. */
export function useGame() {
  const [state, dispatch] = useReducer(reducer, Date.now(), initState);

  // Lås upp ljudet vid första gesten (krav på iOS, se sound.ts).
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Flytta kulan ett steg i taget längs vägen.
  const movingActive = state.moving !== null;
  useEffect(() => {
    if (!movingActive) return;
    const id = setInterval(() => dispatch({ type: "moveStep" }), MOVE_STEP_MS);
    return () => clearInterval(id);
  }, [movingActive]);

  // Låt rensningsanimationen spela klart innan kulorna tas bort.
  const clearingActive = state.clearing !== null;
  useEffect(() => {
    if (!clearingActive) return;
    const id = setTimeout(() => dispatch({ type: "clearDone" }), CLEAR_MS);
    return () => clearTimeout(id);
  }, [clearingActive]);

  // Ett ljud per rensad rad, lätt förskjutna om flera rader rensas samtidigt.
  useEffect(() => {
    if (state.clearSeq === 0) return;
    state.clearLengths.forEach((len, i) => playCleared(len, i * 0.18));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.clearSeq]);

  const cellClick = useCallback((pos: GridPos) => dispatch({ type: "cellClick", pos }), []);
  const restart = useCallback(() => dispatch({ type: "start", seed: Date.now() }), []);

  return { state, actions: { cellClick, restart } };
}
