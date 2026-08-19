"use client";

import { useWindowStore } from "@/lib/windowStore";

export default function DummyOne({ windowId }: { windowId: string }) {
  const openChildWindow = useWindowStore((s) => s.openChildWindow);

  return (
    <div className="flex h-full flex-col gap-3 p-2">
      <p>
        This window proves the core window manager: drag by the title bar,
        resize from the bottom-right corner, minimize / maximize / close, and
        focus stacking (click another window to raise it).
      </p>
      <button
        type="button"
        onClick={() =>
          openChildWindow(windowId, "dummy-two", {
            title: "Dummy Window Two (child)",
            w: 360,
            h: 240,
          })
        }
      >
        Open full case →
      </button>
      <p className="text-xs">
        That spawns a child window offset down-right, focused, while this
        parent stays open behind it.
      </p>
    </div>
  );
}
