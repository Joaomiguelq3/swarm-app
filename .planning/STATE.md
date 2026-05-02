# State: SWARM - Multi-Agent Orchestrator

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-05-01)

**Core value:** One developer can launch and supervise multiple independent AI coding tasks in parallel, with clear runtime choice, live terminal visibility, file-change awareness, and graceful process control.
**Current focus:** Phase 7 - Shutdown, Hardening, and Demo Readiness

## Current Phase

- **Phase:** 7
- **Name:** Shutdown, Hardening, and Demo Readiness
- **Status:** ready_to_plan
- **Next command:** `$gsd-plan-phase 7`

## Completed

- Project initialized from PRD.
- Requirements defined and mapped.
- Roadmap created.
- Phase 1 context gathered.
- Phase 1 planned.
- Phase 1 executed and verified.
- Phase 2 context gathered.
- Phase 2 planned.
- Phase 2 executed and verified.
- Phase 3 context gathered.
- Research summary created.
- Phase 3 planned.
- Phase 3 executed and verified.
- Phase 4 context gathered.
- Phase 4 planned.
- Phase 4 executed and verified.
- Phase 5 context gathered.
- Phase 5 planned.
- Phase 5 executed and verified.
- Phase 6 context gathered.
- Phase 6 planned.
- Phase 6 executed and verified.
- Phase 7 context gathered.

## Open Decisions

- Phase 1 will include dependency setup and a working `npm start`.
- Phase 1 will use raw Electron scripts, not Forge or builder.
- Phase 1 will open `renderer/home.html` and create `renderer/workspace.html` as a placeholder.
- Phase 2 will install/prove `node-pty` with a PowerShell smoke test.
- Phase 2 will create runtime config only, not real Claude/Codex agent spawning.
- Phase 2 will keep scout, sentinel, and TTS independently testable modules.
- Phase 2 PTY and TTS checks pass outside sandbox; PTY requires ConPTY access.
- Phase 3 persists workspaces via Electron userData path with `%APPDATA%\swarm` fallback.
- Phase 3 preserves existing `brain.json`, `CLAUDE.md`, and `AGENTS.md`.
- Phase 3 exposes minimal workspace IPC without building the full Home UI.
- Whether mixed runtime execution in one swarm belongs in v1 or v2; currently deferred to v2.
- Phase 5 implements stop-before-runtime-switch as a named UI lifecycle hook/local pane reset; Phase 6 connects it to real orchestration stop.
- Phase 6 will use deterministic local mission decomposition first; external AI decomposition is deferred.
- Phase 6 automated verification uses a fake/test runtime and does not require real Claude Code or Codex binaries.
- Phase 7 will rehearse real Claude Code and Codex demo runs and harden close/stop behavior.

## Last Session

- **Stopped at:** Phase 7 context gathered
- **Resume file:** `.planning/phases/07-shutdown-hardening-and-demo-readiness/07-CONTEXT.md`

## Quick Tasks Completed

| Date | Task | Status |
|------|------|--------|

## Notes

- Codex invokes GSD commands with `$gsd-*`, not `/gsd-*`.
- Claude Code invokes GSD commands with `/gsd-*`.
