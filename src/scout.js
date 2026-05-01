const fs = require('fs');
const path = require('path');

const DEFAULT_IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '__pycache__',
  'venv',
  '.venv',
  'coverage',
  'out',
  'release'
]);

const IMPORTANT_NAMES = new Set([
  'package.json',
  'main.js',
  'preload.js',
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  'readme.md'
]);

const IMPORTANT_DIRS = new Set(['src', 'renderer', 'scripts']);

function normalizeSlash(value) {
  return value.replace(/\\/g, '/');
}

function isImportant(relativePath) {
  const normalized = normalizeSlash(relativePath);
  const name = path.basename(normalized);
  const firstSegment = normalized.split('/')[0];
  return IMPORTANT_NAMES.has(name) || IMPORTANT_DIRS.has(firstSegment);
}

function readPreview(filePath, maxLines, maxBytes) {
  const buffer = fs.readFileSync(filePath);
  const text = buffer.toString('utf8', 0, Math.min(buffer.length, maxBytes));
  return text.split(/\r?\n/).slice(0, maxLines).join('\n');
}

function walk(rootPath, currentPath, options, state) {
  const entries = fs.readdirSync(currentPath, { withFileTypes: true });

  for (const entry of entries) {
    if (state.files.length >= options.maxFiles) {
      return;
    }

    const absolutePath = path.join(currentPath, entry.name);
    const relativePath = normalizeSlash(path.relative(rootPath, absolutePath));

    if (entry.isDirectory()) {
      if (options.ignoreDirs.has(entry.name)) {
        state.ignored.push(relativePath);
        continue;
      }
      walk(rootPath, absolutePath, options, state);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const stats = fs.statSync(absolutePath);
    const important = isImportant(relativePath);
    const file = {
      path: relativePath,
      bytes: stats.size,
      important,
      preview: ''
    };

    if (important && stats.size <= options.maxBytesPerFile) {
      try {
        file.preview = readPreview(absolutePath, options.maxLinesPerFile, options.maxBytesPerFile);
      } catch (error) {
        file.preview = `[unreadable: ${error.message}]`;
      }
    }

    state.files.push(file);
  }
}

function formatScoutContext(result) {
  const lines = [
    `Project: ${result.root}`,
    `Files scanned: ${result.summary.filesScanned}`,
    `Important files: ${result.summary.importantFiles}`,
    `Ignored directories: ${result.ignored.length ? result.ignored.join(', ') : 'none'}`,
    ''
  ];

  for (const file of result.files.filter((item) => item.important)) {
    lines.push(`## ${file.path} (${file.bytes} bytes)`);
    if (file.preview) {
      lines.push(file.preview);
    } else {
      lines.push('[no preview]');
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}

function scoutProject(rootPath, options = {}) {
  const resolvedRoot = path.resolve(rootPath);
  const settings = {
    ignoreDirs: new Set(options.ignoreDirs || DEFAULT_IGNORE_DIRS),
    maxFiles: options.maxFiles || 250,
    maxLinesPerFile: options.maxLinesPerFile || 20,
    maxBytesPerFile: options.maxBytesPerFile || 24000
  };

  const state = {
    files: [],
    ignored: []
  };

  walk(resolvedRoot, resolvedRoot, settings, state);

  const result = {
    root: resolvedRoot,
    files: state.files,
    ignored: state.ignored,
    summary: {
      filesScanned: state.files.length,
      importantFiles: state.files.filter((file) => file.important).length,
      truncated: state.files.length >= settings.maxFiles
    },
    context: ''
  };

  result.context = formatScoutContext(result);
  return result;
}

module.exports = {
  DEFAULT_IGNORE_DIRS,
  scoutProject,
  formatScoutContext
};
