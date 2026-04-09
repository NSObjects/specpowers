/**
 * End-to-end integration smoke test for the agent auto-install flow.
 *
 * Exercises:
 * 1. First-run bootstrap (no install-state.json) with TypeScript files
 * 2. Incremental bootstrap (add Python files)
 * 3. Up-to-date bootstrap (all modules already installed)
 * 4. Auto-install boundary: rules-* auto-install, non-rules need confirmation
 * 5. CLI backward compatibility
 * 6. SKILL.md content verification
 * 7. Import resolution verification
 *
 * Validates: Requirements 1.5, 2.3, 3.3, 4.5
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, cpSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getStatePath, readPlatformState, writeState } from '../scripts/lib/install-state.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function setupTmpRoot() {
  const tmp = mkdtempSync(join(process.env.TMPDIR || '/tmp', 'sp-auto-install-'));
  for (const entry of ['manifests', 'scripts', 'skills', 'package.json']) {
    cpSync(join(ROOT, entry), join(tmp, entry), { recursive: true });
  }
  rmSync(join(tmp, 'manifests', 'install-state.json'), { force: true });
  return tmp;
}

describe('Agent Auto-Install Integration', () => {
  describe('Import resolution', () => {
    it('session-bootstrap.js exports bootstrap function', async () => {
      const mod = await import('../scripts/lib/session-bootstrap.js');
      assert.equal(typeof mod.bootstrap, 'function');
    });

    it('auto-install.js exports boundary control functions', async () => {
      const mod = await import('../scripts/lib/auto-install.js');
      assert.equal(typeof mod.isAutoInstallable, 'function');
      assert.equal(typeof mod.partitionByAutoInstallScope, 'function');
      assert.equal(typeof mod.createInstallLog, 'function');
    });

    it('install.js exports all API functions', async () => {
      const mod = await import('../scripts/install.js');
      assert.equal(typeof mod.install, 'function');
      assert.equal(typeof mod.getInstalledModules, 'function');
      assert.equal(typeof mod.getMissingLanguageModules, 'function');
      assert.equal(typeof mod.installModules, 'function');
      assert.equal(typeof mod.isAutoInstallable, 'function');
    });

    it('language-detect.js exports detectLanguages', async () => {
      const mod = await import('../scripts/lib/language-detect.js');
      assert.equal(typeof mod.detectLanguages, 'function');
    });

    it('install-state.js exports readState and writeState', async () => {
      const mod = await import('../scripts/lib/install-state.js');
      assert.equal(typeof mod.readState, 'function');
      assert.equal(typeof mod.writeState, 'function');
    });
  });

  describe('First-run bootstrap (Req 2.6, 5.1, 5.2)', () => {
    it('installs developer profile + language modules on first run with TS files', async () => {
      const tmp = setupTmpRoot();
      const { bootstrap } = await import('../scripts/lib/session-bootstrap.js');

      try {
        const result = await bootstrap({
          platform: 'claude-code',
          fileList: ['src/index.ts', 'src/utils.ts', 'README.md'],
          rootDir: tmp,
        });

        assert.equal(result.action, 'first_run');
        assert.ok(
          result.installedModules.includes('rules-typescript') || result.installedModules.length === 0,
          'Should install rules-typescript or have it already from developer profile'
        );
        assert.ok(result.summary.length > 0, 'Should have a non-empty summary');
        assert.ok(result.summary.includes('SpecPowers'), 'Summary should include welcome text');

        const statePath = getStatePath(tmp, 'claude-code');
        assert.ok(existsSync(statePath), 'platform state should exist after first run');

        const state = JSON.parse(readFileSync(statePath, 'utf-8'));
        assert.equal(state.platform, 'claude-code');
        assert.equal(state.profile, 'developer');
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    });

    it('treats bootstrap as first run when another platform is already installed', async () => {
      const tmp = setupTmpRoot();
      try {
        const { install } = await import('../scripts/install.js');
        const { bootstrap } = await import('../scripts/lib/session-bootstrap.js');

        await install({
          platform: 'codex',
          profile: 'developer',
          rootDir: tmp,
        });

        const result = await bootstrap({
          platform: 'claude-code',
          fileList: ['src/index.ts'],
          rootDir: tmp,
        });

        assert.equal(result.action, 'first_run');
        assert.ok(result.summary.includes('SpecPowers'));
        assert.ok(existsSync(getStatePath(tmp, 'codex')));
        assert.ok(existsSync(getStatePath(tmp, 'claude-code')));
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    });

    it('treats incomplete install state as first run and restores baseline install', async () => {
      const tmp = setupTmpRoot();
      try {
        writeState(
          getStatePath(tmp, 'claude-code'),
          { modules: [] },
        );

        const { bootstrap } = await import('../scripts/lib/session-bootstrap.js');
        const result = await bootstrap({
          platform: 'claude-code',
          fileList: ['app.py'],
          rootDir: tmp,
        });

        assert.equal(result.action, 'first_run');
        assert.ok(result.installedModules.includes('rules-python'));
        assert.ok(result.summary.includes('SpecPowers'));

        const state = JSON.parse(readFileSync(getStatePath(tmp, 'claude-code'), 'utf-8'));
        const moduleIds = state.modules.map((m) => m.id);
        assert.equal(state.platform, 'claude-code');
        assert.equal(state.profile, 'developer');
        assert.ok(moduleIds.includes('core-workflow'));
        assert.ok(moduleIds.includes('foundation'));
        assert.ok(moduleIds.includes('rules-python'));
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    });
  });

  describe('Incremental bootstrap (Req 2.3, 6.1, 6.2)', () => {
    it('installs only missing language modules when new language detected', async () => {
      const tmp = setupTmpRoot();
      try {
        const { install } = await import('../scripts/install.js');
        const { bootstrap } = await import('../scripts/lib/session-bootstrap.js');

        await install({ platform: 'claude-code', profile: 'developer', rootDir: tmp });

        const result = await bootstrap({
          platform: 'claude-code',
          fileList: ['app.py', 'utils.py'],
          rootDir: tmp,
        });

        assert.equal(result.action, 'incremental');
        assert.ok(result.installedModules.includes('rules-python'), 'Should install rules-python');
        assert.ok(result.summary.includes('rules-python'), 'Summary should mention rules-python');

        const state = readPlatformState(tmp, 'claude-code');
        const moduleIds = state.modules.map((m) => m.id);
        assert.ok(moduleIds.includes('rules-python'), 'State should include rules-python');
        assert.ok(moduleIds.includes('core-workflow'), 'State should still include core-workflow');
        assert.ok(moduleIds.includes('foundation'), 'State should still include foundation');
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    });

    it('installs missing language rules for the current platform even when another platform already has them', async () => {
      const tmp = setupTmpRoot();
      try {
        const { install } = await import('../scripts/install.js');
        const { bootstrap } = await import('../scripts/lib/session-bootstrap.js');

        await install({
          platform: 'codex',
          profile: 'developer',
          add: ['rules-python'],
          rootDir: tmp,
        });
        await install({
          platform: 'claude-code',
          profile: 'developer',
          rootDir: tmp,
        });

        const beforeCodexState = readPlatformState(tmp, 'codex');
        const result = await bootstrap({
          platform: 'claude-code',
          fileList: ['app.py'],
          rootDir: tmp,
        });

        assert.equal(result.action, 'incremental');
        assert.ok(result.installedModules.includes('rules-python'));
        assert.deepStrictEqual(readPlatformState(tmp, 'codex'), beforeCodexState);
        assert.ok(readPlatformState(tmp, 'claude-code').modules.some((m) => m.id === 'rules-python'));
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    });
  });

  describe('Up-to-date bootstrap (Req 6.3)', () => {
    it('returns up_to_date when all language modules already installed', async () => {
      const tmp = setupTmpRoot();
      try {
        const { install } = await import('../scripts/install.js');
        const { bootstrap } = await import('../scripts/lib/session-bootstrap.js');

        await install({
          platform: 'claude-code',
          profile: 'developer',
          add: ['rules-typescript'],
          rootDir: tmp,
        });

        const result = await bootstrap({
          platform: 'claude-code',
          fileList: ['src/index.ts', 'src/utils.ts'],
          rootDir: tmp,
        });

        assert.equal(result.action, 'up_to_date');
        assert.deepEqual(result.installedModules, []);
        assert.equal(result.summary, '');
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    });
  });

  describe('Auto-install boundary (Req 4.1, 4.4)', () => {
    it('module catalog no longer exposes search-first as a standalone module', () => {
      const catalog = JSON.parse(
        readFileSync(resolve(ROOT, 'manifests/install-modules.json'), 'utf-8')
      );

      assert.ok(
        !catalog.modules.some((module) => module.id === 'search-first'),
        'search-first should no longer be exposed as a standalone install module'
      );
    });

    it('developer profile no longer lists search-first', () => {
      const profiles = JSON.parse(
        readFileSync(resolve(ROOT, 'manifests/install-profiles.json'), 'utf-8')
      );

      assert.ok(
        !profiles.profiles.developer.modules.includes('search-first'),
        'developer profile should no longer include search-first'
      );
    });

    it('rules-* modules are auto-installable', async () => {
      const { isAutoInstallable, partitionByAutoInstallScope } = await import(
        '../scripts/lib/auto-install.js'
      );
      const catalog = JSON.parse(
        readFileSync(resolve(ROOT, 'manifests/install-modules.json'), 'utf-8')
      );

      // rules-* modules should be auto-installable
      assert.ok(isAutoInstallable('rules-typescript', catalog.modules));
      assert.ok(isAutoInstallable('rules-python', catalog.modules));
      assert.ok(isAutoInstallable('rules-common', catalog.modules));
      assert.ok(isAutoInstallable('rules-golang', catalog.modules));
      assert.ok(isAutoInstallable('rules-rust', catalog.modules));
    });

    it('non-rules modules need confirmation', async () => {
      const { isAutoInstallable, partitionByAutoInstallScope } = await import(
        '../scripts/lib/auto-install.js'
      );
      const catalog = JSON.parse(
        readFileSync(resolve(ROOT, 'manifests/install-modules.json'), 'utf-8')
      );

      // Non-rules modules should NOT be auto-installable
      assert.ok(!isAutoInstallable('verification-loop', catalog.modules));
      assert.ok(!isAutoInstallable('quality-gate', catalog.modules));
      assert.ok(!isAutoInstallable('core-workflow', catalog.modules));
      assert.ok(!isAutoInstallable('role-agents', catalog.modules));
    });

    it('partitionByAutoInstallScope correctly separates modules', async () => {
      const { partitionByAutoInstallScope } = await import('../scripts/lib/auto-install.js');
      const catalog = JSON.parse(
        readFileSync(resolve(ROOT, 'manifests/install-modules.json'), 'utf-8')
      );

      const mixed = ['rules-typescript', 'verification-loop', 'rules-python', 'quality-gate'];
      const { autoInstall, needsConfirmation } = partitionByAutoInstallScope(
        mixed,
        catalog.modules
      );

      assert.deepEqual(autoInstall.sort(), ['rules-python', 'rules-typescript']);
      assert.deepEqual(needsConfirmation.sort(), ['quality-gate', 'verification-loop']);
    });
  });

  describe('SKILL.md content verification (Req 3.1, 3.3)', () => {
    it('contains "Language Rule Auto-Install" section', () => {
      const content = readFileSync(
        resolve(ROOT, 'skills/using-skills/SKILL.md'),
        'utf-8'
      );
      assert.ok(
        content.includes('Language Rule Auto-Install'),
        'SKILL.md should contain "Language Rule Auto-Install"'
      );
    });

    it('does NOT contain old "Language Rule Auto-Suggestion" text', () => {
      const content = readFileSync(
        resolve(ROOT, 'skills/using-skills/SKILL.md'),
        'utf-8'
      );
      assert.ok(
        !content.includes('Language Rule Auto-Suggestion'),
        'SKILL.md should NOT contain "Language Rule Auto-Suggestion"'
      );
    });

    it('mentions auto-install boundary rules', () => {
      const content = readFileSync(
        resolve(ROOT, 'skills/using-skills/SKILL.md'),
        'utf-8'
      );
      assert.ok(
        content.includes('Auto-Install Boundary'),
        'SKILL.md should describe auto-install boundary'
      );
      assert.ok(
        content.includes('rules-*'),
        'SKILL.md should mention rules-* modules'
      );
    });

    it('mentions first-run detection', () => {
      const content = readFileSync(
        resolve(ROOT, 'skills/using-skills/SKILL.md'),
        'utf-8'
      );
      assert.ok(
        content.includes('First-Run Detection'),
        'SKILL.md should describe first-run detection'
      );
      assert.ok(
        content.includes('developer'),
        'SKILL.md should mention developer profile'
      );
    });

    it('references session-bootstrap.js and install.js', () => {
      const content = readFileSync(
        resolve(ROOT, 'skills/using-skills/SKILL.md'),
        'utf-8'
      );
      assert.ok(
        content.includes('session-bootstrap.js'),
        'SKILL.md should reference session-bootstrap.js'
      );
      assert.ok(
        content.includes('install.js'),
        'SKILL.md should reference install.js'
      );
    });

    it('describes bootstrap flow consistent with session-bootstrap.js interface', () => {
      const content = readFileSync(
        resolve(ROOT, 'skills/using-skills/SKILL.md'),
        'utf-8'
      );
      // SKILL.md should mention the key functions that session-bootstrap.js uses
      assert.ok(
        content.includes('detectLanguages'),
        'SKILL.md should mention detectLanguages'
      );
      assert.ok(
        content.includes('installModules'),
        'SKILL.md should mention installModules'
      );
    });
  });

  describe('Install log creation (Req 4.6)', () => {
    it('createInstallLog produces correct structure', async () => {
      const { createInstallLog } = await import('../scripts/lib/auto-install.js');

      const log = createInstallLog(
        ['rules-typescript', 'rules-python'],
        ['rules-typescript', 'rules-python']
      );

      assert.deepEqual(log.moduleIds, ['rules-typescript', 'rules-python']);
      assert.deepEqual(log.trigger, ['rules-typescript', 'rules-python']);
      assert.ok(typeof log.timestamp === 'string');
      // Verify ISO 8601 format
      assert.ok(!isNaN(Date.parse(log.timestamp)), 'timestamp should be valid ISO 8601');
    });
  });
});
