export default function Resume() {
  return (
    <div className="flex h-full flex-col gap-3 bg-white p-3">
      <div className="flex-1 overflow-auto whitespace-pre-wrap border border-black p-3">
        {`Krishnendu Samanta
AI/ML and frontend engineer

CTO & Co-founder — Lumeo
Software Developer Intern — Tech Vortex Ventures (KeyPr)

Education
Second-year B.Tech, Sister Nivedita University (MAKAUT), Kolkata

Ecosystem
Superteam India contributor`}
      </div>
      <a href="/resume.pdf" download className="self-start">
        Download PDF
      </a>
    </div>
  );
}
