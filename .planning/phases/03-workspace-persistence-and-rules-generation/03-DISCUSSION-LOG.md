# Phase 3: Workspace Persistence and Rules Generation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-05-01
**Phase:** 3-Workspace Persistence and Rules Generation
**Areas discussed:** Workspace storage, Workspace schema, Core module, brain.json, Rules files, IPC

---

## Workspace Storage

| Option | Description | Selected |
|--------|-------------|----------|
| `app.getPath("userData")` with fallback | Use Electron app data path primarily, fallback to `%APPDATA%\swarm\workspaces.json` for tests. | yes |
| Hardcoded `%APPDATA%` | Always write to `%APPDATA%\swarm\workspaces.json`. | |

**User's choice:** Use recommendations.
**Notes:** Core modules must be smoke-testable without Electron app runtime.

---

## Workspace Schema

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed schema | `{ id, name, path, runtime, model, lastAccess }`, validate runtime against `src/runtimes.js`. | yes |
| Freeform schema | Accept arbitrary extra fields as part of the schema. | |

**User's choice:** Use recommendations.
**Notes:** Keep v1 persistence predictable.

---

## Core Module

| Option | Description | Selected |
|--------|-------------|----------|
| UI-independent core | `src/workspaces.js` accepts explicit path/runtime/model and can be tested from scripts. | yes |
| Dialog-coupled implementation | Implement workspace creation directly through Electron dialog IPC. | |

**User's choice:** Use recommendations.
**Notes:** Native dialog can be added later without changing persistence logic.

---

## brain.json

| Option | Description | Selected |
|--------|-------------|----------|
| Create if missing | Create valid `brain.json` only when absent. | yes |
| Always rewrite | Replace `brain.json` with latest template every time. | |

**User's choice:** Use recommendations.
**Notes:** Preserve existing workspace memory.

---

## Runtime Rules Files

| Option | Description | Selected |
|--------|-------------|----------|
| Preserve both | Create required runtime rules file if missing and never delete the other file. | yes |
| Only current runtime | Keep only the active runtime's rules file. | |

**User's choice:** Use recommendations.
**Notes:** Existing `CLAUDE.md` and `AGENTS.md` must not be overwritten.

---

## IPC

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal IPC now | Expose list/create/update/touch workspace methods safely through preload. | yes |
| Modules only | Defer all IPC until Home/Main UI phases. | |

**User's choice:** Use recommendations.
**Notes:** Full Home UI is still Phase 4.

---

## the agent's Discretion

- Exact helper names, smoke script names, and UUID source are left to planner/executor.
- Planner can split persistence and IPC into separate plans.

## Deferred Ideas

- Full workspace card grid.
- Native folder picker UX.
- Runtime switching process restart behavior.
- Real agent launch.
