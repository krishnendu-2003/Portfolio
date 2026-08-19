export type CaseStudy = {
  slug: string;
  title: string;
  role: string;
  oneLiner: string;
  body: string[];
};

export const cases: CaseStudy[] = [
  {
    slug: "lumeo",
    title: "Lumeo",
    role: "CTO & Co-founder",
    oneLiner:
      "An AI-native financial operating system for Indian independent workers and exporters.",
    body: [
      "Lumeo is an AI-native financial operating system built for Indian independent workers and exporters. The real competitor isn't another payments app — it's a traditional CA (chartered accountant) firm. Independent workers and exporters already have someone handling their compliance today; usually that someone is a person filling out forms by hand. Lumeo's thesis is that this work should be automated, not just digitized.",
      "As CTO & Co-founder, I own the machine-learning layer — five production models running behind a Python inference service — along with the entire frontend.",
      "One rule shapes everything we ship: no money-moving job goes out the door without first passing a compliance-signature gate. Automation earns trust by being provably conservative before it's fast.",
    ],
  },
  {
    slug: "keypr",
    title: "KeyPr",
    role: "Software Developer Intern, Tech Vortex Ventures",
    oneLiner: "React Native and web product work.",
    body: [
      "Software Developer Intern at Tech Vortex Ventures Private Limited (June 2025 – Present), building and maintaining the company's React Native mobile app and web platform.",
      "Shipped push notifications and WebSocket support for a chat feature, and wired up user authentication through Firebase.",
    ],
  },
  {
    slug: "catoff-gaming",
    title: "Catoff Gaming",
    role: "Software Developer Intern",
    oneLiner: "Integrated three popular games and streamlined project workflows.",
    body: [
      "Software Developer Intern at Catoff Gaming (March 2025 – June 2025). Integrated three popular games — Fortnite, Marvel Rivals, and CS:GO — and streamlined project workflows, improving overall efficiency by 25%.",
      "Built with React, TypeScript, and REST APIs.",
    ],
  },
  {
    slug: "hackathons",
    title: "Hackathons & Superteam",
    role: "Contributor",
    oneLiner: "Hackathon wins and Superteam India ecosystem contributions.",
    body: [
      "Hackathon Winner, Prayash 2024 — Techno India Batanagar (Hardware Project).",
      "Hackathon Winner, Binary 2025 — Kalyani Govt. College (Deepfake Detection System).",
      "Alongside hackathons, I contribute to the Superteam India ecosystem.",
    ],
  },
];

export const caseBySlug: Record<string, CaseStudy> = Object.fromEntries(
  cases.map((c) => [c.slug, c])
);
