/**
 * Unit tests for installModules() incremental install function.
 *
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { tmpdir } from 'node:os';
import { mkdtempSync, rmSync, cpSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeState, readState } from '../scripts/lib/install-state.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SPECPOWERS_ROOT = resolve(__dirname, '..');

/**
 * Create a temp directory with a copy of the manifests so tests don't
 * mutate the real install-state.json.
 */
function setupTmpRoot() {
  const tmp = mkdtempSync(join(tmpdir(), 'sp-install-modules-'));
  cpSync(join(SPECPOWERS_ROOT, 'manifests'), join(tmp, 'manifests'), { recursive: true });
  // Copy adapters so dynamic import works
  cpSync(join(SPECPOWERS_ROOT, 'scripts'), join(tmp, 'scripts'), { recursive: true });
  // Copy source skills for file materialization
  cpSync(join(SPECPOWERS_ROOT, 'skills'), join(tmp, 'skills'), { recursive: true });
  // Copy package.json for sourceVersion
  cpSync(join(SPECPOWERS_ROOT, 'package.json'), join(tmp, 'package.json'));
  return tmp;
}

test('installModules() incremental install', async (t) => {
  await t.test('installs new modules and their dependencies', async () => {
    const tmp = setupTmpRoot();
    try {
      const statePath = join(tmp, 'manifests/install-state.json');
      // Start with empty state
      writeState(statePath, {
        version: 1,
        platform: 'claude-code',
        installedAt: '2025-01-01T00:00:00Z',
        sourceVersion: '0.2.0',
        profile: 'core',
        modules: [],
        extraModules: [],
        excludedModules: [],
      });

      const { installModules } = await import('../scripts/install.js');
      const result = await installModules({
        platform: 'claude-code',
        moduleIds: ['rules-typescript'],
        rootDir: tmp,
      });

      assert.equal(result.success, true);
      assert.equal(result.error, null);
      // rules-typescript depends on rules-common, both should be installed
      assert.ok(result.installedModules.includes('rules-typescript'));
      assert.ok(result.installedModules.includes('rules-common'));

      // Verify state was updated
      const state = readState(statePath);
      const installedIds = state.modules.map((m) => m.id);
      assert.ok(installedIds.includes('rules-typescript'));
      assert.ok(installedIds.includes('rules-common'));
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  await t.test('skips already-installed modules (Req 6.3)', async () => {
    const tmp = setupTmpRoot();
    try {
      const statePath = join(tmp, 'manifests/install-state.json');
      // Pre-install rules-common
      writeState(statePath, {
        version: 1,
        platform: 'claude-code',
        installedAt: '2025-01-01T00:00:00Z',
        sourceVersion: '0.2.0',
        profile: 'developer',
        modules: [
          { id: 'rules-common', installedAt: '2025-01-01T00:00:00Z', paths: ['.claude/skills/rules-common'] },
        ],
        extraModules: [],
        excludedModules: [],
      });

      const { installModules } = await import('../scripts/install.js');
      const result = await installModules({
        platform: 'claude-code',
        moduleIds: ['rules-typescript'],
        rootDir: tmp,
      });

      assert.equal(result.success, true);
      // rules-common should be skipped, rules-typescript installed
      assert.ok(result.skippedModules.includes('rules-common'));
      assert.ok(result.installedModules.includes('rules-typescript'));
      assert.ok(!result.installedModules.includes('rules-common'));

      // Verify existing record preserved (Req 6.2)
      const state = readState(statePath);
      const commonRecord = state.modules.find((m) => m.id === 'rules-common');
      assert.equal(commonRecord.installedAt, '2025-01-01T00:00:00Z');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  await t.test('preserves existing module records (Req 6.2)', async () => {
    const tmp = setupTmpRoot();
    try {
      const statePath = join(tmp, 'manifests/install-state.json');
      const existingModules = [
        { id: 'core-workflow', installedAt: '2025-01-01T00:00:00Z', paths: ['.claude/skills/using-skills'] },
      ];
      writeState(statePath, {
        version: 1,
        platform: 'claude-code',
        installedAt: '2025-01-01T00:00:00Z',
        sourceVersion: '0.2.0',
        profile: 'developer',
        modules: existingModules,
        extraModules: [],
        excludedModules: [],
      });

      const { installModules } = await import('../scripts/install.js');
      await installModules({
        platform: 'claude-code',
        moduleIds: ['rules-common'],
        rootDir: tmp,
      });

      const state = readState(statePath);
      // Original module should still be there with original timestamp
      const coreRecord = state.modules.find((m) => m.id === 'core-workflow');
      assert.ok(coreRecord, 'Existing module record should be preserved');
      assert.equal(coreRecord.installedAt, '2025-01-01T00:00:00Z');
      // New module should be appended
      const rulesRecord = state.modules.find((m) => m.id === 'rules-common');
      assert.ok(rulesRecord, 'New module should be appended');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  await t.test('returns error for invalid platform', async () => {
    const { installModules } = await import('../scripts/install.js');
    const result = await installModules({
      platform: 'invalid-platform',
      moduleIds: ['rules-common'],
    });

    assert.equal(result.success, false);
    assert.ok(result.error.includes('Unsupported platform'));
  });

  await t.test('returns error for missing platform', async () => {
    const { installModules } = await import('../scripts/install.js');
    const result = await installModules({
      platform: '',
      moduleIds: ['rules-common'],
    });

    assert.equal(result.success, false);
    assert.ok(result.error.includes('Platform is required'));
  });

  await t.test('returns success with empty lists when all modules already installed', async () => {
    const tmp = setupTmpRoot();
    try {
      const statePath = join(tmp, 'manifests/install-state.json');
      writeState(statePath, {
        version: 1,
        platform: 'claude-code',
        installedAt: '2025-01-01T00:00:00Z',
        sourceVersion: '0.2.0',
        profile: 'developer',
        modules: [
          { id: 'rules-common', installedAt: '2025-01-01T00:00:00Z', paths: ['.claude/skills/rules-common'] },
        ],
        extraModules: [],
        excludedModules: [],
      });

      const { installModules } = await import('../scripts/install.js');
      const result = await installModules({
        platform: 'claude-code',
        moduleIds: ['rules-common'],
        rootDir: tmp,
      });

      assert.equal(result.success, true);
      assert.equal(result.installedModules.length, 0);
      assert.ok(result.skippedModules.includes('rules-common'));
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  await t.test('rollback on error — state unchanged (Req 6.5)', async () => {
    const tmp = setupTmpRoot();
    try {
      const statePath = join(tmp, 'manifests/install-state.json');
      const originalState = {
        version: 1,
        platform: 'claude-code',
        installedAt: '2025-01-01T00:00:00Z',
        sourceVersion: '0.2.0',
        profile: 'developer',
        modules: [],
        extraModules: [],
        excludedModules: [],
      };
      writeState(statePath, originalState);

      const { installModules } = await import('../scripts/install.js');
      // Request a module that doesn't exist in catalog — should trigger error
      const result = await installModules({
        platform: 'claude-code',
        moduleIds: ['nonexistent-module'],
        rootDir: tmp,
      });

      assert.equal(result.success, false);
      assert.ok(result.error.includes('not found in catalog'));

      // State should be unchanged
      const state = readState(statePath);
      assert.deepStrictEqual(state, originalState);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
