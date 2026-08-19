"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

// Fixed 60Hz simulation step, decoupled from render/display refresh rate —
// games must not run faster on a 120Hz display. Accumulator pattern.
const FIXED_STEP_MS = 1000 / 60;
// Clamp a single frame's elapsed time so a backgrounded-tab spike doesn't
// force a huge catch-up burst of update() calls when it resumes.
const MAX_FRAME_MS = 250;

export function useGameLoop(update: (dtMs: number) => void, render: () => void, running: boolean) {
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const accumulatorRef = useRef(0);
  const updateRef = useRef(update);
  const renderRef = useRef(render);
  useLayoutEffect(() => {
    updateRef.current = update;
    renderRef.current = render;
  });

  useEffect(() => {
    if (!running) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = null;
      accumulatorRef.current = 0;
      return;
    }

    function frame(time: number) {
      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const delta = Math.min(time - lastTimeRef.current, MAX_FRAME_MS);
      lastTimeRef.current = time;
      accumulatorRef.current += delta;
      while (accumulatorRef.current >= FIXED_STEP_MS) {
        updateRef.current(FIXED_STEP_MS);
        accumulatorRef.current -= FIXED_STEP_MS;
      }
      renderRef.current();
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running]);
}
