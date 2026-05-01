# Phase 6: Swarm Launch and Live Orchestration - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase turns the Phase 5 workspace cockpit into the first real swarm workflow. It connects mission launch, project scouting, task decomposition, runtime process spawning, pane lifecycle statuses, agent/file feed events, launch overlay, and TTS lifecycle announcements.

This phase should make orchestration work end to end for the active workspace runtime. It should not add mixed Claude+Codex execution inside one swarm, production-grade AI task decomposition quality, demo hardening for live presentation, or final app-close cleanup guarantees. Mixed runtime execution remains v2/future scope, and demo readiness/shutdown hardening belongs to Phase 7.

</domain>

<decisions>
## Implementation Decisions

### Mission Decomposition
- **D-01:** Start with a local deterministic task decomposition layer instead of calling external AI APIs for decomposition in Phase 6.
- **D-02:** The decomposition input is mission text, selected agent count, active workspace metadata, and compact scout context.
- **D-03:** The decomposition output should be N structured task prompts, one per agent, with clear task number, mission summary, workspace path, runtime, and scout context.
- **D-04:** The deterministic splitter may be simple, but it must avoid pretending it has deep AI planning quality. It should be easy to replace later with Haiku or gpt-4o-mini.
- **D-05:** Agent count comes from the Phase 5 `agent-count` control and should be bounded to a practical range such as 1-6.

### Swarm Orchestrator
- **D-06:** Create `src/swarm.js` in Phase 6; it does not currently exist.
- **D-07:** `src/swarm.js` is runtime-agnostic and receives workspace path, mission, agent count, runtime, and model/config as inputs.
- **D-08:** `src/swarm.js` uses `src/runtimes.js` for runtime commands and arguments.
- **D-09:** Use `node-pty` for real runtime process spawning so each pane can receive live process output.
- **D-10:** Spawn the active workspace runtime only. Mixed runtime execution inside one launch remains deferred.
- **D-11:** Each spawned process receives its own task prompt plus project context through stdin or the most reliable available CLI input path.
- **D-12:** The orchestrator must expose lifecycle events rather than directly manipulating renderer state.

### IPC and Process Lifecycle
- **D-13:** Add dedicated main/preload IPC for swarm launch, stop, and event streaming.
- **D-14:** Main process owns the active swarm/process registry. Renderer must not spawn or kill processes directly.
- **D-15:** Renderer calls a safe preload API such as `window.swarm.orchestration.launch(input)` and `window.swarm.orchestration.stop()`.
- **D-16:** Renderer receives agent output, status, file events, and mission events through safe preload event subscriptions.
- **D-17:** Runtime switch should reuse or connect to the Phase 5 stop hook so active processes are stopped before switching runtime.
- **D-18:** Stop behavior in Phase 6 should terminate active spawned processes for the current mission, but final app-close cleanup and demo hardening are Phase 7.

### Pane Status Mapping
- **D-19:** Pane statuses update through orchestration events and continue using the Phase 5 states: `IDLE`, `THINKING`, `WRITING`, `DONE`, and `ERROR`.
- **D-20:** Initial launch sets assigned panes to `THINKING`.
- **D-21:** Output from a process keeps the pane active and may remain `THINKING` unless file events or explicit writing heuristics move it to `WRITING`.
- **D-22:** File events from Sentinel associated with the workspace should push relevant panes or the shared feed toward `WRITING`.
- **D-23:** Process exit code `0` maps to `DONE`.
- **D-24:** Non-zero exit, process error, or spawn failure maps to `ERROR`.
- **D-25:** Unused panes remain `IDLE`.

### Feed and Sentinel
- **D-26:** Feed becomes unified across mission events, agent lifecycle events, agent output summaries, and file watcher events.
- **D-27:** Use `src/sentinel.js` to watch the active workspace during an active mission.
- **D-28:** Sentinel events should be sent to renderer as `{ acao, arquivo, timestamp }` and displayed in the existing feed.
- **D-29:** Feed entries should remain concise and operational, not verbose logs of every output byte.
- **D-30:** Raw terminal output belongs in pane terminal surfaces; feed receives summarized lifecycle/file events.

### Launch Overlay and TTS
- **D-31:** Implement the Phase 6 launch overlay: dark overlay, `SWARM · spawning agents...`, runtime badge, task list typing/progressive reveal, pane glow, and fade out.
- **D-32:** Overlay should reflect the active runtime badge: Claude Code purple or Codex green.
- **D-33:** TTS is best-effort. Failure or timeout from `src/tts.js` must not block launch or mark the mission failed.
- **D-34:** TTS should announce swarm start with runtime and agent count, agent completion/error, and mission completion.
- **D-35:** TTS messages should be short and in Portuguese, matching the existing product language.

### Verification and Demo Boundary
- **D-36:** Automated verification should use a fake/test runtime path or injectable process command so tests do not depend on real `claude` or `codex` CLIs.
- **D-37:** Add smoke coverage for decomposition, launch IPC/orchestrator behavior, pane/feed event hooks, and stop behavior.
- **D-38:** Real Claude Code and Codex demo runs are deferred to Phase 7.
- **D-39:** If real runtime binaries are unavailable during Phase 6 development, the app should show clear spawn errors in pane/feed without crashing.
- **D-40:** Phase 6 completion should not claim production readiness; it should claim functional local orchestration with testable fake-runtime verification.

