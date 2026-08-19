import { systemProperties } from "@/content/systemProperties";

export default function SystemProperties() {
  return (
    <div className="flex h-full flex-col gap-3 bg-white p-3">
      <p className="font-bold">My Machine</p>
      <div className="field-row-stacked text-xs">
        <span>Processor: {systemProperties.processor}</span>
        <span>Memory: {systemProperties.memory}</span>
      </div>
      <p className="text-xs font-bold">Installed</p>
      <ul className="flex-1 list-disc overflow-auto pl-5 text-xs">
        {systemProperties.installed.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
