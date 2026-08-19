"use client";

import { useWindowStore } from "@/lib/windowStore";
import { caseBySlug } from "@/content/cases";

export default function CaseCard({ windowId }: { windowId: string }) {
  const slug = windowId.replace(/^case-/, "");
  const item = caseBySlug[slug];
  const openChildWindow = useWindowStore((s) => s.openChildWindow);

  if (!item) return null;

  return (
    <div className="flex h-full flex-col gap-3 bg-white p-3">
      <p className="font-bold">{item.title}</p>
      <p className="text-xs">{item.role}</p>
      <p>{item.oneLiner}</p>
      <button
        type="button"
        className="self-start"
        onClick={() =>
          openChildWindow(windowId, `case-${slug}-full`, {
            title: `${item.title} — Full Case`,
            w: 480,
            h: 420,
          })
        }
      >
        Open full case →
      </button>
    </div>
  );
}
