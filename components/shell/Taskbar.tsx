"use client";

import { useEffect, useState } from "react";
import { useWindowStore } from "@/lib/windowStore";

export function Taskbar() {
  const windows = useWindowStore((s) => s.windows);
  const order = useWindowStore((s) => s.order);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);

  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    function update() {
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, []);

  const zValues = Object.values(windows).map((w) => w.z);
  const maxZ = zValues.length > 0 ? Math.max(...zValues) : 0;

  return (
    <div className="flex h-10 items-center gap-2 border-t-2 px-2" style={{ background: "silver" }}>
      <button type="button" className="font-bold">
        Start
      </button>
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
