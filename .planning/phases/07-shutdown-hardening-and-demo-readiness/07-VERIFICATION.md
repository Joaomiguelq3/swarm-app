---
status: human_needed
phase: 7-shutdown-hardening-and-demo-readiness
updated: 2026-05-01
---

# Phase 7 Verification

## Automated Checks

- `npm.cmd run smoke:shutdown-lifecycle` - passed
- `npm.cmd run smoke:stop-ui` - passed
- `node --check scripts/demo-preflight.js` - passed
- `npm.cmd run smoke:phase7` - passed

## Demo Preflight

- `npm.cmd run demo:preflight` - failed

Result:

- `CLAUDE CODE`: `claude not found on PATH`
- `CODEX`: `codex not found on PATH`

This does not invalidate automated hardening. It blocks real Claude Code and Codex demo rehearsal until the CLIs are installed/configured in the terminal environment.

## Coverage

- `SWM-07`: covered by idempotent core stop, IPC stop, `STOP SWARM` UI, runtime-switch stop path, and shutdown lifecycle smoke.
- `PRS-02`: covered by Electron close/quit cleanup hooks and shutdown lifecycle smoke.
- Phase 7 decisions `D-01` through `D-20`: covered by implementation, docs, or explicit manual-demo boundary.

## Human Verification Required

Follow `docs/demo-runbook.md` after `npm.cmd run demo:preflight` passes:

1. Run the Claude Code demo mission.
2. Run the Codex demo mission.
3. Record pass/fail, files changed, and any issues observed.

## Verdict

Automated hardening passed. Manual real-runtime demo rehearsal is pending local CLI availability.
