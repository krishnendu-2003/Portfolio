"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useWindowStore } from "@/lib/windowStore";
import { useScoresStore } from "@/lib/scoresStore";

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

export function GameShell({
  windowId,
  instructions,
  onReset,
  onKeyDown,
  children,
}: {
  windowId: string;
  instructions: string;
  onReset?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  children: (opts: { running: boolean }) => ReactNode;
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
    <div className="flex h-full flex-col gap-1 bg-white p-1 text-xs">
      <div className="flex items-center justify-between gap-2 border-b border-gray-400 pb-1">
        <p className="flex-1">{instructions}</p>
        <div className="flex shrink-0 gap-1">
          {started && (
            <button
              type="button"
              aria-pressed={paused}
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? "Resume" : "Pause (P)"}
            </button>
          )}
          {onReset && started && (
            <button
              type="button"
              onClick={() => {
                onReset();
                setStarted(false);
                setPaused(false);
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div
        ref={contentRef}
        tabIndex={-1}
        className="relative min-h-0 flex-1 outline-none"
        onKeyDown={(e) => {
          if (!started) return;
          if (e.key.toLowerCase() === "p") {
            setPaused((p) => !p);
            return;
          }
          onKeyDown?.(e);
        }}
      >
        {children({ running })}
        {!started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white">
            <button type="button" onClick={() => setStarted(true)} autoFocus>
              Start
            </button>
          </div>
        )}
        {started && paused && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/85">
            <p className="font-bold">Paused</p>
          </div>
        )}
      </div>
    </div>
  );
}
