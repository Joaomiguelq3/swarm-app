# Phase 2 Research: Runtime, Scout, Sentinel, TTS, and Terminal Core

**Phase:** 02 - Runtime, Scout, Sentinel, TTS, and Terminal Core
**Date:** 2026-05-01
**Status:** Complete

## Research Summary

Phase 2 should prove local core modules independently before the app grows UI complexity. The safest plan is to keep these modules in `src/`, add smoke scripts under `scripts/`, and avoid coupling them to renderer IPC until later phases.

## Technical Findings

### node-pty

- `node-pty` is the right dependency for real terminal processes, but it is a native module and can be sensitive to Windows build tooling and Electron/Node ABI differences.
- Phase 2 should install it and test a simple PowerShell command from Node. Full xterm.js integration should wait until UI terminal panes are in scope.
- A smoke script should fail clearly if `node-pty` cannot load, because later terminal panes depend on it.

### chokidar

- `chokidar` is appropriate for local file watching and can emit add/change/unlink events.
- Sentinel should normalize watcher events into SWARM's Portuguese event shape: `{ acao, arquivo, timestamp }`.
- Watchers must expose a stop/close method so later runtime switching and app shutdown can clean up resources.

### Runtime Config

- Runtime config is pure data for this phase. It should define Claude Code and Codex commands, args, rules files, skills directories, labels, badge metadata, and model lists.
- Real runtime process spawning should be deferred to orchestration phases.

### Scout

- Scout should ignore heavy/generated folders by default and keep output bounded.
- Returning both prompt-ready text and structured metadata supports agent prompts and future UI/debug views.

### TTS

- Windows SpeechSynthesizer through PowerShell is acceptable for v1 and avoids external APIs.
- TTS must fail softly so lack of audio support does not block core workflows or tests.

## Planning Guidance

- Use multiple plans to avoid same-file conflicts:
  - Plan 02-01: dependencies, scripts, and runtime config.
  - Plan 02-02: scout module and smoke test.
  - Plan 02-03: sentinel and TTS modules plus smoke tests.
  - Plan 02-04: PTY smoke test and final verification.
- Plans 02-02 and 02-03 can run in parallel after Plan 02-01.
- Plan 02-04 depends on all prior plans because it validates the full phase.

## Risks

- `node-pty` install/build can fail on Windows if native tooling or ABI compatibility is missing.
- TTS may be unavailable or blocked in non-interactive shells; this should produce a non-crashing failure result.
- File watcher tests can be flaky if they do not wait for events deterministically.

## Research Complete

This research supports a four-plan, wave-based Phase 2 execution.
