# Phase 1 Research: Project Skeleton and Electron Foundation

**Phase:** 01 - Project Skeleton and Electron Foundation
**Date:** 2026-05-01
**Status:** Complete

## Research Summary

Phase 1 is a foundation phase, not a feature phase. The implementation should optimize for a small, readable Electron app that proves the app can start safely and establishes the project boundaries later phases will build on.

## Technical Findings

### Electron Foundation

- Raw Electron is appropriate for Phase 1 because the project does not need packaging, installers, auto-update, or distribution tooling yet.
- `main.js` should create the `BrowserWindow`, set secure `webPreferences`, and register a small IPC smoke-test handler.
- `preload.js` should expose a narrow API through `contextBridge.exposeInMainWorld`.
- Renderer files should not import Node APIs or use `require`.

### Security Defaults

Phase 1 must set:

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: false` only if preload needs controlled Node access; otherwise keep the bridge minimal and avoid broad APIs.

The renderer should interact with the main process only through the preload API.

### File Structure

The PRD and context require:

```text
main.js
preload.js
brain.json
.env
.gitignore
renderer/
  home.html
  workspace.html
  style.css
  app.js
src/
```

Phase 1 should create this structure but avoid implementing Phase 2+ modules such as `src/swarm.js`, `src/scout.js`, `src/sentinel.js`, `src/tts.js`, or `src/runtimes.js`.

## Planning Guidance

- One plan is enough. Splitting scaffold work across plans would create artificial dependencies and same-file conflicts.
- The executor should install Electron through npm and commit `package-lock.json` if generated.
- The verification must include `npm start` or an equivalent smoke command that proves Electron can load `renderer/home.html`.
- If a GUI launch cannot be completed in the execution environment, the executor should still verify with static checks and report the limitation clearly in SUMMARY.md.

## Risks

- Network access may be needed for npm install during execution.
- Electron GUI launch may require permission depending on the shell/runtime environment.
- PowerShell execution policy can block `.ps1` shims, so npm commands on Windows should prefer `npm.cmd`.

## Research Complete

This research supports a single implementation plan for the Electron foundation.
