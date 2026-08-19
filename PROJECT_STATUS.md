# Portfolio Build — Status Report

Handoff document describing what's been built so far, for feeding into a new
session to draft a follow-up master prompt (Phase 2 features / additions).

## What this is

A retro desktop-OS-shell portfolio for **Krishnendu Samanta** (AI/ML and
frontend engineer, CTO & Co-founder at Lumeo). Built with Next.js 16 App
Router + 98.css, as a single-page client-side window manager with real
server-rendered content underneath for crawlability. Repo:
`/Users/krishnendu/Desktop/Portfolio`.

Steps 1–7 of the original build plan are complete and committed to `main`
(7 commits, clean working tree as of this writeup). **Step 8 (deploy) has
not run yet.**

---

## Stack (verified current versions, not assumed from training data)

| Package | Version | Note |
|---|---|---|
| next | 16.3.1 | App Router, Turbopack |
| react / react-dom | 19.2.8 | |
| typescript | 5.9.3 | Deliberately NOT the bleeding-edge 7.0.2 — create-next-app's own template pins 5.9.3 as the tested combo for this Next version; went with that over `npm show`'s "latest" |
| tailwindcss | 4.3.3 | v4 — CSS-based `@theme`, no `tailwind.config.js` |
| 98.css | 0.1.21 | MIT, CSS-only chrome (buttons, title bars, bevels) |
| zustand | 5.0.15 | Window manager state |
| eslint / eslint-config-next | 9.39.5 / 16.3.1 | |

No Framer Motion — deferred per spec ("barely animates anyway"), plain CSS
used everywhere so far.

## Deploy target

Vercel, static-first, no database. **Not yet deployed** — that's Step 8,
intentionally paused so this status doc could be written first.

---

## Architecture

```
app/
  layout.tsx            # fonts (JetBrains Mono), metadataBase, 98.css import
  page.tsx               # <Desktop/> + hidden SSR content block (curl-able)
  globals.css             # Tailwind + 98.css import + WCAG contrast overrides
  about/page.tsx          # static crawlable fallback
  resume/page.tsx         # static crawlable fallback
  work/[slug]/page.tsx    # static crawlable case pages (generateStaticParams)
  work/[slug]/opengraph-image.tsx  # per-case dynamic OG image (next/og)
  opengraph-image.tsx     # site-wide default OG image
  sitemap.ts, robots.ts   # driven by lib/siteConfig.ts

components/
  shell/
    Desktop.tsx            # wallpaper, icon grid, window layer, taskbar
    WindowFrame.tsx         # title bar, drag/resize, focus, mobile sheet mode
    Taskbar.tsx              # desktop bar (window list) + mobile bar (Back), CSS-toggled
    DesktopIcon.tsx
    ExternalLink.tsx         # renders the EXTERNAL_LINKS allowlist, or "(link pending)"
  apps/                     # one file per window, pure content
    AboutMe.tsx, WhatIDo.tsx, SelectedWork.tsx, CaseCard.tsx,
    CaseStudy.tsx, Resume.tsx, Contact.tsx

lib/
  windowStore.ts           # zustand: open/close/focus/minimize/maximize/move/resize
  windowMeta.ts             # component-free metadata (title/icon/size) — see note below
  windowRegistry.ts         # windowMeta + actual React components, for WindowFrame
  hashRouting.ts            # windowId <-> URL hash slug maps
  urlSync.ts                # deep-link-on-load + Back-closes-top-window hook
  useIsMobile.ts            # useSyncExternalStore over matchMedia(max-width:767px)
  useIconGridNav.ts         # arrow-key roving focus for icon grids
  focusReturn.ts            # remembers/restores focus origin on window open/close
  externalLinks.ts          # the EXTERNAL_LINKS allowlist (github/linkedin/x/lumeo)
  siteConfig.ts             # SITE_URL from NEXT_PUBLIC_SITE_URL (falls back to localhost)

content/
  about.ts                 # aboutMe, whatIDo, resume — single source of truth,
                            # shared by shell windows, static pages, hidden SSR block
  cases.ts                 # the 4 Selected Work cases (lumeo, keypr, catoff-gaming, hackathons)

eslint-rules/
  no-shell-navigation.mjs   # custom rule: blocks <a href="/..."> or "#..."> in
                            # components/apps/** unless paired with onClick or download

public/
  icons/*.svg               # 5 original 32x32 icons (folder, notepad, wordpad-doc, document, mail)
  resume.pdf                 # the REAL résumé PDF (95KB), not a placeholder
```

### Why `windowMeta.ts` and `windowRegistry.ts` are split

`windowStore.ts` needs to push a URL hash when a window opens
(`lib/hashRouting.ts`), which needs to look up a window's title/size by id.
If that lookup went through `windowRegistry.ts` (which imports the actual
React components), it would create a circular import: store → hashRouting →
registry → `SelectedWork.tsx` → store (since `SelectedWork.tsx` calls
`useWindowStore`). `windowMeta.ts` holds the same data with zero component
imports, so the store can depend on it safely. `windowRegistry.ts` layers the
components on top, for `WindowFrame.tsx` to actually render.

