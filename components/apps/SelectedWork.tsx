"use client";

import Image from "next/image";
import { useWindowStore } from "@/lib/windowStore";
import { rememberFocusOrigin } from "@/lib/focusReturn";
import { useIconGridNav } from "@/lib/useIconGridNav";
import { cases, type CaseStudy } from "@/content/cases";

export default function SelectedWork() {
  const openWindow = useWindowStore((s) => s.openWindow);
  const { containerRef, onKeyDown } = useIconGridNav();

  function open(item: CaseStudy, el: HTMLElement) {
    const id = `case-${item.slug}`;
    rememberFocusOrigin(id, el);
    openWindow(id, { title: item.title, w: 340, h: 260 });
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={onKeyDown}
      className="grid grid-cols-3 content-start gap-4 p-2 md:grid-cols-[repeat(auto-fill,80px)] md:gap-2"
    >
      {cases.map((item) => (
        <a
          key={item.slug}
          href={`/work/${item.slug}`}
          data-icon
          className="folder-icon flex w-full flex-col items-center gap-1 p-1 text-center md:w-20"
          onClick={(e) => {
            e.preventDefault();
            open(item, e.currentTarget);
          }}
          onKeyDown={(e) => {
            if (e.key === " ") {
              e.preventDefault();
              open(item, e.currentTarget);
            }
          }}
        >
          <Image src="/icons/document.svg" alt="" width={32} height={32} aria-hidden="true" />
          <span className="text-xs leading-tight break-words">{item.title}</span>
        </a>
      ))}
    </div>
  );
}
