"use client";

import { useWindowStore } from "@/lib/windowStore";

export default function ShutDown() {
  const order = useWindowStore((s) => s.order);
  const closeWindow = useWindowStore((s) => s.closeWindow);

  function restart() {
    for (const id of order) closeWindow(id);
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-white p-4 text-center">
      <p>It is now safe to turn off your computer.</p>
      <button type="button" onClick={restart}>
        Restart
      </button>
    </div>
  );
}
