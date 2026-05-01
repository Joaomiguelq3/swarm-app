# Phase 5: Main Workspace UI and Runtime Switching - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-05-01
**Phase:** 5-Main Workspace UI and Runtime Switching
**Areas discussed:** Workspace opening, cockpit layout, terminal pane scope, runtime/model switching, tabs, mission/feed placeholders

---

## Workspace Opening

| Option | Description | Selected |
|--------|-------------|----------|
| Same-window route | Home card opens `workspace.html?id=<workspaceId>` in the same BrowserWindow. | yes |
| New window per workspace | Each workspace opens a separate BrowserWindow. | |
| Main-process navigation IPC | Renderer asks main process to navigate with a dedicated IPC method. | |

**User's choice:** pode usar as recomendações
**Notes:** Recommendation selected. Use simple same-window route and existing preload workspace APIs.

---

## Cockpit Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Full operations cockpit | Dense full-viewport layout with tabs, panes, mission bar, feed, map/files, and node panel. | yes |
| Card dashboard | Separate dashboard cards for each area. | |
| Minimal placeholder screen | Keep only a simple workspace details page. | |

**User's choice:** pode usar as recomendações
**Notes:** Recommendation selected. Follow PRD cockpit shape and Phase 4 terminal visual language.

---

## Terminal Pane Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Visual pane surfaces now | Build pane containers, statuses, runtime indicators, and mount points; no real process binding yet. | yes |
| Real xterm/node-pty now | Attach interactive runtime terminals during Phase 5. | |
| Static mockup only | Draw panes without usable state structure. | |

**User's choice:** pode usar as recomendações
**Notes:** Recommendation selected. Phase 5 prepares the UI contract; Phase 6 wires real orchestration.

---

## Runtime and Model Switching

| Option | Description | Selected |
|--------|-------------|----------|
| Persisted dropdowns with stop hook | Runtime/model dropdowns persist changes and run a stop-active-processes hook before runtime changes. | yes |
| Persist only | Save runtime/model without lifecycle hook. | |
| Delay controls | Keep controls disabled until real agents exist. | |

**User's choice:** pode usar as recomendações
**Notes:** Recommendation selected. Stop hook is explicit no-op/local reset in Phase 5 and becomes real process termination later.

---

## Tabs, Mission Bar, Feed, and Map/Files

| Option | Description | Selected |
|--------|-------------|----------|
| Visible shell with honest placeholders | Show all main cockpit areas, but only local UI/config events work in Phase 5. | yes |
| Hide launch/feed until Phase 6 | Build only panes and node panel. | |
| Simulate agent events | Show fake agent activity for presentation feel. | |

**User's choice:** pode usar as recomendações
**Notes:** Recommendation selected. Feed must not pretend agents are running before orchestration exists.

---

## the agent's Discretion

- Exact class names, responsive breakpoints, copy, and smoke test structure.
- Whether workspace tabs show all saved workspaces or use overflow handling.
- Whether the `+` tab returns to Home or opens an already available create-workspace flow.

## Deferred Ideas

- Real agent terminal attachment, mission decomposition, process spawning, file watcher feed, launch overlay, TTS launch lifecycle, and full child-process shutdown.
