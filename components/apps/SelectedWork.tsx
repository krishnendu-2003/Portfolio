"use client";

import Image from "next/image";
import { useWindowStore } from "@/lib/windowStore";
import { rememberFocusOrigin } from "@/lib/focusReturn";
import { cases } from "@/content/cases";

export default function SelectedWork() {
  const openWindow = useWindowStore((s) => s.openWindow);

  return (
    <div className="grid grid-cols-[repeat(auto-fill,80px)] content-start gap-2 p-2">
      {cases.map((item) => (
        <button
          key={item.slug}
          type="button"
          className="folder-icon flex w-20 flex-col items-center gap-1 p-1 text-center"
          onClick={(e) => {
            const id = `case-${item.slug}`;
            rememberFocusOrigin(id, e.currentTarget);
            openWindow(id, { title: item.title, w: 340, h: 260 });
          }}
        >
          <Image src="/icons/document.svg" alt="" width={32} height={32} aria-hidden="true" />
          <span className="text-xs leading-tight break-words">{item.title}</span>
        </button>
      ))}
    </div>
  );
}
