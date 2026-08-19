"use client";

import { useId } from "react";
import { useWallpaperStore, WALLPAPERS, type WallpaperId } from "@/lib/wallpaperStore";
import { useIconPositionsStore } from "@/lib/iconPositionsStore";

const SWATCH_COLORS: Record<WallpaperId, string> = {
  teal: "#008080",
  clouds: "#bfe3f7",
  sunset: "#8a3b6b",
  starfield: "#05070f",
  "neon-grid": "#0a0020",
  diagonal: "#004d4d",
  "terminal-green": "#001a00",
  nebula: "#05010f",
};

export default function DisplayProperties() {
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
        {WALLPAPERS.map((w) => (
          <label key={w.id} className="flex items-center gap-2 py-0.5">
            <input
              type="radio"
              name={groupName}
              checked={wallpaper === w.id}
              onChange={() => setWallpaper(w.id)}
            />
            <span
              aria-hidden="true"
              className="inline-block h-3 w-5 border border-gray-500"
              style={{ background: SWATCH_COLORS[w.id] }}
            />
            {w.label}
          </label>
        ))}
      </div>
      <div className="border-t border-gray-400 pt-2">
        <button type="button" onClick={resetLayout}>
          Reset icon layout
        </button>
      </div>
    </div>
  );
}
