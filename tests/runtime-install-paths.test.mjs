import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

test('runtime entrypoints use managed install directories', async (t) => {
  await t.test('codex plugin manifest relies on default root skills discovery', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(ROOT, '.codex-plugin/plugin.json'), 'utf-8'),
    );
    assert.equal(manifest.skills, undefined);
  });

  await t.test('Claude Code plugin manifest points at managed skills and hooks', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(ROOT, '.claude-plugin/plugin.json'), 'utf-8'),
    );
    assert.equal(manifest.skills, './.claude/skills/');
    assert.equal(manifest.hooks, './hooks/hooks.json');
  });

  await t.test('session-start hook uses the managed Claude Code skills payload', () => {
    const content = readFileSync(resolve(ROOT, 'hooks/session-start'), 'utf-8');
    assert.ok(content.includes('.claude/skills/using-skills/SKILL.md'));
    assert.ok(!content.includes('.cursor-plugin/skills/using-skills/SKILL.md'));
    assert.ok(!content.includes('PLUGIN_ROOT}/skills'));
  });

  await t.test('Codex install docs use a sparse plugin checkout with one skills tree', () => {
    const content = readFileSync(resolve(ROOT, '.codex/INSTALL.md'), 'utf-8');
    const installSteps = content.split('### Migrating from older instructions')[0];
    assert.ok(installSteps.includes("plugin checkout's `skills/` directory"));
    assert.ok(installSteps.includes('.codex-plugin/plugin.json'));
    assert.ok(installSteps.includes("Codex's Plugins UI"));
    assert.ok(installSteps.includes('git clone --filter=blob:none --sparse https://github.com/NSObjects/specpowers ~/plugins/specpowers'));
    assert.ok(installSteps.includes('git sparse-checkout set .codex-plugin skills README.md LICENSE'));
    assert.ok(installSteps.includes('Do not point Codex at a full SpecPowers source checkout'));
    assert.ok(!installSteps.includes('node scripts/install.js --platform codex --profile developer'));
    assert.ok(!installSteps.includes('.codex/skills/'));
    assert.ok(!installSteps.includes('Node.js'));
  });

  await t.test('Codex install docs use the home-local marketplace plugin path', () => {
    const content = readFileSync(resolve(ROOT, '.codex/INSTALL.md'), 'utf-8');

    assert.ok(content.includes('git clone --filter=blob:none --sparse https://github.com/NSObjects/specpowers ~/plugins/specpowers'));
    assert.ok(content.includes('mkdir -p ~/plugins'));
    assert.ok(content.includes('"path": "./plugins/specpowers"'));
    const installSteps = content.split('### Migrating from older instructions')[0];
    assert.ok(!installSteps.includes('~/.codex/plugins/specpowers'));
    assert.ok(!installSteps.includes('./.codex/plugins/specpowers'));
  });

  await t.test('Claude Code install docs include the managed install bootstrap step', () => {
    const content = readFileSync(resolve(ROOT, '.claude-plugin/INSTALL.md'), 'utf-8');
    assert.ok(content.includes('node scripts/install.js --platform claude-code --profile developer'));
    assert.match(content, /local install\s+artifacts?/i);
    assert.match(content, /not authored source/i);
    assert.ok(!content.includes('not source content'));
  });

  await t.test('README documents Codex default skills discovery without materialization', () => {
    const content = readFileSync(resolve(ROOT, 'README.md'), 'utf-8');
    assert.ok(content.includes('Codex plugin installs use a sparse plugin checkout'));
    assert.ok(!content.includes('node scripts/install.js --platform codex --profile developer'));
    assert.ok(content.includes('node scripts/install.js --platform claude-code --profile developer'));
  });

  await t.test('.gitignore excludes generated Codex managed skills', () => {
    const gitignore = readFileSync(resolve(ROOT, '.gitignore'), 'utf-8');
    assert.ok(gitignore.includes('.codex/skills/'));
    assert.ok(gitignore.includes('manifests/install-state/*.json'));
  });

  await t.test('README describes Codex skills as default-discovered content', () => {
    const readme = readFileSync(resolve(ROOT, 'README.md'), 'utf-8');
    assert.match(readme, /sparse plugin checkout|default plugin discovery/i);
  });

  await t.test('README.zh-CN describes Codex skills as default-discovered content', () => {
    const readmeZh = readFileSync(resolve(ROOT, 'README.zh-CN.md'), 'utf-8');
    assert.match(readmeZh, /sparse 插件检出|不生成 `.codex\/skills\/`/);
  });

  await t.test('.codex/INSTALL.md does not reintroduce legacy or generated skill paths', () => {
    const install = readFileSync(resolve(ROOT, '.codex/INSTALL.md'), 'utf-8');
    const installSteps = install.split('### Migrating from older instructions')[0];
    assert.ok(!install.includes('Symlink the skills'));
    assert.ok(!installSteps.includes('mkdir -p ~/.codex/skills'));
    assert.ok(!installSteps.includes('ln -s'));
    assert.ok(!installSteps.includes('.codex/skills/'));
    assert.ok(!installSteps.match(/manually maintain|hand.maintain/i),
      'Install docs should not instruct readers to maintain .codex/skills/ as a second authored source');
  });
});
