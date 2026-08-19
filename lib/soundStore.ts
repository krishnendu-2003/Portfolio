import { create } from "zustand";
import { readStorage, writeStorage } from "./safeStorage";

const STORAGE_KEY = "sound:v1";

type Store = {
  muted: boolean;
  hydrated: boolean;
  hydrate: () => void;
  toggle: () => void;
};

export const useSoundStore = create<Store>((set, get) => ({
  muted: true,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    const stored = readStorage<boolean>("local", STORAGE_KEY, true);
    set({ muted: stored, hydrated: true });
  },
  toggle: () => {
    const next = !get().muted;
    writeStorage("local", STORAGE_KEY, next);
    set({ muted: next });
  },
}));
