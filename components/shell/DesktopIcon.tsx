"use client";

import Image from "next/image";
import { useWindowStore } from "@/lib/windowStore";
import { rememberFocusOrigin } from "@/lib/focusReturn";
import type { WindowRegistryEntry } from "@/lib/windowRegistry";

export function DesktopIcon({ id, entry }: { id: string; entry: WindowRegistryEntry }) {
  const openWindow = useWindowStore((s) => s.openWindow);

  function handleOpen(e: React.MouseEvent<HTMLButtonElement>) {
    rememberFocusOrigin(id, e.currentTarget);
    openWindow(id, { title: entry.title, w: entry.defaultSize.w, h: entry.defaultSize.h });
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="desktop-icon flex w-full flex-col items-center gap-1 p-1 text-center focus:outline focus:outline-2 focus:outline-dotted focus:outline-white md:w-20"
    >
      <Image src={entry.icon} alt="" width={32} height={32} aria-hidden="true" />
      <span className="text-xs leading-tight break-words">{entry.title}</span>
    </button>
  );
}
