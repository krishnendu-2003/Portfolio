export type CaseStudy = {
  slug: string;
  title: string;
  role: string;
  oneLiner: string;
  body: string[];
  placeholder?: boolean;
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
      "Software Developer Intern at Tech Vortex Ventures, contributing to KeyPr's React Native mobile app and web product surface.",
    ],
  },
  {
    slug: "catoff-gaming",
    title: "Catoff Gaming",
    role: "Engineering",
    oneLiner: "Prior engineering work.",
    body: ["Prior engineering work at Catoff Gaming. Fuller case detail to come."],
    placeholder: true,
  },
  {
    slug: "hackathons",
    title: "Hackathons & Superteam",
    role: "Contributor",
    oneLiner: "Hackathon wins and Superteam India ecosystem contributions.",
    body: [
      "A running list of hackathon wins and contributions to the Superteam India ecosystem. Specific placements are pulled from my résumé and will be added here.",
    ],
    placeholder: true,
  },
];

export const caseBySlug: Record<string, CaseStudy> = Object.fromEntries(
  cases.map((c) => [c.slug, c])
);
