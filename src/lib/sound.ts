/* Ljudeffekter: originalets wav-filer (en per radlängd 5–9) spelas via WebAudio.
   HTMLAudio duger inte – ljuden triggas från timers (utanför användargester)
   och iOS blockerar då uppspelningen. Med en AudioContext som låsts upp i en
   gest (unlockAudio) fungerar det överallt. */

let audioCtx: AudioContext | null = null;
let soundOn = true;
const buffers = new Map<number, AudioBuffer>();
let loadStarted = false;

export function isSoundOn(): boolean {
  return soundOn;
}
export function toggleSound(): boolean {
  soundOn = !soundOn;
  return soundOn;
}

function ctx(): AudioContext {
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  audioCtx = audioCtx || new AC();
  return audioCtx;
}

async function loadClips(): Promise<void> {
  if (loadStarted) return;
  loadStarted = true;
  const ac = ctx();
  await Promise.all(
    [5, 6, 7, 8, 9].map(async (n) => {
      try {
        const r = await fetch(`${import.meta.env.BASE_URL}sounds/cleared_ball_${n}.wav`);
        if (!r.ok) return;
        const buf = await ac.decodeAudioData(await r.arrayBuffer());
        buffers.set(n, buf);
      } catch {
        /* ignorera ljudfel – spelet ska fungera tyst */
      }
    }),
  );
}

/**
 * iOS/Safari startar en AudioContext som "suspended" om den inte skapas eller
 * återupptas i en användargest. Anropas vid första pointerdown/keydown.
 * Passar även på att förladda klippen.
 */
export function unlockAudio(): void {
  try {
    const ac = ctx();
    if (ac.state === "suspended") void ac.resume();
    void loadClips();
  } catch {
    /* ignorera ljudfel */
  }
}

/** Spela ljudet för en rensad rad. Rader längre än 9 använder 9-klippet. */
export function playCleared(length: number, delaySec = 0): void {
  if (!soundOn) return;
  try {
    const ac = ctx();
    const n = Math.min(Math.max(length, 5), 9);
    const buf = buffers.get(n);
    if (!buf) {
      void loadClips();
      return;
    }
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.connect(ac.destination);
    src.start(ac.currentTime + delaySec);
  } catch {
    /* ignorera ljudfel */
  }
}
