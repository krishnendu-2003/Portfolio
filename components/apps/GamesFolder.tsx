"use client";

import Image from "next/image";
import { useWindowStore } from "@/lib/windowStore";
import { rememberFocusOrigin } from "@/lib/focusReturn";
import { useIconGridNav } from "@/lib/useIconGridNav";
import { windowMeta, GAME_IDS } from "@/lib/windowMeta";

export default function GamesFolder({ windowId }: { windowId: string }) {
  const openChildWindow = useWindowStore((s) => s.openChildWindow);
  const { containerRef, onKeyDown } = useIconGridNav();

  function open(id: string, el: HTMLElement) {
    const meta = windowMeta[id];
    if (!meta) return;
    rememberFocusOrigin(id, el);
    openChildWindow(windowId, id, {
      title: meta.title,
      w: meta.defaultSize.w,
      h: meta.defaultSize.h,
    });
  }

  const items = [...GAME_IDS, "high-scores"];

  return (
    <div
      ref={containerRef}
      onKeyDown={onKeyDown}
      className="grid grid-cols-3 content-start gap-4 p-2 md:grid-cols-[repeat(auto-fill,80px)] md:gap-2"
    >
      {items.map((id) => {
        const meta = windowMeta[id];
        if (!meta) return null;
        return (
          <button
            key={id}
            type="button"
            data-icon
            className="folder-icon flex w-full flex-col items-center gap-1 p-1 text-center md:w-20"
            onClick={(e) => open(id, e.currentTarget)}
          >
            <Image src={meta.icon} alt="" width={32} height={32} aria-hidden="true" />
            <span className="text-xs leading-tight break-words">{meta.title}</span>
          </button>
        );
      })}
    </div>
  );
}
