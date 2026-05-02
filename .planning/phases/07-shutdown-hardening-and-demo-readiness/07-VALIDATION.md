---
phase: 7
slug: shutdown-hardening-and-demo-readiness
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-01
---

# Phase 7 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node smoke scripts |
| **Config file** | `package.json` |
| **Quick run command** | `npm.cmd run smoke:shutdown-lifecycle` or `npm.cmd run smoke:stop-ui` |
| **Full suite command** | `npm.cmd run smoke:phase7` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run the plan-specific smoke or `node --check` command listed in that task.
- **After every plan wave:** Run `npm.cmd run check`.
- **Before `$gsd-verify-work`:** Run `npm.cmd run smoke:phase7`.
- **Max feedback latency:** 30 seconds for automated checks.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | SWM-07, PRS-02 | cleanup duplicate/hang | Stop is idempotent and bounded | smoke | `npm.cmd run smoke:shutdown-lifecycle` | yes | pending |
| 07-02-01 | 02 | 2 | SWM-07 | unsafe UI stop/error | Stop uses preload API and errors are safe | smoke | `npm.cmd run smoke:stop-ui` | yes | pending |
| 07-03-01 | 03 | 3 | PRS-02 | demo environment ambiguity | Preflight is explicit and separate from check | static/syntax | `node --check scripts/demo-preflight.js` | yes | pending |
| 07-04-01 | 04 | 4 | SWM-07, PRS-02 | verification overclaim | Automated/manual evidence separated | aggregate | `npm.cmd run smoke:phase7` | yes | pending |

---

## Wave 0 Requirements

Existing Node smoke infrastructure covers this phase. No separate Wave 0 setup is required.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Claude Code demo mission | Demo readiness | Requires installed CLI, credentials, and network | Follow `docs/demo-runbook.md` after `npm.cmd run demo:preflight` |
| Codex demo mission | Demo readiness | Requires installed CLI, credentials, and network | Follow `docs/demo-runbook.md` after `npm.cmd run demo:preflight` |

---

## Validation Sign-Off

- [x] All tasks have automated verify or explicit manual-only boundary.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency target under 30s.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** pending execution
