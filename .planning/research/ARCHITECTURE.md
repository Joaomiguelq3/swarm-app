# Architecture Research: SWARM

## Proposed Boundaries

```text
main.js
  Electron window lifecycle
  IPC registration
  Workspace persistence
  Process lifecycle ownership

preload.js
  Safe IPC bridge only

src/
  runtimes.js  Runtime metadata and spawn config
  scout.js     Project map and compact context
  sentinel.js  File watcher and change events
  tts.js       Windows speech
  swarm.js     Mission decomposition and agent orchestration

renderer/
  home.html
  workspace.html
  app.js
  style.css
```

## Event Flow

1. Renderer requests workspace list through preload IPC.
2. Main process reads `%APPDATA%\swarm\workspaces.json`.
3. User opens workspace.
4. Renderer sends mission, agent count, runtime, and model.
5. Main process calls `swarm.launch`.
6. `swarm.launch` calls scout, decomposes tasks, spawns node-pty processes, and emits events.
7. Main forwards events and terminal output to renderer.
8. Renderer updates panes, status dots, feed, timers, and file activity.

## Runtime Contract

`src/runtimes.js` should export:

```js
const RUNTIMES = {
  claude: {
    label: "CLAUDE CODE",
    cmd: "claude",
    args: ["--dangerously-skip-permissions"],
    rulesFile: "CLAUDE.md",
    skillsDir: ".claude/skills/",
    models: ["opus-4", "sonnet-4", "haiku"]
  },
  codex: {
    label: "CODEX",
    cmd: "codex",
    args: ["--approval-mode", "full-auto"],
    rulesFile: "AGENTS.md",
    skillsDir: ".codex/skills/",
    models: ["gpt-4o", "gpt-4.1", "o3", "o4-mini"]
  }
};
```

## Packaging Considerations

- Verify `node-pty` works in dev before packaging.
- Keep native module rebuild notes in project docs.
- Avoid introducing frontend frameworks until the app behavior is stable.
