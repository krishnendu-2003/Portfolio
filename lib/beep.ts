"use client";

import { useSoundStore } from "./soundStore";

let sharedContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!sharedContext) sharedContext = new AudioCtor();
  return sharedContext;
}

// A short synthesized beep — no audio files anywhere. Never plays while
// muted (the default), and never autoplays on its own; every call site is
// a direct response to a user action inside an already-running game.
export function playBeep(frequency = 440, durationMs = 80, type: OscillatorType = "square") {
  if (useSoundStore.getState().muted) return;
  const ctx = getContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = 0.06;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + durationMs / 1000);
}
