import { create } from "zustand";
import { readStorage, writeStorage } from "./safeStorage";

export const WALLPAPERS = [
  { id: "teal", label: "Teal" },
  { id: "clouds", label: "Clouds" },
  { id: "sunset", label: "Sunset" },
  { id: "starfield", label: "Starfield" },
  { id: "neon-grid", label: "Neon Grid" },
  { id: "diagonal", label: "Diagonal" },
  { id: "terminal-green", label: "Terminal Green" },
  { id: "nebula", label: "Nebula" },
] as const;

export type WallpaperId = (typeof WALLPAPERS)[number]["id"];

const STORAGE_KEY = "wallpaper:v1";
export const DEFAULT_WALLPAPER: WallpaperId = "teal";

function applyToDocument(id: WallpaperId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-wallpaper", id);
}

type Store = {
  wallpaper: WallpaperId;
  setWallpaper: (id: WallpaperId) => void;
  hydrate: () => void;
};

export const useWallpaperStore = create<Store>((set) => ({
  wallpaper: DEFAULT_WALLPAPER,
  setWallpaper: (id) => {
    writeStorage("local", STORAGE_KEY, id);
    applyToDocument(id);
    set({ wallpaper: id });
  },
  hydrate: () => {
    const stored = readStorage<WallpaperId>("local", STORAGE_KEY, DEFAULT_WALLPAPER);
    applyToDocument(stored);
    set({ wallpaper: stored });
  },
}));
