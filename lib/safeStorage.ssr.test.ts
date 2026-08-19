// @vitest-environment node
import { describe, it, expect } from "vitest";
import { readStorage, writeStorage, removeStorage } from "./safeStorage";

describe("safeStorage during SSR (no window)", () => {
  it("readStorage returns the fallback without throwing", () => {
    expect(readStorage("local", "any:v1", "server-default")).toBe("server-default");
  });

  it("writeStorage and removeStorage no-op without throwing", () => {
    expect(() => writeStorage("local", "any:v1", "x")).not.toThrow();
    expect(() => removeStorage("local", "any:v1")).not.toThrow();
  });
});
