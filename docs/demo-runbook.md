# SWARM Demo Runbook

## Boundary

Automated smoke tests validate SWARM orchestration with fake runtimes. Real Claude Code and Codex rehearsal depends on local CLI installs, credentials, network, and the selected demo workspaces. Record real rehearsal results manually in Phase 7 verification.

Keep generated demo projects outside this SWARM repo by default.

## Preflight

Run from the SWARM repo:

```powershell
npm.cmd run check
npm.cmd run demo:preflight
```

Expected:

- `check` passes without requiring real Claude Code or Codex.
- `demo:preflight` reports versions for both `CLAUDE CODE` and `CODEX`.
- `.env` contains valid credentials, but the demo output must never display keys.

## Claude Code Demo

Workspace:

- Name: `demo-api`
- Runtime: `CLAUDE CODE`
- Suggested location: outside this repo, for example `C:\tmp\swarm-demo\demo-api`

Mission:

```text
crie autenticacao completa com login, registro, JWT e testes
```

Expected UI signals:

- Workspace card and pane badges show `CLAUDE CODE` in purple.
- Launch overlay shows the Claude Code badge and task list.
- Panes move from `THINKING` to `WRITING`, then `DONE` or visible `ERROR`.
- Feed shows mission start, agent lifecycle, and file events.
- TTS announces start/completion if Windows speech is available.
- `STOP SWARM` is enabled while agents are active and returns panes to `IDLE` when used.

Result notes:

- Date/time:
- Passed:
- Files changed:
- Issues observed:

## Codex Demo

Workspace:

- Name: `demo-frontend`
- Runtime: `CODEX`
- Suggested location: outside this repo, for example `C:\tmp\swarm-demo\demo-frontend`

Mission:

```text
crie um dashboard React com 3 componentes e estilo dark mode
```

Expected UI signals:

- Workspace card and pane badges show `CODEX` in green.
- Launch overlay shows the Codex badge and task list.
- Panes stream output and update statuses.
- Feed shows mission start, agent lifecycle, and file events.
- Errors are visible in pane/feed without crashing the app.
- `STOP SWARM` works during active execution.

Result notes:

- Date/time:
- Passed:
- Files changed:
- Issues observed:

## Recovery Checklist

- If `demo:preflight` fails, fix the missing CLI before rehearsal.
- If a runtime spawn fails in the app, confirm the feed shows a safe operational error.
- If a mission runs too long, click `STOP SWARM` and confirm the feed records the stop.
- If closing the app during active agents, confirm child processes are not left running.
