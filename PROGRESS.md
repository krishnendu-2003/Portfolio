# Phase 2 Progress

Tracking doc for the current build-without-stopping pass. See
`PROJECT_STATUS.md` for the fuller Phase 1 / early Phase 2A history — this
file is the up-to-the-minute one, update it after every item.

## Status

Building sequentially through the SCOPE in the current master prompt: finish
Phase 2A (1a–1d) → Sketchpad (2) → Games (3) → final pass (4).

## Done

- [x] Phase 2A steps 1–4 (safeStorage, icon dragging, wallpaper CSS/store,
      Display Properties window, Start Menu) — see `PROJECT_STATUS.md`.

## Done (this pass)

- [x] 1a. Now (2026) window — desktop icon, `content/now.ts` placeholder copy
- [x] 1b. System Properties / "My Machine" window — desktop icon, placeholder skills
- [x] 1c. Recycle Bin window — desktop icon, placeholder project + working Restore-joke
- [x] 1d. Promoted Display Properties → "Wallpaper" desktop app (own icon, gradient
      swatch previews, 98 dotted-focus border on the selected swatch)

All four smoke-tested live in the browser (icons render, windows open with
correct content, Restore joke fires, wallpaper swatches preview real
gradients and apply live). `next build`/`tsc`/`eslint`/`vitest` all clean,
redaction grep clean.

- [x] 2. Sketchpad — desktop icon, 9 tools incl. rainbow brush/flood fill/6
      stamps (canvas-drawn, not separate SVG files), 3 sizes, 16-swatch
      palette + native color input, undo (12-snapshot cap), inline-confirm
      Clear, network-free Save. `next/dynamic(ssr:false)` in
      windowRegistry.ts — first use of that pattern, games will match it.
      Added to Start Menu. Smoke-tested live (pencil, rainbow hue-cycle,
      undo all verified in-browser).
- [x] Bug fix (found while testing): hydration mismatch from the wallpaper
      pre-paint script — `suppressHydrationWarning` on `<html>`.
- [x] UX fix (user-requested mid-pass): desktop icons now require a
      double-click/double-tap to open. Single click/tap only selects (a
      translucent glassmorphic highlight, lifted to `Desktop.tsx` as
      `selectedId` state), never opens — fixes drags that used to
      occasionally read as a stray click-to-open or text selection.
      Keyboard Enter/Space still opens on the first press (`e.detail === 0`
      distinguishes it from a pointer click). This changed the
      `DesktopIcon`/`Desktop` contract — keep it in mind if Games'
      folder-window icons or anything else reuses `DesktopIcon`.

- [x] 3a. Shared game engine — `components/apps/games/useGameLoop.ts` (fixed
      60Hz accumulator, decoupled from render) + `GameShell.tsx`
      (`useWindowActive` pause-on-blur/minimize/tab-hide, Start gate, P/Pause
      button, scoped keyboard div). `lib/soundStore.ts` + `lib/beep.ts`
      (WebAudio square-wave, muted by default, taskbar toggle added) +
      `lib/scoresStore.ts` (`portfolio:scores:v1`).
- [x] 3b. Games folder window (desktop icon, original controller SVG) —
      `GAME_IDS` in `lib/windowMeta.ts` is the single list every game
      registers into; GamesFolder/Start-Menu-Games-submenu/HighScores all
      read it, so nothing needs updating in 3 places per game.
- [x] 3d. High Scores window — reads `scoresStore`, formats via
      `lib/gameCatalog.ts` (kept separate from code-split game components
      so formatting never triggers a game chunk load), Clear behind
      inline confirm.
- [x] Bug fix (found while smoke-testing): desktop icons could collide —
      `iconPositionsStore.hydrate()` now resolves collisions the same way
      `moveIcon` does. Real bug, will keep mattering as more icons are added.

All of the above smoke-tested live (Games folder opens, High Scores opens
as its child exactly like "Open full case", icon collision fix verified
by reloading with stale localStorage positions).

## In progress / next up

- [ ] 3c. Match, Snake, Sweeper, Merge, Paddle — build in this order, each
      commit adds its id to `GAME_IDS` + a `GAME_CATALOG` entry
- [ ] 4. Final pass (redaction sweep, bundle table, deploy, live Lighthouse,
      regression check)

## Placeholders shipped (needs real content from the user)

- `content/now.ts` — the "what I'm working on right now" note, dated 2026
- `content/systemProperties.ts` — Processor/Memory/Installed lines (real
  skills/tools list, personal stack only, no Lumeo backend/infra names)
- `content/recycleBin.ts` — shelved side-project list, one self-deprecating
  line each (currently a single placeholder entry)

## Open questions for the user

(consolidated at the end, per the operating mode)
