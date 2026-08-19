import { describe, it, expect, beforeEach, vi } from "vitest";
import { readStorage, writeStorage, removeStorage } from "./safeStorage";

describe("safeStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("round-trips a value through write/read", () => {
    writeStorage("local", "test:v1", { a: 1 });
    expect(readStorage("local", "test:v1", null)).toEqual({ a: 1 });
  });

  it("namespaces keys under portfolio:", () => {
    writeStorage("local", "wallpaper:v1", "teal");
    expect(window.localStorage.getItem("portfolio:wallpaper:v1")).toBe('"teal"');
  });

  it("returns the fallback when the key is missing", () => {
    expect(readStorage("local", "missing:v1", "default")).toBe("default");
  });

  it("returns the fallback on malformed JSON instead of throwing", () => {
    window.localStorage.setItem("portfolio:broken:v1", "{not json");
    expect(readStorage("local", "broken:v1", "safe")).toBe("safe");
  });

  it("returns the fallback when getItem throws (Safari private mode)", () => {
    const spy = vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    expect(readStorage("local", "any:v1", "fallback")).toBe("fallback");
    spy.mockRestore();
  });

  it("no-ops on write when setItem throws instead of propagating", () => {
    const spy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    expect(() => writeStorage("local", "any:v1", "x")).not.toThrow();
    spy.mockRestore();
  });

  it("keeps local and session storage independent", () => {
    writeStorage("local", "shared:v1", "L");
    writeStorage("session", "shared:v1", "S");
    expect(readStorage("local", "shared:v1", "")).toBe("L");
    expect(readStorage("session", "shared:v1", "")).toBe("S");
  });

  it("removeStorage clears a key without affecting others", () => {
    writeStorage("local", "keep:v1", "keep");
    writeStorage("local", "drop:v1", "drop");
    removeStorage("local", "drop:v1");
    expect(readStorage("local", "keep:v1", "")).toBe("keep");
    expect(readStorage("local", "drop:v1", "gone")).toBe("gone");
  });
});