---

## What's built (Steps 1–7)

**Step 1 — scaffold.** Next.js 16 + Tailwind v4 + 98.css wired together,
JetBrains Mono as the one non-98.css font, favicon/boilerplate cleared out.

**Step 2+3 — window manager core.** Zustand store with cascade placement,
viewport clamping (title bar can never be dragged fully off-screen),
monotonic z-index focus stacking, 8-window cap (oldest unfocused evicted),
minimize/maximize/close, and the parent→child "Open full case" spawn
(offset +30px down-right, focused, parent stays open behind it — this is
§0's core interaction and it's the most load-bearing thing in the whole
build). Pointer-event drag/resize with rAF throttling, no external DnD
library. `role="dialog"` / `aria-modal="false"` / `aria-labelledby`, focus-in
on open, focus-return on close, Escape closes the focused window.

**Step 4 — real content.** About Me, What I Do, Selected Work (folder of 4
case cards, each with its own "Open full case" full-narrative child window),
Résumé, Contact. All window content lives in `components/apps/**`, guarded
by the custom ESLint rule so nothing there can ever do a real page
navigation. Content redaction list (see below) enforced and grep-verified.

**Step 5 — crawlability.** Static `/work/[slug]`, `/about`, `/resume` routes
with `generateStaticParams` + per-page metadata + dynamic OG images
(`next/og`, teal/98-styled cards). `sitemap.xml` / `robots.txt`. The
homepage server-renders real prose into a `<div hidden>` block so `curl`
sees actual content, not an empty client shell. Hash-based URL sync
(`#/lumeo` deep-links straight into that window; Back closes the top window)
using raw `history` APIs only, never `next/navigation`'s router. Selected
Work's case icons use the one sanctioned `<a href="/work/slug">` exception
from §3 (real href for crawlers/middle-click, `onClick` intercepts for the
shell).

**Résumé overhaul (mid-Step-5, user-directed).** The user supplied their
actual résumé PDF; it's now `public/resume.pdf` (the real download, not a
placeholder) and `content/about.ts`'s `resume` object mirrors its real
content — both degrees, both internships (Tech Vortex Ventures, Catoff
Gaming), all 3 side projects (FirmDev, SwitchSocial, Luminere), both real
hackathon wins (Prayash 2024, Binary 2025), skills, volunteering. This also
resolved what had been placeholder-marked content for the Hackathons and
Catoff Gaming cases (real specifics now, nothing invented). A Lumeo (CTO &
Co-founder) entry was added to the résumé's work-experience list, corroborated
via the user's LinkedIn (headline: "Building @Lumeo") — LinkedIn has no dated
Experience entry for it, so the period is "Present" rather than guessed.

**About Me expansion.** Grew from 3 bare lines to 4 flowing paragraphs
covering Lumeo, the concurrent Tech Vortex Ventures/Catoff Gaming work, side
projects + hackathon wins, and education — via the same shared
`content/about.ts` source used everywhere.

**External links filled in.** `lib/externalLinks.ts`'s `EXTERNAL_LINKS`
(GitHub, LinkedIn, X, Lumeo product site) are all real URLs now, supplied by
the user directly. Surfaced in Contact (all four... three, LinkedIn/GitHub/X)
and as a "Visit Lumeo ↗" link on the Lumeo full case.

**Step 6 — mobile sheet mode.** Below 768px: windows render full-screen (no
drag/resize — was already guarded by a live viewport check from Step 2/3),
only the topmost window is visible (others stay in the store but
`display:none` — a simple back-stack), minimize/maximize controls and the
resize handle are hidden. Taskbar splits into two variants toggled by pure
CSS (`md:hidden` / `hidden md:flex` — no JS, no flash-of-wrong-layout on
first paint): the desktop window-list bar, and a mobile bottom bar with a
← Back button (closes the top window, restores focus to its opener) plus the
current window's title. Both icon grids (desktop, Selected Work) become
3-column below 768px.

*Testing note:* the sandboxed browser used for verification doesn't
propagate OS-level window resizes to the page's actual CSS viewport, so
mobile mode was verified via a same-origin iframe pinned to 375×700 (iframes
get their own real viewport) rather than trusting an unverified
implementation. Confirmed: 3-column icons, full-screen sheet with only a
Close control, Back correctly closing + restoring focus.

