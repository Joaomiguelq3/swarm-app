# Research Summary: SWARM

## Stack

Electron, Node.js, xterm.js, node-pty, chokidar, Windows PowerShell SpeechSynthesizer, CSS puro, and JavaScript puro match the PRD and should be kept narrow for v1.

## Table Stakes

- Workspace selector with persisted runtime/model.
- Main multi-pane terminal grid.
- Runtime-aware spawn config for Claude Code and Codex.
- Scout, sentinel, TTS, and graceful process management.
- Runtime-specific rules file generation.

## Watch Out For

- Test `node-pty` early on Windows.
- Keep Electron security defaults strict.
- Treat process lifecycle as a first-class feature.
- Do not let runtime switching leave active child processes behind.
- Defer mixed-runtime-per-launch until same-runtime parallel execution works reliably.
