# Phase 7: Shutdown, Hardening, and Demo Readiness - Research

## RESEARCH COMPLETE

## Planning Findings

### Lifecycle Cleanup

- Current cleanup starts at `main.js` through `swarmIpc.stop('app-close')`, but only from `window-all-closed`.
- `src/swarm-ipc.js` owns the active orchestration registry and is the correct place to enforce idempotent stop behavior across user-stop, runtime-switch, mission-complete, and app-close.
- `src/swarm.js` owns the child process map and should guarantee that repeated `stop()` calls are safe and bounded.

### Stop-All Interaction

- Renderer already has `stopActiveProcesses(reason)` and uses it before runtime switch.
- A visible `STOP SWARM` button near `LAUNCH SWARM` is the lowest-friction UI addition and matches Phase 7 context.
- Stop state should derive from active pane statuses and mission state rather than from a separate timer.

### Error Visibility

- Spawn failures already emit `agent:error` in `src/swarm.js`.
- Phase 7 should improve message safety and coverage, not introduce raw environment or stack dumps.
- Sentinel/TTS warnings already travel through `src/swarm-ipc.js`; smoke coverage should assert they do not fail missions.

### Demo Readiness

- Automated `npm.cmd run check` should remain independent from real `claude` and `codex`.
- Add an explicit demo preflight command that checks `claude --version` and `codex --version`.
- Demo evidence should live in Phase 7 verification docs and distinguish automated checks from manual real-runtime rehearsal.

## Validation Architecture

- Fake-runtime lifecycle smokes for stop idempotency, bounded cleanup, and IPC stop paths.
- Static renderer smoke for `STOP SWARM` DOM/JS/CSS hooks.
- Demo-preflight script for real CLI availability, intentionally not included in `check`.
- Aggregate `smoke:phase7` running all Phase 7 automated checks plus existing `check`.

## Boundaries

- Do not add mixed runtime launches.
- Do not make real Claude/Codex missions part of automated CI/check.
- Do not redesign the cockpit.
- Do not implement installer/package work.
