const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { CHANNELS, registerWorkspaceIpc } = require('../src/workspace-ipc');

function makeTempDir(name) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `swarm-${name}-`));
}

function createFakeIpcMain() {
  const handlers = new Map();
  return {
    handlers,
    handle(channel, handler) {
      if (handlers.has(channel)) {
        throw new Error(`Duplicate IPC handler: ${channel}`);
      }
      handlers.set(channel, handler);
    },
    invoke(channel, payload) {
      const handler = handlers.get(channel);
      if (!handler) {
        throw new Error(`Missing IPC handler: ${channel}`);
      }
      return handler({}, payload);
    }
  };
}

async function main() {
  const appDataPath = makeTempDir('ipc-appdata');
  const workspacePath = makeTempDir('ipc-workspace');
  const ipcMain = createFakeIpcMain();
  const app = {
    getPath(name) {
      assert.strictEqual(name, 'userData');
      return appDataPath;
    }
  };

  registerWorkspaceIpc({ ipcMain, app });

  for (const channel of Object.values(CHANNELS)) {
    assert.ok(ipcMain.handlers.has(channel), `Expected channel ${channel}`);
  }

  const created = await ipcMain.invoke(CHANNELS.create, {
    path: workspacePath,
    runtime: 'codex'
  });

  assert.strictEqual(created.workspace.runtime, 'codex');
  assert.strictEqual(created.workspace.model, 'gpt-4o');

  const listed = await ipcMain.invoke(CHANNELS.list);
  assert.strictEqual(listed.length, 1);
  assert.strictEqual(listed[0].id, created.workspace.id);

  const modelUpdated = await ipcMain.invoke(CHANNELS.updateModel, {
    id: created.workspace.id,
    model: 'gpt-4.1'
  });
  assert.strictEqual(modelUpdated.workspace.model, 'gpt-4.1');

  const runtimeUpdated = await ipcMain.invoke(CHANNELS.updateRuntime, {
    id: created.workspace.id,
    runtime: 'claude',
    model: 'sonnet-4'
  });
  assert.strictEqual(runtimeUpdated.workspace.runtime, 'claude');
  assert.strictEqual(runtimeUpdated.workspace.model, 'sonnet-4');
  assert.ok(fs.existsSync(path.join(workspacePath, 'CLAUDE.md')));
  assert.ok(fs.existsSync(path.join(workspacePath, 'AGENTS.md')));

  const touched = await ipcMain.invoke(CHANNELS.touch, {
    id: created.workspace.id
  });
  assert.ok(touched.workspace.lastAccess);

  console.log('smoke-workspace-ipc ok');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
