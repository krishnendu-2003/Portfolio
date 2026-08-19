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
    </div>
  );
}
