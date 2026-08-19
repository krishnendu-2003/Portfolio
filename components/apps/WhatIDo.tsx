const CHIPS = [
  "Machine Learning",
  "Python",
  "Frontend Engineering",
  "React / Next.js",
  "Product Architecture",
];

export default function WhatIDo() {
  return (
    <div className="flex h-full flex-col gap-3 bg-white p-3">
      <p>
        I work across the stack on AI-native products, but I live at the
        intersection of the two hardest parts: the machine-learning layer
        that has to be right, and the frontend that has to make it feel
        simple.
      </p>
      <p>
        At Lumeo I own both — the production model layer and the entire
        frontend — which means I spend most of my time translating between
        what a model can guarantee and what a product can promise.
      </p>
      <div className="flex flex-wrap gap-2 pt-2">
        {CHIPS.map((chip) => (
          <span
            key={chip}
            className="border border-black px-2 py-1 text-xs"
            style={{ background: "var(--surface, #c0c0c0)" }}
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
