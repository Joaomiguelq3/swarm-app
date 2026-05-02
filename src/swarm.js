const { EventEmitter } = require('events');
const nodePty = require('node-pty');
const { scoutProject } = require('./scout');
const { getDefaultModel, getRuntime } = require('./runtimes');

const STATUS = {
  IDLE: 'IDLE',
  THINKING: 'THINKING',
  WRITING: 'WRITING',
  DONE: 'DONE',
  ERROR: 'ERROR'
};

function clampAgentCount(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return 3;
  }
  return Math.min(6, Math.max(1, parsed));
}

function normalizeMission(value) {
  return String(value || '').trim();
}

function decomposeMission(input = {}) {
  const mission = normalizeMission(input.mission);
  const agentCount = clampAgentCount(input.agentCount);
  const runtime = input.runtime || 'runtime';
  const model = input.model || 'default';
  const scoutContext = input.scoutContext || 'Contexto do projeto indisponivel.';

  return Array.from({ length: agentCount }, (_, index) => {
    const agentId = index + 1;
    const isProjectLead = agentId === 1;
    return {
      id: `agent-${agentId}`,
      paneId: agentId,
      title: isProjectLead
        ? 'Terminal 1: novo projeto'
        : `Terminal ${agentId}: livre`,
      prompt: isProjectLead
        ? [
            mission,
            '',
            `Runtime: ${runtime}`,
            `Modelo: ${model}`,
            'Voce e o terminal responsavel por iniciar o novo projeto.',
            'Use os outros terminais apenas como apoio independente quando o usuario pedir.',
            '',
            'Contexto do projeto:',
            scoutContext
          ].join('\n')
        : ''
    };
  });
}

function quoteCmdArg(value) {
  const text = String(value || '');
  if (/^[a-zA-Z0-9_./:=+-]+$/.test(text)) {
    return text;
  }
  return `"${text.replace(/"/g, '\\"')}"`;
}

function getPtyCommand(runtime) {
  if (process.platform !== 'win32') {
    return {
      cmd: runtime.cmd,
      args: runtime.args
    };
  }

  const runtimeCommand = [runtime.cmd, ...(runtime.args || [])]
    .map(quoteCmdArg)
    .join(' ');

  return {
    cmd: 'cmd.exe',
    args: ['/d', '/s', '/k', runtimeCommand]
  };
}

function defaultSpawnAdapter({ runtime, cwd }) {
  const command = getPtyCommand(runtime);
  const pty = nodePty.spawn(command.cmd, command.args, {
    cwd,
    env: process.env,
    name: 'xterm-color',
    cols: 120,
    rows: 30
  });

  return {
    write: (data) => pty.write(data),
    kill: () => pty.kill(),
    resize: (cols, rows) => pty.resize(cols, rows),
    onData: (listener) => pty.onData(listener),
    onExit: (listener) => pty.onExit(listener)
  };
}

