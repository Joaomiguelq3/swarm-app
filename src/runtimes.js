const RUNTIMES = {
  claude: {
    id: 'claude',
    label: 'CLAUDE CODE',
    cmd: 'claude',
    args: ['--dangerously-skip-permissions'],
    rulesFile: 'CLAUDE.md',
    skillsDir: '.claude/skills/',
    models: ['opus-4', 'sonnet-4', 'haiku'],
    badge: {
      className: 'badge-claude',
      color: '#aa66ff'
    }
  },
  codex: {
    id: 'codex',
    label: 'CODEX',
    cmd: 'codex',
    args: ['--approval-mode', 'full-auto'],
    rulesFile: 'AGENTS.md',
    skillsDir: '.codex/skills/',
    models: ['gpt-4o', 'gpt-4.1', 'o3', 'o4-mini'],
    badge: {
      className: 'badge-codex',
      color: '#00ff88'
    }
  }
};

function getRuntime(runtimeId) {
  const runtime = RUNTIMES[runtimeId];
  if (!runtime) {
    throw new Error(`Unknown runtime: ${runtimeId}`);
  }
  return runtime;
}

function listRuntimes() {
  return Object.values(RUNTIMES);
}

module.exports = {
  RUNTIMES,
  getRuntime,
  listRuntimes
};
