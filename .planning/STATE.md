# State: SWARM - Multi-Agent Orchestrator

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-05-01)

**Core value:** One developer can launch and supervise multiple independent AI coding tasks in parallel, with clear runtime choice, live terminal visibility, file-change awareness, and graceful process control.
**Current focus:** Phase 3 - Workspace Persistence and Rules Generation

## Current Phase

- **Phase:** 3
- **Name:** Workspace Persistence and Rules Generation
- **Status:** ready_to_execute
- **Plans:** 3
- **Next command:** `$gsd-execute-phase 3`

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

## Open Decisions

- Phase 1 will include dependency setup and a working `npm start`.
- Phase 1 will use raw Electron scripts, not Forge or builder.
- Phase 1 will open `renderer/home.html` and create `renderer/workspace.html` as a placeholder.
- Phase 2 will install/prove `node-pty` with a PowerShell smoke test.
- Phase 2 will create runtime config only, not real Claude/Codex agent spawning.
- Phase 2 will keep scout, sentinel, and TTS independently testable modules.
- Phase 2 PTY and TTS checks pass outside sandbox; PTY requires ConPTY access.
- Phase 3 will persist workspaces via Electron userData path with `%APPDATA%\swarm` fallback.
- Phase 3 will preserve existing `brain.json`, `CLAUDE.md`, and `AGENTS.md`.
- Phase 3 will expose minimal workspace IPC without building the full Home UI.
- Whether mixed runtime execution in one swarm belongs in v1 or v2; currently deferred to v2.

## Last Session

- **Stopped at:** Phase 3 planned
- **Resume file:** `.planning/phases/03-workspace-persistence-and-rules-generation/03-01-PLAN.md`

## Quick Tasks Completed

| Date | Task | Status |
|------|------|--------|

## Notes

- Codex invokes GSD commands with `$gsd-*`, not `/gsd-*`.
- Claude Code invokes GSD commands with `/gsd-*`.
