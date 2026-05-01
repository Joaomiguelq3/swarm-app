# Phase 4: Home UI and Visual System - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase replaces the placeholder Home screen with the first real SWARM workspace selector UI. It delivers the typing SWARM logo, subtle Matrix canvas background, saved workspace display with runtime badges, new workspace entry point, and reusable dark terminal visual system. It should not build the main workspace cockpit, terminal panes, runtime process lifecycle, launch animation, or real agent spawning.

</domain>

<decisions>
## Implementation Decisions

### Home Density and Layout
- **D-01:** Use an operational console feel: dense but readable, built for scanning saved workspaces quickly.
- **D-02:** Render saved workspaces as compact cards in a responsive grid, not oversized marketing cards and not a plain table-only list.
- **D-03:** Each workspace card must show project name, path, runtime badge, model, and last access date.
- **D-04:** Keep cards visually restrained with terminal-style borders, stable dimensions, and no nested cards.

### Workspace Creation Flow
- **D-05:** Provide a visible `+ novo workspace` action from the Home screen.
- **D-06:** The creation flow should be simple: choose folder, choose runtime, and let the model default from the selected runtime unless the UI exposes a model chooser cleanly.
- **D-07:** Use the Phase 3 preload API (`window.swarm.workspaces.*`) as the integration boundary. Renderer code must not access Node or filesystem APIs directly.
- **D-08:** If native folder dialog support is not fully wired yet, the UI may use a small modal/manual path fallback, but it must be structured so a later native dialog can replace it without changing the workspace API.

### Matrix Background and Logo Motion
- **D-09:** Implement the Matrix background as a canvas behind the Home content with very low opacity, close to the PRD's `0.04`, so it is texture rather than decoration competing with content.
- **D-10:** Implement the SWARM logo typing animation as a first-viewport signal, but keep it compact enough that workspace cards remain visible without feeling like a landing page.
- **D-11:** Avoid decorative gradient blobs, oversized hero composition, or stock/illustrative imagery. This app should feel like a terminal operations console.

### Runtime Badges and Visual System
- **D-12:** Claude Code badges use the existing purple token: `#aa66ff`.
- **D-13:** Codex badges use the existing green token: `#00ff88`.
- **D-14:** CSS should centralize the terminal dark palette from the PRD and add reusable classes for badges, buttons, form controls, empty states, and card layout.
- **D-15:** The visual system should stay JavaScript/CSS/HTML only: no React, no TypeScript, no UI framework.

### Empty, Loading, and Error States
- **D-16:** Empty state should be functional and direct: show that no workspaces are saved and make `+ novo workspace` the obvious next action.
- **D-17:** Loading states should be quiet and terminal-like, not full-screen marketing copy.
- **D-18:** Errors should appear inline near the affected workspace/action and should not crash or replace the whole Home UI.

### the agent's Discretion
- The planner may choose exact CSS class names, animation timing, date formatting, and modal structure as long as the UI remains compact, responsive, and consistent with the terminal console direction.
- The planner may decide whether Phase 4 should include a lightweight renderer smoke test or manual Electron screenshot check, as long as `npm.cmd run check` remains useful.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Planning
- `.planning/PROJECT.md` - Product positioning, stack constraints, UI tone, and architecture boundaries.
- `.planning/REQUIREMENTS.md` - Phase 4 requirement IDs: WRK-04, UI-01, UI-02, UI-04, UI-05, UI-07.
- `.planning/ROADMAP.md` - Phase 4 goal and success criteria.
- `.planning/STATE.md` - Current project state after Phase 3 completion.
- `.planning/phases/03-workspace-persistence-and-rules-generation/03-VERIFICATION.md` - Verified workspace persistence and IPC contract available to the Home UI.

### Current Code
- `renderer/home.html` - Current placeholder Home route to replace.
- `renderer/style.css` - Existing dark terminal palette and base layout.
- `renderer/app.js` - Current renderer entry point and preload usage pattern.
- `preload.js` - Safe renderer API, including `window.swarm.workspaces.*`.
- `src/runtimes.js` - Runtime labels, badge metadata, and model lists.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `window.swarm.getAppInfo()` already proves the preload bridge works from renderer code.
- `window.swarm.workspaces.list/create/updateRuntime/updateModel/touch` are available for Home integration.
- `src/runtimes.js` has runtime labels and badge color metadata that should drive visual consistency.
- `renderer/style.css` already defines the PRD palette variables and terminal font stack.

### Established Patterns
- Renderer code is plain JavaScript loaded by `home.html`; keep that pattern.
- Styling is CSS puro with root variables.
- Electron has `contextIsolation: true` and `nodeIntegration: false`; do not regress this.
- Main process and `src/` own filesystem/workspace persistence; renderer only calls preload methods.

### Integration Points
- `renderer/home.html` should become the real Home workspace selector.
- `renderer/app.js` should load saved workspaces on startup and render cards/states.
- `preload.js` is the only allowed bridge for workspace operations.
- Phase 5 will later reuse the selected workspace metadata for the main workspace screen and runtime switch UI.

</code_context>

<specifics>
## Specific Ideas

- Keep the first screen practical, not a landing page.
- Workspace cards should be compact enough to show multiple projects on desktop.
- Matrix canvas should sit behind content and remain subtle.
- The `+ novo workspace` flow should default model by runtime if model selection would add friction.

</specifics>

<deferred>
## Deferred Ideas

- Full main workspace cockpit, terminal panes, mission bar, feed, map/files area, and node panel remain Phase 5 or later.
- Runtime switch process kill/restart behavior remains Phase 5.
- Launch overlay, pane glow, task typing animation, and swarm TTS launch flow remain Phase 6.
- Native folder dialog can be improved later if Phase 4 uses a manual path fallback to keep the UI moving.

</deferred>

---

*Phase: 4-Home UI and Visual System*
*Context gathered: 2026-05-01*
