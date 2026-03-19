"use client";

import { useEffect } from "react";
import { Shuffle } from "lucide-react";

const STORAGE_KEY = "clifton_brand_hue";

function pickHue(): number {
  // Skip the muddy yellow-green band (55–115)
  const hue = Math.floor(Math.random() * 299);
  return hue < 55 ? hue : hue + 61;
}

function applyHue(hue: number) {
  const isDark = document.documentElement.classList.contains("dark");
  // Vary lightness slightly based on hue for more perceptual distinction
  const lightness = isDark
    ? (0.6 + (hue % 60) / 300).toFixed(2)
    : (0.48 + (hue % 60) / 300).toFixed(2);
  const primary = `oklch(${lightness} 0.25 ${hue})`;
  const ring = `oklch(0.65 0.1 ${hue})`;
  const el = document.documentElement;
  el.style.setProperty("--primary", primary);
  el.style.setProperty("--color-primary", primary);
  el.style.setProperty("--ring", ring);
  el.style.setProperty("--color-ring", ring);
}

export function ThemeRandomizer() {
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) applyHue(Number(stored));
  }, []);

  function randomize() {
    const hue = pickHue();
    applyHue(hue);
    localStorage.setItem(STORAGE_KEY, String(hue));
  }

  return (
    <button
      onClick={randomize}
      title="Randomize theme color"
      className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <Shuffle className="h-4 w-4" />
    </button>
  );
}
