import { create } from "zustand";
import { readStorage, writeStorage } from "./safeStorage";

const STORAGE_KEY = "scores:v1";

export type ScoresMap = Record<string, number>;

type Store = {
  scores: ScoresMap;
  hydrated: boolean;
  hydrate: () => void;
  // Records `value` as the new best for `gameId` only if it beats the
  // existing one — `higherIsBetter` lets each game decide its own
  // direction (moves/time want lower, points want higher).
  submit: (gameId: string, value: number, higherIsBetter: boolean) => void;
  clear: () => void;
};

export const useScoresStore = create<Store>((set, get) => ({
  scores: {},
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    const stored = readStorage<ScoresMap>("local", STORAGE_KEY, {});
    set({ scores: stored, hydrated: true });
  },
  submit: (gameId, value, higherIsBetter) => {
    set((s) => {
      const existing = s.scores[gameId];
      const better =
        existing === undefined || (higherIsBetter ? value > existing : value < existing);
      if (!better) return s;
      const next = { ...s.scores, [gameId]: value };
      writeStorage("local", STORAGE_KEY, next);
      return { scores: next };
    });
  },
  clear: () => {
    writeStorage("local", STORAGE_KEY, {});
    set({ scores: {} });
  },
}));
