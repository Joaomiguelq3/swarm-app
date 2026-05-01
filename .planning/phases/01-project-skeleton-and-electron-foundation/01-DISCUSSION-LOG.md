# Phase 1: Project Skeleton and Electron Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-05-01
**Phase:** 1-Project Skeleton and Electron Foundation
**Areas discussed:** Scaffold and dependencies, Electron setup, First screen

---

## Scaffold and Dependencies

| Option | Description | Selected |
|--------|-------------|----------|
| Scaffold + deps | Create `package.json`, configure Electron, and make `npm start` open the app in Phase 1. | yes |
| Structure only | Create files and folders only, leaving dependency install for later. | |

**User's choice:** Use the recommendation.
**Notes:** Phase 1 should leave a runnable Electron app, not only a static scaffold.

---

## Electron Setup

| Option | Description | Selected |
|--------|-------------|----------|
| Raw Electron | Minimal Electron scripts with no Forge/builder yet. | yes |
| Electron Forge | Use Forge from the beginning. | |
| electron-builder | Use builder from the beginning. | |

**User's choice:** Use the recommendation.
**Notes:** Packaging tools are deferred. The foundation should stay simple and explicit.

---

## First Screen

| Option | Description | Selected |
|--------|-------------|----------|
| Open `home.html` | Start on a minimal SWARM home placeholder. | yes |
| Diagnostic screen | Start on a technical status page. | |
| Placeholders only | Create home/workspace placeholders without committing to first route. | |

**User's choice:** Use the recommendation, with `home.html` as the first route and `workspace.html` placeholder created.
**Notes:** Full home visuals are Phase 4. Phase 1 only proves the shell and file boundaries.

---

## the agent's Discretion

- Exact module format and supporting npm scripts are left to the planner/executor.
- A tiny IPC smoke test is acceptable if it helps prove `preload.js`, but feature work should stay out of Phase 1.

## Deferred Ideas

- Packaging with Forge/builder.
- Full home screen visual treatment.
- Runtime orchestration, pty terminals, scout, sentinel, and TTS.
