# Phase 7: Shutdown, Hardening, and Demo Readiness - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase makes the existing SWARM workflow reliable enough for a live local demo. It hardens process cleanup when the app closes, adds an explicit stop-all user action, improves visible error handling for real runtime failures, and records/rehearses the Claude Code and Codex demo flows.

This phase should not add mixed Claude+Codex agents in one swarm, replace deterministic decomposition with external AI planning, redesign the cockpit, or expand v1 scope. It should stabilize what Phase 6 already built and prove the demo path with real installed CLIs.

</domain>

<decisions>
## Implementation Decisions

### Shutdown and Process Cleanup
- **D-01:** Main process remains the owner of active swarm/process cleanup. Renderer never kills child processes directly.
- **D-02:** App-close cleanup should be centralized through the existing `swarmIpc.stop('app-close')` path, but Phase 7 should harden it for Electron lifecycle events such as `before-quit`, `will-quit`, `window-all-closed`, and window close.
- **D-03:** Cleanup must be idempotent. Multiple stop/close events should not double-kill children, double-close Sentinel, or emit noisy duplicate errors.
- **D-04:** Cleanup should be best-effort but bounded. The app should try graceful kill first and not hang forever if a pty/runtime ignores termination.
- **D-05:** Cleanup errors should be logged/emitted as operational warnings, not allowed to crash Electron during quit.
- **D-06:** On stop or close, Sentinel watchers and orchestration event subscriptions must be disposed before the active mission registry is discarded.

### Stop-All User Action
- **D-07:** Add an explicit stop-all action visible in the workspace cockpit. Recommended placement is near `LAUNCH SWARM` in the mission bar, with compact terminal styling.
- **D-08:** The stop action calls `window.swarm.orchestration.stop('user-stop')`, resets active pane statuses to `IDLE`, clears launch overlay state, and writes a concise feed entry.
- **D-09:** Stop should be disabled or visually idle when no mission is active, and enabled while any pane is `THINKING` or `WRITING`.
- **D-10:** Runtime switching continues to call the same stop path before persisting the new runtime.

### Error Visibility and Demo Safety
- **D-11:** Missing `claude` or `codex` binaries, spawn failures, non-zero exits, Sentinel failures, and TTS warnings must be visible in pane/feed without crashing the app.
- **D-12:** Error messages should be operational and safe: include which runtime/agent failed and the high-level reason, but never print API keys, tokens, `.env` contents, or full sensitive environment dumps.
- **D-13:** For demo readiness, add a preflight check that verifies `claude --version` and `codex --version` are callable, but do not run real agent missions in automated `npm run check`.
- **D-14:** Automated tests should continue to use fake/injected runtime paths. Real Claude/Codex verification is manual or explicit demo-preflight, because it depends on local CLIs, credentials, and network.
- **D-15:** If a real runtime is unavailable, the app should fail visibly and calmly, leaving panes and feed in a coherent state.

### Demo Rehearsal
- **D-16:** Phase 7 should produce a short demo runbook/checklist for the two intended flows: one Claude Code workspace and one Codex workspace.
- **D-17:** The demo runbook should include exact preflight commands, workspace setup expectations, mission text, expected UI signals, and pass/fail notes.
- **D-18:** Real demo rehearsal means launching the app and running one Claude Code and one Codex mission manually or semi-manually, then recording the result in Phase 7 verification. It should not be hidden behind fake-runtime smoke tests.
- **D-19:** Demo folders may be prepared if useful, but generated demo app code should remain outside the SWARM repo unless explicitly needed as test fixtures.
- **D-20:** The Phase 7 summary must be honest: distinguish automated hardening checks from manually rehearsed real runtime demos.