function createSwarm(options = {}) {
  const emitter = new EventEmitter();
  const spawnAdapter = options.spawnAdapter || defaultSpawnAdapter;
  const scout = options.scout || scoutProject;
  const now = options.now || (() => new Date().toISOString());
  const processes = new Map();
  const paneProcesses = new Map();
  let activeMission = null;
  let stopping = false;

  function emit(event) {
    emitter.emit('event', {
      timestamp: now(),
      ...event
    });
  }

  function getExitCode(exit) {
    if (typeof exit === 'number') {
      return exit;
    }
    if (exit && typeof exit.exitCode === 'number') {
      return exit.exitCode;
    }
    return 0;
  }

  function markAgentExit(missionId, agentId, paneId, exit) {
    const code = getExitCode(exit);
    const status = code === 0 ? STATUS.DONE : STATUS.ERROR;
    const mission = activeMission;
    processes.delete(agentId);
    paneProcesses.delete(Number(paneId));

    if (mission) {
      mission.completed += 1;
      if (status === STATUS.ERROR) {
        mission.errors += 1;
      }
    }

    emit({
      type: 'agent:exit',
      missionId,
      agentId,
      paneId,
      status,
      exitCode: code,
      message: status === STATUS.DONE
        ? `Terminal ${paneId} concluido.`
        : `Terminal ${paneId} falhou com codigo ${code}.`
    });

    if (mission && mission.completed >= mission.total) {
      const missionStatus = mission.errors === 0 ? STATUS.DONE : STATUS.ERROR;
      emit({
        type: 'mission:done',
        missionId,
        status: missionStatus,
        message: missionStatus === STATUS.DONE
          ? 'Terminais concluidos.'
          : `Terminais concluidos com ${mission.errors} erro(s).`
      });
      activeMission = null;
    }
  }

  function launch(input = {}) {
    const mission = normalizeMission(input.mission);
    if (!mission) {
      throw new Error('Missao obrigatoria.');
    }

    const workspace = input.workspace || {};
    const workspacePath = input.workspacePath || workspace.path || input.path;
    if (!workspacePath) {
      throw new Error('Workspace path obrigatorio.');
    }

    if (activeMission) {
      stop('restart');
    }
    stopping = false;

    const runtimeId = input.runtime || workspace.runtime || 'codex';
    const runtime = input.runtimeConfig || options.runtime || getRuntime(runtimeId);
    const model = input.model || workspace.model || getDefaultModel(runtime);
    const decompositionModel = runtime.decompositionModel || getDefaultModel(runtime);
    const agentCount = clampAgentCount(input.agentCount);
    const missionId = `mission-${Date.now()}`;
    const scoutResult = scout(workspacePath);
    const scoutContext = scoutResult && scoutResult.context ? scoutResult.context : String(scoutResult || '');
    const tasks = decomposeMission({
      mission,
      agentCount,
      runtime: runtime.id || runtimeId,
      model,
      decompositionModel,
      scoutContext
    });

    activeMission = {
      id: missionId,
      total: tasks.length,
      completed: 0,
      errors: 0
    };

    emit({
      type: 'mission:start',
      missionId,
      status: STATUS.THINKING,
      mission,
      runtime: runtime.id || runtimeId,
      model,
      decompositionModel,
      tasks,
      message: `AVANT IA iniciado com ${runtime.label || runtime.id || runtimeId}.`
    });

    for (const task of tasks) {
      const agentId = task.id;
      emit({
        type: 'agent:start',
        missionId,
        agentId,
        paneId: task.paneId,
        status: STATUS.THINKING,
        task,
        message: `${task.title} iniciado.`
      });

      try {
        const child = spawnAdapter({
          runtime,
          cwd: workspacePath,
          task,
          paneId: task.paneId,
          missionId
        });
        processes.set(agentId, child);
        paneProcesses.set(Number(task.paneId), child);

        child.onData((output) => {
          emit({
            type: 'agent:output',
            missionId,
            agentId,
            paneId: task.paneId,
            status: STATUS.WRITING,
            output: String(output),
            message: `${task.title} escrevendo.`
          });
        });

        child.onExit((exit) => markAgentExit(missionId, agentId, task.paneId, exit));
        if (task.prompt) {
          child.write(`${task.prompt}\r`);
        }
      } catch (error) {
        emit({
          type: 'agent:error',
          missionId,
          agentId,
          paneId: task.paneId,
          status: STATUS.ERROR,
          error: error.message,
        message: `Erro ao iniciar ${task.title}: ${error.message}`
        });
        markAgentExit(missionId, agentId, task.paneId, { exitCode: 1 });
      }
    }

    return {
      ok: true,
      missionId,
      tasks,
      runtime: runtime.id || runtimeId,
      model
    };
  }

  function stop(reason = 'stop') {
    if (stopping || (!activeMission && processes.size === 0)) {
      return { ok: true, stopped: false, reason };
    }

    stopping = true;
    const missionId = activeMission ? activeMission.id : null;
    const children = Array.from(processes.entries());
    processes.clear();
    paneProcesses.clear();

    for (const [agentId, child] of children) {
      try {
        child.kill();
      } catch (error) {
        emit({
          type: 'agent:error',
          agentId,
          status: STATUS.ERROR,
          error: error.message,
        message: `Erro ao parar ${agentId}: ${error.message}`
        });
      }
    }

    if (activeMission) {
      emit({
        type: 'mission:stop',
        missionId,
        status: STATUS.IDLE,
        reason,
        message: `Terminais parados: ${reason}.`
      });
      activeMission = null;
    }

    stopping = false;
    return { ok: true, stopped: true, reason };
  }

  return {
    launch,
    stop,
    writeToPane(paneId, data) {
      const child = paneProcesses.get(Number(paneId));
      if (!child || typeof child.write !== 'function') {
        return { ok: false, error: `Terminal ${paneId} nao esta ativo.` };
      }
      child.write(String(data || ''));
      return { ok: true };
    },
    resizePane(paneId, cols, rows) {
      const child = paneProcesses.get(Number(paneId));
      if (!child || typeof child.resize !== 'function') {
        return { ok: false, error: `Terminal ${paneId} nao esta ativo.` };
      }
      const safeCols = Math.min(240, Math.max(40, Number.parseInt(cols, 10) || 120));
      const safeRows = Math.min(80, Math.max(12, Number.parseInt(rows, 10) || 30));
      child.resize(safeCols, safeRows);
      return { ok: true, cols: safeCols, rows: safeRows };
    },
    onEvent(listener) {
      emitter.on('event', listener);
      return () => emitter.off('event', listener);
    }
  };
}

module.exports = {
  STATUS,
  clampAgentCount,
  decomposeMission,
  createSwarm
};
