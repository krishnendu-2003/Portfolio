"use client";

import { useEffect } from "react";
import { useWindowStore } from "@/lib/windowStore";
import { windowRegistry, DESKTOP_ICON_ORDER } from "@/lib/windowRegistry";
import { useUrlSync } from "@/lib/urlSync";
import { useIconGridNav } from "@/lib/useIconGridNav";
import { useIsMobile } from "@/lib/useIsMobile";
import { useIconPositionsStore } from "@/lib/iconPositionsStore";
import { WindowFrame } from "./WindowFrame";
import { DesktopIcon } from "./DesktopIcon";
import { Taskbar } from "./Taskbar";

export function Desktop() {
  const windowIds = useWindowStore((s) => s.order);
  useUrlSync();
  const { containerRef, onKeyDown } = useIconGridNav();
  const isMobile = useIsMobile();
  const positions = useIconPositionsStore((s) => s.positions);
  const moveIcon = useIconPositionsStore((s) => s.moveIcon);
  const hydrate = useIconPositionsStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="desktop-root fixed inset-0 flex flex-col">
      <div className="relative flex-1">
        <div
          ref={containerRef}
          onKeyDown={onKeyDown}
          className={
            isMobile
              ? "grid grid-cols-3 content-start gap-4 overflow-y-auto p-4"
              : "relative h-full"
          }
        >
          {DESKTOP_ICON_ORDER.map((id) => (
            <DesktopIcon
              key={id}
              id={id}
              entry={windowRegistry[id]}
              cell={positions[id] ?? [0, 0]}
              onMove={moveIcon}
            />
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
