import { cases } from "@/content/cases";

// Component-free window metadata — safe for windowStore/hashRouting to
// import without pulling in components/apps/** (which import windowStore,
// which would otherwise create a circular import).
export type WindowMeta = {
  title: string;
  icon: string;
  defaultSize: { w: number; h: number };
  resizable?: boolean;
};

export const windowMeta: Record<string, WindowMeta> = {
  "selected-work": {
    title: "Selected Work",
    icon: "/icons/folder.svg",
    defaultSize: { w: 460, h: 340 },
    resizable: true,
  },
  "about-me": {
    title: "About Me",
    icon: "/icons/notepad.svg",
    defaultSize: { w: 380, h: 320 },
    resizable: true,
  },
  "what-i-do": {
    title: "What I Do",
    icon: "/icons/wordpad-doc.svg",
    defaultSize: { w: 420, h: 360 },
    resizable: true,
  },
  resume: {
    title: "Résumé.pdf",
    icon: "/icons/document.svg",
    defaultSize: { w: 420, h: 480 },
    resizable: true,
  },
  contact: {
    title: "Contact",
    icon: "/icons/mail.svg",
    defaultSize: { w: 380, h: 360 },
    resizable: true,
  },
  wallpaper: {
    title: "Wallpaper",
    icon: "/icons/wallpaper.svg",
    defaultSize: { w: 320, h: 360 },
    resizable: true,
  },
  shutdown: {
    title: "Shut Down Windows",
    icon: "/icons/placeholder.svg",
    defaultSize: { w: 320, h: 200 },
    resizable: false,
  },
  now: {
    title: "Now",
    icon: "/icons/calendar.svg",
    defaultSize: { w: 320, h: 220 },
    resizable: true,
  },
  "system-properties": {
    title: "My Machine",
    icon: "/icons/monitor.svg",
    defaultSize: { w: 340, h: 340 },
    resizable: true,
  },
  "recycle-bin": {
    title: "Recycle Bin",
    icon: "/icons/recycle-bin.svg",
    defaultSize: { w: 360, h: 380 },
    resizable: true,
  },
  sketchpad: {
    title: "Sketchpad",
    icon: "/icons/sketchpad.svg",
    defaultSize: { w: 520, h: 460 },
    resizable: true,
  },
  games: {
    title: "Games",
    icon: "/icons/games.svg",
    defaultSize: { w: 380, h: 300 },
    resizable: true,
  },
  "high-scores": {
    title: "High Scores",
    icon: "/icons/trophy.svg",
    defaultSize: { w: 320, h: 360 },
    resizable: true,
  },
  match: {
    title: "Match",
    icon: "/icons/match.svg",
    defaultSize: { w: 320, h: 340 },
    resizable: true,
  },
};

// Filled in as each game is registered (Phase 2 3c) — the single source
// of truth GamesFolder, the Start Menu's Games submenu, and High Scores
// all read from, so nothing has to be updated in three places per game.
export const GAME_IDS: string[] = ["match"];

// Case cards + full case windows, opened from inside the Selected Work
// folder — not shown as top-level desktop icons.
for (const item of cases) {
  windowMeta[`case-${item.slug}`] = {
    title: item.title,
    icon: "/icons/document.svg",
    defaultSize: { w: 340, h: 260 },
    resizable: true,
  };
  windowMeta[`case-${item.slug}-full`] = {
    title: `${item.title} — Full Case`,
    icon: "/icons/document.svg",
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
  "now",
  "system-properties",
  "recycle-bin",
  "wallpaper",
  "sketchpad",
  "games",
];
