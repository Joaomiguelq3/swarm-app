# Phase 7: Shutdown, Hardening, and Demo Readiness - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-05-01
**Phase:** 7-Shutdown, Hardening, and Demo Readiness
**Areas discussed:** Demo and hardening

---

## Demo and Hardening

| Option | Description | Selected |
|--------|-------------|----------|
| Demo and hardening | Define practical criteria for stop/close, visible errors, and real Claude/Codex rehearsals. | Yes |
| Demo only | Focus only on scripts/runbook, leaving cleanup details mostly to the planner. | |
| Technical only | Discuss cleanup, stop, logs, smoke tests, and demos in more technical detail. | |

**User's choice:** Interactive picker was unavailable in Default mode, so the recommended "Demo and hardening" path was selected.
**Notes:** This matches the Phase 7 roadmap boundary: process cleanup, stop-all behavior, error handling, and real demo rehearsal. The context keeps fake-runtime automation separate from manual real-runtime demos.

---

## the agent's Discretion

- Exact stop button styling and placement may be decided during planning if the action remains obvious and compact.
- Exact split between lifecycle helper modules and `main.js` may be decided by the planner.
- Exact demo runbook and smoke script filenames may be decided by the planner.

## Deferred Ideas

- Mixed runtime launch remains future/v2 scope.
- AI-powered task decomposition quality remains future scope.
- Installer/package creation remains outside Phase 7 unless separately added.
