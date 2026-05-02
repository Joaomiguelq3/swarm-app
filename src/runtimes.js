const RUNTIMES = {
  claude: {
    id: 'claude',
    label: 'CLAUDE CODE',
    cmd: 'claude',
    args: ['--dangerously-skip-permissions'],
    authArgs: [],
    rulesFile: 'CLAUDE.md',
    skillsDir: '.claude/skills/',
    models: [
      {
        id: 'claude-opus-4-7',
        label: 'Claude Opus 4.7',
        desc: 'Flagship - tasks complexas e arquitetura',
        tier: 'opus'
      },
      {
        id: 'claude-sonnet-4-6',
        label: 'Claude Sonnet 4.6',
        desc: 'Melhor custo-beneficio - uso geral',
        tier: 'sonnet'
      },
      {
        id: 'claude-haiku-4-5-20251001',
        label: 'Claude Haiku 4.5',
        desc: 'Rapido e barato - decomposicao e tasks simples',
        tier: 'haiku'
      }
    ],
    defaultModel: 'claude-sonnet-4-6',
    decompositionModel: 'claude-haiku-4-5-20251001',
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
    authArgs: ['app'],
    rulesFile: 'AGENTS.md',
    skillsDir: '.codex/skills/',
    models: [
      {
        id: 'gpt-5.5',
        label: 'GPT-5.5',
        desc: 'Flagship - melhor para coding complexo e agentic workflows',
        tier: 'flagship'
      },
      {
        id: 'gpt-5.4',
        label: 'GPT-5.4',
        desc: 'Fallback se gpt-5.5 nao disponivel',
        tier: 'standard'
      },
      {
        id: 'gpt-5.4-mini',
        label: 'GPT-5.4 Mini',
        desc: 'Rapido e economico - subagentes e tasks leves',
        tier: 'mini'
      },
      {
        id: 'gpt-5.3-codex',
        label: 'GPT-5.3 Codex',
        desc: 'Especializado em coding',
        tier: 'codex'
      }
    ],
    defaultModel: 'gpt-5.5',
    decompositionModel: 'gpt-5.4-mini',
    badge: {
      className: 'badge-codex',
      color: '#00ff88'
    }
  }
};

if (process.platform === 'win32') {
  RUNTIMES.codex.cmd = 'codex.cmd';
  RUNTIMES.codex.args = [
    '--dangerously-bypass-approvals-and-sandbox',
    '--no-alt-screen'
  ];
}

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

function getModelId(model) {
  return typeof model === 'string' ? model : model?.id;
}

function getModelIds(runtime) {
  return Array.isArray(runtime.models) ? runtime.models.map(getModelId).filter(Boolean) : [];
}

function getDefaultModel(runtime) {
  return runtime.defaultModel || getModelIds(runtime)[0] || 'default';
}

module.exports = {
  RUNTIMES,
  getRuntime,
  listRuntimes,
  getModelId,
  getModelIds,
  getDefaultModel
};
