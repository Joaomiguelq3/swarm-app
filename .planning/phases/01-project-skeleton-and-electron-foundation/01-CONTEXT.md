# Phase 1: Project Skeleton and Electron Foundation - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the runnable Electron foundation for SWARM: project package setup, secure Electron main/preload/renderer boundaries, the required folder/file structure, and a minimal first window proving `npm start` works. It does not implement runtime spawning, node-pty terminals, workspace persistence, scout, sentinel, TTS, or full UI workflows; those belong to later phases.

</domain>

<decisions>
## Implementation Decisions

### Scaffold and Dependencies
- **D-01:** Phase 1 should create `package.json`, install/configure the base Electron dependency, and make `npm start` open the app successfully.
- **D-02:** Phase 1 should include the required base files from the PRD: `.gitignore`, `.env`, `brain.json`, `main.js`, `preload.js`, `renderer/`, and `src/`.
- **D-03:** Phase 1 may keep `.env` as a placeholder with no real secrets. It must not include actual API keys or tokens.

### Electron Setup
- **D-04:** Use raw Electron scripts for v1 foundation. Do not introduce Electron Forge or electron-builder in Phase 1.
- **D-05:** Keep the Electron setup minimal and explicit: `main.js` owns `BrowserWindow` creation and IPC registration; `preload.js` exposes a narrow safe bridge; renderer files contain UI only.
- **D-06:** Electron security settings are mandatory in Phase 1: `contextIsolation: true`, `nodeIntegration: false`, and no direct Node APIs in renderer code.

### First Screen
- **D-07:** The app should open `renderer/home.html` on `npm start`.
- **D-08:** Create placeholders for both `renderer/home.html` and `renderer/workspace.html`, but only route to/open `home.html` in Phase 1.
- **D-09:** The home placeholder should visually identify SWARM and confirm the app shell is alive. Full Matrix rain, workspace cards, and rich UI polish are Phase 4 scope, not Phase 1.

### the agent's Discretion
- The planner can choose exact npm script names beyond `start` if helpful, but `npm start` must work.
- The planner can choose CommonJS or ESM for the Electron files, as long as the project stays JavaScript puro and simple for Windows.
- The planner can include a tiny IPC smoke test if it helps prove `preload.js` wiring, but should avoid expanding into feature work from later phases.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Planning
- `.planning/PROJECT.md` - Product context, constraints, key decisions, architecture boundaries, and runtime rules.
- `.planning/REQUIREMENTS.md` - v1 requirements and phase traceability.
- `.planning/ROADMAP.md` - Phase 1 goal and success criteria.
- `.planning/STATE.md` - Current project state and open decisions.

### Project Rules
- `AGENTS.md` - Codex-facing project rules.
- `CLAUDE.md` - Claude Code-facing project rules.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No app source exists yet. Phase 1 creates the first source files.

### Established Patterns
- Planning docs already establish the separation: `main.js` for Electron/IPC, `preload.js` for bridge, `src/` for business logic, and `renderer/` for UI.
- Project rules already require JavaScript puro, CSS puro, no TypeScript, no renderer Node access, and IPC only through `preload.js`.

### Integration Points
- `main.js` will later integrate with `src/swarm.js`, workspace persistence, and process lifecycle management.
- `preload.js` will later expose workspace, terminal, sentinel, and swarm IPC channels.
- `renderer/home.html` will later become the workspace selector from Phase 4.
- `renderer/workspace.html` will later become the multi-pane workspace shell from Phase 5.

</code_context>

<specifics>
## Specific Ideas

- Use the recommended path from discussion: install/configure Electron now, keep the scaffold raw and simple, and open a minimal `home.html`.
- Create `workspace.html` as a placeholder now so the intended file structure exists, but do not implement its full layout yet.

</specifics>

<deferred>
## Deferred Ideas

- Electron Forge or electron-builder packaging is deferred until the app needs packaging/distribution.
- Full Matrix background, workspace cards, runtime badges, and visual polish are Phase 4.
- Terminal panes, node-pty, runtime spawn, scout, sentinel, and TTS are Phase 2+.

</deferred>

---

*Phase: 1-Project Skeleton and Electron Foundation*
*Context gathered: 2026-05-01*
