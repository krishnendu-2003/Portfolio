"use client";

import { useWindowStore } from "@/lib/windowStore";
import { windowRegistry, DESKTOP_ICON_ORDER } from "@/lib/windowRegistry";
import { WindowFrame } from "./WindowFrame";
import { DesktopIcon } from "./DesktopIcon";
import { Taskbar } from "./Taskbar";

export function Desktop() {
  const windowIds = useWindowStore((s) => s.order);

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: "#008080" }}>
      <div className="relative flex-1">
        <div className="grid grid-cols-[repeat(auto-fill,80px)] content-start gap-2 p-4">
          {DESKTOP_ICON_ORDER.map((id) => (
            <DesktopIcon key={id} id={id} entry={windowRegistry[id]} />
          ))}
        </div>
        {windowIds.map((id) => (
          <WindowFrame key={id} id={id} />
        ))}
      </div>
      <Taskbar />
    </div>
  );
}
