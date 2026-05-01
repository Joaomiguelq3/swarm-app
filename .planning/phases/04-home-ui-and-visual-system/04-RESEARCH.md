# Phase 4: Home UI and Visual System - Research

**Researched:** 2026-05-01
**Status:** Complete

## Research Question

What needs to be known to plan the Home workspace selector, runtime badges, Matrix background, typing logo, and reusable dark terminal visual system well?

## Current System Fit

- The app starts at `renderer/home.html`.
- `renderer/app.js` is the current browser-only entry point and already uses the safe preload bridge.
- `renderer/style.css` already has the core terminal palette from the PRD.
- `preload.js` exposes `window.swarm.workspaces.*`, so the Home UI can list and create workspaces without renderer Node access.
- Phase 4 can stay entirely in HTML/CSS/JS and should not introduce React, TypeScript, bundlers, or a UI framework.

## Implementation Findings

### Home UI Architecture

Use a single-page renderer structure:

- `home.html` owns static landmarks, canvas, workspace container, empty/loading/error regions, and modal shell.
- `app.js` owns state, workspace loading, card rendering, typing animation, Matrix canvas loop, and modal interactions.
- `style.css` owns all reusable visual system classes: layout, buttons, badges, cards, modal, form controls, states, and responsive rules.

This keeps Phase 4 focused and avoids adding a build step.

### Workspace Data Integration

The Home UI should call:

- `window.swarm.workspaces.list()` on startup.
- `window.swarm.workspaces.create({ path, runtime, model })` from the new workspace form.

The Phase 3 create API already defaults the model when omitted, so the UI can avoid a heavy model selector in Phase 4. If the form shows a model field, it should be optional and runtime-aware. The simpler plan is path + runtime only.

### Runtime Badges

Runtime badges can be resolved from workspace `runtime` values:

- `claude` -> `CLAUDE CODE`, purple `badge-claude`
- `codex` -> `CODEX`, green `badge-codex`

Do not import `src/runtimes.js` into renderer code because renderer has no Node access. The renderer can define a small display mapping that mirrors the public runtime labels/colors from the PRD.

### Matrix Canvas

Use a `<canvas>` positioned behind the Home content:

- fixed or absolute full-viewport
- pointer-events disabled
- low opacity close to `0.04`
- resize-aware
- requestAnimationFrame loop with modest frame pacing to avoid waste

The canvas should be visibly present but not make text harder to read.

### Typing Logo

The typing logo should be compact:

- render `SWARM`
- add a cursor/blink or incremental text reveal
- avoid hero-scale layout that pushes workspace cards below the fold

### Verification Strategy

Since this phase is mostly renderer behavior without a test framework, use a lightweight smoke script that statically verifies expected DOM hooks and JS integration points. It should check:

- `home.html` contains Matrix canvas, workspace grid, empty/loading/error regions, and modal/form hooks.
- `style.css` contains `badge-claude`, `badge-codex`, core CSS variables, responsive rules, and Matrix/card styles.
- `app.js` references `window.swarm.workspaces.list`, `window.swarm.workspaces.create`, typing logo behavior, and Matrix canvas setup.

Manual verification via `npm.cmd start` remains valuable, but static smoke keeps Phase 4 runnable in non-GUI environments.

## Risks and Constraints

- The renderer must not use `require`, `fs`, `path`, `ipcRenderer`, or other Node APIs.
- Layout must remain compact and operational, not a landing page.
- Text should not overlap or overflow on desktop/mobile.
- Cards should have stable dimensions and no nested card patterns.
- Native folder dialog can be deferred; the UI can use a path input fallback if it calls the same workspace API.

## Plan Shape Recommendation

Use three sequential plans:

1. Home shell, visual system, Matrix canvas, and typing logo.
2. Workspace card rendering and new workspace flow.
3. Static smoke verification, responsive polish, and phase summary.

Sequential waves are appropriate because the same renderer files are touched across the phase.

## RESEARCH COMPLETE
