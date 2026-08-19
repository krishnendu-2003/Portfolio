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

- [x] 3c (1/5). Match — 4x4 memory grid, 8 procedurally-generated original
      glyph pairs (regular polygons via Math.cos/sin, plus a star and a
      plus — not hand-authored assets). Turn-based, uses GameShell but not
      useGameLoop. Smoke-tested: moves counter correct, mismatch/match
      logic correct, Reset correct.
- [x] 3c (2/5). Snake — canvas grid game, original dark-green chrome, arrow
      keys/swipe/on-screen D-pad, speed ramps with length via
      useGameLoop's accumulator. Smoke-tested: renders, steers, wall
      collision → game-over overlay, P pauses (shows "Paused", blocks
      input), Reset works, score submits.
- [x] Refactored GameShell's `running` flag from a render-prop to a
      `RunningContext` + `useGameRunning()` hook — Snake needs `running` at
      its own component top level to call `useGameLoop`, and the render-prop
      form would have nested that hook call inside a closure, outside the
      real top level. Match updated to match (its children prop is now
      plain `ReactNode`).
- [x] Discovered (and worked around, not fixed upstream): this repo's
      `react-hooks/refs` eslint rule flags `object.property` access
      whenever `object` is returned from a hook that also returns a ref,
      even for non-ref properties. Fix is always the same: destructure into
      local consts before using values in JSX/hooks. Snake does this;
      Sweeper/Merge/Paddle will need to as well if they follow the same
      "one hook returns refs+state, one descendant component consumes it"
      shape Snake uses.

## Out-of-plan addition (user-requested mid-pass, after this checkpoint)

- [x] **Tetris** — not in the original SCOPE; the user explicitly asked for
      it by name after this file's last checkpoint. This directly
      contradicts the master prompt's own IP-rules section ("NO
      falling-tetromino game... it is off the list entirely", citing
      *Tetris Holding, LLC v. Xio Interactive*). **I flagged this conflict
      to the user before writing any code; they explicitly chose to ship
      literal Tetris anyway, informed of the legal exposure.** Standard 7
      tetrominoes/4 rotations/10x20 board/next-piece preview/classic
      scoring, rendered in the shell's monochrome green rather than the
      colorful Guideline palette. See the commit message
      (`07dc941`) for full detail — worth reading if a future session or
      the user revisits whether to keep it.
- [x] **Game Boy-style shell** — also user-requested, applies to
      `GameShell.tsx` so every game gets it for free (putty shell, green
      LCD tint over each game's own canvas, scanlines, pill-shaped
      START/PAUSE/RESET buttons). Not a reproduction of any specific
      console's exact shell color/trade dress. Re-verified Match and Snake
      still work correctly under the new shell.
- [x] Bug found and fixed while building Tetris: `iconPositionsStore`
      collisions were already fixed earlier, unrelated — see the actual
      finding below, which is about **testing environment, not app code**:
      `document.hidden` reports `true` in this session's automated Chrome
      tab even while it's the focused tab. GameShell's pause-on-tab-hide
      logic is *correct* (per spec) and refuses to run while hidden — so
      a game can look "stuck on a blank/unrendered canvas" when
      smoke-tested via this tooling even though it works fine for a real
      user. Diagnosed by temporarily bypassing the check, confirming full
      gameplay (movement/rotation/hard-drop/locking) worked, then
      reverting. **If this recurs when testing Sweeper/Merge/Paddle,
      don't assume a game-logic bug — check `document.hidden` first.**

`GAME_IDS` is now `["match", "snake", "tetris"]` — Sweeper/Merge/Paddle
still come next, unaffected by this insert.

## Interim deploy (user-requested, out of the normal step 4 sequence)

- [x] Redeployed to production at the user's request: `vercel deploy --prod`
      from commit `685de81` (Match + Snake + Tetris + the Game Boy shell,
      no Sweeper/Merge/Paddle yet). Live at
      `https://krishnendu-portfolio-chi.vercel.app` — verified 200s on
      `/`, `/work/lumeo`, `/about`, `/resume`, and the homepage `<title>`.
      Deployment id `dpl_3EfwEirYec6Ag53NhSr9hBjUh8WQ`.
      **This is not the same as finishing item 4 below** — no live
      Lighthouse run, no bundle-size table, no redaction sweep were done
      as part of this deploy. Do those once Sweeper/Merge/Paddle land (or
      sooner, if asked), against whatever commit is live at the time.

## In progress / next up — pick up here after `/clear`

- [ ] 3c (3/5). Sweeper — grid minesweeping, original chrome/numeral
      styling, 3 difficulties, right-click to flag (desktop) + long-press
      to flag (touch)