**Step 7 — accessibility pass.** Computed actual WCAG contrast ratios on
98.css's stock colors (don't trust "looks fine") and found two real
failures: the active title bar's white text against the light end of its
default blue gradient (`#1084d0`) came out to ~4.0:1, under the 4.5:1 AA
minimum — overrode `--dialog-blue-light` to `#0c6aa8` (~5.8:1, same
navy-to-blue look). Inactive title bars keep white `.title-bar-text` on a
*light gray* gradient in stock 98.css (not scoped to `.active`) — ~2:1,
badly failing — switched to black text for the inactive state. Also found
98.css explicitly strips focus outlines (`outline: none`) from the
title-bar min/max/close buttons and from all text inputs/textarea/select,
with zero substitute — restored visible `:focus-visible` rings for both.
Added arrow-key roving navigation across both icon grids
(`lib/useIconGridNav.ts` — linear-sequence model since column count varies
by breakpoint, not full 2D geometry) and `prefers-reduced-motion` support.

Verified against a **production build** (`next start`, not dev mode) with
real Lighthouse: **accessibility 100** on both the homepage and a case page
(including a targeted re-check with a window actually open, confirming the
title-bar fix holds under audit — 0 failing `color-contrast` elements, not
just hand calculation). SEO 100. Performance: 93 (homepage) / 97 (static
case page) — close to but not quite the spec's ≥95 target; the gap traces to
a small render-blocking CSS request that reads mostly as localhost
test-harness latency, worth re-checking once actually deployed.

---

## Content rules that must keep being enforced

This is the single most important thing for a follow-up prompt to preserve.
The site is permanently public, and the following must never appear —
anywhere, including comments/commit messages:

- The parent-entity name paired with "Lumeo"
- Named backend frameworks, databases, queues, ledger engines, or infra
  providers used by Lumeo
- Blockchain/chain/smart-contract/token terminology *describing Lumeo*
  (personal Solana/Web3/Superteam background is fine as personal background
  — already used for the SwitchSocial project in the résumé)
- Investor names, fund names, raise amounts, cap terms
- Internal codenames
- Any traction/waitlist/revenue/user-count number
- Co-founder names only as full legal names if they appear at all (none
  currently named anywhere on the site)

A grep sweep for these terms has been run clean after every content change
so far (see commit messages). Keep doing that on every future content PR.

---

## Explicitly NOT built yet (Phase 2, per the original spec's build order)

None of these exist in the codebase at all right now:

- **Terminal** (fake shell with `help`/`whoami`/`ls`/`cat`/`open`/`contact`/
  `sudo`/`clear`/`exit` commands)
- **System Properties / "My Machine"** (the tech-stack dialog)
- **Display Properties** (wallpaper picker, 8 CSS-only presets,
  `localStorage`-persisted — nothing in the codebase touches
  `localStorage` yet, so the "wrap in try/catch" requirement is untested)
- **Now (2026)** window
- **Recycle Bin** (shelved side projects)
- **Original mascot / Help assistant** (explicitly "no Clippy" — needs an
  original SVG character)
- **Boot sequence** (skippable splash, once per session via
  `sessionStorage`)
- **Sound effects** (off by default, muted toggle in taskbar)
- **Start Menu** — the taskbar currently has a decorative "Start" button
  that does nothing; no menu exists
- **Ctrl+Tab window cycling** (spec listed this as optional; skipped)

## Known small gaps / things worth a decision in the next round

- **Résumé narrative tension:** the résumé's objective line (verbatim from
  the user's PDF) reads *"Fullstack developer, seeking a full-time
  opportunity as a fresher"* directly above a "CTO & Co-founder" entry.
  Flagged to the user once, not resolved either way.
- **"Second-year B.Tech" vs. résumé dates:** the original master prompt
  said "second-year"; the résumé shows B.Tech starting Sep 2022, which by
  the current date (2026) would put them well past second year. Never
  corrected — still says "second-year" everywhere on the site.
- **Performance score (93 on the homepage)** — likely resolves closer to 95+
  on real deploy infra (CDN, HTTP/2, no dev-fetch overhead); worth a
  post-deploy Lighthouse re-run rather than more local optimization.
- **Lighthouse SEO/Performance haven't been checked on `/about` or
  `/resume`** specifically, only homepage and one case page.
- No automated test suite exists (unit or e2e) — everything has been
  verified via manual browser testing + Lighthouse + `curl`, not CI-checked.

## Things a follow-up master prompt should probably restate explicitly

If regenerating a master prompt from this document, carry these forward —
they're easy to silently lose:

1. The §0 rule (nothing in `components/apps/**` navigates the page) and the
   ESLint rule that enforces it — any new interactive app window must
   follow the same `openWindow`/`openChildWindow` pattern, never raw
   navigation.
2. The redaction list above, verbatim.
3. "Never guess a URL" — every external link so far was supplied by the
   user directly in chat, never invented. Any new external link needs the
   same treatment.
4. The content single-source-of-truth pattern (`content/about.ts`,
   `content/cases.ts`) — new content should extend these files, not
   duplicate copy inline in components.
5. `git config` in this repo is set locally (not globally) to the user's
   name/email since none was configured at scaffold time — worth knowing if
   a future session needs to make commits.
