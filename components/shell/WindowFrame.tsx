"use client";

import { useEffect, useRef } from "react";
import { useWindowStore, TASKBAR_HEIGHT, MOBILE_TASKBAR_HEIGHT } from "@/lib/windowStore";
import { restoreFocusOrigin } from "@/lib/focusReturn";
import { windowRegistry } from "@/lib/windowRegistry";
import { useIsMobile } from "@/lib/useIsMobile";

type DragState = {
  originX: number;
  originY: number;
  startX: number;
  startY: number;
  latestDx: number;
  latestDy: number;
  frame: number | null;
};

type ResizeState = {
  originW: number;
  originH: number;
  startX: number;
  startY: number;
  latestDw: number;
  latestDh: number;
  frame: number | null;
};

function isDesktopViewport() {
  return typeof window !== "undefined" && window.innerWidth >= 768;
}

export function WindowFrame({ id }: { id: string }) {
  const win = useWindowStore((s) => s.windows[id]);
  const isTop = useWindowStore((s) => {
    const visible = Object.values(s.windows).filter((w) => !w.minimized);
    if (visible.length === 0) return false;
    const maxZ = Math.max(...visible.map((w) => w.z));
    return !!s.windows[id] && !s.windows[id].minimized && s.windows[id].z === maxZ;
  });
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);
  const moveWindow = useWindowStore((s) => s.moveWindow);
  const resizeWindow = useWindowStore((s) => s.resizeWindow);
  const isMobile = useIsMobile();

  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<DragState | null>(null);
  const resizeState = useRef<ResizeState | null>(null);
  const titleId = `window-title-${id}`;

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isTop) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeWindow(id);
        restoreFocusOrigin(id);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isTop, id, closeWindow]);

  if (!win) return null;

  const entry = windowRegistry[id];

  function handleClose() {
    closeWindow(id);
    restoreFocusOrigin(id);
  }

  function onTitleBarPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (win.maximized) return;
    if (!isDesktopViewport()) return;
    if ((e.target as HTMLElement).closest("button")) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragState.current = {
      originX: win.x,
      originY: win.y,
      startX: e.clientX,
      startY: e.clientY,
      latestDx: 0,
      latestDy: 0,
      frame: null,
    };
    focusWindow(id);
  }

  function onTitleBarPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const ds = dragState.current;
    if (!ds) return;
    ds.latestDx = e.clientX - ds.startX;
    ds.latestDy = e.clientY - ds.startY;
    if (ds.frame === null) {
      ds.frame = requestAnimationFrame(() => {
        moveWindow(id, ds.originX + ds.latestDx, ds.originY + ds.latestDy);
        ds.frame = null;
      });
    }
  }

  function onTitleBarPointerUp() {
    dragState.current = null;
  }

  function onResizePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (win.maximized) return;
    if (!isDesktopViewport()) return;
    e.stopPropagation();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    resizeState.current = {
      originW: win.w,
      originH: win.h,
      startX: e.clientX,
      startY: e.clientY,
      latestDw: 0,
      latestDh: 0,
      frame: null,
    };
    focusWindow(id);
  }

  function onResizePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const rs = resizeState.current;
    if (!rs) return;
    rs.latestDw = e.clientX - rs.startX;
    rs.latestDh = e.clientY - rs.startY;
    if (rs.frame === null) {
      rs.frame = requestAnimationFrame(() => {
        resizeWindow(id, rs.originW + rs.latestDw, rs.originH + rs.latestDh);
        rs.frame = null;
      });
    }
  }

  function onResizePointerUp() {
    resizeState.current = null;
  }

  const style: React.CSSProperties = isMobile
    ? { position: "fixed", left: 0, top: 0, right: 0, bottom: MOBILE_TASKBAR_HEIGHT, zIndex: win.z }
    : win.maximized
      ? { position: "fixed", left: 0, top: 0, right: 0, bottom: TASKBAR_HEIGHT, zIndex: win.z }
      : { position: "fixed", left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  const hidden = win.minimized || (isMobile && !isTop);

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="window flex flex-col"
      style={{ ...style, display: hidden ? "none" : "flex" }}
      onPointerDownCapture={() => focusWindow(id)}
    >
      <div
        className={`title-bar${isTop ? "" : " inactive"}`}
        onPointerDown={onTitleBarPointerDown}
        onPointerMove={onTitleBarPointerMove}
        onPointerUp={onTitleBarPointerUp}
      >
        <div id={titleId} className="title-bar-text">
          {win.title}
        </div>
        <div className="title-bar-controls">
          {!isMobile && (
            <>
              <button type="button" aria-label="Minimize" onClick={() => minimizeWindow(id)} />
              <button
                type="button"
                aria-label={win.maximized ? "Restore" : "Maximize"}
                onClick={() => toggleMaximize(id)}
              />
            </>
          )}
          <button type="button" aria-label="Close" onClick={handleClose} />
        </div>
      </div>
      <div className="window-body flex-1 overflow-auto">
        {entry ? <entry.component windowId={id} /> : null}
      </div>
      {!isMobile && !win.maximized && entry?.resizable !== false && (
        <div
          className="resize-handle"
          onPointerDown={onResizePointerDown}
          onPointerMove={onResizePointerMove}
          onPointerUp={onResizePointerUp}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
