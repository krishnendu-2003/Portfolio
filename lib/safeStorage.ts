"use client";

export type StorageArea = "local" | "session";

function getArea(area: StorageArea): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return area === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    // Safari private mode (and some locked-down environments) throw just
    // accessing the property.
    return null;
  }
}

function namespaced(key: string) {
  return `portfolio:${key}`;
}

export function readStorage<T>(area: StorageArea, key: string, fallback: T): T {
  const storage = getArea(area);
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(namespaced(key));
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(area: StorageArea, key: string, value: T): void {
  const storage = getArea(area);
  if (!storage) return;
  try {
    storage.setItem(namespaced(key), JSON.stringify(value));
  } catch {
    // Quota exceeded, private-mode write rejection, etc. — silently no-op,
    // the caller's in-memory state is still correct for this session.
  }
}

export function removeStorage(area: StorageArea, key: string): void {
  const storage = getArea(area);
  if (!storage) return;
  try {
    storage.removeItem(namespaced(key));
  } catch {
    // ignore
  }
}
