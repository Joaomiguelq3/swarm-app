const { spawn } = require('child_process');

function escapeForPowerShellSingleQuote(value) {
  return String(value).replace(/'/g, "''");
}

function buildSpeechCommand(text) {
  const safeText = escapeForPowerShellSingleQuote(text);
  return [
    'Add-Type -AssemblyName System.Speech;',
    '$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer;',
    `$speaker.Speak('${safeText}');`,
    '$speaker.Dispose();'
  ].join(' ');
}

function speak(text, options = {}) {
  const timeoutMs = options.timeoutMs || 8000;

  if (process.platform !== 'win32') {
    return Promise.resolve({
      ok: false,
      skipped: true,
      error: 'TTS is only available on Windows'
    });
  }

  return new Promise((resolve) => {
    let child;
    try {
      child = spawn('powershell.exe', [
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        buildSpeechCommand(text)
      ], {
        windowsHide: true
      });
    } catch (error) {
      resolve({ ok: false, skipped: true, error: error.message });
      return;
    }

    let stderr = '';
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      child.kill();
      resolve({ ok: false, skipped: true, error: 'TTS timed out' });
    }, timeoutMs);

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolve({ ok: false, skipped: true, error: error.message });
    });

    child.on('close', (code) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      if (code === 0) {
        resolve({ ok: true, skipped: false, error: null });
      } else {
        resolve({ ok: false, skipped: true, error: stderr.trim() || `PowerShell exited with ${code}` });
      }
    });
  });
}

module.exports = {
  buildSpeechCommand,
  speak
};
