import { now } from "@/content/now";

export default function Now() {
  return (
    <div className="flex h-full flex-col gap-2 bg-white p-3">
      <p className="font-bold">Now — {now.updated}</p>
      <p className="text-xs text-gray-600">A snapshot, not a promise it stays true.</p>
      <p className="whitespace-pre-wrap">{now.note}</p>
    </div>
  );
}
