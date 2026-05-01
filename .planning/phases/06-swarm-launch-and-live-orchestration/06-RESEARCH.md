# Phase 6: Swarm Launch and Live Orchestration - Research

**Date:** 2026-05-01
**Status:** Complete

## Research Complete

### Phase Goal

Phase 6 connects the cockpit built in Phase 5 to real orchestration behavior:

- Mission launch from renderer.
- Scout context before launch.
- Deterministic decomposition into N agent prompts.
- Parallel runtime process spawn through `node-pty`.
- Agent lifecycle/output events over IPC.
- Sentinel file events in the shared feed.
- Pane status updates and terminal output surfaces.
- Launch overlay and best-effort TTS lifecycle messages.
- Fake-runtime smoke tests that do not require real Claude Code or Codex binaries.

### Current Implementation Findings

#### Existing Orchestration Gap

- `src/swarm.js` does not exist yet.
- `main.js` currently registers only app info and workspace IPC.
- `preload.js` exposes only `getAppInfo` and `workspaces`.
- Phase 5 renderer has `handleLaunchPlaceholder()` and local `stopActiveProcesses()` that must be replaced or connected to real orchestration IPC.

#### Reusable Core Modules

- `src/runtimes.js` defines runtime commands and args:
  - Claude: `claude --dangerously-skip-permissions`
  - Codex: `codex --approval-mode full-auto`
- `src/scout.js` returns compact context for a workspace and ignores heavy directories.
- `src/sentinel.js` wraps chokidar and emits `{ acao, arquivo, timestamp }`.
- `src/tts.js` speaks through PowerShell on Windows and resolves a best-effort result instead of throwing.

#### Renderer Hooks from Phase 5

- `renderer/workspace.html` has `mission-input`, `agent-count`, `launch-swarm-button`, `pane-grid`, `activity-feed`, and node panel controls.
- `renderer/app.js` already renders panes, feed entries, runtime badges, model controls, and pane statuses.
- `renderer/app.js` currently creates terminal surfaces as DOM placeholders; Phase 6 can append output lines there before full xterm integration is deepened.
- `stopActiveProcesses()` currently resets local panes; Phase 6 should call orchestration stop first and then reset UI.

#### IPC Pattern

- `src/workspace-ipc.js` is the model: one module owns channel constants and `register...Ipc({ ipcMain, app })`.
- `preload.js` exposes narrow functions and hides raw `ipcRenderer`.
- Phase 6 should mirror this with `src/swarm-ipc.js`, event subscription helpers, and cleanup functions returned to renderer.

### Planning Implications

- Add `src/swarm.js` with a small event-driven API:
  - `launchSwarm(input, options)`
  - `stopSwarm()`
  - `onEvent(listener)`
  - possibly `decomposeMission(input)` exported for tests.
- The core should accept injectable runtime definitions or spawn adapter for fake-runtime smoke tests.
- `src/swarm-ipc.js` should own orchestration IPC and hold the active swarm instance/registry in main process.
- Renderer should subscribe to events on workspace init and unsubscribe when appropriate.
- Pane events need stable ids: agent/pane index should be part of every agent event.
- Feed should summarize lifecycle and file events while terminal surfaces receive process output text.
- TTS should run best-effort from main/core and emit warning events only if useful; it must never block or fail mission launch.

### Suggested Event Contract

Use a compact event shape:

```js
{
  type: 'mission:start' | 'agent:start' | 'agent:output' | 'agent:status' |
        'agent:exit' | 'file:event' | 'mission:done' | 'mission:error' | 'tts:warning',
  paneId,
  status,
  message,
  output,
  file,
  timestamp
}
```

Exact names can change during implementation, but events must be renderer-safe plain objects.

### Risks and Mitigations

- **Risk:** Real `claude`/`codex` binaries are missing during verification.
  **Mitigation:** Add fake-runtime injection/smoke path; real demos move to Phase 7.

- **Risk:** Spawned processes continue after stop/runtime switch.
  **Mitigation:** Main process owns registry and exposes stop; Phase 7 hardens app-close cleanup.

- **Risk:** Feed becomes unusably noisy.
  **Mitigation:** Raw output stays in panes; feed gets summaries and file events.

- **Risk:** TTS blocks launch.
  **Mitigation:** Treat TTS as fire-and-forget/best-effort and never await it on the critical path unless safely timed.

### Recommended Plan Structure

- **06-01:** Orchestrator core, deterministic decomposition, fake-runtime support, and core smoke.
- **06-02:** Main/preload IPC, process registry, sentinel and TTS event integration.
- **06-03:** Renderer launch, pane output/status updates, feed integration, stop hook connection.
- **06-04:** Launch overlay, final UI lifecycle polish, and TTS user-facing behavior.
- **06-05:** Aggregate smoke verification and phase summary.

---

*Research complete: 2026-05-01*
