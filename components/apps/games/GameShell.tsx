"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useWindowStore } from "@/lib/windowStore";
import { useScoresStore } from "@/lib/scoresStore";

// Whether the game should currently be simulating/animating — exposed via
// context (not a render-prop) so a game can call useGameLoop with it at
// its own top level, satisfying the rules of hooks instead of nesting a
// hook call inside a children-as-function closure.
const RunningContext = createContext(false);
export function useGameRunning() {
  return useContext(RunningContext);
}

// A game only runs while its own window is the focused, non-minimized,
// visible one — pause on blur/minimize/back-stack/tab-hide, genuinely
// (the rAF loop in useGameLoop is cancelled outright, not skipping frames).
export function useWindowActive(windowId: string) {
  const isTop = useWindowStore((s) => {
    const visible = Object.values(s.windows).filter((w) => !w.minimized);
    if (visible.length === 0) return false;
    const maxZ = Math.max(...visible.map((w) => w.z));
    const win = s.windows[windowId];
    return !!win && !win.minimized && win.z === maxZ;
  });
  const [pageVisible, setPageVisible] = useState(
    typeof document === "undefined" ? true : !document.hidden
  );

  useEffect(() => {
    function onVisibility() {
      setPageVisible(!document.hidden);
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return isTop && pageVisible;
}

// Handheld-console palette. Deliberately not an exact reproduction of any
// specific console's shell color/trade dress — a warm putty shell + a
// green-tinted LCD screen is the general aesthetic language of that whole
// era of handhelds, not one company's protected expression.
const SHELL = "#c9c7ac";
const SHELL_EDGE = "#918f76";
const SCREEN_FRAME = "#2b2b28";
const LCD_LIGHT = "#9bbc0f";
const LCD_DARK = "#0f380f";

function ShellButton({
  children,
  onClick,
  ariaPressed,
  tone = "select",
}: {
  children: ReactNode;
  onClick: () => void;
  ariaPressed?: boolean;
  tone?: "select" | "action";
}) {
  const isAction = tone === "action";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ariaPressed}
      className="text-[10px] font-bold"
      style={{
        borderRadius: 999,
        padding: isAction ? "4px 10px" : "3px 8px",
        background: isAction ? "#7b2d3a" : "#4a4a44",
        color: "#f2ede0",
        border: "1px solid rgba(0,0,0,0.4)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.4)",
      }}
    >
      {children}
    </button>
  );
}

export function GameShell({
  windowId,
  instructions,
  onReset,
  onKeyDown,
  onKeyUp,
  children,
}: {
  windowId: string;
  instructions: string;
  onReset?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  children: ReactNode;
}) {
  const windowActive = useWindowActive(windowId);
  const hydrateScores = useScoresStore((s) => s.hydrate);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const running = started && !paused && windowActive;

  useEffect(() => {
    hydrateScores();
  }, [hydrateScores]);

  useEffect(() => {
    if (started) contentRef.current?.focus();
  }, [started]);

  return (
    <div
      className="flex h-full flex-col gap-1.5 p-1.5"
      style={{ background: SHELL, border: `2px solid ${SHELL_EDGE}`, borderRadius: 10 }}
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: "#7b2d3a", boxShadow: "0 0 3px #ff4d6d" }} />
        <p className="flex-1 text-[10px] font-bold tracking-wide" style={{ color: "#3a3a2c" }}>
          {instructions}
        </p>
        <div className="flex shrink-0 gap-1.5">
          {started && (
            <ShellButton ariaPressed={paused} onClick={() => setPaused((p) => !p)}>
              {paused ? "RESUME" : "PAUSE (P)"}
            </ShellButton>
          )}
          {onReset && started && (
            <ShellButton
              onClick={() => {
                onReset();
                setStarted(false);
                setPaused(false);
              }}
            >
              RESET
            </ShellButton>
          )}
        </div>
      </div>

      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{
          background: LCD_DARK,
          border: `4px solid ${SCREEN_FRAME}`,
          borderRadius: 4,
          boxShadow: "inset 0 0 10px rgba(0,0,0,0.65)",
        }}
      >
        {/* Green LCD tint over whatever the game draws — a wash, not a hard
            override, so each game's own colors/shapes stay legible. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: LCD_LIGHT, mixBlendMode: "multiply", opacity: 0.55, zIndex: 5 }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1px, transparent 1px, transparent 3px)",
            zIndex: 6,
          }}
        />

        <div
          ref={contentRef}
          tabIndex={-1}
          className="relative h-full w-full outline-none"
          onKeyDown={(e) => {
            if (!started) return;
            if (e.key.toLowerCase() === "p") {
              setPaused((p) => !p);
              return;
            }
            onKeyDown?.(e);
          }}
          onKeyUp={(e) => {
            if (!started) return;
            onKeyUp?.(e);
          }}
        >
          <RunningContext.Provider value={running}>{children}</RunningContext.Provider>
          {!started && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{ background: LCD_LIGHT }}
            >
              <ShellButton tone="action" onClick={() => setStarted(true)}>
                START
              </ShellButton>
            </div>
          )}
          {started && paused && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(155,188,15,0.9)", zIndex: 7 }}
            >
              <p className="text-xs font-bold" style={{ color: LCD_DARK }}>
                PAUSED
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
