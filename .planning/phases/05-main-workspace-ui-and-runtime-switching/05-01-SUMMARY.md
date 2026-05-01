---
phase: "05"
plan: "01"
subsystem: "workspace-ui"
tags:
  - "renderer"
  - "workspace-route"
  - "cockpit"
key-files:
  - "renderer/app.js"
  - "renderer/workspace.html"
  - "renderer/style.css"
metrics:
  tasks_completed: 4
  checks_run: 2
---

# Plan 05-01 Summary: Workspace Route and Cockpit Shell

## Commits

| Commit | Description |
|--------|-------------|
| pending | Workspace route/cockpit implementation will be committed with this summary. |

## Changes

- Added route-aware renderer initialization for Home and Workspace pages.
- Made Home workspace cards clickable and keyboard-accessible, navigating to `workspace.html?id=<workspaceId>`.
- Replaced the workspace placeholder with the main cockpit DOM: tabs, active workspace header, three pane region, mission bar, feed, map/files area, and node panel.
- Added workspace loading by id, touch-on-open, invalid-id inline error state, workspace tabs, and initial `IDLE` pane rendering.
- Added responsive terminal cockpit CSS while preserving Phase 4 Home styles.

## Verification

| Command | Result |
|---------|--------|
| `node --check renderer/app.js` | Passed |
| `npm.cmd run check` | Passed |
| `npm.cmd run smoke:home-ui` | Passed |

## Deviations

None.

## Self-Check: PASSED

- Home route still initializes existing Home UI behavior.
- Workspace route loads through `window.swarm.workspaces.*`.
- Main cockpit regions required by UI-03 are present.
- Pane headers show runtime indicators and `IDLE` status.
- Renderer remains browser-only.
