"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useWindowStore, TASKBAR_HEIGHT } from "@/lib/windowStore";
import { rememberFocusOrigin } from "@/lib/focusReturn";
import { useIsMobile } from "@/lib/useIsMobile";
import { cellToPixel, clampPixel, pixelToNearestCell, type Cell } from "@/lib/iconLayout";
import type { WindowRegistryEntry } from "@/lib/windowRegistry";

const DRAG_THRESHOLD = 4;
const DOUBLE_TAP_MS = 400;
const DOUBLE_TAP_DIST = 12;

function isDesktopViewport() {
  return typeof window !== "undefined" && window.innerWidth >= 768;
}

type DragState = {
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  dragging: boolean;
  latestX: number;
  latestY: number;
  frame: number | null;
};

export function DesktopIcon({
  id,
  entry,
  cell,
  onMove,
  selected,
  onSelect,
}: {
  id: string;
  entry: WindowRegistryEntry;
  cell: Cell;
  onMove: (id: string, cell: Cell) => void;
  selected: boolean;
  onSelect: () => void;
}) {
  const openWindow = useWindowStore((s) => s.openWindow);
  const isMobile = useIsMobile();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragState = useRef<DragState | null>(null);
  const wasDraggingRef = useRef(false);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const [dragPixel, setDragPixel] = useState<{ x: number; y: number } | null>(null);

  const basePixel = cellToPixel(cell);
  const pixel = dragPixel ?? basePixel;

  function handleOpen() {
    if (buttonRef.current) rememberFocusOrigin(id, buttonRef.current);
    openWindow(id, { title: entry.title, w: entry.defaultSize.w, h: entry.defaultSize.h });
  }

  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (!isDesktopViewport()) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: basePixel.x,
      originY: basePixel.y,
      dragging: false,
      latestX: basePixel.x,
      latestY: basePixel.y,
      frame: null,
    };
  }

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const ds = dragState.current;
    if (!ds) return;
    const dx = e.clientX - ds.startX;
    const dy = e.clientY - ds.startY;
    if (!ds.dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    ds.dragging = true;
    const clamped = clampPixel(
      ds.originX + dx,
      ds.originY + dy,
      window.innerWidth,
      window.innerHeight,
      TASKBAR_HEIGHT
    );
    ds.latestX = clamped.x;
    ds.latestY = clamped.y;
    if (ds.frame === null) {
      ds.frame = requestAnimationFrame(() => {
        setDragPixel({ x: ds.latestX, y: ds.latestY });
        ds.frame = null;
      });
    }
  }

  function onPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    const ds = dragState.current;
    dragState.current = null;
    // On mobile, onPointerDown returns early (icons aren't draggable there)
    // so ds is always null — every tap falls through to the double-tap
    // check below, same as a non-dragging desktop click.
    if (ds && ds.dragging) {
      wasDraggingRef.current = true;
      onMove(id, pixelToNearestCell(ds.latestX, ds.latestY));
      setDragPixel(null);
      lastTapRef.current = null;
      return;
    }
    // Not a drag — a tap/click release. Pointer users need a second one
    // within the window to open (so a single click/tap only ever starts a
    // drag, never fights with it); keyboard activation is handled by
    // onClick below instead, since Enter/Space never reaches here.
    const now = Date.now();
    const last = lastTapRef.current;
    const dist = last ? Math.hypot(e.clientX - last.x, e.clientY - last.y) : Infinity;
    if (last && now - last.time < DOUBLE_TAP_MS && dist < DOUBLE_TAP_DIST) {
      lastTapRef.current = null;
      handleOpen();
    } else {
      lastTapRef.current = { time: now, x: e.clientX, y: e.clientY };
      onSelect();
    }
  }

  function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      return;
    }
    // Keyboard-triggered clicks (Enter/Space on the focused button) carry
    // detail 0 — those still open on the first activation. Pointer-driven
    // clicks (detail >= 1) are handled by the double-tap logic in
    // onPointerUp instead, so a single click never also opens the window.
    if (e.detail === 0) handleOpen();
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      data-icon
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={onClick}
      onFocus={onSelect}
      className="desktop-icon flex w-full flex-col items-center gap-1 rounded p-1 text-center select-none md:absolute md:w-[70px]"
      style={{
        ...(!isMobile
          ? {
              left: pixel.x,
              top: pixel.y,
              touchAction: dragPixel ? "none" : undefined,
            }
          : undefined),
        ...(selected
          ? {
              background: "rgba(255, 255, 255, 0.22)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              outline: "1px solid rgba(255, 255, 255, 0.55)",
              outlineOffset: -1,
            }
          : undefined),
      }}
    >
      <Image src={entry.icon} alt="" width={32} height={32} aria-hidden="true" />
      <span className="text-xs leading-tight break-words">{entry.title}</span>
    </button>
  );
}
