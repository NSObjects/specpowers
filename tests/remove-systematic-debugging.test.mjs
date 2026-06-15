import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');
const removedSkillId = 'systematic-debugging';
const removedSkillPath = `skills/${removedSkillId}`;

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

test('systematic-debugging is removed from authored and exposed skill surfaces', async (t) => {
  await t.test('authored skill directory is absent', () => {
    assert.equal(
      fs.existsSync(path.join(repoRoot, removedSkillPath)),
      false,
      `${removedSkillPath} should be deleted`,
    );
  });

  await t.test('install manifest does not materialize the removed skill', () => {
    const manifest = readJson('manifests/install-modules.json');
    const manifestPaths = manifest.modules.flatMap((module) => module.paths);

    assert.ok(
      !manifestPaths.includes(removedSkillPath),
      `install manifest should not include ${removedSkillPath}`,
    );
  });

  await t.test('routing, metadata, and reader-facing docs do not advertise the removed skill', () => {
    const exposureFiles = [
      'skills/using-skills/SKILL.md',
      '.codex-plugin/plugin.json',
      '.claude-plugin/plugin.json',
      '.claude-plugin/marketplace.json',
      '.agents/plugins/marketplace.json',
      'README.md',
      'README.zh-CN.md',
    ];

    for (const relativePath of exposureFiles) {
      assert.doesNotMatch(
        read(relativePath),
        /\bsystematic[- ]debugging\b/i,
        `${relativePath} should not mention ${removedSkillId}`,
      );
    }
  });
});
