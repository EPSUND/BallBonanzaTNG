/* Ren, stegbar PRNG (mulberry32). Reducern måste vara ren (React StrictMode
   dubbelkör den i dev), så all slump går via ett seed som ligger i state och
   returneras uppdaterat i stället för att anropa Math.random() direkt. */

/** Ett PRNG-steg: [slumptal 0..1, nästa seed]. */
export function nextRand(seed: number): [number, number] {
  const newSeed = (seed + 0x6d2b79f5) | 0;
  let t = newSeed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, newSeed];
}

/** Slumpat heltal 0..n-1 plus nästa seed. */
export function randInt(seed: number, n: number): [number, number] {
  const [v, s] = nextRand(seed);
  return [Math.floor(v * n), s];
}
