# Phase 6: Swarm Launch and Live Orchestration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-05-01
**Phase:** 6-Swarm Launch and Live Orchestration
**Areas discussed:** Mission decomposition, runtime spawning, IPC lifecycle, pane/feed mapping, launch overlay, TTS, verification boundary

---

## Mission Decomposition

| Option | Description | Selected |
|--------|-------------|----------|
| Deterministic local splitter | Split mission into N structured prompts using scout context, no external API. | yes |
| AI decomposition now | Call Haiku or gpt-4o-mini during Phase 6. | |
| Manual task entry | User types every agent task manually. | |

**User's choice:** pode usar as recomendações
**Notes:** Recommendation selected. Keep the first decomposition deterministic and replaceable.

---

## Runtime Spawning

| Option | Description | Selected |
|--------|-------------|----------|
| Real node-pty orchestration | Create `src/swarm.js`, use `src/runtimes.js`, spawn active workspace runtime per pane. | yes |
| UI-only simulation | Keep panes simulated until demo hardening. | |
| Mixed runtime launch | Allow Claude and Codex in one launch now. | |

**User's choice:** pode usar as recomendações
**Notes:** Recommendation selected. Mixed runtime remains future scope.

---

## IPC Lifecycle

| Option | Description | Selected |
|--------|-------------|----------|
| Main-owned process registry | Main process owns launch/stop/process registry; renderer uses safe preload APIs. | yes |
| Renderer-owned spawning | Renderer spawns or kills processes directly. | |
| Minimal no-stop launch | Launch only, leave stop handling for later. | |

**User's choice:** pode usar as recomendações
**Notes:** Recommendation selected. Phase 6 stop should terminate active mission processes; final app-close hardening is Phase 7.

---

## Pane Status and Feed

| Option | Description | Selected |
|--------|-------------|----------|
| Event-driven mapping | Pane statuses and feed update from orchestration, process, and sentinel events. | yes |
| Raw output-only feed | Put all output bytes in the shared feed. | |
| Status-only panes | Show status but skip file/agent feed for now. | |

**User's choice:** pode usar as recomendações
**Notes:** Recommendation selected. Feed summarizes; panes carry terminal output.

---

## Launch Overlay and TTS

| Option | Description | Selected |
|--------|-------------|----------|
| Full overlay and best-effort TTS | Implement launch overlay and non-blocking TTS lifecycle messages. | yes |
| TTS only | Skip overlay until later. | |
| Overlay only | Skip TTS until demo phase. | |

**User's choice:** pode usar as recomendações
**Notes:** Recommendation selected. TTS errors must not fail launch.

---

## Verification Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Fake-runtime smoke | Verify orchestration with deterministic fake runtime, not real Claude/Codex binaries. | yes |
| Real runtime smoke | Require installed Claude/Codex for automated Phase 6 verification. | |
| Manual-only verification | Skip automated orchestration smoke. | |

**User's choice:** pode usar as recomendações
**Notes:** Recommendation selected. Real Claude/Codex demo runs move to Phase 7.

---

## the agent's Discretion

- Exact fake runtime mechanism.
- Exact IPC channel names and event payload shape.
- Exact wave order for overlay vs orchestration internals.

## Deferred Ideas

- Mixed runtime swarm launch.
- AI-powered decomposition via external model.
- Real Claude/Codex demo rehearsals.
- Final app-close process cleanup and demo hardening.
