# Pitfalls Research: SWARM

## Pitfall: Terminal Processes Outlive the App

- **Warning signs**: `claude`, `codex`, or shell processes remain after closing SWARM.
- **Prevention**: central process registry, graceful kill on app close, timeout fallback.
- **Phase**: Phase 2 and Phase 7.

## Pitfall: Renderer Gets Privileged Node Access

- **Warning signs**: renderer imports `fs`, `child_process`, or direct Node APIs.
- **Prevention**: `contextIsolation: true`, `nodeIntegration: false`, IPC through preload only.
- **Phase**: Phase 1.

## Pitfall: Agent File Conflicts

- **Warning signs**: multiple panes edit the same file, final output is inconsistent.
- **Prevention**: decomposition should prefer independent task areas; feed should show file writes quickly; later add conflict warnings.
- **Phase**: Phase 4 and Phase 6.

## Pitfall: Runtime Switch During Active Work

- **Warning signs**: stale terminals continue running after switching from Claude to Codex or vice versa.
- **Prevention**: runtime switch must call orchestrator stop, kill children, reset pane state, then update workspace config.
- **Phase**: Phase 5.

## Pitfall: node-pty Windows Installation Issues

- **Warning signs**: npm install succeeds but terminal pane cannot spawn; native module ABI errors.
- **Prevention**: test node-pty immediately after dependency install and keep Electron version pinned.
- **Phase**: Phase 1.

## Pitfall: Unsafe High-Trust Runtime Modes

- **Warning signs**: app launches agents without making danger mode visible.
- **Prevention**: visible danger toggle/state, runtime command display in node panel, document trust assumptions.
- **Phase**: Phase 5.
