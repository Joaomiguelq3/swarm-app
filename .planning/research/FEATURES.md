# Feature Research: SWARM

## Table Stakes

### Workspace Management

- Create workspace from folder picker.
- Save workspace name, path, runtime, model, and last access.
- Reopen recent workspaces.
- Show runtime badge on each workspace card.

### Runtime Management

- Support Claude Code and Codex.
- Runtime is selected per workspace.
- Runtime switch kills active processes and restarts the workspace runtime context.
- Model dropdown changes by runtime.

### Terminal Orchestration

- Multiple panes with real terminal sessions.
- Agent status per pane: IDLE, THINKING, WRITING, DONE, ERROR.
- Mission input and launch button.
- Agent count control.
- Runtime badge per pane.

### Project Intelligence

- Scout maps project files and extracts compact context.
- Sentinel watches file creation, modification, and deletion.
- Feed displays project and agent events in real time.
- `brain.json` stores lightweight cross-session context.

### Windows Experience

- Native TTS announcements.
- Graceful process cleanup on app close.
- Dark terminal UI that works on desktop presentations.

## Differentiators

- Same app can run Claude Code or Codex per workspace.
- UI shows multiple agent panes side by side rather than hiding output.
- Launch animation makes the swarm event obvious for demos.
- Runtime-specific rules files are generated automatically.

## Deferred Ideas

- Mixed runtime execution in a single launch can be deferred until same-runtime parallel execution is stable.
- Cloud sync, team workspaces, and remote workers are later milestones.
