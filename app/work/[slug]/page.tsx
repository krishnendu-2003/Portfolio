import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cases, caseBySlug } from "@/content/cases";

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = caseBySlug[slug];
  if (!item) return {};
  return {
    title: `${item.title} — Krishnendu Samanta`,
    description: item.oneLiner,
  };
}

export default async function WorkCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = caseBySlug[slug];
  if (!item) notFound();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
      <Link href="/">← Back to desktop</Link>
      <div>
        <h1 className="text-2xl font-bold">{item.title}</h1>
        <p className="opacity-70">{item.role}</p>
      </div>
      <div className="flex flex-col gap-4">
        {item.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </main>
  );
}
