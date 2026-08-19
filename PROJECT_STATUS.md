# Portfolio Build — Status Report

Handoff document describing what's been built so far, for feeding into a new
session to pick up mid-Phase-2 work without re-deriving context.

## What this is

A retro desktop-OS-shell portfolio for **Krishnendu Samanta** (AI/ML and
frontend engineer, CTO & Co-founder at Lumeo). Built with Next.js 16 App
Router + 98.css, as a single-page client-side window manager with real
server-rendered content underneath for crawlability. Repo:
`/Users/krishnendu/Desktop/Portfolio`.

Steps 1–7 of the Phase 1 build plan are complete and committed to `main`.
**Step 8 (deploy) ran** — live at
`https://krishnendu-portfolio-chi.vercel.app`. Two content gaps flagged in
an earlier version of this doc (the "second-year B.Tech" mismatch, and the
résumé's "seeking a fresher role" line clashing with the CTO title) are both
fixed as of commit `2c37259`.

**Phase 2 is in progress.** Master prompt build order: Phase 2A (shell:
storage wrapper, icon dragging, wallpaper/Display Properties, Start Menu,
three small content windows, redeploy+Lighthouse) → stop → Phase 2B
(Sketchpad, Match, Snake) → stop → Phase 2C (remaining games, Terminal, boot
sequence/mascot/sound), only if explicitly told to continue at each stop.
**Phase 2A steps 1–4 are done; step 5 (Now / System Properties / Recycle
Bin) and step 6 (redeploy + re-run Lighthouse) are what's left before the
first Phase 2 stop-and-report point.**

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

Vercel, static-first, no database. Linked (`.vercel/project.json`, project
`krishnendu-portfolio`) and deployed — live at
`https://krishnendu-portfolio-chi.vercel.app`. Phase 2A steps 1–4's work is
committed but **not yet redeployed**; that's part of step 6.

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
    Taskbar.tsx              # desktop bar (window list + Start button/menu) + mobile bar (Back), CSS-toggled
    StartMenu.tsx            # Start Menu: items, Selected Work submenu, roving keyboard nav
    DesktopIcon.tsx           # Pointer Events drag (4px threshold, snap-to-grid) + click-to-open
    ExternalLink.tsx         # renders the EXTERNAL_LINKS allowlist, or "(link pending)"
  apps/                     # one file per window, pure content
    AboutMe.tsx, WhatIDo.tsx, SelectedWork.tsx, CaseCard.tsx,
    CaseStudy.tsx, Resume.tsx, Contact.tsx, DisplayProperties.tsx, ShutDown.tsx

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
  safeStorage.ts             # the one localStorage/sessionStorage wrapper, namespaced + try/catch'd
  iconLayout.ts               # 2-col column-major grid math: cell<->pixel, clamp, nearest-free-cell
  iconPositionsStore.ts       # zustand, persists desktop icon positions via safeStorage
  wallpaperStore.ts           # zustand, persists the chosen wallpaper via safeStorage

content/
  about.ts                 # aboutMe, whatIDo, resume — single source of truth,
                            # shared by shell windows, static pages, hidden SSR block
  cases.ts                 # the 4 Selected Work cases (lumeo, keypr, catoff-gaming, hackathons)

eslint-rules/
  no-shell-navigation.mjs   # custom rule: blocks <a href="/..."> or "#..."> in
                            # components/apps/** unless paired with onClick or download

public/
  icons/*.svg               # 5 original 32x32 icons (folder, notepad, wordpad-doc, document, mail)
                            # + placeholder.svg, reused for the two Start-Menu-only windows
                            # (Display Properties, Shut Down) since their icon is never rendered
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

## Phase 2A progress (steps 1–4 of 6, done)

**Step 1 — `lib/safeStorage.ts`.** The one storage wrapper everything else
uses: `readStorage`/`writeStorage`/`removeStorage`, namespaced under
`portfolio:*`, wrapped in try/catch (Safari private-mode throws just
touching `localStorage`), SSR-safe (`typeof window === "undefined"` guard).
Unit-tested (`lib/safeStorage.test.ts`, `.ssr.test.ts` — first tests in the
repo, `vitest run` via `npm test`).

**Step 2 — desktop icon dragging.** `lib/iconLayout.ts` (2-column,
column-major grid, cell↔pixel conversion, clamping, nearest-free-cell
collision resolution) + `lib/iconPositionsStore.ts` (zustand, persists
`{id: [col,row]}` under `portfolio:iconPositions:v1`). `DesktopIcon.tsx`
does Pointer Events dragging with a 4px threshold (below it, a normal click
that opens the window; above it, the synthetic click is suppressed so a
drag never also opens a window), snap-to-grid on drop, rAF-throttled like
`WindowFrame`. Roving arrow-key nav (`useIconGridNav`) still follows DOM
order, unaffected by drag state. "Reset icon layout" lives in Display
Properties (see below) — not yet in the Start Menu's own click-through, but
it *is* a Start Menu item that opens the same action.

**Step 3 — wallpaper + Display Properties.** Eight CSS-only wallpapers
(`app/globals.css`, keyed off `html[data-wallpaper="..."] .desktop-root`) —
teal, clouds, sunset, starfield, neon-grid, diagonal, terminal-green,
nebula. Contrast-checked: clouds/sunset get a dark-text icon-label override
(`html[data-wallpaper="clouds"] button.desktop-icon` etc.), the rest clear
4.5:1+ with the stock white/shadowed label text. `lib/wallpaperStore.ts`
persists the choice under `portfolio:wallpaper:v1`. Read-before-first-paint
via an inline script in `app/layout.tsx` (same pattern as a theme-flash
fix) — no flash of the wrong wallpaper on load. `components/apps/
DisplayProperties.tsx` is the actual picker window: a radiogroup of all 8
wallpapers with a small color swatch each, applies live on selection (no
separate Apply/OK step — there's nothing "pending" to commit, matches how
the rest of the shell works), plus the "Reset icon layout" button. Not a
desktop icon — reached only through the Start Menu, same as real Windows
Display Properties.

**Step 4 — Start Menu.** `components/shell/StartMenu.tsx`, opens upward
from the Start button (`components/shell/Taskbar.tsx` holds the
open/closed state + anchor ref). 98-styled with a vertical gradient sidebar
strip (`writing-mode: vertical-rl`, not a manual rotate+translate hack).
Items: Selected Work ▸ (submenu of the 4 cases, opens on hover or
Right/Enter, same `case-{slug}` windows the desktop folder opens), About
Me, What I Do, Résumé, Contact, ─────, Display Properties, Reset icon
layout, ─────, Shut Down…. Keyboard: Up/Down roving focus (wraps),
Right/Enter opens the submenu and focuses its first item, Left/Escape
closes the submenu and returns focus to the parent item, Escape at the top
level closes the whole menu and returns focus to the Start button
(`stopPropagation`'d so it doesn't also bubble up and close the topmost
*window* via `WindowFrame`'s own Escape handler). Click-outside (a
`pointerdown` listener checking `contains()` against both the menu root and
the Start button) closes it. **Shut Down…** opens as a real window
(`components/apps/ShutDown.tsx`, registered like any other) with "It is now
safe to turn off your computer." and a Restart button; Restart closes every
open window (added `order`/`closeWindow` iteration, no new store method
needed) — there's no boot sequence yet (that's Phase 2C), so Restart is
currently just "closes everything," which already satisfies the spec's
"must not actually navigate or blank the page permanently."

**Games ▸ and Sketchpad are deliberately not in the Start Menu yet** — those
apps don't exist until Phase 2B, and adding menu entries for windows that
don't exist would be exactly the kind of half-finished surface the build
spec warns against. Add them to `StartMenu.tsx`'s `items` array when Step 7
(Sketchpad) and Step 8 (Games shell) land.

**Not yet in windowMeta but expected by Step 5:** `now`, `system-properties`
(a.k.a. "My Machine"), `recycle-bin` — these get **desktop icons**, not
Start Menu entries, per the spec's actual item list.

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

## Explicitly NOT built yet

**Rest of Phase 2A (step 5, next up):**
- **Now (2026)** window — needs copy from the user, don't invent it
- **System Properties / "My Machine"** (the tech-stack-as-specs dialog) —
  needs the user's skill/tool list
- **Recycle Bin** (shelved side projects, one self-deprecating line each,
  fake "Restore" tooltip) — needs the project list from the user

All three get desktop icons (unlike Display Properties/Shut Down, which are
Start-Menu-only). Once these land, redeploy and re-run Lighthouse — that's
step 6, the first Phase 2 stop-and-report point.

**Phase 2B (blocked on explicit go-ahead after step 6):**
- Sketchpad drawing app
- Games shell + shared `useGameLoop`/`GameShell` engine + Match + Snake

**Phase 2C (blocked on explicit go-ahead after Phase 2B):**
- Sweeper, Merge, Paddle, High Scores window
- Terminal (fake shell with `help`/`whoami`/`ls`/`cat`/`open`/`contact`/
  `sudo`/`clear`/`exit` commands)
- Boot sequence (skippable splash, once per session via `sessionStorage`)
- Original mascot / Help assistant (explicitly "no Clippy" — needs an
  original SVG character)
- Sound effects (WebAudio synthesized beeps, off by default, muted toggle
  in taskbar)

**Skipped by spec:** Ctrl+Tab window cycling (listed as optional).

## Known small gaps / things worth a decision in the next round

- **Post-deploy Lighthouse hasn't been re-run since Phase 1 shipped.** The
  93/97 performance scores in the Step 7 section above are from a local
  production build, not the live Vercel URL. Step 6 of Phase 2A (redeploy +
  re-run Lighthouse across homepage/case/about/resume) will get a real
  number — do that rather than trying to guess or locally optimize further.
- Test coverage is still thin — `lib/safeStorage.*.test.ts` are the only
  unit tests in the repo (added alongside Step 1). Everything else is still
  verified via manual browser testing, not CI-checked.
- Both items flagged in an earlier version of this doc (résumé objective
  framing, "second-year B.Tech" vs. real dates) are resolved — see commit
  `2c37259`.

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
