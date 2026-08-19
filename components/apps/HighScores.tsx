"use client";

import { useEffect, useState } from "react";
import { useScoresStore } from "@/lib/scoresStore";
import { GAME_CATALOG } from "@/lib/gameCatalog";
import { GAME_IDS } from "@/lib/windowMeta";

export default function HighScores() {
  const scores = useScoresStore((s) => s.scores);
  const hydrate = useScoresStore((s) => s.hydrate);
  const clear = useScoresStore((s) => s.clear);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="flex h-full flex-col gap-2 bg-white p-3 text-xs">
      <p className="font-bold">High Scores</p>
      <ul className="flex-1 overflow-auto">
        {GAME_IDS.map((id) => {
          const entry = GAME_CATALOG[id];
          const value = scores[id];
          return (
            <li key={id} className="flex justify-between border-b border-gray-300 py-1">
              <span>{entry?.title ?? id}</span>
              <span>{value === undefined ? "—" : entry ? entry.formatScore(value) : value}</span>
            </li>
          );
        })}
      </ul>
      {confirming ? (
        <span className="flex items-center gap-1">
          Clear all scores?
          <button
            type="button"
            onClick={() => {
              clear();
              setConfirming(false);
            }}
          >
            Yes
          </button>
          <button type="button" onClick={() => setConfirming(false)}>
            No
          </button>
        </span>
      ) : (
        <button type="button" className="self-start" onClick={() => setConfirming(true)}>
          Clear
        </button>
      )}
    </div>
  );
}
