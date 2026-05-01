# Phase 2: Runtime, Scout, Sentinel, TTS, and Terminal Core - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase proves the local systems that make SWARM real: runtime configuration, a PTY-backed terminal smoke test, project scouting, file watching, and native Windows speech. It should create testable backend/core modules and small verification scripts, but it should not build the full workspace UI, launch real Claude/Codex agent swarms, persist workspaces, or implement the Phase 5/6 orchestration workflow.

</domain>

<decisions>
## Implementation Decisions

### Terminal PTY
- **D-01:** Install and configure `node-pty` in Phase 2.
- **D-02:** Add a smoke test that spawns a simple PowerShell command through `node-pty`, captures output, and exits cleanly.
- **D-03:** Do not wire full xterm.js UI terminal panes in this phase. The output can be verified through scripts or a minimal main-process test path.

### Runtime Config
- **D-04:** Create `src/runtimes.js` with Claude Code and Codex runtime definitions exactly aligned with the PRD.
- **D-05:** Runtime definitions must include command, args, rules file, skills directory, label, badge class/color metadata if useful, and model options.
- **D-06:** Do not spawn real Claude/Codex agent processes in this phase. Real runtime launch/orchestration belongs to later phases.

### Scout
- **D-07:** Create `src/scout.js` that returns both compact human-readable context and structured metadata.
- **D-08:** Scout must ignore `node_modules`, `.git`, `dist`, `build`, `.next`, `__pycache__`, `venv`, and similar heavy/generated folders.
- **D-09:** Scout should capture the first lines of important files within a bounded limit so prompts stay compact.

### Sentinel
- **D-10:** Create `src/sentinel.js` with explicit `start` and `stop` lifecycle methods.
- **D-11:** Sentinel emits normalized events shaped like `{ acao, arquivo, timestamp }`.
- **D-12:** Keep sentinel independent from renderer UI in this phase. IPC integration can be minimal or deferred; full feed integration is Phase 6.

### TTS
- **D-13:** Create `src/tts.js` using Windows PowerShell `System.Speech.Synthesis.SpeechSynthesizer`.
- **D-14:** TTS should fail softly by default: log/return a failure result without crashing the app if speech is unavailable.
- **D-15:** Add a smoke test for speaking or invoking the TTS path with "SWARM inicializado".

### the agent's Discretion
- The planner may choose exact script names, but verification should be runnable through `npm.cmd run ...` commands.
- The planner may add small scripts under `scripts/` for smoke tests if that keeps app code clean.
- The planner may add `chokidar` and `node-pty` dependencies in the same phase, but should avoid adding xterm.js until UI terminal panes are actually implemented.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Planning
- `.planning/PROJECT.md` - Product context, constraints, architecture boundaries, and runtime rules.
- `.planning/REQUIREMENTS.md` - Phase 2 requirement IDs: RUN-01, RUN-02, RUN-06, RUN-07, TRM-02, TRM-05, FIL-01, FIL-02, FIL-03, TTS-01.
- `.planning/ROADMAP.md` - Phase 2 goal and success criteria.
- `.planning/STATE.md` - Current state after Phase 1 completion.
- `.planning/phases/01-project-skeleton-and-electron-foundation/01-CONTEXT.md` - Foundation decisions and boundaries.
- `.planning/phases/01-project-skeleton-and-electron-foundation/01-01-SUMMARY.md` - Files created in Phase 1.
- `.planning/phases/01-project-skeleton-and-electron-foundation/01-VERIFICATION.md` - Verified Electron/preload assumptions.

### Project Rules
- `AGENTS.md` - Codex-facing project rules.
- `CLAUDE.md` - Claude Code-facing project rules.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `main.js` already owns Electron lifecycle and one IPC handler. Phase 2 can add module smoke hooks carefully, but should avoid turning main into business logic.
- `preload.js` exposes a narrow bridge. Phase 2 should preserve the "no raw ipcRenderer" rule.
- `package.json` already has `start` and `check`; Phase 2 can extend scripts for module smoke tests.
- `renderer/home.html`, `renderer/workspace.html`, `renderer/style.css`, and `renderer/app.js` exist as placeholders and should not become full terminal UI in this phase.

### Established Patterns
- CommonJS is currently used in `main.js` and `preload.js`; Phase 2 modules should follow CommonJS unless a strong reason appears.
- Electron security settings are already established: `contextIsolation: true` and `nodeIntegration: false`.
- Business logic belongs in `src/`; renderer code should stay UI-only.

### Integration Points
- `src/runtimes.js` will later feed workspace creation, node panel runtime selector, and swarm process spawning.
- `src/scout.js` will later feed mission decomposition and agent prompts.
- `src/sentinel.js` will later feed the live activity feed through IPC.
- `src/tts.js` will later announce launch, completion, and error lifecycle events.
- PTY smoke code will later become the basis for agent terminal panes.

</code_context>

<specifics>
## Specific Ideas

- Prefer smoke-test scripts that can run without opening the full UI.
- Keep Phase 2 proof-oriented: each core module should be individually testable from npm scripts or Node scripts.
- TTS should be Windows-native and local-only; no external API.

</specifics>

<deferred>
## Deferred Ideas

- Full xterm.js renderer terminal panes are deferred until UI integration phases.
- Real Claude/Codex process orchestration is deferred until swarm launch/orchestration phases.
- Workspace persistence and rules-file generation are Phase 3.
- Shared activity feed UI is Phase 6.

</deferred>

---

*Phase: 2-Runtime, Scout, Sentinel, TTS, and Terminal Core*
*Context gathered: 2026-05-01*
