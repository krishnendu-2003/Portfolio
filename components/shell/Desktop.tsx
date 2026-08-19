"use client";

import { useWindowStore } from "@/lib/windowStore";
import { windowRegistry, DESKTOP_ICON_ORDER } from "@/lib/windowRegistry";
import { useUrlSync } from "@/lib/urlSync";
import { useIconGridNav } from "@/lib/useIconGridNav";
import { WindowFrame } from "./WindowFrame";
import { DesktopIcon } from "./DesktopIcon";
import { Taskbar } from "./Taskbar";

export function Desktop() {
  const windowIds = useWindowStore((s) => s.order);
  useUrlSync();
  const { containerRef, onKeyDown } = useIconGridNav();

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: "#008080" }}>
      <div className="relative flex-1">
        <div
          ref={containerRef}
          onKeyDown={onKeyDown}
          className="grid grid-cols-3 content-start gap-4 overflow-y-auto p-4 md:grid-cols-[repeat(auto-fill,80px)] md:gap-2 md:overflow-visible"
        >
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
