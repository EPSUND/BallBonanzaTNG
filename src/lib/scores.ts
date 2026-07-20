import type { ScoreEntry } from "./types";

/* Global topplista via Supabase REST – samma Supabase-projekt som Ord på Ord
   men en egen tabell (bb_scores). Den publicerbara nyckeln är gjord för att
   ligga öppet i klienten; åtkomsten styrs av Row Level Security (läs + lägg till). */
const SUPA_URL = "https://vvspqfbvxuimxcbyyahw.supabase.co";
const SUPA_KEY = "sb_publishable_-T5PvrE5hwqAPqiJ1JcKcQ_ZkrOPTHm";
const SUPA_TABLE = "bb_scores";
const SUPA_HEADERS: Record<string, string> = {
  apikey: SUPA_KEY,
  Authorization: "Bearer " + SUPA_KEY,
  "Content-Type": "application/json",
};
const HS_SELECT = "select=name,score,balls:balls_cleared,created:created_at";

export async function loadScores(): Promise<ScoreEntry[]> {
  let r: Response;
  try {
    r = await fetch(
      `${SUPA_URL}/rest/v1/${SUPA_TABLE}?${HS_SELECT}&order=score.desc&limit=200`,
      { headers: SUPA_HEADERS },
    );
  } catch {
    throw new Error("Kunde inte nå topplistan (nätverksfel).");
  }
  if (!r.ok) throw new Error("Topplistan svarade med fel (" + r.status + ").");
  return (await r.json()) as ScoreEntry[];
}

export interface NewScore {
  name: string;
  score: number;
  balls: number;
}

export async function submitScore(entry: NewScore): Promise<void> {
  let r: Response;
  try {
    r = await fetch(`${SUPA_URL}/rest/v1/${SUPA_TABLE}`, {
      method: "POST",
      headers: { ...SUPA_HEADERS, Prefer: "return=minimal" },
      body: JSON.stringify({
        name: entry.name,
        score: entry.score,
        balls_cleared: entry.balls,
      }),
    });
  } catch {
    throw new Error("Kunde inte spara poängen (nätverksfel).");
  }
  if (!r.ok) throw new Error("Poängen kunde inte sparas (" + r.status + ").");
}
