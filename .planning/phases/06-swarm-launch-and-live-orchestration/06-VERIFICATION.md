# Phase 6 Verification

## Commands

- `npm.cmd run smoke:swarm-core` - passed
- `npm.cmd run smoke:swarm-ipc` - passed
- `npm.cmd run smoke:workspace-orchestration` - passed
- `npm.cmd run smoke:launch-overlay` - passed
- `npm.cmd run smoke:phase6` - passed

## Coverage

- Orchestrator core uses runtime config, scouts workspace context, decomposes mission, spawns N processes, streams output, emits lifecycle events, and stops active children.
- IPC exposes launch/stop/event APIs through preload and forwards Sentinel/TTS lifecycle behavior.
- Renderer launches missions, updates pane status/output, shows file events in feed, and calls real stop on runtime switch.
- Overlay shows active runtime badge, progressive tasks, pane glow, and bounded fade-out.

## Boundary

Automated verification uses fake-runtime process injection. Real Claude Code and Codex demo rehearsal is intentionally deferred to Phase 7.
