# Requirements: SWARM - Multi-Agent Orchestrator

**Defined:** 2026-05-01
**Core Value:** One developer can launch and supervise multiple independent AI coding tasks in parallel, with clear runtime choice, live terminal visibility, file-change awareness, and graceful process control.

## v1 Requirements

### Workspace

- [ ] **WRK-01**: User can create a workspace by selecting a local folder.
- [ ] **WRK-02**: User can choose Claude Code or Codex when creating a workspace.
- [ ] **WRK-03**: User can reopen saved workspaces from `%APPDATA%\swarm\workspaces.json`.
- [ ] **WRK-04**: Workspace cards show project name, path, runtime badge, model, and last access date.
- [ ] **WRK-05**: User can switch between saved workspaces from the main UI.

### Runtime

- [ ] **RUN-01**: SWARM spawns Claude Code with `claude --dangerously-skip-permissions`.
- [ ] **RUN-02**: SWARM spawns Codex with `codex --approval-mode full-auto`.
- [ ] **RUN-03**: SWARM stores runtime and model per workspace.
- [ ] **RUN-04**: User can switch the current workspace runtime from the node panel.
- [ ] **RUN-05**: Runtime switch kills active processes before applying the new runtime.
- [ ] **RUN-06**: Claude workspaces create or preserve `CLAUDE.md`.
- [ ] **RUN-07**: Codex workspaces create or preserve `AGENTS.md`.
- [ ] **RUN-08**: Model dropdown options change according to selected runtime.

### Terminal Panes

- [ ] **TRM-01**: User can see multiple terminal panes in the main workspace screen.
- [ ] **TRM-02**: Each pane renders a real interactive terminal using xterm.js and node-pty.
- [ ] **TRM-03**: Each pane shows runtime indicator and status.
- [ ] **TRM-04**: Pane status can display IDLE, THINKING, WRITING, DONE, and ERROR.
- [ ] **TRM-05**: Terminal output streams live from each agent process.

### Swarm Orchestration

- [ ] **SWM-01**: User can enter a mission and select agent count.
- [ ] **SWM-02**: SWARM scouts the project before launching agents.
- [ ] **SWM-03**: SWARM decomposes the mission into independent tasks.
- [ ] **SWM-04**: SWARM spawns multiple runtime processes in parallel.
- [ ] **SWM-05**: Each spawned process receives its own task and project context.
- [ ] **SWM-06**: SWARM emits agent lifecycle events through IPC.
- [ ] **SWM-07**: SWARM can stop all active agents gracefully.

### File Monitoring

- [ ] **FIL-01**: SWARM maps the project while ignoring `node_modules`, `.git`, `dist`, `build`, `.next`, `__pycache__`, and `venv`.
- [ ] **FIL-02**: Scout captures compact context including first lines from important files.
- [ ] **FIL-03**: Sentinel detects file creation, modification, and removal.
- [ ] **FIL-04**: File events are shown in the shared activity feed.

### User Interface

- [ ] **UI-01**: Home screen shows SWARM logo with typing animation.
- [ ] **UI-02**: Home screen renders low-opacity Matrix character rain.
- [ ] **UI-03**: Main screen renders workspace tabs, terminal panes, mission bar, feed, map/files area, and node panel.
- [ ] **UI-04**: Claude Code badges use purple styling.
- [ ] **UI-05**: Codex badges use green styling.
- [ ] **UI-06**: Launch overlay shows runtime badge, task typing animation, pane glow, and fade out.
- [ ] **UI-07**: UI uses dark terminal theme with CSS puro.

### TTS and Persistence

- [ ] **TTS-01**: SWARM announces swarm start with selected runtime and agent count.
- [ ] **TTS-02**: SWARM announces agent completion and errors.
- [ ] **TTS-03**: SWARM announces mission completion.
- [ ] **PRS-01**: SWARM writes `brain.json` in each project root.
- [ ] **PRS-02**: SWARM kills child processes gracefully when closing the app.

## v2 Requirements

### Advanced Orchestration

- **ADV-01**: User can run mixed Claude Code and Codex agents in a single swarm launch.
- **ADV-02**: SWARM detects likely file conflicts before agents overwrite each other.
- **ADV-03**: SWARM supports remote workers.
- **ADV-04**: SWARM provides richer task dependency visualization.

## Out of Scope

| Feature | Reason |
|---------|--------|
| SaaS backend | v1 is a local desktop tool |
| TypeScript migration | PRD explicitly requires JavaScript puro |
| External voice APIs | Windows native TTS is enough for v1 |
| Team accounts | Single local developer workflow first |
| Mobile app | Not relevant to terminal orchestration |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| WRK-01 | Phase 3 | Pending |
| WRK-02 | Phase 3 | Pending |
| WRK-03 | Phase 3 | Pending |
| WRK-04 | Phase 4 | Pending |
| WRK-05 | Phase 5 | Pending |
| RUN-01 | Phase 2 | Pending |
| RUN-02 | Phase 2 | Pending |
| RUN-03 | Phase 3 | Pending |
| RUN-04 | Phase 5 | Pending |
| RUN-05 | Phase 5 | Pending |
| RUN-06 | Phase 2 | Pending |
| RUN-07 | Phase 2 | Pending |
| RUN-08 | Phase 5 | Pending |
| TRM-01 | Phase 4 | Pending |
| TRM-02 | Phase 2 | Pending |
| TRM-03 | Phase 4 | Pending |
| TRM-04 | Phase 6 | Pending |
| TRM-05 | Phase 2 | Pending |
| SWM-01 | Phase 6 | Pending |
| SWM-02 | Phase 2 | Pending |
| SWM-03 | Phase 6 | Pending |
| SWM-04 | Phase 6 | Pending |
| SWM-05 | Phase 6 | Pending |
| SWM-06 | Phase 6 | Pending |
| SWM-07 | Phase 7 | Pending |
| FIL-01 | Phase 2 | Pending |
| FIL-02 | Phase 2 | Pending |
| FIL-03 | Phase 2 | Pending |
| FIL-04 | Phase 6 | Pending |
| UI-01 | Phase 4 | Pending |
| UI-02 | Phase 4 | Pending |
| UI-03 | Phase 5 | Pending |
| UI-04 | Phase 4 | Pending |
| UI-05 | Phase 4 | Pending |
| UI-06 | Phase 6 | Pending |
| UI-07 | Phase 4 | Pending |
| TTS-01 | Phase 2 | Pending |
| TTS-02 | Phase 6 | Pending |
| TTS-03 | Phase 6 | Pending |
| PRS-01 | Phase 3 | Pending |
| PRS-02 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 40
- Unmapped: 0

---
*Requirements defined: 2026-05-01*
*Last updated: 2026-05-01 after initial definition*
