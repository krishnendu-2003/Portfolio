import { windowMeta, DESKTOP_ICON_ORDER } from "./windowMeta";
import { cases } from "@/content/cases";

// URL hash slug -> windowId to open. Case slugs deep-link straight to the
// full case window (the same content the crawlable /work/[slug] page shows).
export const HASH_TO_WINDOW: Record<string, string> = {};
// windowId -> URL hash slug, pushed to history when that window opens.
export const WINDOW_TO_HASH: Record<string, string> = {};

for (const id of DESKTOP_ICON_ORDER) {
  HASH_TO_WINDOW[id] = id;
  WINDOW_TO_HASH[id] = id;
}

for (const item of cases) {
  const fullId = `case-${item.slug}-full`;
  HASH_TO_WINDOW[item.slug] = fullId;
  WINDOW_TO_HASH[fullId] = item.slug;
}

export function windowOpenOptionsForHash(slug: string) {
  const windowId = HASH_TO_WINDOW[slug];
  const meta = windowId ? windowMeta[windowId] : undefined;
  if (!windowId || !meta) return null;
  return { windowId, title: meta.title, w: meta.defaultSize.w, h: meta.defaultSize.h };
}