- [ ] 3c (4/5). Merge — 4x4 sliding number-merge puzzle, original palette/
      typography (not a 2048 visual reproduction), arrow keys + swipe
- [ ] 3c (5/5). Paddle — brick-breaker, original brick palette/layout,
      mouse/touch drag + arrow keys
- [ ] 4. Final pass:
      - Redaction grep sweep across the whole repo (every new file this
        pass, not just content files)
      - `next build` route-level bundle table in this doc — homepage
        first-load JS must not grow >~15KB gzipped over the Phase 1
        baseline; prove Sketchpad/games aren't in the homepage chunk
        (they're all `next/dynamic(ssr:false)` already, so this should
        just be a matter of running the build and reading the table)
      - Deploy to Vercel (project already linked — `.vercel/project.json`,
        `krishnendu-portfolio`; live at
        `https://krishnendu-portfolio-chi.vercel.app`). Vercel CLI is not
        installed locally (`npm i -g vercel` or `npx vercel`) — check
        before assuming it's available.
      - Live Lighthouse on the deployed URL (not local): Performance ≥90,
        Accessibility 100, SEO 100, across homepage/a case page/`/about`/
        `/resume`. Phase 1's 93/97 performance numbers were from a local
        build — this is the first real number.
      - Open 3 windows + a running game together: zero console errors,
        zero hydration warnings (ignore `bis_skin_checked`/`bis_register` —
        that's a browser-extension artifact in the test environment, not
        the app; every hydration check this pass confirmed no
        `data-wallpaper`-style app-caused mismatch)
      - Regression check: icon drag still never opens a window (double-
        click/tap requirement from earlier this pass), arrow-key icon nav
        still works, all 8 wallpapers still pass label contrast, Start
        Menu still fully keyboard-operable (now with 2 submenus — Selected
        Work, Games — verify Left/Right/Escape between them), Escape still
        closes the focused window (including a game window)
      - End with the single consolidated question list below

## Next-session quick orientation

- Games so far live in `components/apps/games/`: `useGameLoop.ts`,
  `GameShell.tsx` (+ `useGameRunning`/`useWindowActive`), `Match.tsx`,
  `Snake.tsx`, `Tetris.tsx`. Copy Snake's/Tetris's split (a `useXGame()` hook holding refs/state,
  called from the outer non-descendant component; a `XBoard` descendant
  component that calls `useGameRunning()`/`useGameLoop()` and destructures
  the hook's return before using it in JSX) for Sweeper/Merge/Paddle if
  they need `useGameLoop` — Merge and Sweeper might not (turn-based like
  Match), Paddle definitely will (continuous ball physics).
- Every game registers in 4 places per the pattern already established:
  `lib/windowMeta.ts` (windowMeta entry + push the id into `GAME_IDS`),
  `lib/gameCatalog.ts` (title/higherIsBetter/formatScore), `lib/
  windowRegistry.ts` (`dynamic(() => import(...), {ssr:false})` +
  componentsById entry), and an original 32x32 icon in `public/icons/`.
  GamesFolder/Start-Menu-Games-submenu/HighScores all read `GAME_IDS`
  automatically — nothing else to touch.
- Dev server: there's usually already one running on :3000 from a prior
  turn (check with `ps aux | grep "next dev"` before starting a new one —
  starting a second one just fails with "Another next dev server is
  already running" and exits, harmlessly).

## Placeholders shipped (needs real content from the user)

- `content/now.ts` — the "what I'm working on right now" note, dated 2026
- `content/systemProperties.ts` — Processor/Memory/Installed lines (real
  skills/tools list, personal stack only, no Lumeo backend/infra names)
- `content/recycleBin.ts` — shelved side-project list, one self-deprecating
  line each (currently a single placeholder entry)

## Open questions for the user

Per the operating mode, these are collected here rather than blocking —
none of them stopped any work this pass, all shipped as clearly-marked
placeholders. Still open as of this checkpoint:

1. **Now (2026) copy** — a short, dated "what I'm working on right now"
   note. `content/now.ts` currently has `"(copy pending)"`.
2. **My Machine skills list** — Processor/Memory/Installed lines framing
   your personal stack as system specs. Personal stack only — no Lumeo
   backend/infra names. `content/systemProperties.ts` currently has
   `"(copy pending)"` placeholders.
3. **Recycle Bin project list** — shelved side projects, one honest
   self-deprecating line each. `content/recycleBin.ts` currently has a
   single `"(copy pending)"` entry; not invented.

Nothing else has come up yet — Sweeper/Merge/Paddle and the final pass
may add more (e.g. if a game needs a specific difficulty/setting choice).
