# SWARM - Multi-Agent Orchestrator

## What This Is

SWARM is a Windows desktop app that orchestrates multiple AI coding agents in parallel. A user chooses the runtime per workspace, Claude Code or Codex, describes a mission, and SWARM decomposes that mission into independent tasks that run at the same time in separate embedded terminals with their own context.

The product is for developers who currently supervise one agent at a time and want to supervise four to six concurrent workstreams from one desktop interface.

## Core Value

One developer can launch and supervise multiple independent AI coding tasks in parallel, with clear runtime choice, live terminal visibility, file-change awareness, and graceful process control.

## Requirements

### Validated

(None yet - ship to validate)

### Active

- [ ] User can create and reopen workspaces saved in `%APPDATA%\swarm\workspaces.json`.
- [ ] Each workspace stores its selected runtime, model, path, name, and last access time.
- [ ] User can choose Claude Code or Codex per workspace.
- [ ] SWARM spawns the correct runtime command for the selected workspace.
- [ ] SWARM shows multiple live terminal panes through xterm.js and node-pty.
- [ ] User can enter a mission, choose agent count, and launch a parallel swarm.
- [ ] SWARM scouts the target project and injects compact context into agent tasks.
- [ ] SWARM watches file changes in real time and streams events to the UI.
- [ ] SWARM creates the correct rules file for each runtime without deleting the other one.
- [ ] SWARM uses native Windows TTS to announce major lifecycle events.
- [ ] SWARM kills child processes gracefully when switching runtime or closing the app.
- [ ] SWARM provides a dark terminal-first UI with runtime badges and launch animation.

### Out of Scope

- Cloud orchestration - v1 is a local Windows desktop app.
- TypeScript - the project explicitly uses JavaScript puro.
- External TTS APIs - v1 uses Windows PowerShell SpeechSynthesizer only.
- Browser SaaS version - desktop Electron first.
- Multi-user collaboration - one local developer supervising local agents.
- Perfect AI decomposition quality - v1 can use a practical decomposition layer and improve later.

## Context

The app exists because one developer currently manages one coding agent at a time. SWARM should let a developer supervise four to six tasks in parallel and see results in minutes rather than hours.

The implementation target is Windows desktop. The chosen stack is Electron, Node.js, xterm.js, node-pty, chokidar, PowerShell SpeechSynthesizer, CSS puro, and JavaScript puro. The UI should feel like a serious terminal operations console rather than a marketing page.

The runtime selector is central. Claude Code workspaces spawn `claude --dangerously-skip-permissions`, use `CLAUDE.md`, and use `.claude/skills/`. Codex workspaces spawn `codex --approval-mode full-auto`, use `AGENTS.md`, and use `.codex/skills/`.

The home screen stores and displays workspaces, including colored runtime badges. The main screen contains workspace tabs, terminal panes, a mission launcher, a feed, map/files area, and a node panel with runtime/model controls.

## Constraints

- **Platform**: Windows desktop - required for the target workflow and native PowerShell TTS.
- **Stack**: Electron + Node.js + JavaScript puro - no TypeScript.
- **Terminal**: xterm.js + node-pty - panes must be real interactive terminals.
- **File watching**: chokidar - real-time project activity feed.
- **Runtime commands**: Claude Code and Codex must be spawned exactly according to workspace runtime.
- **Security**: Never display API keys or tokens; credentials stay in `.env` and are not committed.
- **Architecture**: `main.js` owns Electron window and IPC, `preload.js` is the only bridge, `src/` owns business logic, `renderer/` owns UI.
- **Process lifecycle**: active child processes are terminated gracefully on workspace runtime switch and app close.
- **Visual design**: dark terminal theme, Matrix background at low opacity, runtime badges, no framework dependency.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Runtime is selected per workspace | Different projects may work better with Claude Code or Codex | Pending |
| Runtime config lives in `src/runtimes.js` | Keeps orchestration agnostic and avoids hard-coded branching | Pending |
| JavaScript puro instead of TypeScript | Explicit PRD constraint and faster prototype path | Pending |
| Use node-pty for embedded terminals | Agents must run in real terminal processes | Pending |
| Keep both `CLAUDE.md` and `AGENTS.md` when switching runtimes | Preserves compatibility and avoids deleting user rules | Pending |
| Use PowerShell SpeechSynthesizer for TTS | Windows-native, zero external API dependency | Pending |
| Use local persistence in `%APPDATA%\swarm\workspaces.json` | Simple desktop persistence with no backend | Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? Move to Out of Scope with reason.
2. Requirements validated? Move to Validated with phase reference.
3. New requirements emerged? Add to Active.
4. Decisions to log? Add to Key Decisions.
5. "What This Is" still accurate? Update if drifted.

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections.
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state.

---
*Last updated: 2026-05-01 after initialization*
