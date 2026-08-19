"use client";

import { useRef } from "react";

const NAV_KEYS = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];

/**
 * Roving keyboard navigation for a grid of icon buttons/links. Treats the
 * grid as a linear sequence (Right/Down = next, Left/Up = previous) rather
 * than computing visual rows/columns, since the grid's column count varies
 * by breakpoint (auto-fill on desktop, 3 columns on mobile) — still fully
 * arrow-key navigable per §7, just without exact 2D geometry.
 */
export function useIconGridNav() {
  const containerRef = useRef<HTMLDivElement>(null);

  function onKeyDown(e: React.KeyboardEvent) {
    if (!NAV_KEYS.includes(e.key)) return;
    const container = containerRef.current;
    if (!container) return;
    const items = Array.from(container.querySelectorAll<HTMLElement>("[data-icon]"));
    if (items.length === 0) return;
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    if (currentIndex === -1) return;

    e.preventDefault();
    let nextIndex = currentIndex;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIndex = Math.min(currentIndex + 1, items.length - 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextIndex = Math.max(currentIndex - 1, 0);
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = items.length - 1;
    }
    items[nextIndex]?.focus();
  }

  return { containerRef, onKeyDown };
}
