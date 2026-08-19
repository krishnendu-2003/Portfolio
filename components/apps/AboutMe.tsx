import { aboutMe } from "@/content/about";

export default function AboutMe() {
  return (
    <div className="h-full bg-white p-3 whitespace-pre-wrap">
      {`${aboutMe.name}\n${aboutMe.tagline}\n\n${aboutMe.lines.join("\n")}`}
    </div>
  );
}
