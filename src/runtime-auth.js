'use strict';

const { spawn, spawnSync } = require('child_process');
const { RUNTIMES } = require('./runtimes');

function checkRuntime(runtimeId) {
  const runtime = RUNTIMES[runtimeId];
  if (!runtime) {
    return {
      runtime: runtimeId,
      available: false,
      status: 'missing',
      message: 'Runtime desconhecido'
    };
  }

  const result = spawnSync(runtime.cmd, ['--version'], {
    shell: true,
    encoding: 'utf8',
    timeout: 8000,
    windowsHide: true
  });

  const output = `${result.stdout || ''}${result.stderr || ''}`.trim();
  const ok = result.status === 0 && output.length > 0;

  return {
    runtime: runtimeId,
    label: runtime.label,
    available: ok,
    status: ok ? 'ready' : 'missing',
    message: ok ? output : `${runtime.label} nao encontrado no PATH. Instale primeiro.`
  };
}

function openRuntimeLogin(runtimeId) {
  const runtime = RUNTIMES[runtimeId];
  if (!runtime) {
    return { ok: false, error: 'Runtime desconhecido' };
  }

  try {
    return runtimeId === 'codex'
      ? loginCodexTerminal(runtime)
      : loginClaudeTerminal(runtime);
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function loginCodexTerminal(runtime) {
  const child = spawn('cmd.exe', ['/c', 'start', 'cmd', '/k', 'codex login'], {
    shell: false,
    detached: true,
    stdio: 'ignore',
    windowsHide: false
  });

  child.on('error', (error) => {
    console.error(`[LOGIN] erro ao abrir terminal codex: ${error.message}`);
  });
  child.unref();

  return {
    ok: true,
    runtime: runtime.id,
    label: runtime.label,
    message: 'Terminal aberto com "codex login". Siga as instrucoes: copie a URL, abra no browser e cole o codigo.'
  };
}

function loginClaudeTerminal(runtime) {
  const child = spawn('cmd.exe', ['/c', 'start', 'cmd', '/k', 'claude auth login'], {
    shell: false,
    detached: true,
    stdio: 'ignore',
    windowsHide: false
  });

  child.on('error', (error) => {
    console.error(`[LOGIN] erro ao abrir terminal claude: ${error.message}`);
  });
  child.unref();

  return {
    ok: true,
    runtime: runtime.id,
    label: runtime.label,
    message: 'Terminal aberto com "claude auth login". Siga as instrucoes no browser.'
  };
}

module.exports = {
  checkRuntime,
  openRuntimeLogin
};
