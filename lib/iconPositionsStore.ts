import { create } from "zustand";
import { readStorage, writeStorage } from "./safeStorage";
import { defaultLayout, findFreeCell, type Cell } from "./iconLayout";
import { DESKTOP_ICON_ORDER } from "./windowMeta";

const STORAGE_KEY = "iconPositions:v1";

type Store = {
  positions: Record<string, Cell>;
  hydrated: boolean;
  hydrate: () => void;
  moveIcon: (id: string, target: Cell) => void;
  resetLayout: () => void;
};

export const useIconPositionsStore = create<Store>((set, get) => ({
  positions: defaultLayout(DESKTOP_ICON_ORDER),
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const stored = readStorage<Record<string, Cell>>("local", STORAGE_KEY, {});
    const base = defaultLayout(DESKTOP_ICON_ORDER);
    const merged: Record<string, Cell> = { ...base };
    for (const id of DESKTOP_ICON_ORDER) {
      if (stored[id]) merged[id] = stored[id];
    }
    set({ positions: merged, hydrated: true });
  },

  moveIcon: (id, target) => {
    set((s) => {
      const occupied = new Set(
        Object.entries(s.positions)
          .filter(([otherId]) => otherId !== id)
          .map(([, cell]) => `${cell[0]},${cell[1]}`)
      );
      const finalCell = findFreeCell(target, occupied);
      const next = { ...s.positions, [id]: finalCell };
      writeStorage("local", STORAGE_KEY, next);
      return { positions: next };
    });
  },

  resetLayout: () => {
    const base = defaultLayout(DESKTOP_ICON_ORDER);
    writeStorage("local", STORAGE_KEY, base);
    set({ positions: base });
  },
}));
