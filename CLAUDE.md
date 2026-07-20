# CLAUDE.md — Kul med kulor (BallBonanzaTNG)

Vägledning för AI-agenter (och människor) som arbetar i det här repot. Håll den kort och
högsignal – den läses in varje session.

## 1. Projektöversikt

"Kul med kulor" är en remake i React av Java-spelet
[EPSUND/BallBonanza](https://github.com/EPSUND/BallBonanza) (en Lines-variant).

- 10×10-bräde, kulor i 6 färger. Klicka på en kula, sedan på en tom ruta – kulan
  rullar dit om en fri väg finns (BFS, 4-grannskap).
- Rader med ≥5 kulor i samma färg (vågrätt/lodrätt/diagonalt) rensas och ger poäng.
- Drag utan poäng ⇒ 3 nya kulor på slumpade tomma rutor ("Nästa" visar färgerna).
- Fullt bräde ⇒ game over. **Global topplista** via Supabase.

Systerprojekt: [WordOnWordNext](https://github.com/EPSUND/WordOnWordNext) – samma
stack, arkitektur och designspråk; mönster därifrån gäller även här.

## 2. Teknisk stack

- **React 18 + TypeScript + Vite**, statisk sajt på **GitHub Pages**.
- **Supabase** (REST) för topplistan. Inget eget backend.

## 3. Kommandon

```
npm install          # installera beroenden
npm run dev          # dev-server med HMR (Vite)
npm run build        # tsc -b && vite build → dist/
npm run typecheck    # bara TypeScript, ingen emit
npm run preview      # servera dist/ lokalt (under rätt base-path)
npm run dev -- --host   # exponera på LAN för test i telefon
```

## 4. Kodkarta (var saker bor)

```
src/lib/engine/     Ren spellogik, ingen DOM:
  constants.ts        ROWS/COLS=10, färger, poängtabell (originalets värden), animationstakter
  rng.ts              nextRand/randInt – ren, stegbar PRNG (seed i state, se §6)
  grid.ts             makeEmptyGrid, cloneGrid, emptyCells, isFull
  pathfinder.ts       findPath – BFS genom tomma rutor (originalet använde A*)
  score.ts            findScoreRows (maximala följder i 4 riktningar), scoreForRows,
                      ballsInRows, cellsToClear
src/lib/            scores.ts (Supabase), sound.ts (wav via WebAudio), types.ts
src/game/reducer.ts Hela speltillståndet som en REN reducer (state + actions)
src/hooks/          useGame.ts (reducer-glue: timers för flytt/rensning, ljud)
                    useTileSize.ts (mäter --tile-size i DOM:en – se §6)
src/components/     Header, Board, StatusCard, ControlsCard,
                    HelpDialog, EndDialog, HighscoreDialog, HighscoreTable, Overlay
                    Foo.css bredvid Foo.tsx, importerad därifrån
src/index.css       Laddar bara basen (@import styles/*)
src/styles/base.css   Variabler, reset, element-/.card-regler, kulfärgerna
src/styles/layout.css .layout-griden och kortens placering
public/sounds/      Originalets cleared_ball_5..9.wav
.github/workflows/  deploy.yml (Actions → Pages)
```

## 5. Arkitektur & dataflöde

- **Reducern (`src/game/reducer.ts`) äger allt speltillstånd** och är ren.
  Sidoeffekter (timers, ljud, Supabase) ligger i `useGame` och dialogerna.
- Flödet vid ett drag: `cellClick` (välj/flytta) → `moving` med hela vägen →
  `moveStep`-timer flyttar kulan cell för cell → landning kör `resolveBoard`:
  poängrader ⇒ `clearing`-fas (kulorna ligger kvar i grid tills `clearDone`),
  annars 3 nya kulor + ny "Nästa". Ordningen följer originalet: poängdrag ger
  inga nya kulor; blir brädet fullt av de nya kulorna är spelet över innan
  eventuella rader räknas.
- Transienta effekter drivs av räknare i state: `clearSeq`/`clearLengths` (ljud),
  `shakeSeq` ("ingen väg"-skakning).
- Kulor positioneras med `--tx`/`--ty` + en delad transform-regel så att
  animationer kan lägga scale ovanpå utan att tappa positionen. Den rullande
  kulan använder i stället inline-transform + transition (custom
  property-ändringar triggar inte transitions tillförlitligt).

## 6. Kritiska invarianter / fallgropar (läs innan du ändrar)

- **Reducern måste vara ren.** React StrictMode dubbelkör den i dev. All slump
  går därför via `seed` i state och `rng.ts` – aldrig `Math.random()` i reducern.
- **Poängtabellen är originalets** (5/6/7/8/9 ⇒ 1/3/10/15/25, diagonal +1,
  +1 per extra rad; rader ≥9 räknas som 9; rensade kulor räknas per rad så att
  delade rutor i korsande rader räknas två gånger). Ändra inte utan avsikt.
- **Base-path.** `vite.config.ts` har `base: '/BallBonanzaTNG/'` (projektsajt).
  Alla runtime-hämtningar (ljud) går via `import.meta.env.BASE_URL`.
- **Supabase-nyckeln** i `scores.ts` är en *publicerbar* nyckel och ligger
  avsiktligt i klienten. RLS på `bb_scores`: anon får `SELECT`+`INSERT`, inte
  ändra/radera. Tabellen skapas med SQL:en i README.
- **Topplistan kastar fel** vid nätverks-/API-fel (ingen tyst fallback) – felen
  visas i dialogerna.
- **`--tile-size` får INTE läsas med `getComputedStyle`** (returnerar
  tokensträngen, inte px). `useTileSize` mäter ett dolt probe-element.
- **Använd `svh`, aldrig `dvh`** i höjdberäkningar (adressfältet på mobil får
  annars layouten att hoppa under scroll).
- **`index.css` måste importeras före `App` i `main.tsx`** – Vite emitterar CSS
  i evalueringsordning, annars skriver basen över komponent-CSS:en.
- **Ljud kräver en användargest.** `useGame` anropar `unlockAudio()` vid första
  `pointerdown`/`keydown`; ljuden spelas från timers, utanför gester, och iOS
  blockerar dem annars.
- **React StrictMode** (dev) dubbelkör effekter → ljud kan spelas två gånger i
  `npm run dev`. Det sker inte i bygget.

## 7. Externa tjänster – Supabase

- URL: `https://vvspqfbvxuimxcbyyahw.supabase.co` (samma projekt som Ord på Ord),
  tabell **`bb_scores`**.
- Kolumner: `id, name, score, balls_cleared, created_at`.
- REST-anropen (i `src/lib/scores.ts`) läser med alias:
  `select=name,score,balls:balls_cleared,created:created_at`.
- RLS: anon får `SELECT` och `INSERT`; `DELETE`/`UPDATE` är blockerat.

## 8. Deploy

- **GitHub Actions → Pages.** `.github/workflows/deploy.yml` bygger och deployar
  `dist/` vid push till `main`.
- Engångsinställning i GitHub: **Settings ▸ Pages ▸ Source ▸ GitHub Actions**.

## 9. Konventioner

- **Svenska** i UI-text och kodkommentarer.
- TypeScript `strict` (inkl. `noUnusedLocals`/`noUnusedParameters`).
- **Trogen port**: bevara originalets spelregler och beteende om inte ändring
  uttryckligen efterfrågas.
- CSS per komponent men med **globala klassnamn**; delade regler bor i
  `src/styles/`. Varje komponents media queries ligger sist i komponentens fil.

## 10. Kända begränsningar / TODO

- Ingen automatiserad testsvit ännu.
- Ingen PWA (manifest/ikoner/service worker).
- Topplistan är global och ofiltrerad (ingen daglig lista – originalet hade ingen).
