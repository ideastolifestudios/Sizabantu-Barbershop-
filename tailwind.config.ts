import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "szb-black":    "#0a0a0a",
        "szb-charcoal": "#141414",
        "szb-dark":     "#1a1a1a",
        "szb-surface":  "#222222",
        "szb-gold":     "#c9a84c",
        "szb-gold-dim": "#9a7c34",
        "szb-cream":    "#f5f0e8",
        "szb-muted":    "rgba(245,240,232,0.45)",
      },
      fontFamily: {
        syne: ["var(--font-syne)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "fade-up":    "szb-fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-gold": "szb-pulse-gold 2s infinite",
      },
      borderRadius: {
        szb:    "4px",
        "szb-lg": "8px",
      },
    },
  },
  plugins: [],
};

export default config;
