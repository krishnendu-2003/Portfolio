"use client";

import { useEffect } from "react";
import { useWindowStore } from "./windowStore";
import { windowOpenOptionsForHash } from "./hashRouting";

// Deep-links (#/lumeo) open their window on first load, and Back closes the
// top window instead of leaving the shell. Uses raw history APIs only —
// never next/navigation's router, so the pathname never changes.
export function useUrlSync() {
  const openWindow = useWindowStore((s) => s.openWindow);
  const closeWindow = useWindowStore((s) => s.closeWindow);

  useEffect(() => {
    const slug = window.location.hash.replace(/^#\/?/, "");
    if (!slug) return;
    const opts = windowOpenOptionsForHash(slug);
    if (opts) {
      openWindow(opts.windowId, { title: opts.title, w: opts.w, h: opts.h });
    }
    // Only run once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onPopState() {
      const state = useWindowStore.getState();
      const visible = Object.values(state.windows).filter((w) => !w.minimized);
      if (visible.length === 0) return;
      const top = visible.reduce((a, b) => (b.z > a.z ? b : a));
      closeWindow(top.id);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [closeWindow]);
}
