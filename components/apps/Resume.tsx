import { resume } from "@/content/about";

export default function Resume() {
  return (
    <div className="flex h-full flex-col gap-3 bg-white p-3">
      <div className="flex-1 overflow-auto border border-black p-3">
        <p className="font-bold">{resume.name}</p>
        <p className="text-xs">{resume.location}</p>
        <p className="mt-3">{resume.objective}</p>

        <p className="mt-4 font-bold">Education</p>
        {resume.education.map((e) => (
          <div key={e.degree} className="mt-1">
            <p>
              {e.degree} — <span className="text-xs">{e.period}</span>
            </p>
            <p className="text-xs">{e.school}</p>
            <p className="text-xs">{e.detail}</p>
          </div>
        ))}

        <p className="mt-4 font-bold">Work Experience</p>
        {resume.experience.map((job) => (
          <div key={`${job.org}-${job.period}`} className="mt-1">
            <p>
              {job.role} — {job.org}
            </p>
            <p className="text-xs">{job.period}</p>
            <ul className="list-disc pl-4 text-xs">
              {job.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        ))}

        <p className="mt-4 font-bold">Projects</p>
        {resume.projects.map((p) => (
          <div key={p.name} className="mt-1">
            <p>{p.name}</p>
            <p className="text-xs">{p.description}</p>
            <p className="text-xs">Stack: {p.stack}</p>
          </div>
        ))}

        <p className="mt-4 font-bold">Achievements</p>
        <ul className="list-disc pl-4 text-xs">
          {resume.achievements.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>

        <p className="mt-4 font-bold">Additional Information</p>
        {Object.entries(resume.additional).map(([label, value]) => (
          <p key={label} className="text-xs">
            <span className="font-bold">{label}:</span> {value}
          </p>
        ))}

        <p className="mt-4 font-bold">Volunteering &amp; Services</p>
        <ul className="list-disc pl-4 text-xs">
          {resume.volunteering.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      </div>
      <a href="/resume.pdf" download className="self-start">
        Download PDF
      </a>
    </div>
  );
}
