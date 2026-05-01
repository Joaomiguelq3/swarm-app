# Phase 3: Workspace Persistence and Rules Generation - Research

**Researched:** 2026-05-01
**Status:** Complete

## Research Question

What needs to be known to plan workspace persistence, runtime-specific project bootstrap files, and minimal IPC safely for the SWARM Electron app?

## Current System Fit

- The app already uses CommonJS, raw Electron, and a narrow preload bridge.
- `src/runtimes.js` is the canonical runtime source and already defines each runtime's rules file, model list, command, args, and badge metadata.
- `main.js` already owns Electron lifecycle and one IPC handler.
- `preload.js` already exposes `window.swarm` without exposing raw Electron or Node APIs.
- Phase 4 owns the full Home UI, so Phase 3 should produce usable backend/preload APIs and smoke coverage, not polished cards.

## Implementation Findings

### Storage Location

Electron's `app.getPath("userData")` is the right primary storage base while the app is running. For Node-only smoke tests, the module should accept an explicit app data path and fall back to `%APPDATA%\swarm` when Electron is unavailable. This keeps the core persistence module testable without a browser window.

Recommended file shape:

```json
{
  "workspaces": []
}
```

The module should tolerate a missing file by creating this shape. A corrupt JSON file should fail loudly enough for smoke tests and IPC callers to report the error instead of silently losing user workspace records.

### Workspace Schema

Persist only the Phase 3 schema:

```json
{
  "id": "uuid",
  "name": "project-name",
  "path": "C:\\projects\\project-name",
  "runtime": "codex",
  "model": "gpt-4o",
  "lastAccess": "2026-05-01T10:00:00.000Z"
}
```

Runtime validation should call `getRuntime(runtime)`. Model defaults should be selected from `runtime.models[0]` if no model is provided. Model validation should reject values outside the selected runtime's model list unless later phases intentionally relax this.

### Rules and Brain File Generation

Workspace creation and runtime switching must call a shared bootstrap helper. That helper should:

- create `brain.json` only when missing
- create the selected runtime's `rulesFile` only when missing
- preserve existing `brain.json`, `CLAUDE.md`, and `AGENTS.md`
- return metadata about which files were created or preserved, so smoke tests and IPC can verify behavior

The local project's `AGENTS.md` and `CLAUDE.md` are suitable templates for generated workspace rules. Use their contents as source when available, with a small fallback string so tests do not break if a template file is missing.

### IPC Boundary

Phase 3 needs a minimal main-process registration helper instead of putting all persistence code into `main.js`. This keeps `main.js` aligned with the architecture rule that business logic belongs in `src/`.

Recommended IPC helper:

- `src/workspace-ipc.js`
- `registerWorkspaceIpc({ ipcMain, app })`

Recommended preload surface:

```js
window.swarm.workspaces.list()
window.swarm.workspaces.create(input)
window.swarm.workspaces.updateRuntime(id, runtime, model)
window.swarm.workspaces.updateModel(id, model)
window.swarm.workspaces.touch(id)
```

No raw `ipcRenderer`, `fs`, or arbitrary channel invocation should be exposed.

### Smoke Testing Strategy

Use temporary folders for both app data and workspace roots. Smoke tests should not write to a real user project or real `%APPDATA%`.

Minimum useful smoke coverage:

- create a Codex workspace and verify `workspaces.json`, `brain.json`, and `AGENTS.md`
- create or update a Claude workspace and verify `CLAUDE.md`
- verify existing `brain.json` and rules files are not overwritten
- verify runtime/model persistence and default model behavior
- verify preload API shape statically by syntax checking and, where possible, loading the IPC registration helper with fake dependencies

## Risks and Constraints

- Native folder dialog is not needed in Phase 3. The IPC can accept an explicit path; Phase 4 can wire the real dialog if desired.
- Electron's real `app.getPath("userData")` should not be required for Node smoke tests.
- Runtime switching in Phase 3 updates persisted config and creates missing rules files only. Killing active processes belongs to Phase 5.
- Full workspace cards, runtime badges on cards, Matrix rain, and Home UI polish belong to Phase 4.

## Plan Shape Recommendation

Use three plans:

1. Core workspace persistence and bootstrap generation.
2. IPC and preload bridge integration.
3. Aggregate Phase 3 verification and summary.

This keeps shared `package.json` edits in the first plan and avoids later plan conflicts.

## RESEARCH COMPLETE
