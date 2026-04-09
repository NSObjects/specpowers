import assert from 'node:assert/strict';
import test from 'node:test';
import { tmpdir } from 'node:os';
import { mkdtempSync, rmSync, cpSync, existsSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function setupTmpRoot() {
  const tmp = mkdtempSync(join(tmpdir(), 'sp-install-materialization-'));
  for (const entry of ['manifests', 'scripts', 'skills', 'package.json']) {
    cpSync(join(ROOT, entry), join(tmp, entry), { recursive: true });
  }
  rmSync(join(tmp, 'manifests', 'install-state.json'), { force: true });
  return tmp;
}

async function loadInstallApi(tmpRoot) {
  return import(pathToFileURL(join(tmpRoot, 'scripts/install.js')).href);
}

test('install materialization', async (t) => {
  await t.test('install() keeps managed payloads for multiple platforms in the same repository', async () => {
    const tmp = setupTmpRoot();
    try {
      const { install } = await loadInstallApi(tmp);

      await install({
        platform: 'codex',
        profile: 'developer',
        rootDir: tmp,
      });

      const result = await install({
        platform: 'claude-code',
        profile: 'developer',
        rootDir: tmp,
      });

      assert.equal(result.success, true);
      assert.ok(existsSync(join(tmp, '.codex/skills/using-skills/SKILL.md')));
      assert.ok(existsSync(join(tmp, '.claude/skills/using-skills/SKILL.md')));

      const codexState = JSON.parse(
        readFileSync(join(tmp, 'manifests/install-state/codex.json'), 'utf-8'),
      );
      const claudeState = JSON.parse(
        readFileSync(join(tmp, 'manifests/install-state/claude-code.json'), 'utf-8'),
      );
      assert.equal(codexState.platform, 'codex');
      assert.equal(claudeState.platform, 'claude-code');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  await t.test('install() copies profile content into the platform target dir', async () => {
    const tmp = setupTmpRoot();
    try {
      const { install } = await loadInstallApi(tmp);

      const result = await install({
        platform: 'claude-code',
        profile: 'developer',
        rootDir: tmp,
      });

      assert.equal(result.success, true);
      assert.ok(
        existsSync(join(tmp, '.claude/skills/using-skills/SKILL.md')),
        'core workflow skill should be materialized',
      );
      assert.ok(
        existsSync(join(tmp, '.claude/skills/requesting-code-review/code-reviewer-prompt.md')),
        'foundation prompt should be materialized',
      );
      assert.ok(
        existsSync(join(tmp, '.claude/skills/quality-gate/SKILL.md')),
        'developer profile additions should be materialized',
      );
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  await t.test('installModules() copies requested modules and dependencies', async () => {
    const tmp = setupTmpRoot();
    try {
      const { install, installModules } = await loadInstallApi(tmp);

      await install({
        platform: 'claude-code',
        profile: 'core',
        rootDir: tmp,
      });

      const result = await installModules({
        platform: 'claude-code',
        moduleIds: ['rules-typescript'],
        rootDir: tmp,
      });

      assert.equal(result.success, true);
      assert.ok(existsSync(join(tmp, '.claude/skills/rules-typescript/SKILL.md')));
      assert.ok(existsSync(join(tmp, '.claude/skills/rules-common/SKILL.md')));
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  await t.test('install() prunes no-longer-selected managed paths on reinstall', async () => {
    const tmp = setupTmpRoot();
    try {
      const { install } = await loadInstallApi(tmp);

      await install({
        platform: 'claude-code',
        profile: 'full',
        rootDir: tmp,
      });
      await install({
        platform: 'codex',
        profile: 'developer',
        rootDir: tmp,
      });
      assert.ok(existsSync(join(tmp, '.claude/skills/rules-typescript/SKILL.md')));
      assert.ok(existsSync(join(tmp, '.codex/skills/using-skills/SKILL.md')));

      const result = await install({
        platform: 'claude-code',
        profile: 'developer',
        rootDir: tmp,
      });

      assert.equal(result.success, true);
      assert.ok(
        !existsSync(join(tmp, '.claude/skills/rules-typescript/SKILL.md')),
        'reinstall should remove managed files that are no longer selected',
      );
      assert.ok(
        existsSync(join(tmp, '.claude/skills/rules-common/SKILL.md')),
        'shared managed files should remain',
      );
      assert.ok(
        existsSync(join(tmp, '.codex/skills/using-skills/SKILL.md')),
        'reinstall should not remove another platform payload',
      );
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
