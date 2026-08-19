import { whatIDo } from "@/content/about";

export default function WhatIDo() {
  return (
    <div className="flex h-full flex-col gap-3 bg-white p-3">
      {whatIDo.paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
      <div className="flex flex-wrap gap-2 pt-2">
        {whatIDo.chips.map((chip) => (
          <span
            key={chip}
            className="border border-black px-2 py-1 text-xs"
            style={{ background: "var(--surface, #c0c0c0)" }}
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
