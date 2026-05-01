---
phase: "04"
plan: "03"
subsystem: "home ui verification"
tags:
  - smoke
  - verification
  - renderer
requirements-completed:
  - "WRK-04"
  - "UI-01"
  - "UI-02"
  - "UI-04"
  - "UI-05"
  - "UI-07"
key-files:
  created:
    - "scripts/smoke-home-ui.js"
    - "scripts/smoke-phase4.js"
  modified:
    - "package.json"
completed: "2026-05-01"
---

# Phase 04 Plan 03: Home UI Smoke and Verification Summary

Added static Home UI smoke coverage and verified the Electron app starts with the new Home screen.

## Completed

- Added `scripts/smoke-home-ui.js` to verify Matrix, typing logo, workspace grid/card, runtime badge, state, and preload integration hooks.
- Added `scripts/smoke-phase4.js` to run Home UI smoke plus the existing project check.
- Added `smoke:home-ui` and `smoke:phase4` package scripts.
- Extended `npm.cmd run check` to syntax-check the new smoke scripts.

## Verification

- `node --check scripts/smoke-home-ui.js` passed.
- `node --check scripts/smoke-phase4.js` passed.
- `npm.cmd run smoke:home-ui` passed.
- `npm.cmd run smoke:phase4` passed.
- `npm.cmd start` was launched in a hidden window for 6 seconds; Electron processes started and the main window title was `SWARM`.

## Requirement Coverage

- WRK-04: workspace card hooks and renderer logic cover name, path, runtime badge, model, and last access date.
- UI-01: typing logo hook and implementation are present.
- UI-02: low-opacity Matrix canvas hook and implementation are present.
- UI-04: `.badge-claude` uses the Claude purple token.
- UI-05: `.badge-codex` uses the Codex green token.
- UI-07: CSS keeps the dark terminal theme in plain CSS.

## Deferred Scope

- Main workspace cockpit remains Phase 5.
- Terminal panes and runtime switch lifecycle remain later phases.
- Real agent spawning and launch overlay remain Phase 6.

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED
