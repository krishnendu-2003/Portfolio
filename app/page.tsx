import { Desktop } from "@/components/shell/Desktop";
import AboutMe from "@/components/apps/AboutMe";
import WhatIDo from "@/components/apps/WhatIDo";
import Resume from "@/components/apps/Resume";
import CaseStudy from "@/components/apps/CaseStudy";
import { cases } from "@/content/cases";

export default function Home() {
  return (
    <>
      {/* Server-rendered so a plain HTTP fetch (curl, a simple crawler, a
          link-preview bot) sees real prose, not an empty client shell. The
          interactive desktop below renders the same content in windows. */}
      <div hidden>
        <h1>Krishnendu Samanta</h1>
        <section>
          <h2>About Me</h2>
          <AboutMe />
        </section>
        <section>
          <h2>What I Do</h2>
          <WhatIDo />
        </section>
        <section>
          <h2>Selected Work</h2>
          {cases.map((item) => (
            <article key={item.slug}>
              <h3>{item.title}</h3>
              <CaseStudy windowId={`case-${item.slug}-full`} />
            </article>
          ))}
        </section>
        <section>
          <h2>Résumé</h2>
          <Resume />
        </section>
      </div>
      <Desktop />
    </>
  );
}
