"use client";

import { useId } from "react";
import { useWallpaperStore, WALLPAPERS, type WallpaperId } from "@/lib/wallpaperStore";
import { useIconPositionsStore } from "@/lib/iconPositionsStore";

// Mirrors app/globals.css's html[data-wallpaper="..."] .desktop-root rules,
// simplified to a single CSS background value for a small swatch preview.
const SWATCH_BACKGROUND: Record<WallpaperId, string> = {
  teal: "#008080",
  clouds: "linear-gradient(180deg, #bfe3f7, #eaf6ff)",
  sunset: "linear-gradient(180deg, #2b1055 0%, #8a3b6b 45%, #ee7752 75%, #f7b267 100%)",
  starfield:
    "radial-gradient(circle at 30% 30%, #ffffff 0 1px, transparent 1px) 0 0/10px 10px, #05070f",
  "neon-grid":
    "linear-gradient(rgba(255,0,200,0.35) 1px, transparent 1px) 0 0/8px 8px, linear-gradient(90deg, rgba(0,255,255,0.35) 1px, transparent 1px) 0 0/8px 8px, #0a0020",
  diagonal:
    "repeating-linear-gradient(45deg, #006666 0px, #006666 4px, #004d4d 4px, #004d4d 8px)",
  "terminal-green":
    "repeating-linear-gradient(0deg, rgba(0,255,100,0.15) 0px, rgba(0,255,100,0.15) 1px, transparent 1px, transparent 3px), #001a00",
  nebula:
    "radial-gradient(circle at 25% 35%, rgba(180,80,220,0.6), transparent 50%), radial-gradient(circle at 75% 65%, rgba(60,120,220,0.6), transparent 50%), #05010f",
};

export default function Wallpaper() {
  const wallpaper = useWallpaperStore((s) => s.wallpaper);
  const setWallpaper = useWallpaperStore((s) => s.setWallpaper);
  const resetLayout = useIconPositionsStore((s) => s.resetLayout);
  const groupName = useId();

  return (
    <div className="flex h-full flex-col gap-3 bg-white p-3">
      <p className="font-bold">Background</p>
      <div
        role="radiogroup"
        aria-label="Wallpaper"
        className="field-row-stacked flex-1 overflow-auto"
      >
        {WALLPAPERS.map((w) => {
          const selected = wallpaper === w.id;
          return (
            <label key={w.id} className="flex items-center gap-2 py-1">
              <input
                type="radio"
                name={groupName}
                checked={selected}
                onChange={() => setWallpaper(w.id)}
              />
              <span
                aria-hidden="true"
                className="inline-block h-6 w-10"
                style={{
                  background: SWATCH_BACKGROUND[w.id],
                  border: selected ? "2px solid #000000" : "1px solid #808080",
                  outline: selected ? "1px dotted #000000" : "none",
                  outlineOffset: 2,
                }}
              />
              {w.label}
            </label>
          );
        })}
      </div>
      <div className="border-t border-gray-400 pt-2">
        <button type="button" onClick={resetLayout}>
          Reset icon layout
        </button>
      </div>
    </div>
  );
}
