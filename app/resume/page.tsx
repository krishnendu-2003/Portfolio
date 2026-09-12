import type { Metadata } from "next";
import Link from "next/link";
import { resume } from "@/content/about";

export const metadata: Metadata = {
  title: "Résumé — Krishnendu Samanta",
  description: resume.objective,
};

export default function ResumePage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
      <Link href="/">← Back to desktop</Link>
      <div>
        <h1 className="text-2xl font-bold">{resume.name}</h1>
        <p className="text-sm opacity-70">{resume.title}</p>
        <p className="mt-2 text-sm">
          {resume.contact.email} · {resume.contact.phone} · {resume.contact.location}
        </p>
        <p className="text-sm">
          {resume.contact.github} · {resume.contact.linkedin}
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Professional Summary</h2>
        <p className="mt-1 text-sm">{resume.objective}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Technical Skills</h2>
        {resume.skills.map((s) => (
          <p key={s.label} className="mt-1 text-sm">
            <span className="font-medium">{s.label}:</span> {s.value}
          </p>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold">Professional Experience</h2>
        {resume.experience.map((job) => (
          <div key={`${job.org}-${job.period}`} className="mt-2">
            <p className="font-medium">
              {job.role} — {job.org}
            </p>
            <p className="text-sm opacity-70">{job.period}</p>
            <ul className="mt-1 list-disc pl-5 text-sm">
              {job.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold">Projects</h2>
        {resume.projects.map((p) => (
          <div key={p.name} className="mt-2">
            <p className="font-medium">{p.name}</p>
            <p className="text-sm">{p.description}</p>
            <p className="text-sm opacity-70">Stack: {p.stack}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold">Achievements</h2>
        <ul className="mt-1 list-disc pl-5 text-sm">
          {resume.achievements.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Education</h2>
        {resume.education.map((e) => (
          <div key={e.degree} className="mt-2">
            <p className="font-medium">
              {e.degree} — <span className="text-sm opacity-70">{e.period}</span>
            </p>
            <p className="text-sm">{e.school}</p>
            {e.detail ? <p className="text-sm opacity-70">{e.detail}</p> : null}
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold">Additional Information</h2>
        {Object.entries(resume.additional).map(([label, value]) => (
          <p key={label} className="mt-1 text-sm">
            <span className="font-medium">{label}:</span> {value}
          </p>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold">Volunteering &amp; Services</h2>
        <ul className="mt-1 list-disc pl-5 text-sm">
          {resume.volunteering.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      </div>

      <a href="/resume.pdf" download>
        Download PDF
      </a>
    </main>
  );
}
