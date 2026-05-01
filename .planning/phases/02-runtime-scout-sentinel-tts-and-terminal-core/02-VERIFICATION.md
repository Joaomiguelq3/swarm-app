---
status: passed
phase: "02-runtime-scout-sentinel-tts-and-terminal-core"
verified: "2026-05-01"
source:
  - "02-01-PLAN.md"
  - "02-02-PLAN.md"
  - "02-03-PLAN.md"
  - "02-04-PLAN.md"
---

# Phase 2 Verification

## Result

Passed.

## Goal

Implement and test the core local capabilities before building complex UI.

## Must-Haves

| Must-have | Status | Evidence |
|-----------|--------|----------|
| `src/runtimes.js` exports Claude Code and Codex runtime definitions | Passed | `npm.cmd run check:runtimes` |
| `src/tts.js` can speak "SWARM inicializado" on Windows | Passed | `npm.cmd run smoke:tts` passed outside sandbox |
| `src/scout.js` maps a folder while ignoring configured directories | Passed | `npm.cmd run smoke:scout` |
| `src/sentinel.js` emits create/change/delete events | Passed | `npm.cmd run smoke:sentinel` |
| A test PTY process can stream output into a terminal surface | Passed | `npm.cmd run smoke:pty` received `SWARM_PTY_OK` |
| Phase 2 avoids full UI panes and real agent spawning | Passed | No xterm.js UI and no Claude/Codex process spawn added |

## Automated Checks

```powershell
npm.cmd run smoke:phase2
```

Passed outside sandbox.

## Warnings

- `node-pty` ConPTY access fails inside the sandbox with `EPERM`, but passes outside the sandbox.
- `npm install` continues to report 1 high severity vulnerability in dependency audit output.

## Human Verification

No additional human verification required for Phase 2.
