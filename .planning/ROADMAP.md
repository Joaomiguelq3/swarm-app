# Roadmap: SWARM - Multi-Agent Orchestrator

**Created:** 2026-05-01
**Mode:** standard
**Execution:** parallel where independent

## Overview

7 phases | 40 v1 requirements mapped | All v1 requirements covered

| # | Phase | Goal | Requirements | UI hint |
|---|-------|------|--------------|---------|
| 1 | Project Skeleton and Electron Foundation | Create the runnable Electron app foundation with secure IPC boundaries | Foundation | yes |
| 2 | Runtime, Scout, Sentinel, TTS, and Terminal Core | Prove the local systems that make SWARM real: pty terminals, runtime config, project scout, file watcher, and speech | RUN-01, RUN-02, RUN-06, RUN-07, TRM-02, TRM-05, FIL-01, FIL-02, FIL-03, TTS-01 | no |
| 3 | Workspace Persistence and Rules Generation | Build workspace creation, persistence, brain file, runtime/model storage, and rules-file generation | WRK-01, WRK-02, WRK-03, RUN-03, PRS-01 | yes |
| 4 | Home UI and Visual System | Build the home selector, runtime badges, Matrix background, and base terminal visual system | WRK-04, UI-01, UI-02, UI-04, UI-05, UI-07 | yes |
| 5 | Main Workspace UI and Runtime Switching | Build the main multi-pane layout, node panel, workspace tabs, model dropdown, and runtime switching lifecycle | WRK-05, RUN-04, RUN-05, RUN-08, TRM-01, TRM-03, UI-03 | yes |
| 6 | Swarm Launch and Live Orchestration | Connect mission launch, decomposition, parallel agent spawn, pane statuses, feed, launch animation, and TTS lifecycle | TRM-04, SWM-01, SWM-02, SWM-03, SWM-04, SWM-05, SWM-06, FIL-04, UI-06, TTS-02, TTS-03 | yes |
| 7 | Shutdown, Hardening, and Demo Readiness | Ensure process cleanup, error handling, demo flows, and end-to-end verification for Claude Code and Codex | SWM-07, PRS-02 | no |

## Phase Details

### Phase 1: Project Skeleton and Electron Foundation

**Goal:** Create a runnable Electron desktop app with strict process boundaries and the file structure required by the PRD.

**Plans:**

| Plan | Wave | Objective | Status |
|------|------|-----------|--------|
| 01-01 | 1 | Electron foundation scaffold | Complete |

**Success criteria:**
1. `npm start` opens an Electron window without runtime errors.
2. `main.js`, `preload.js`, `renderer/`, and `src/` exist with the intended responsibilities.
3. Electron security settings use context isolation and no renderer Node integration.
4. `.gitignore`, `.env`, `brain.json`, `CLAUDE.md`, and `AGENTS.md` exist.

**Status:** Complete on 2026-05-01.

### Phase 2: Runtime, Scout, Sentinel, TTS, and Terminal Core

**Goal:** Implement and test the core local capabilities before building complex UI.

**Requirements:** RUN-01, RUN-02, RUN-06, RUN-07, TRM-02, TRM-05, FIL-01, FIL-02, FIL-03, TTS-01

**Plans:**

| Plan | Wave | Objective | Status |
|------|------|-----------|--------|
| 02-01 | 1 | Dependencies and runtime config | Complete |
| 02-02 | 2 | Project scout module | Complete |
| 02-03 | 2 | Sentinel watcher and TTS modules | Complete |
| 02-04 | 3 | PTY smoke and phase verification | Complete |

**Success criteria:**
1. `src/runtimes.js` exports Claude Code and Codex runtime definitions.
2. `src/tts.js` can speak "SWARM inicializado" on Windows.
3. `src/scout.js` maps a folder while ignoring configured directories.
4. `src/sentinel.js` emits create/change/delete events.
5. A test pty process can stream output into a terminal surface.

**Status:** Complete on 2026-05-01.

### Phase 3: Workspace Persistence and Rules Generation

**Goal:** Persist workspaces and generate runtime-specific project files.

**Requirements:** WRK-01, WRK-02, WRK-03, RUN-03, PRS-01

**Success criteria:**
1. Workspaces are saved and loaded from the app data location.
2. Workspace records include id, name, path, runtime, model, and lastAccess.
3. New workspace flow creates `brain.json`.
4. New workspace flow creates `CLAUDE.md` or `AGENTS.md` according to runtime.
5. Switching runtime creates the other rules file without deleting the existing one.

### Phase 4: Home UI and Visual System

**Goal:** Build the first-screen workspace selector and reusable visual language.

**Requirements:** WRK-04, UI-01, UI-02, UI-04, UI-05, UI-07

**Success criteria:**
1. Home screen shows SWARM typing logo.
2. Home screen renders low-opacity Matrix rain.
3. Workspace cards show name, path, runtime badge, model, and date.
4. Claude Code badge is purple and Codex badge is green.
5. CSS variables implement the terminal dark theme.

### Phase 5: Main Workspace UI and Runtime Switching

**Goal:** Build the operational cockpit for one workspace.

**Requirements:** WRK-05, RUN-04, RUN-05, RUN-08, TRM-01, TRM-03, UI-03

**Success criteria:**
1. Main screen contains workspace tabs, terminal panes, mission bar, feed, map/files area, and node panel.
2. Runtime dropdown updates workspace config.
3. Model dropdown changes options based on selected runtime.
4. Runtime switch stops active processes before applying the new runtime.
5. Panes show runtime indicators.

### Phase 6: Swarm Launch and Live Orchestration

**Goal:** Make the core product workflow work end to end.

**Requirements:** TRM-04, SWM-01, SWM-02, SWM-03, SWM-04, SWM-05, SWM-06, FIL-04, UI-06, TTS-02, TTS-03

**Success criteria:**
1. User can enter a mission and launch N agents.
2. Scout context is included before launch.
3. Mission is decomposed into N task prompts.
4. N runtime processes spawn in parallel.
5. Pane statuses update through lifecycle events.
6. File events and agent events appear in the feed.
7. Launch overlay displays runtime badge and task animation.
8. TTS announces agent completion, errors, and mission completion.

### Phase 7: Shutdown, Hardening, and Demo Readiness

**Goal:** Make the app reliable enough for a live demo.

**Requirements:** SWM-07, PRS-02

**Success criteria:**
1. Closing the app gracefully kills child processes.
2. Stop-all action terminates active agents and resets pane state.
3. Claude Code demo flow runs once end to end.
4. Codex demo flow runs once end to end.
5. Errors are visible in pane/feed without crashing Electron.

## Next Step

Run `$gsd-discuss-phase 1` to gather implementation context for Phase 1, or `$gsd-plan-phase 1 --skip-research` if the foundation decisions are already locked.
