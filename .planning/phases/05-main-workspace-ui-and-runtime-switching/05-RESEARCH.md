# Phase 5: Main Workspace UI and Runtime Switching - Research

**Date:** 2026-05-01
**Status:** Complete

## Research Complete

### Phase Goal

Phase 5 builds the first usable main workspace cockpit. The work is mostly renderer/UI integration over already verified persistence APIs:

- Home card navigation into `workspace.html?id=<workspaceId>`.
- Workspace route loading and invalid-id handling.
- Main cockpit layout: tabs, panes, mission bar, feed, map/files, node panel.
- Runtime/model dropdown behavior backed by existing workspace persistence.
- Stop-before-runtime-switch lifecycle hook as a Phase 5 UI contract, not real process management.

### Current Implementation Findings

#### Existing Renderer Shape

- `renderer/app.js` currently initializes Home unconditionally on `DOMContentLoaded`.
- Home already has bridge status, typing logo, Matrix canvas, workspace loading, card rendering, and create-workspace modal behavior.
- `renderer/workspace.html` is still a placeholder and loads only `style.css`; it does not load `app.js`.
- The existing renderer code uses DOM APIs and `textContent`, not unsafe HTML injection. Keep that pattern.
- The renderer already has a `RUNTIME_VIEW` map for labels and badge classes, but it does not include model lists yet.

#### Existing Workspace APIs

`preload.js` exposes the exact API Phase 5 needs:

- `window.swarm.workspaces.list()`
- `window.swarm.workspaces.updateRuntime(id, runtime, model)`
- `window.swarm.workspaces.updateModel(id, model)`
- `window.swarm.workspaces.touch(id)`

`src/workspaces.js` already validates runtime/model through `src/runtimes.js`, updates `lastAccess`, and bootstraps missing runtime rules files on runtime switch. Phase 5 should rely on this instead of duplicating rules-file behavior in the renderer.

#### Runtime and Model Source of Truth

`src/runtimes.js` defines:

- `claude`: label `CLAUDE CODE`, models `opus-4`, `sonnet-4`, `haiku`, badge `badge-claude`.
- `codex`: label `CODEX`, models `gpt-4o`, `gpt-4.1`, `o3`, `o4-mini`, badge `badge-codex`.

The renderer cannot import this CommonJS module directly without violating the Node-free renderer boundary. For Phase 5, a small renderer-safe mirror is acceptable. A later phase can expose runtime metadata through preload if needed.

#### CSS and Layout Base

`renderer/style.css` already has:

- Terminal palette variables.
- Runtime badge styles.
- Button, modal, form, loading, empty, error, and card styles.
- A placeholder `.shell` and `.status-panel` used by the current workspace placeholder.

Phase 5 should extend the same file with workspace-specific classes rather than introducing a new CSS file or framework.

#### Verification Pattern

Phase 4 uses static smoke tests:

- `scripts/smoke-home-ui.js` reads HTML/CSS/JS and asserts required hooks.
- `scripts/smoke-phase4.js` runs `smoke:home-ui` and `check`.
- `package.json` exposes `smoke:*` scripts.

Phase 5 should follow the same pattern with `scripts/smoke-workspace-ui.js` and `scripts/smoke-phase5.js`, then add them to `package.json`.

### Planning Implications

- Split `renderer/app.js` by route using `body[data-route]` or page-specific DOM presence so Home still works and Workspace gets its own initializer.
- Add `data-route="workspace"` and load `app.js` from `workspace.html`.
- Make Home cards interactive and keyboard-accessible; clicking should navigate using `window.location.href = './workspace.html?id=...'`.
- Keep all user/workspace data rendering through text APIs.
- Implement pane/feed state locally in the renderer.
- Implement `stopActiveProcesses()` as a named async function that resets pane state and logs a feed event before calling `updateRuntime`.
- Runtime switch persistence must update local workspace state from the API response.
- The mission launch button should not claim to run agents; disabled or placeholder event is acceptable.

### Risks and Mitigations

- **Risk:** Renderer route changes break Home initialization.
  **Mitigation:** Gate initialization by `document.body.dataset.route` and keep Home functions intact.

- **Risk:** Runtime dropdown model choices drift from `src/runtimes.js`.
  **Mitigation:** Use the same labels/models in a clearly named renderer runtime map and smoke-test the required model strings.

- **Risk:** Phase 5 accidentally simulates real agent work.
  **Mitigation:** Feed messages should only describe UI/config events. Keep launch disabled or explicitly marked pending.

- **Risk:** Stop-before-switch requirement is under-specified without real processes.
  **Mitigation:** Implement a real hook function and call order now; later phases replace internals with child-process termination.

### Recommended Plan Structure

- **05-01:** Workspace route and cockpit layout shell.
- **05-02:** Runtime/model controls, pane state, feed events, and lifecycle hook.
- **05-03:** Workspace UI smoke and aggregate Phase 5 verification.

---

*Research complete: 2026-05-01*
