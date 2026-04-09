import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

test('runtime entrypoints use managed install directories', async (t) => {
  await t.test('codex plugin manifest points at managed skills', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(ROOT, '.codex-plugin/plugin.json'), 'utf-8'),
    );
    assert.equal(manifest.skills, './.codex/skills/');
  });

  await t.test('cursor plugin manifest points at managed skills', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(ROOT, '.cursor-plugin/plugin.json'), 'utf-8'),
    );
    assert.equal(manifest.skills, './.cursor-plugin/skills/');
  });

  await t.test('OpenCode plugin prefers the managed skills directory', () => {
    const content = readFileSync(resolve(ROOT, '.opencode/plugins/specpowers.js'), 'utf-8');
    assert.ok(content.includes('.opencode/skills'));
  });

  await t.test('session-start hook prefers managed installed skills for hook-based platforms', () => {
    const content = readFileSync(resolve(ROOT, 'hooks/session-start'), 'utf-8');
    assert.ok(content.includes('.claude/skills/using-skills/SKILL.md'));
    assert.ok(content.includes('.cursor-plugin/skills/using-skills/SKILL.md'));
  });

  await t.test('Codex install docs include the managed install bootstrap step', () => {
    const content = readFileSync(resolve(ROOT, '.codex/INSTALL.md'), 'utf-8');
    assert.ok(content.includes('node scripts/install.js --platform codex --profile developer'));
  });

  await t.test('README documents the Codex managed install bootstrap step', () => {
    const content = readFileSync(resolve(ROOT, 'README.md'), 'utf-8');
    assert.ok(content.includes('node scripts/install.js --platform codex --profile developer'));
  });
});
