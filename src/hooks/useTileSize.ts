import { useLayoutEffect, useState } from "react";

const FALLBACK = 46;

/**
 * Mäter --tile-size genom att stoppa in ett osynligt element med den bredden
 * och läsa av dess faktiska storlek.
 *
 * getComputedStyle på en oregistrerad custom property går INTE att använda här:
 * den returnerar tokensträngen ("min(9.2vw, ...)"), inte ett px-värde, så
 * parseFloat ger NaN så fort variabeln innehåller min()/calc(). Kulorna skulle
 * då positioneras med fel avstånd i ett bräde som ritats i en annan storlek.
 */
function makeProbe(): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText =
    "position:absolute;top:0;left:0;height:0;visibility:hidden;pointer-events:none;width:var(--tile-size)";
  el.setAttribute("aria-hidden", "true");
  return el;
}

/** Aktuell rutstorlek i px (följer CSS-variabeln --tile-size). */
export function useTileSize(): number {
  const [t, setT] = useState(FALLBACK);

  // useLayoutEffect: mät före första målningen, annars syns en bildruta med
  // fallback-storleken innan mobilvärdet slår igenom.
  useLayoutEffect(() => {
    const probe = makeProbe();
    document.body.appendChild(probe);

    const read = () => {
      const w = probe.getBoundingClientRect().width;
      if (w > 0) setT(w);
    };
    read();

    // ResizeObserver fångar allt som ändrar värdet: rotation, fönsterstorlek
    // och svh-ändringar när mobilens adressfält fälls in/ut (ingen resize då).
    const ro = new ResizeObserver(read);
    ro.observe(probe);
    window.addEventListener("resize", read);
    window.addEventListener("orientationchange", read);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", read);
      window.removeEventListener("orientationchange", read);
      probe.remove();
    };
  }, []);

  return t;
}
