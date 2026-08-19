import { aboutMe } from "@/content/about";

export default function AboutMe() {
  const text = [aboutMe.name, aboutMe.tagline, ...aboutMe.paragraphs].join("\n\n");

  return (
    <div className="h-full overflow-auto bg-white p-3 whitespace-pre-wrap">{text}</div>
  );
}
