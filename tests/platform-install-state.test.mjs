import assert from 'node:assert/strict';
import test from 'node:test';
import { tmpdir } from 'node:os';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import {
  getStatePath,
  readPlatformState,
  writeState,
  writePlatformState,
} from '../scripts/lib/install-state.js';

function makeTmpDir() {
  return mkdtempSync(join(tmpdir(), 'sp-platform-state-'));
}

test('platform install state isolation', async (t) => {
  await t.test('resolves platform state under manifests/install-state/<platform>.json', () => {
    const statePath = getStatePath('/tmp/specpowers', 'claude-code');
    assert.equal(statePath, '/tmp/specpowers/manifests/install-state/claude-code.json');
  });

  await t.test('reads each platform state independently', () => {
    const dir = makeTmpDir();
    try {
      const claudeState = {
        version: 1,
        platform: 'claude-code',
        installedAt: '2026-04-09T00:00:00.000Z',
        sourceVersion: '0.2.0',
        profile: 'developer',
        modules: [{ id: 'core-workflow', installedAt: '2026-04-09T00:00:00.000Z', paths: ['.claude/skills/using-skills'] }],
        extraModules: [],
        excludedModules: [],
      };
      const codexState = {
        version: 1,
        platform: 'codex',
        installedAt: '2026-04-09T00:00:00.000Z',
        sourceVersion: '0.2.0',
        profile: 'developer',
        modules: [{ id: 'core-workflow', installedAt: '2026-04-09T00:00:00.000Z', paths: ['.codex/skills/using-skills'] }],
        extraModules: [],
        excludedModules: [],
      };

      writePlatformState(dir, 'claude-code', claudeState);
      writePlatformState(dir, 'codex', codexState);

      assert.deepStrictEqual(readPlatformState(dir, 'claude-code'), claudeState);
      assert.deepStrictEqual(readPlatformState(dir, 'codex'), codexState);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  await t.test('falls back to legacy shared state only when it matches the requested platform', () => {
    const dir = makeTmpDir();
    try {
      const legacyState = {
        version: 1,
        platform: 'claude-code',
        installedAt: '2026-04-09T00:00:00.000Z',
        sourceVersion: '0.2.0',
        profile: 'developer',
        modules: [{ id: 'core-workflow', installedAt: '2026-04-09T00:00:00.000Z', paths: ['.claude/skills/using-skills'] }],
        extraModules: [],
        excludedModules: [],
      };

      const legacyPath = join(dir, 'manifests', 'install-state.json');
      writeState(legacyPath, legacyState);

      assert.deepStrictEqual(readPlatformState(dir, 'claude-code'), legacyState);

      const codexState = readPlatformState(dir, 'codex');
      assert.equal(codexState.platform, null);
      assert.deepStrictEqual(codexState.modules, []);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
