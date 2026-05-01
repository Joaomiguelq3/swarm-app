# Phase 5: Main Workspace UI and Runtime Switching - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase builds the main operational cockpit for a selected saved workspace. It connects the Home workspace cards to `workspace.html`, renders the main workspace layout, shows workspace tabs, terminal pane surfaces, mission bar, feed, map/files area, and node panel, and implements runtime/model switching against the persisted workspace config.

This phase should not implement real swarm launch, real agent process spawning, mission decomposition, file watcher feed streaming, launch overlay, TTS lifecycle announcements, or complete xterm/node-pty agent attachment. Those belong to Phase 6 and Phase 7. Phase 5 may create UI and lifecycle hooks that later phases will connect to real processes.

</domain>

<decisions>
## Implementation Decisions

### Workspace Opening and Route Model
- **D-01:** Clicking a saved workspace card on Home opens `renderer/workspace.html` for that workspace in the same BrowserWindow.
- **D-02:** Use a simple route parameter such as `workspace.html?id=<workspaceId>` so the workspace screen can load the selected record without introducing a router framework.
- **D-03:** `workspace.html` reads the workspace id, loads the saved workspace list through `window.swarm.workspaces.list()`, finds the matching workspace, and calls `window.swarm.workspaces.touch(id)` after successful load.
- **D-04:** If the id is missing or invalid, show an inline terminal-style error state with a clear action back to Home. Do not crash or expose raw stack traces.
- **D-05:** Keep navigation browser-only from the renderer side. Do not expose filesystem or raw Electron APIs to the renderer for this flow.

### Main Cockpit Layout
- **D-06:** The workspace screen should be a full-viewport operations cockpit, not a marketing page and not a card-heavy dashboard.
- **D-07:** Layout should include a top workspace tab strip, central multi-pane terminal grid, right-side node panel, lower mission bar/feed area, and map/files area as described by the PRD.
- **D-08:** Use compact, dense, stable UI surfaces consistent with the Phase 4 terminal visual system.
- **D-09:** Avoid nested cards. Use panels, borders, and full-width/viewport regions rather than floating decorative sections.
- **D-10:** The default pane count for the initial cockpit should be three panes, matching the PRD sketch, while keeping the structure easy to expand later.

### Terminal Pane Surfaces
- **D-11:** Phase 5 creates pane containers, headers, runtime indicators, status dots, and empty terminal surfaces only.
- **D-12:** Pane status should start as `IDLE` and support the visual states required by the PRD: `IDLE`, `THINKING`, `WRITING`, `DONE`, and `ERROR`.
- **D-13:** Each pane header shows the active workspace runtime indicator using the same Claude Code/Codex color language established on Home.
- **D-14:** Do not wire real Claude/Codex terminal processes in Phase 5. Real process output and interactive xterm attachment are Phase 6 concerns.
- **D-15:** The pane UI should be structured so a later xterm.js instance can mount into each pane without rewriting the page layout.

### Runtime and Model Controls
- **D-16:** The node panel must include a runtime dropdown with `claude` and `codex`.
- **D-17:** The node panel must include a model dropdown whose options change when the selected runtime changes.
- **D-18:** Claude Code model options are `opus-4`, `sonnet-4`, and `haiku`.
- **D-19:** Codex model options are `gpt-4o`, `gpt-4.1`, `o3`, and `o4-mini`.
- **D-20:** Runtime/model changes persist through the existing preload workspace API: `window.swarm.workspaces.updateRuntime(id, runtime, model)` and `window.swarm.workspaces.updateModel(id, model)`.
- **D-21:** Runtime switching must execute a stop-active-processes lifecycle hook before applying the new runtime.
- **D-22:** Because Phase 5 does not own real agent processes yet, the stop-active-processes hook should be an explicit no-op or local pane-state reset with a feed event. It must be named/structured so Phase 6 or Phase 7 can replace it with real child-process termination.
- **D-23:** Switching runtime should still rely on Phase 3 behavior to create the newly required rules file without deleting the previous rules file.

### Workspace Tabs and Main States
- **D-24:** The top tab strip should show saved workspaces and highlight the active workspace.
- **D-25:** Selecting a different workspace tab navigates to or loads that workspace in the same BrowserWindow, using the same route model.
- **D-26:** The `+` tab/action may return to Home or invoke the existing create-workspace flow if cleanly available; full multi-workspace session management is not required in Phase 5.
- **D-27:** Loading and error states should remain inline and terminal-like, consistent with Phase 4.

### Mission Bar, Feed, and Map/Files Area
- **D-28:** The mission input, agent count control, launch button area, feed, and map/files panel must be visible in the main screen.
- **D-29:** Launch behavior is a placeholder in Phase 5. The launch button may be disabled or emit a local "pending orchestration" feed message, but it must not pretend to run agents.
- **D-30:** The feed can show local UI/config events in Phase 5, such as workspace loaded, runtime changed, process-stop hook called, and model changed.
- **D-31:** Real file watcher events and agent lifecycle events are Phase 6 concerns.

