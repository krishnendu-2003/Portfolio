import type { ComponentType } from "react";
import dynamic from "next/dynamic";
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
import GamesFolder from "@/components/apps/GamesFolder";
import HighScores from "@/components/apps/HighScores";
import { cases } from "@/content/cases";

// Heavy, canvas-driven apps split into their own chunk, loaded only when
// the window actually opens — must never land in the homepage bundle.
const Sketchpad = dynamic(() => import("@/components/apps/Sketchpad"), { ssr: false });
const Match = dynamic(() => import("@/components/apps/games/Match"), { ssr: false });
const Snake = dynamic(() => import("@/components/apps/games/Snake"), { ssr: false });
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
  sketchpad: wrap(Sketchpad),
  games: GamesFolder,
  "high-scores": wrap(HighScores),
  match: Match,
  snake: Snake,
};

for (const item of cases) {
  componentsById[`case-${item.slug}`] = CaseCard;
  componentsById[`case-${item.slug}-full`] = CaseStudy;
}

export const windowRegistry: Record<string, WindowRegistryEntry> = Object.fromEntries(
  Object.entries(windowMeta).map(([id, meta]) => [id, { ...meta, component: componentsById[id] }])
);

export { DESKTOP_ICON_ORDER };
