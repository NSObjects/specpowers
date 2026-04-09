import assert from 'node:assert/strict';
import test from 'node:test';
import { tmpdir } from 'node:os';
import { mkdtempSync, rmSync, cpSync, existsSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function setupTmpRoot() {
  const tmp = mkdtempSync(join(tmpdir(), 'sp-install-rollback-'));
  for (const entry of ['manifests', 'scripts', 'skills', 'package.json']) {
    cpSync(join(ROOT, entry), join(tmp, entry), { recursive: true });
  }
  return tmp;
}

async function loadInstallApi(tmpRoot) {
  return import(pathToFileURL(join(tmpRoot, 'scripts/install.js')).href);
}

test('install rollback integrity', async (t) => {
  await t.test('full install failure preserves another platform payload and both platform state files', async () => {
    const tmp = setupTmpRoot();
    try {
      const { install } = await loadInstallApi(tmp);
      const claudeStatePath = join(tmp, 'manifests/install-state/claude-code.json');
      const codexStatePath = join(tmp, 'manifests/install-state/codex.json');

      await install({
        platform: 'codex',
        profile: 'developer',
        rootDir: tmp,
      });
      await install({
        platform: 'claude-code',
        profile: 'developer',
        rootDir: tmp,
      });

      const beforeClaudeState = readFileSync(claudeStatePath, 'utf-8');
      const beforeCodexState = readFileSync(codexStatePath, 'utf-8');
      assert.ok(existsSync(join(tmp, '.codex/skills/search-first/SKILL.md')));
      assert.ok(existsSync(join(tmp, '.claude/skills/search-first/SKILL.md')));

      rmSync(join(tmp, 'skills/search-first'), { recursive: true, force: true });

      await assert.rejects(
        install({
          platform: 'claude-code',
          profile: 'developer',
          rootDir: tmp,
        }),
      );

      assert.equal(readFileSync(claudeStatePath, 'utf-8'), beforeClaudeState);
      assert.equal(readFileSync(codexStatePath, 'utf-8'), beforeCodexState);
      assert.ok(
        existsSync(join(tmp, '.codex/skills/search-first/SKILL.md')),
        'failed reinstall should leave another platform payload intact',
      );
      assert.ok(
        existsSync(join(tmp, '.claude/skills/search-first/SKILL.md')),
        'failed reinstall should restore the target platform payload',
      );
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  await t.test('full install failure preserves the previous managed payload and state', async () => {
    const tmp = setupTmpRoot();
    try {
      const { install } = await loadInstallApi(tmp);
      const statePath = join(tmp, 'manifests/install-state.json');

      await install({
        platform: 'claude-code',
        profile: 'developer',
        rootDir: tmp,
      });

      const beforeState = readFileSync(statePath, 'utf-8');
      assert.ok(existsSync(join(tmp, '.claude/skills/search-first/SKILL.md')));

      rmSync(join(tmp, 'skills/search-first'), { recursive: true, force: true });

      await assert.rejects(
        install({
          platform: 'claude-code',
          profile: 'developer',
          rootDir: tmp,
        }),
      );

      assert.equal(readFileSync(statePath, 'utf-8'), beforeState);
      assert.ok(
        existsSync(join(tmp, '.claude/skills/search-first/SKILL.md')),
        'failed reinstall should leave the previously installed payload intact',
      );
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  await t.test('incremental install failure does not leave untracked files on disk', async () => {
    const tmp = setupTmpRoot();
    try {
      const { install, installModules } = await loadInstallApi(tmp);
      const statePath = join(tmp, 'manifests/install-state.json');

      await install({
        platform: 'claude-code',
        profile: 'core',
        rootDir: tmp,
      });

      const beforeState = readFileSync(statePath, 'utf-8');
      rmSync(join(tmp, 'skills/rules-typescript'), { recursive: true, force: true });

      const result = await installModules({
        platform: 'claude-code',
        moduleIds: ['rules-typescript'],
        rootDir: tmp,
      });

      assert.equal(result.success, false);
      assert.equal(readFileSync(statePath, 'utf-8'), beforeState);
      assert.ok(
        !existsSync(join(tmp, '.claude/skills/rules-common/SKILL.md')),
        'failed incremental install should not leave copied dependency files behind',
      );
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
