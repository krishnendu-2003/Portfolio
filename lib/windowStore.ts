import { create } from "zustand";

export type Rect = { x: number; y: number; w: number; h: number };

export type WindowState = {
  id: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  prevRect?: Rect;
  parentId?: string;
};

export type OpenWindowOptions = {
  title: string;
  w: number;
  h: number;
  x?: number;
  y?: number;
  parentId?: string;
};

const MAX_WINDOWS = 8;
const CASCADE_STEP = 28;
const CASCADE_ORIGIN = { x: 80, y: 80 };
const MIN_VISIBLE = 80;
const MIN_W = 240;
const MIN_H = 160;
export const TASKBAR_HEIGHT = 40;

function viewport() {
  if (typeof window === "undefined") return { vw: 1280, vh: 800 };
  return { vw: window.innerWidth, vh: window.innerHeight };
}

function clampRect(x: number, y: number, w: number) {
  const { vw, vh } = viewport();
  const clampedX = Math.min(Math.max(x, MIN_VISIBLE - w), vw - MIN_VISIBLE);
  const clampedY = Math.min(Math.max(y, 0), vh - TASKBAR_HEIGHT - 32);
  return { x: clampedX, y: clampedY };
}

type Store = {
  windows: Record<string, WindowState>;
  order: string[];
  zCounter: number;
  cascade: { x: number; y: number } | null;
  openWindow: (id: string, opts: OpenWindowOptions) => void;
  openChildWindow: (
    parentId: string,
    childId: string,
    opts: Omit<OpenWindowOptions, "parentId" | "x" | "y">
  ) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, w: number, h: number) => void;
};

export const useWindowStore = create<Store>((set, get) => ({
  windows: {},
  order: [],
  zCounter: 10,
  cascade: null,

  openWindow: (id, opts) => {
    const existing = get().windows[id];
    if (existing) {
      get().focusWindow(id);
      return;
    }

    set((s) => {
      let windows = s.windows;
      let order = s.order;
      const zCounter = s.zCounter + 1;

      if (Object.keys(windows).length >= MAX_WINDOWS) {
        const maxZ = Math.max(...Object.values(windows).map((w) => w.z));
        const victim = order.find((wid) => windows[wid] && windows[wid].z !== maxZ);
        if (victim) {
          const rest = { ...windows };
          delete rest[victim];
          windows = rest;
          order = order.filter((wid) => wid !== victim);
        }
      }

      let x = opts.x;
      let y = opts.y;
      if (x === undefined || y === undefined) {
        const prev =
          s.cascade ?? { x: CASCADE_ORIGIN.x - CASCADE_STEP, y: CASCADE_ORIGIN.y - CASCADE_STEP };
        let nx = prev.x + CASCADE_STEP;
        let ny = prev.y + CASCADE_STEP;
        const { vw, vh } = viewport();
        if (nx + opts.w > vw - 20 || ny + opts.h > vh - TASKBAR_HEIGHT - 20) {
          nx = CASCADE_ORIGIN.x;
          ny = CASCADE_ORIGIN.y;
        }
        x = nx;
        y = ny;
      }
      const clamped = clampRect(x, y, opts.w);

      const win: WindowState = {
        id,
        title: opts.title,
        x: clamped.x,
        y: clamped.y,
        w: opts.w,
        h: opts.h,
        z: zCounter,
        minimized: false,
        maximized: false,
        parentId: opts.parentId,
      };

      return {
        windows: { ...windows, [id]: win },
        order: [...order, id],
        zCounter,
        cascade: { x, y },
      };
    });
  },

  openChildWindow: (parentId, childId, opts) => {
    const parent = get().windows[parentId];
    const x = parent ? parent.x + 30 : undefined;
    const y = parent ? parent.y + 30 : undefined;
    get().openWindow(childId, { ...opts, x, y, parentId });
  },

  closeWindow: (id) => {
    set((s) => {
      const rest = { ...s.windows };
      delete rest[id];
      return { windows: rest, order: s.order.filter((wid) => wid !== id) };
    });
  },

  focusWindow: (id) => {
    set((s) => {
      if (!s.windows[id]) return s;
      const zCounter = s.zCounter + 1;
      return {
        zCounter,
        windows: {
          ...s.windows,
          [id]: { ...s.windows[id], z: zCounter, minimized: false },
        },
      };
    });
  },

  minimizeWindow: (id) => {
    set((s) => {
      if (!s.windows[id]) return s;
      return { windows: { ...s.windows, [id]: { ...s.windows[id], minimized: true } } };
    });
  },

  toggleMaximize: (id) => {
    set((s) => {
      const win = s.windows[id];
      if (!win) return s;
      if (win.maximized) {
        const prev = win.prevRect ?? { x: 80, y: 80, w: win.w, h: win.h };
        return {
          windows: {
            ...s.windows,
            [id]: {
              ...win,
              maximized: false,
              x: prev.x,
              y: prev.y,
              w: prev.w,
              h: prev.h,
              prevRect: undefined,
            },
          },
        };
      }
      return {
        windows: {
          ...s.windows,
          [id]: { ...win, maximized: true, prevRect: { x: win.x, y: win.y, w: win.w, h: win.h } },
        },
      };
    });
  },

  moveWindow: (id, x, y) => {
    set((s) => {
      const win = s.windows[id];
      if (!win || win.maximized) return s;
      const clamped = clampRect(x, y, win.w);
      return { windows: { ...s.windows, [id]: { ...win, x: clamped.x, y: clamped.y } } };
    });
  },

  resizeWindow: (id, w, h) => {
    set((s) => {
      const win = s.windows[id];
      if (!win || win.maximized) return s;
      const nw = Math.max(MIN_W, w);
      const nh = Math.max(MIN_H, h);
      return { windows: { ...s.windows, [id]: { ...win, w: nw, h: nh } } };
    });
  },
}));
