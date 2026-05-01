const assert = require('assert');
const { DEFAULT_IGNORE_DIRS, scoutProject } = require('../src/scout');

const result = scoutProject(process.cwd(), {
  maxFiles: 500,
  maxLinesPerFile: 5
});

const paths = result.files.map((file) => file.path);

assert.ok(DEFAULT_IGNORE_DIRS.has('node_modules'), 'node_modules must be ignored');
assert.ok(DEFAULT_IGNORE_DIRS.has('.git'), '.git must be ignored');
assert.ok(paths.includes('package.json'), 'package.json should be discovered');
assert.ok(paths.includes('main.js'), 'main.js should be discovered');
assert.ok(paths.includes('preload.js'), 'preload.js should be discovered');
assert.ok(!paths.some((file) => file.startsWith('node_modules/')), 'node_modules should not be walked');
assert.ok(!paths.some((file) => file.startsWith('.git/')), '.git should not be walked');
assert.ok(result.context.includes('package.json'), 'context should include important files');

console.log(`scout ok: ${result.summary.filesScanned} files, ${result.summary.importantFiles} important`);
