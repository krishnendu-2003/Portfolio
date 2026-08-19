import type { Metadata } from "next";
import Link from "next/link";
import { aboutMe, whatIDo } from "@/content/about";

export const metadata: Metadata = {
  title: "About — Krishnendu Samanta",
  description: aboutMe.tagline,
};

export default function AboutPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
      <Link href="/">← Back to desktop</Link>
      <div>
        <h1 className="text-2xl font-bold">{aboutMe.name}</h1>
        <p className="opacity-70">{aboutMe.tagline}</p>
      </div>
      <ul className="flex flex-col gap-1">
        {aboutMe.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <div>
        <h2 className="text-xl font-semibold">What I Do</h2>
        {whatIDo.paragraphs.map((paragraph, i) => (
          <p key={i} className="mt-3">
            {paragraph}
          </p>
        ))}
        <div className="mt-4 flex flex-wrap gap-2">
          {whatIDo.chips.map((chip) => (
            <span key={chip} className="border border-black px-2 py-1 text-xs">
              {chip}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
