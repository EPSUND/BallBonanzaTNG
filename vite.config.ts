import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Projektsajt på https://epsund.github.io/BallBonanzaTNG/ → base måste matcha repo-namnet.
export default defineConfig({
  base: "/BallBonanzaTNG/",
  plugins: [react()],
});