### the agent's Discretion
- The planner may choose the exact fake runtime mechanism, as long as it is deterministic and does not require network/API credentials.
- The planner may choose exact IPC channel names and event payload field names if they are consistent, documented in code, and exposed safely through preload.
- The planner may decide whether launch overlay work is implemented before or after core orchestration in the plan waves, as long as both are verified before phase completion.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Planning
- `.planning/PROJECT.md` - Product context, active orchestration requirements, stack constraints, and phase state.
- `.planning/REQUIREMENTS.md` - Phase 6 requirement IDs: TRM-04, SWM-01, SWM-02, SWM-03, SWM-04, SWM-05, SWM-06, FIL-04, UI-06, TTS-02, TTS-03.
- `.planning/ROADMAP.md` - Phase 6 goal and success criteria.
- `.planning/STATE.md` - Current project state after Phase 5 completion.
- `.planning/phases/05-main-workspace-ui-and-runtime-switching/05-CONTEXT.md` - Cockpit, pane, runtime switch, mission/feed decisions feeding this phase.
- `.planning/phases/05-main-workspace-ui-and-runtime-switching/05-VERIFICATION.md` - Verified Phase 5 UI/lifecycle hooks and deferred Phase 6 scope.
- `.planning/phases/02-runtime-scout-sentinel-tts-and-terminal-core/02-VERIFICATION.md` - Verified scout, sentinel, TTS, runtime config, and PTY assumptions.
- `.planning/phases/03-workspace-persistence-and-rules-generation/03-VERIFICATION.md` - Verified workspace persistence and runtime/model APIs.

### Current Code
- `renderer/app.js` - Current workspace route, mission placeholder, pane rendering, feed rendering, runtime controls, and `stopActiveProcesses()` hook.
- `renderer/workspace.html` - Main cockpit DOM hooks for panes, mission bar, feed, node panel, and future overlay.
- `renderer/style.css` - Terminal visual system, pane statuses, feed, and cockpit layout.
- `preload.js` - Safe renderer bridge to extend with orchestration APIs and event subscriptions.
- `main.js` - Electron lifecycle and IPC registration location.
- `src/runtimes.js` - Runtime command definitions and model lists.
- `src/scout.js` - Project scout used before launch.
- `src/sentinel.js` - File watcher used during active missions.
- `src/tts.js` - Best-effort Windows native speech utility.
- `src/workspace-ipc.js` - Existing IPC registration pattern to mirror for orchestration IPC.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `renderer/app.js` already has `handleLaunchPlaceholder`, `renderPanes`, `renderFeed`, `stopActiveProcesses`, mission input, agent count input, and runtime/model state.
- `renderer/workspace.html` already has stable hooks for `mission-input`, `agent-count`, `launch-swarm-button`, `pane-grid`, `activity-feed`, `runtime-select`, and `model-select`.
- `src/scout.js` can produce compact project context and already ignores common heavy directories.
- `src/sentinel.js` wraps chokidar and emits `{ acao, arquivo, timestamp }` events.
- `src/tts.js` already speaks through PowerShell SpeechSynthesizer and returns a non-throwing result.
- `src/runtimes.js` already defines the Claude and Codex commands and args.
- `src/workspace-ipc.js` provides the main-process IPC registration style to follow.

### Established Patterns
- Renderer stays browser-only and uses preload APIs.
- Main process owns IPC handlers.
- Business logic belongs in `src/`.
- Existing smoke tests are static and deterministic, with aggregate `smoke:phaseN` scripts.
- UI uses compact terminal styling and should not become a marketing flow.

### Integration Points
- `src/swarm.js` should be introduced as the orchestration core.
- New orchestration IPC can be registered from `main.js` via a helper similar to `src/workspace-ipc.js`.
- `preload.js` should expose only launch/stop and event subscription helpers, not raw `ipcRenderer`.
- Renderer launch handling should replace `handleLaunchPlaceholder` with real orchestration calls.
- Renderer pane/feed state should update from orchestration events instead of local placeholder events.

</code_context>

<specifics>
## Specific Ideas

- Keep the first orchestration implementation practical and replaceable.
- Fake-runtime smoke tests are required so CI/local checks do not depend on installed agent CLIs.
- Feed should summarize events; panes should carry terminal output.
- TTS should never block or fail the mission.
- Phase 6 should be honest about capability: functional orchestration, not final demo hardening.

</specifics>

<deferred>
## Deferred Ideas

- Mixed Claude Code and Codex agents in a single swarm launch remains v2/future scope.
- AI-powered decomposition via Haiku or gpt-4o-mini is deferred until the deterministic splitter proves the workflow shape.
- Full demo rehearsals with real Claude Code and Codex are Phase 7.
- Final app-close child-process cleanup and hardening are Phase 7.
- Production-grade conflict detection between agents is v2/future scope.

</deferred>

---

*Phase: 6-Swarm Launch and Live Orchestration*
*Context gathered: 2026-05-01*
