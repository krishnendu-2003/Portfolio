"use client";

import { useEffect, useState } from "react";
import { GameShell } from "./GameShell";
import { playBeep } from "@/lib/beep";
import { useScoresStore } from "@/lib/scoresStore";

const PAIRS = 8;
const SYMBOL_COLORS = [
  "#c00000",
  "#008000",
  "#000080",
  "#ffb300",
  "#800080",
  "#008080",
  "#ff6a00",
  "#0000ff",
];

function polygonPoints(sides: number, r: number, cx: number, cy: number) {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    pts.push(`${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`);
  }
  return pts.join(" ");
}

function starPoints(r: number, cx: number, cy: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r / 2.3;
    pts.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`);
  }
  return pts.join(" ");
}

// 8 original, procedurally generated glyphs (regular polygons of 3-8
// sides, plus a star and a plus) — no lifted card-game imagery.
function Glyph({ index }: { index: number }) {
  const color = SYMBOL_COLORS[index % SYMBOL_COLORS.length];
  let shape: React.ReactNode;
  if (index === 6) {
    shape = <polygon points={starPoints(13, 16, 16)} fill={color} stroke="#000000" strokeWidth={1} />;
  } else if (index === 7) {
    shape = (
      <path
        d="M13 4 H19 V13 H28 V19 H19 V28 H13 V19 H4 V13 H13 Z"
        fill={color}
        stroke="#000000"
        strokeWidth={1}
      />
    );
  } else {
    shape = (
      <polygon points={polygonPoints(index + 3, 13, 16, 16)} fill={color} stroke="#000000" strokeWidth={1} />
    );
  }
  return (
    <svg viewBox="0 0 32 32" width={28} height={28} aria-hidden="true">
      {shape}
    </svg>
  );
}

type Card = { id: number; symbol: number; matched: boolean };

function shuffledDeck(): Card[] {
  const symbols = Array.from({ length: PAIRS }, (_, i) => i);
  const deck: Card[] = [...symbols, ...symbols].map((symbol, i) => ({ id: i, symbol, matched: false }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export default function Match({ windowId }: { windowId: string }) {
  const [deck, setDeck] = useState<Card[]>(() => shuffledDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);
  const scores = useScoresStore((s) => s.scores);
  const submit = useScoresStore((s) => s.submit);

  const won = deck.every((c) => c.matched);
  const best = scores.match;

  function reset() {
    setDeck(shuffledDeck());
    setFlipped([]);
    setMoves(0);
    setBusy(false);
  }

  function flip(index: number) {
    if (busy || won) return;
    if (flipped.includes(index)) return;
    if (deck[index].matched) return;
    playBeep(520, 60);

    const next = [...flipped, index];
    setFlipped(next);
    if (next.length < 2) return;

    setBusy(true);
    setMoves((m) => m + 1);
    const [a, b] = next;
    if (deck[a].symbol === deck[b].symbol) {
      playBeep(720, 120, "triangle");
      setTimeout(() => {
        setDeck((d) => d.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)));
        setFlipped([]);
        setBusy(false);
      }, 250);
    } else {
      setTimeout(() => {
        playBeep(220, 120, "sawtooth");
        setFlipped([]);
        setBusy(false);
      }, 700);
    }
  }

  useEffect(() => {
    if (won) submit("match", moves, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);

  return (
    <GameShell windowId={windowId} instructions="Find every pair. Fewer moves is better." onReset={reset}>
      <div className="flex h-full flex-col items-center justify-center gap-2 p-2">
        <div className="grid grid-cols-4 gap-1.5">
          {deck.map((card, i) => {
            const faceUp = card.matched || flipped.includes(i);
            return (
              <button
                key={card.id}
                type="button"
                aria-label={faceUp ? `Card showing shape ${card.symbol + 1}` : "Face-down card"}
                onClick={() => flip(i)}
                disabled={card.matched}
                className="flex h-12 w-12 items-center justify-center border border-gray-500"
                style={{ background: faceUp ? "#ffffff" : "#000080" }}
              >
                {faceUp && <Glyph index={card.symbol} />}
              </button>
            );
          })}
        </div>
        <p className="text-xs">
          Moves: {moves}
          {best !== undefined ? ` — Best: ${best}` : ""}
        </p>
        {won && <p className="font-bold">Solved in {moves} moves!</p>}
      </div>
    </GameShell>
  );
}
