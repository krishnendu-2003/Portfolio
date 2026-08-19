import { caseBySlug } from "@/content/cases";
import { ExternalLink } from "@/components/shell/ExternalLink";
import { EXTERNAL_LINKS } from "@/lib/externalLinks";

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
      {slug === "lumeo" && (
        <p>
          <ExternalLink href={EXTERNAL_LINKS.lumeo} label="Visit Lumeo" />
        </p>
      )}
    </div>
  );
}
