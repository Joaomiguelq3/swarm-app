const assert = require('assert');
const fs = require('fs');

const main = fs.readFileSync('main.js', 'utf8');
const preload = fs.readFileSync('preload.js', 'utf8');
const renderer = fs.readFileSync('renderer/app.js', 'utf8');
const updater = fs.readFileSync('src/auto-updater.js', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

assert(main.includes("require('./src/auto-updater')"), 'main must register auto-updater');
assert(main.includes('registerAutoUpdater'), 'auto-updater registration missing');
assert(preload.includes('avant:update:check'), 'update check bridge missing');
assert(preload.includes('avant:update:install'), 'update install bridge missing');
assert(preload.includes('avant:update:event'), 'update event bridge missing');
assert(renderer.includes('subscribeToUpdates'), 'renderer update subscription missing');
assert(renderer.includes('checkForUpdates'), 'renderer update check missing');
assert(updater.includes('autoUpdater.checkForUpdates'), 'auto updater must check releases');
assert(updater.includes('autoUpdater.quitAndInstall'), 'auto updater must install downloaded update');
assert.deepStrictEqual(pkg.build.publish[0], {
  provider: 'github',
  owner: 'Joaomiguelq3',
  repo: 'swarm-app',
  releaseType: 'release'
});

console.log('smoke-auto-update ok');
