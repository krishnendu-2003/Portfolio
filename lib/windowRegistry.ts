import type { ComponentType } from "react";
import AboutMe from "@/components/apps/AboutMe";
import WhatIDo from "@/components/apps/WhatIDo";
import SelectedWork from "@/components/apps/SelectedWork";
import CaseCard from "@/components/apps/CaseCard";
import CaseStudy from "@/components/apps/CaseStudy";
import Resume from "@/components/apps/Resume";
import Contact from "@/components/apps/Contact";
import { cases } from "@/content/cases";

export type WindowRegistryEntry = {
  title: string;
  icon: string;
  component: ComponentType<{ windowId: string }>;
  defaultSize: { w: number; h: number };
  resizable?: boolean;
};

function wrap(Component: ComponentType) {
  return Component as ComponentType<{ windowId: string }>;
}

export const windowRegistry: Record<string, WindowRegistryEntry> = {
  "selected-work": {
    title: "Selected Work",
    icon: "/icons/folder.svg",
    component: wrap(SelectedWork),
    defaultSize: { w: 460, h: 340 },
    resizable: true,
  },
  "about-me": {
    title: "About Me",
    icon: "/icons/notepad.svg",
    component: wrap(AboutMe),
    defaultSize: { w: 380, h: 320 },
    resizable: true,
  },
  "what-i-do": {
    title: "What I Do",
    icon: "/icons/wordpad-doc.svg",
    component: wrap(WhatIDo),
    defaultSize: { w: 420, h: 360 },
    resizable: true,
  },
  resume: {
    title: "Résumé.pdf",
    icon: "/icons/document.svg",
    component: wrap(Resume),
    defaultSize: { w: 420, h: 480 },
    resizable: true,
  },
  contact: {
    title: "Contact",
    icon: "/icons/mail.svg",
    component: wrap(Contact),
    defaultSize: { w: 380, h: 300 },
    resizable: true,
  },
};

// Case cards + full case windows, opened from inside the Selected Work
// folder — not shown as top-level desktop icons.
for (const item of cases) {
  windowRegistry[`case-${item.slug}`] = {
    title: item.title,
    icon: "/icons/document.svg",
    component: CaseCard,
    defaultSize: { w: 340, h: 260 },
    resizable: true,
  };
  windowRegistry[`case-${item.slug}-full`] = {
    title: `${item.title} — Full Case`,
    icon: "/icons/document.svg",
    component: CaseStudy,
    defaultSize: { w: 480, h: 420 },
    resizable: true,
  };
}

export const DESKTOP_ICON_ORDER = [
  "selected-work",
  "about-me",
  "what-i-do",
  "resume",
  "contact",
];
