"use client";

import { useEffect, useRef, useState } from "react";
import { useWindowStore } from "@/lib/windowStore";
import { restoreFocusOrigin } from "@/lib/focusReturn";
import { StartMenu } from "./StartMenu";

function useClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    function update() {
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

function topWindow(windows: Record<string, { id: string; z: number; minimized: boolean }>) {
  const visible = Object.values(windows).filter((w) => !w.minimized);
  if (visible.length === 0) return null;
  return visible.reduce((a, b) => (b.z > a.z ? b : a));
}

function DesktopTaskbar() {
  const windows = useWindowStore((s) => s.windows);
  const order = useWindowStore((s) => s.order);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const time = useClock();
  const [startOpen, setStartOpen] = useState(false);
  const startButtonRef = useRef<HTMLButtonElement>(null);

  const zValues = Object.values(windows).map((w) => w.z);
  const maxZ = zValues.length > 0 ? Math.max(...zValues) : 0;

  return (
    <div
      className="hidden h-10 items-center gap-2 border-t-2 px-2 md:flex"
      style={{ background: "silver" }}
    >
      <div className="relative">
        <button
          ref={startButtonRef}
          type="button"
          className="font-bold"
          aria-haspopup="true"
          aria-expanded={startOpen}
          onClick={() => setStartOpen((v) => !v)}
        >
          Start
        </button>
        {startOpen && (
          <StartMenu onClose={() => setStartOpen(false)} anchorRef={startButtonRef} />
        )}
      </div>
      <div className="flex flex-1 items-center gap-1 overflow-x-auto">
        {order
          .filter((id) => windows[id])
          .map((id) => {
            const win = windows[id];
            const isFocused = win.z === maxZ && !win.minimized;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={isFocused}
                onClick={() => {
                  if (isFocused) {
                    minimizeWindow(id);
                  } else {
                    focusWindow(id);
                  }
                }}
                className="max-w-[140px] truncate px-2 text-xs"
              >
                {win.title}
              </button>
            );
          })}
      </div>
      <div className="px-2 text-xs" suppressHydrationWarning>
        {time ?? ""}
      </div>
    </div>
  );
}

function MobileTaskbar() {
  const windows = useWindowStore((s) => s.windows);
  const closeWindow = useWindowStore((s) => s.closeWindow);

  const top = topWindow(windows);

  return (
    <div
      className="flex h-12 items-center gap-2 border-t-2 px-3 md:hidden"
      style={{ background: "silver" }}
    >
      <button
        type="button"
        disabled={!top}
        aria-label="Back"
        onClick={() => {
          if (!top) return;
          closeWindow(top.id);
          restoreFocusOrigin(top.id);
        }}
      >
        ← Back
      </button>
      <span className="flex-1 truncate text-xs">{top ? windows[top.id].title : "Desktop"}</span>
    </div>
  );
}

export function Taskbar() {
  return (
    <>
      <DesktopTaskbar />
      <MobileTaskbar />
    </>
  );
}
