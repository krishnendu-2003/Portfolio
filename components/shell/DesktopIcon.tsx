"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useWindowStore, TASKBAR_HEIGHT } from "@/lib/windowStore";
import { rememberFocusOrigin } from "@/lib/focusReturn";
import { useIsMobile } from "@/lib/useIsMobile";
import { cellToPixel, clampPixel, pixelToNearestCell, type Cell } from "@/lib/iconLayout";
import type { WindowRegistryEntry } from "@/lib/windowRegistry";

const DRAG_THRESHOLD = 4;

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
}: {
  id: string;
  entry: WindowRegistryEntry;
  cell: Cell;
  onMove: (id: string, cell: Cell) => void;
}) {
  const openWindow = useWindowStore((s) => s.openWindow);
  const isMobile = useIsMobile();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragState = useRef<DragState | null>(null);
  const wasDraggingRef = useRef(false);
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

  function onPointerUp() {
    const ds = dragState.current;
    dragState.current = null;
    if (!ds) return;
    if (ds.dragging) {
      wasDraggingRef.current = true;
      onMove(id, pixelToNearestCell(ds.latestX, ds.latestY));
      setDragPixel(null);
    }
  }

  function onClick() {
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      return;
    }
    handleOpen();
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
      className="desktop-icon flex w-full flex-col items-center gap-1 p-1 text-center md:absolute md:w-[70px]"
      style={
        !isMobile
          ? {
              left: pixel.x,
              top: pixel.y,
              touchAction: dragPixel ? "none" : undefined,
            }
          : undefined
      }
    >
      <Image src={entry.icon} alt="" width={32} height={32} aria-hidden="true" />
      <span className="text-xs leading-tight break-words">{entry.title}</span>
    </button>
  );
}
