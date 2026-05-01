# Phase 4: Home UI and Visual System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-05-01
**Phase:** 4-Home UI and Visual System
**Areas discussed:** Home density, Workspace creation, Matrix background and typing logo, Empty/loading/error states

---

## Home Density

| Option | Description | Selected |
|--------|-------------|----------|
| Operational compact grid | Dense terminal console cards optimized for scanning saved workspaces. | yes |
| Large visual cards | More spacious, more branded, but less operational. | |
| Plain terminal list | Very dense, but weaker for runtime badges and metadata hierarchy. | |

**User's choice:** "pode usar as recomendações"
**Notes:** Use the recommended compact operational console direction.

---

## Workspace Creation

| Option | Description | Selected |
|--------|-------------|----------|
| Simple create flow | `+ novo workspace`, folder path, runtime, model default. | yes |
| Manual path modal only | Fast to implement but less polished as final UX. | |
| Configure later | Creates workspace first and pushes choices downstream. | |

**User's choice:** "pode usar as recomendações"
**Notes:** The UI should be structured for a native folder dialog later, but may use a manual fallback if needed.

---

## Matrix Background and Typing Logo

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle canvas texture | Matrix canvas at very low opacity; typing logo compact. | yes |
| Cinematic background | Stronger animation and more dramatic first viewport. | |
| Bare terminal UI | Minimal animation, mostly static. | |

**User's choice:** "pode usar as recomendações"
**Notes:** Keep the Home screen useful, not a marketing landing page.

---

## Empty, Loading, and Error States

| Option | Description | Selected |
|--------|-------------|----------|
| Functional inline states | Empty state points directly to `+ novo workspace`; errors appear inline. | yes |
| Branded empty page | More visual but less direct. | |
| Log-only feedback | Terminal-like but may be too terse for workspace creation errors. | |

**User's choice:** "pode usar as recomendações"
**Notes:** Use quiet terminal-style feedback.

## the agent's Discretion

- Exact CSS class names, animation timing, date formatting, and modal structure.
- Whether to include a lightweight renderer smoke test or manual Electron screenshot check in the plan.

## Deferred Ideas

- Main workspace cockpit and terminal panes.
- Runtime process restart behavior.
- Launch overlay and real swarm launch animation.
- Richer native folder picker if Phase 4 uses a simple manual fallback first.
