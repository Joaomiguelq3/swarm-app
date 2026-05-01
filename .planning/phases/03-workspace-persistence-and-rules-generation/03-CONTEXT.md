# Phase 3: Workspace Persistence and Rules Generation - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase builds the workspace persistence and project bootstrap layer: saved workspace records, runtime/model storage, `brain.json` creation, runtime-specific rules file generation, and minimal IPC entry points. It should not build the full Home workspace selector UI, runtime switching UI, terminal panes, or real agent spawning.

</domain>

<decisions>
## Implementation Decisions

### Workspace Storage Location
- **D-01:** Use Electron `app.getPath("userData")` as the primary app data base path for persisted workspace data.
- **D-02:** Keep a fallback path compatible with `%APPDATA%\swarm\workspaces.json` when Electron `app` is unavailable, so core modules can be smoke-tested from Node.
- **D-03:** Persist workspaces in a JSON file named `workspaces.json` under the SWARM app data directory.

### Workspace Record Format
- **D-04:** Store workspace records as `{ id, name, path, runtime, model, lastAccess }`.
- **D-05:** Validate `runtime` against `src/runtimes.js`.
- **D-06:** Use conservative defaults for `model` based on the selected runtime when none is supplied.
- **D-07:** Do not accept arbitrary freeform fields as first-class schema in Phase 3; unknown data can be ignored or preserved only if the implementation can do so safely.

### Core Module Shape
- **D-08:** Implement a core module such as `src/workspaces.js` that can create, list, update, and persist workspaces without depending on renderer UI.
- **D-09:** The core module should accept explicit `path`, `runtime`, and `model` arguments so smoke tests can run without opening native dialogs.
- **D-10:** UI folder selection/dialog integration can be represented through IPC, but full UI flow belongs to later Home/Main UI phases.

### brain.json Creation
- **D-11:** Create `brain.json` in the selected workspace root if it does not already exist.
- **D-12:** Never overwrite an existing `brain.json` during workspace creation.
- **D-13:** The initial `brain.json` should be valid JSON with minimal project/session placeholders.

### Runtime Rules Files
- **D-14:** When creating a workspace, create the rules file required by its runtime if missing: `CLAUDE.md` for Claude Code and `AGENTS.md` for Codex.
- **D-15:** If the user later switches runtime, create the newly required rules file without deleting the previous one.
- **D-16:** Do not overwrite existing `CLAUDE.md` or `AGENTS.md`; preserve user edits.
- **D-17:** Use the existing project rule content pattern as the template source unless a more specific template is needed.

### IPC Boundary
- **D-18:** Phase 3 should expose minimal IPC for workspace operations: list, create, update runtime/model, and touch/open recent workspace metadata.
- **D-19:** IPC handlers belong in `main.js` or a small main-process registration helper; renderer receives only safe methods through `preload.js`.
- **D-20:** Do not build the complete Home card grid in this phase. Phase 4 owns the Home UI.

### the agent's Discretion
- The planner may choose whether to use `crypto.randomUUID()` or another standard UUID source available in Node/Electron.
- The planner may choose exact helper names and smoke script names, as long as verification is runnable through `npm.cmd run ...`.
- The planner may split persistence and IPC into separate plans to avoid same-file conflicts.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Planning
- `.planning/PROJECT.md` - Product context, persistence constraints, runtime behavior, and architecture boundaries.
- `.planning/REQUIREMENTS.md` - Phase 3 requirement IDs: WRK-01, WRK-02, WRK-03, RUN-03, PRS-01.
- `.planning/ROADMAP.md` - Phase 3 goal and success criteria.
- `.planning/STATE.md` - Current state after Phase 2 completion.
- `.planning/phases/02-runtime-scout-sentinel-tts-and-terminal-core/02-CONTEXT.md` - Runtime config decisions and module boundaries.
- `.planning/phases/02-runtime-scout-sentinel-tts-and-terminal-core/02-VERIFICATION.md` - Verified runtime/scout/sentinel/TTS/PTX assumptions.

### Current Code
- `src/runtimes.js` - Runtime definitions and model lists.
- `main.js` - Current Electron lifecycle and IPC pattern.
- `preload.js` - Current safe renderer bridge.
- `AGENTS.md` - Codex-facing project rules.
- `CLAUDE.md` - Claude Code-facing project rules.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/runtimes.js` already defines runtime IDs, commands, rules files, skills dirs, badge metadata, and model lists.
- `main.js` already registers one `ipcMain.handle`, which can guide the minimal IPC style.
- `preload.js` already exposes a narrow `window.swarm` bridge and should be extended without exposing raw `ipcRenderer`.
- `brain.json` exists at the SWARM app root as a project-level placeholder; Phase 3 must create similar files in user-selected workspace roots.

### Established Patterns
- CommonJS modules are used across current app code.
- Business logic belongs in `src/`.
- Renderer must not access Node APIs directly.
- Existing user-authored rules files must be preserved.

### Integration Points
- Phase 4 Home UI will call the workspace IPC methods to render saved workspace cards.
- Phase 5 runtime switching will call the workspace update methods to change runtime/model.
- Later swarm orchestration will read workspace `runtime`, `model`, and `path` from the persisted record.

</code_context>

<specifics>
## Specific Ideas

- Prefer smoke tests that create temporary workspace directories and app data directories without touching real user workspaces.
- Use atomic-ish JSON writes where practical: write complete JSON with indentation, and avoid corrupting existing workspace data if parsing fails.
- Keep workspace persistence deterministic and boring; the UI can become richer later.

</specifics>

<deferred>
## Deferred Ideas

- Full Home workspace card grid is Phase 4.
- Runtime switch UI and process restart behavior are Phase 5.
- Real agent launch and terminal panes are later phases.
- Mixed runtime execution remains deferred to v2/future scope.

</deferred>

---

*Phase: 3-Workspace Persistence and Rules Generation*
*Context gathered: 2026-05-01*
