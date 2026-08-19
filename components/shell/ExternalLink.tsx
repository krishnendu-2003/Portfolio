export function ExternalLink({ href, label }: { href: string; label: string }) {
  if (!href) {
    return <span className="text-xs opacity-60">{label} (link pending)</span>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`}>
      {label} ↗
    </a>
  );
}
