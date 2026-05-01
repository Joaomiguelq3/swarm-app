# Stack Research: SWARM

## Selected Stack

- Electron for the Windows desktop shell.
- Node.js for process spawning, IPC, filesystem access, app data persistence, and orchestration.
- xterm.js for terminal rendering in the renderer.
- node-pty for real PTY-backed agent processes.
- chokidar for filesystem monitoring.
- PowerShell `System.Speech.Synthesis.SpeechSynthesizer` for native Windows TTS.
- CSS puro for the terminal dark theme.
- JavaScript puro, no TypeScript.

## Implementation Notes

- The Electron main process should own app lifecycle, BrowserWindow creation, workspace persistence, pty process creation, and IPC handlers.
- The renderer should never receive direct Node access. All privileged operations go through `preload.js`.
- `node-pty` may require native build support on Windows. Installation and packaging should be tested early.
- Runtime spawn commands must be isolated behind `src/runtimes.js` so the swarm orchestrator stays runtime-agnostic.
- Use `app.getPath("userData")` for `%APPDATA%\swarm` style persistence instead of hard-coded environment paths where possible.

## Risks

- `node-pty` native dependencies can fail if Node/Electron ABI versions are mismatched.
- Launching many AI agents in parallel can create API quota, rate limit, and file conflict issues.
- `--dangerously-skip-permissions` and `--approval-mode full-auto` are intentionally high-trust modes and need prominent danger controls.