### the agent's Discretion
- The planner may choose exact class names, DOM structure, copy, and responsive breakpoints as long as the UI remains compact, readable, and consistent with the established terminal theme.
- The planner may decide whether workspace tabs are rendered from all saved workspaces or a compact subset if the layout needs overflow handling.
- The planner may choose whether the Phase 5 smoke test is DOM/static or Electron-assisted, as long as it verifies the key UI and runtime-switch contracts.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Planning
- `.planning/PROJECT.md` - Product context, stack constraints, runtime behavior, process lifecycle expectations, and main workspace description.
- `.planning/REQUIREMENTS.md` - Phase 5 requirement IDs: WRK-05, RUN-04, RUN-05, RUN-08, TRM-01, TRM-03, UI-03.
- `.planning/ROADMAP.md` - Phase 5 goal and success criteria.
- `.planning/STATE.md` - Current project state after Phase 4 completion.
- `.planning/phases/03-workspace-persistence-and-rules-generation/03-CONTEXT.md` - Workspace persistence and runtime rules-file decisions.
- `.planning/phases/03-workspace-persistence-and-rules-generation/03-VERIFICATION.md` - Verified workspace API and persistence behavior.
- `.planning/phases/04-home-ui-and-visual-system/04-CONTEXT.md` - Home UI, visual system, badges, and renderer boundary decisions.
- `.planning/phases/04-home-ui-and-visual-system/04-VERIFICATION.md` - Verified Home UI behavior and visual contract.

### Current Code
- `renderer/home.html` - Existing Home route and workspace card screen that should navigate into the cockpit.
- `renderer/workspace.html` - Current placeholder workspace route to replace.
- `renderer/style.css` - Existing terminal theme, runtime badge styles, responsive layout base, and visual system.
- `renderer/app.js` - Current renderer entry point, Home rendering, modal flow, and preload usage pattern.
- `preload.js` - Safe renderer API, including workspace list/create/update/touch methods.
- `src/workspaces.js` - Workspace persistence, runtime/model update behavior, and rules-file creation.
- `src/runtimes.js` - Runtime labels, badge metadata, commands, args, rules files, skills dirs, and model lists.
- `main.js` - Electron window lifecycle and secure IPC registration pattern.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `window.swarm.workspaces.list/create/updateRuntime/updateModel/touch` already provides the persistence boundary the workspace screen needs.
- `src/runtimes.js` already defines the canonical runtime ids, labels, badge colors, and model lists.
- `renderer/style.css` already defines the PRD dark terminal palette and runtime badge classes.
- `renderer/app.js` already has bridge-status handling, workspace loading, card rendering, and create-flow patterns that can be extended or routed by page.
- `src/workspaces.js` already preserves existing `CLAUDE.md`, `AGENTS.md`, and `brain.json` while creating missing runtime files.

### Established Patterns
- Renderer code is plain browser JavaScript with no Node APIs.
- Electron keeps `contextIsolation: true` and `nodeIntegration: false`.
- Business logic belongs in `src/`; renderer owns DOM state and visual behavior only.
- The app favors compact operational UI over marketing-style presentation.
- Runtime-specific behavior should flow from `src/runtimes.js` or a renderer-safe mirrored map, not scattered hard-coded branches.

### Integration Points
- Home card click should become the entry point into `workspace.html?id=...`.
- `workspace.html` and `renderer/app.js` need a workspace route initialization path alongside the Home route.
- Runtime/model dropdowns persist through the existing preload API.
- Pane and feed state should be local UI state in Phase 5, ready for Phase 6 orchestration events.
- Later process lifecycle code will replace the Phase 5 stop-active-processes hook.

</code_context>

<specifics>
## Specific Ideas

- Use three initial panes to match the PRD sketch.
- Keep the node panel visibly authoritative for runtime and model selection.
- Show a clear badge for the active runtime in the node panel and each pane header.
- Feed messages in Phase 5 should be honest UI/config events, not simulated agent work.
- The mission bar should be present now so the final app shape is visible, even if launch is not active until Phase 6.

</specifics>

<deferred>
## Deferred Ideas

- Real xterm.js terminal attachment and runtime process output belong to Phase 6.
- Agent spawning, mission decomposition, scout injection, and live pane lifecycle events belong to Phase 6.
- Real file watcher feed events belong to Phase 6.
- Launch overlay animation and launch TTS narration belong to Phase 6.
- Graceful termination of real child processes on app close is hardened in Phase 7, though Phase 5 must create the runtime-switch hook.
- Mixed runtime execution in one swarm remains deferred to future scope unless a later phase explicitly brings it back.

</deferred>

---

*Phase: 5-Main Workspace UI and Runtime Switching*
*Context gathered: 2026-05-01*
