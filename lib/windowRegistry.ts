import type { ComponentType } from "react";
import AboutMe from "@/components/apps/AboutMe";
import WhatIDo from "@/components/apps/WhatIDo";
import SelectedWork from "@/components/apps/SelectedWork";
import CaseCard from "@/components/apps/CaseCard";
import CaseStudy from "@/components/apps/CaseStudy";
import Resume from "@/components/apps/Resume";
import Contact from "@/components/apps/Contact";
import Wallpaper from "@/components/apps/Wallpaper";
import ShutDown from "@/components/apps/ShutDown";
import Now from "@/components/apps/Now";
import SystemProperties from "@/components/apps/SystemProperties";
import RecycleBin from "@/components/apps/RecycleBin";
import { cases } from "@/content/cases";
import { windowMeta, type WindowMeta, DESKTOP_ICON_ORDER } from "./windowMeta";

export type WindowRegistryEntry = WindowMeta & {
  component: ComponentType<{ windowId: string }>;
};

function wrap(Component: ComponentType) {
  return Component as ComponentType<{ windowId: string }>;
}

const componentsById: Record<string, ComponentType<{ windowId: string }>> = {
  "selected-work": wrap(SelectedWork),
  "about-me": wrap(AboutMe),
  "what-i-do": wrap(WhatIDo),
  resume: wrap(Resume),
  contact: wrap(Contact),
  wallpaper: wrap(Wallpaper),
  shutdown: wrap(ShutDown),
  now: wrap(Now),
  "system-properties": wrap(SystemProperties),
  "recycle-bin": wrap(RecycleBin),
};

for (const item of cases) {
  componentsById[`case-${item.slug}`] = CaseCard;
  componentsById[`case-${item.slug}-full`] = CaseStudy;
}

export const windowRegistry: Record<string, WindowRegistryEntry> = Object.fromEntries(
  Object.entries(windowMeta).map(([id, meta]) => [id, { ...meta, component: componentsById[id] }])
);

export { DESKTOP_ICON_ORDER };
