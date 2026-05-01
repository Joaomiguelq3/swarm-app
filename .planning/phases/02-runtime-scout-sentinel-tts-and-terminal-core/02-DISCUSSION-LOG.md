# Phase 2: Runtime, Scout, Sentinel, TTS, and Terminal Core - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-05-01
**Phase:** 2-Runtime, Scout, Sentinel, TTS, and Terminal Core
**Areas discussed:** Terminal PTY, Runtime config, Scout, Sentinel, TTS

---

## Terminal PTY

| Option | Description | Selected |
|--------|-------------|----------|
| Install `node-pty` now | Add dependency and prove a PowerShell PTY smoke test. | yes |
| Abstract only | Create an interface and defer `node-pty` installation. | |

**User's choice:** Use the recommendation.
**Notes:** Phase 2 should prove PTY works locally, but not build full xterm.js UI panes.

---

## Runtime Config

| Option | Description | Selected |
|--------|-------------|----------|
| Config only | Create `src/runtimes.js` with Claude/Codex definitions, no real agent spawn. | yes |
| Spawn real runtimes | Implement actual Claude/Codex process launch now. | |

**User's choice:** Use the recommendation.
**Notes:** Real agent orchestration is deferred. Phase 2 locks the runtime contract.

---

## Scout

| Option | Description | Selected |
|--------|-------------|----------|
| String + metadata | Return compact prompt context plus structured metadata. | yes |
| JSON only | Return only structured JSON. | |

**User's choice:** Use the recommendation.
**Notes:** Later agents need prompt-ready context and the app may need metadata for UI/debugging.

---

## Sentinel

| Option | Description | Selected |
|--------|-------------|----------|
| Module lifecycle | Expose start/stop and normalized events. | yes |
| Direct IPC integration | Wire the watcher directly into UI IPC now. | |

**User's choice:** Use the recommendation.
**Notes:** Keep module independent in Phase 2; full feed integration comes later.

---

## TTS

| Option | Description | Selected |
|--------|-------------|----------|
| Soft fallback | Use PowerShell SpeechSynthesizer and return/log failure without crashing. | yes |
| Hard failure | Treat TTS failure as an app error. | |

**User's choice:** Use the recommendation.
**Notes:** TTS is useful but should never block core app operation.

---

## the agent's Discretion

- Exact smoke script names and helper layout are left to planner/executor.
- Dependencies may be added as needed for Phase 2 modules, especially `node-pty` and `chokidar`.

## Deferred Ideas

- xterm.js UI panes.
- Real Claude/Codex swarm process launch.
- Workspace persistence.
- File event feed UI.
