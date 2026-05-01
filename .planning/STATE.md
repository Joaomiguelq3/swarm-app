# State: SWARM - Multi-Agent Orchestrator

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-05-01)

**Core value:** One developer can launch and supervise multiple independent AI coding tasks in parallel, with clear runtime choice, live terminal visibility, file-change awareness, and graceful process control.
**Current focus:** Phase 5 - Main Workspace UI and Runtime Switching

## Current Phase

- **Phase:** 5
- **Name:** Main Workspace UI and Runtime Switching
- **Status:** context_gathered
- **Next command:** `$gsd-plan-phase 5`

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

## Last Session

- **Stopped at:** Phase 5 context gathered
- **Resume file:** `.planning/phases/05-main-workspace-ui-and-runtime-switching/05-CONTEXT.md`

## Quick Tasks Completed

| Date | Task | Status |
|------|------|--------|

## Notes

- Codex invokes GSD commands with `$gsd-*`, not `/gsd-*`.
- Claude Code invokes GSD commands with `/gsd-*`.
