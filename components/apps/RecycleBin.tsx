"use client";

import { useState } from "react";
import { recycleBinItems } from "@/content/recycleBin";

const RESTORE_JOKES = [
  "Restoring… restoring… nope, it's happier in here.",
  "404: motivation not found.",
  "This one's staying shelved. For everyone's sake.",
];

export default function RecycleBin() {
  const [joke, setJoke] = useState<number | null>(null);

  return (
    <div className="flex h-full flex-col gap-2 overflow-auto bg-white p-3">
      <p className="font-bold">Recycle Bin</p>
      <ul className="flex flex-col gap-2">
        {recycleBinItems.map((item, i) => (
          <li key={i} className="border border-gray-400 p-2">
            <p className="font-bold">{item.name}</p>
            <p className="text-xs">{item.line}</p>
            <button
              type="button"
              className="mt-1"
              onClick={() => setJoke(i)}
            >
              Restore
            </button>
            {joke === i && (
              <p className="mt-1 text-xs italic">{RESTORE_JOKES[i % RESTORE_JOKES.length]}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
