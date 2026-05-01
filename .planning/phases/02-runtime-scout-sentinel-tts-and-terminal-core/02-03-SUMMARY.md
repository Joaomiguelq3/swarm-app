---
phase: "02"
plan: "03"
status: complete
subsystem: "sentinel-tts"
tags:
  - sentinel
  - tts
key-files:
  - src/sentinel.js
  - src/tts.js
  - scripts/smoke-sentinel.js
  - scripts/smoke-tts.js
---

# Plan 02-03 Summary: Sentinel Watcher and TTS Modules

## Status

Complete.

## What Changed

- Created `src/sentinel.js` using `chokidar` with `start()` and `stop()` lifecycle.
- Sentinel emits normalized `{ acao, arquivo, timestamp }` events.
- Created `src/tts.js` using Windows PowerShell `System.Speech.Synthesis.SpeechSynthesizer`.
- TTS returns structured `{ ok, skipped, error }` results and fails softly.
- Created smoke scripts for sentinel and TTS.

## Verification

- `npm.cmd run smoke:sentinel` passed.
- `npm.cmd run smoke:tts` passed outside sandbox with real PowerShell TTS.
- Inside sandbox, TTS returns soft failure for `spawn EPERM` as expected.

## Self-Check

PASSED.
