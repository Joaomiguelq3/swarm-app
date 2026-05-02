---
status: ready
phase: 7-shutdown-hardening-and-demo-readiness
source:
  - 07-VERIFICATION.md
started: 2026-05-01
updated: 2026-05-02
---

# Phase 7 Human UAT

## Current Test

`npm.cmd run demo:preflight` passed outside the sandbox on 2026-05-02. Manual Claude Code and Codex app rehearsal is ready.

## Tests

### 1. Claude Code demo mission

expected: Follow `docs/demo-runbook.md` and complete the Claude Code mission with visible runtime badge, pane status changes, feed events, TTS if available, and working `STOP SWARM`.
result: pending

### 2. Codex demo mission

expected: Follow `docs/demo-runbook.md` and complete the Codex mission with visible runtime badge, pane status changes, feed events, safe error handling, and working `STOP SWARM`.
result: pending

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps

- Manual app rehearsal still needs to be performed and recorded.
