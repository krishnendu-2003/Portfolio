import { caseBySlug } from "@/content/cases";

export default function CaseStudy({ windowId }: { windowId: string }) {
  const slug = windowId.replace(/^case-/, "").replace(/-full$/, "");
  const item = caseBySlug[slug];

  if (!item) return null;

  return (
    <div className="flex h-full flex-col gap-3 bg-white p-3">
      <p className="font-bold">
        {item.title} — {item.role}
      </p>
      {item.body.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
      {item.placeholder && (
        <p className="text-xs opacity-60">
          This case is a placeholder — full detail pending real source material.
        </p>
      )}
    </div>
  );
}
