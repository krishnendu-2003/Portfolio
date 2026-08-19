/**
 * The only URLs allowed to leave the shell (target="_blank"). Values are
 * intentionally blank until the real profile/product URLs are supplied —
 * never guess a URL here. A blank entry renders as pending text instead of
 * a link; see components/shell/ExternalLink.tsx.
 */
export const EXTERNAL_LINKS: Record<string, string> = {
  github: "",
  linkedin: "https://www.linkedin.com/in/echowhisper/",
  x: "",
  lumeo: "",
};
