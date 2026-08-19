export const ICON_INSET = 16;
export const ICON_COL_PITCH = 75;
export const ICON_ROW_PITCH = 90;
export const ICON_W = 70;
export const ICON_H = 82;

export type Cell = [number, number]; // [col, row]

export function cellToPixel(cell: Cell): { x: number; y: number } {
  return { x: ICON_INSET + cell[0] * ICON_COL_PITCH, y: ICON_INSET + cell[1] * ICON_ROW_PITCH };
}

export function pixelToNearestCell(x: number, y: number): Cell {
  const col = Math.max(0, Math.round((x - ICON_INSET) / ICON_COL_PITCH));
  const row = Math.max(0, Math.round((y - ICON_INSET) / ICON_ROW_PITCH));
  return [col, row];
}

/**
 * Clamp a pixel position so the icon stays inside the desktop area and
 * never lands under the taskbar or off the right/bottom edge.
 */
export function clampPixel(
  x: number,
  y: number,
  viewportWidth: number,
  viewportHeight: number,
  taskbarHeight: number
): { x: number; y: number } {
  const maxX = Math.max(ICON_INSET, viewportWidth - ICON_INSET - ICON_W);
  const maxY = Math.max(ICON_INSET, viewportHeight - taskbarHeight - ICON_INSET - ICON_H);
  return {
    x: Math.min(Math.max(x, ICON_INSET), maxX),
    y: Math.min(Math.max(y, ICON_INSET), maxY),
  };
}

/**
 * Default column-major flow layout: fill column 0 top-to-bottom, then wrap
 * to column 1, matching a real Windows desktop's 2-column density.
 */
export function defaultLayout(ids: string[]): Record<string, Cell> {
  const rowsPerColumn = Math.max(1, Math.ceil(ids.length / 2));
  const layout: Record<string, Cell> = {};
  ids.forEach((id, i) => {
    const col = Math.floor(i / rowsPerColumn);
    const row = i % rowsPerColumn;
    layout[id] = [col, row];
  });
  return layout;
}

function cellKey(cell: Cell) {
  return `${cell[0]},${cell[1]}`;
}

/** Nearest unoccupied cell to `target`, searching outward in a square ring. */
export function findFreeCell(target: Cell, occupied: Set<string>): Cell {
  const clamped: Cell = [Math.max(0, target[0]), Math.max(0, target[1])];
  if (!occupied.has(cellKey(clamped))) return clamped;
  for (let radius = 1; radius < 100; radius++) {
    for (let dc = -radius; dc <= radius; dc++) {
      for (let dr = -radius; dr <= radius; dr++) {
        if (Math.max(Math.abs(dc), Math.abs(dr)) !== radius) continue;
        const col = clamped[0] + dc;
        const row = clamped[1] + dr;
        if (col < 0 || row < 0) continue;
        const candidate: Cell = [col, row];
        if (!occupied.has(cellKey(candidate))) return candidate;
      }
    }
  }
  return clamped;
}