### the agent's Discretion
- The planner may choose exact stop button copy and placement if the mission bar remains compact and obvious.
- The planner may choose whether the close cleanup is implemented directly in `main.js` or through a small lifecycle helper in `src/`, as long as the main process owns it.
- The planner may choose exact demo runbook filename and smoke script names.
- The planner may add focused static/fake-runtime smoke tests for stop/close/error paths, but should not add broad GUI automation unless it is practical and stable.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Planning
- `.planning/PROJECT.md` - Product context, active demo-readiness items, stack constraints, and lifecycle expectations.
- `.planning/REQUIREMENTS.md` - Phase 7 requirement `PRS-02` plus demo-readiness expectations from active project context.
- `.planning/ROADMAP.md` - Phase 7 goal and success criteria.
- `.planning/STATE.md` - Current project state after Phase 6 completion.
- `.planning/phases/06-swarm-launch-and-live-orchestration/06-CONTEXT.md` - Phase 6 decisions that deferred final close cleanup and real demo rehearsal to Phase 7.
- `.planning/phases/06-swarm-launch-and-live-orchestration/06-VERIFICATION.md` - Boundary showing fake-runtime automation passed and real runtime demos remain pending.

### Current Code
- `main.js` - Electron lifecycle hooks, `swarmIpc` registration, and current `window-all-closed` cleanup call.
- `src/swarm-ipc.js` - Active swarm registry, IPC launch/stop handlers, Sentinel cleanup, and TTS lifecycle behavior.
- `src/swarm.js` - Child process registry, pty spawn adapter, event model, and current stop behavior.
- `preload.js` - Safe renderer orchestration bridge.
- `renderer/app.js` - Stop hook, launch flow, pane/feed updates, overlay cleanup, and runtime switch behavior.
- `renderer/workspace.html` - Mission bar and workspace cockpit DOM hooks where stop-all can be added.
- `renderer/style.css` - Existing terminal control styles for compact stop button/UI states.
- `src/runtimes.js` - Canonical Claude Code and Codex commands/args for preflight checks.
- `scripts/smoke-swarm-core.js` - Fake-runtime pattern for process lifecycle tests.
- `scripts/smoke-swarm-ipc.js` - IPC injection pattern for lifecycle and TTS tests.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/swarm.js` already tracks spawned child processes in a `Map` and exposes `stop(reason)`.
- `src/swarm-ipc.js` already exposes stop through IPC and owns the active swarm/Sentinel registry.
- `main.js` already calls `swarmIpc.stop('app-close')` from `window-all-closed`, but this is not yet hardened across the full Electron quit lifecycle.
- `renderer/app.js` already has `stopActiveProcesses(reason)`, launch state, pane reset behavior, feed events, and overlay cleanup.
- Existing smoke scripts use injected fake processes and fake IPC, which should be extended for shutdown/error coverage.

### Established Patterns
- Renderer uses `window.swarm.orchestration.*`; no raw `ipcRenderer` and no Node APIs in renderer.
- Main process owns Electron lifecycle and IPC registration.
- Business logic belongs in `src/`.
- Smoke tests are deterministic and should not require real Claude/Codex CLIs.
- UI copy should remain operational and honest, not claim a fake demo is real.

### Integration Points
- Harden `registerSwarmIpc().stop()` so it can support user-stop, runtime-switch, app-close, and mission-complete paths safely.
- Add close lifecycle handling in `main.js` without breaking normal Electron quit behavior.
- Add stop button DOM in `renderer/workspace.html` and renderer logic in `renderer/app.js`.
- Add preflight/demo scripts or docs that call runtime version checks explicitly, separate from `npm.cmd run check`.
- Update Phase 7 verification docs with automated and manual evidence separately.

</code_context>

<specifics>
## Specific Ideas

- Prefer `STOP SWARM` beside `LAUNCH SWARM` over hiding stop inside the node panel.
- Real demo rehearsal should use the original intended split: one Claude Code demo workspace and one Codex demo workspace.
- Keep `npm.cmd run check` independent from real Claude/Codex availability.
- Treat missing runtime binaries as a demo-preflight failure, not as a general build failure.

</specifics>

<deferred>
## Deferred Ideas

- Mixed Claude Code and Codex agents in one launch remains v2/future scope.
- Production-grade task decomposition via external AI remains deferred.
- Conflict detection between parallel agents remains v2/future scope.
- Packaging/installer work is not part of Phase 7 unless separately added to the roadmap.

</deferred>

---

*Phase: 7-Shutdown, Hardening, and Demo Readiness*
*Context gathered: 2026-05-01*
