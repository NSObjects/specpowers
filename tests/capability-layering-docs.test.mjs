import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('README documents rules, workflows, and roles as separate layers', () => {
  const readme = read('README.md');
  const readmeZh = read('README.zh-CN.md');

  assert.ok(readme.includes('Capability Layers'));
  assert.ok(readme.includes('Rules Layer'));
  assert.ok(readme.includes('Workflow Layer'));
  assert.ok(readme.includes('Role Layer'));
  assert.ok(readme.includes('rules-*') || readme.includes('`rules-common`'));
  assert.ok(readme.includes('standards') || readme.includes('constraints'));
  assert.ok(readme.includes('requesting-code-review'));
  assert.ok(readme.includes('single surfaced review entrypoint'));
  assert.ok(readme.includes('security-reviewer'));
  assert.ok(readme.includes('internal helper roles'));

  assert.ok(readmeZh.includes('能力分层'));
  assert.ok(readmeZh.includes('规则层'));
  assert.ok(readmeZh.includes('流程层'));
  assert.ok(readmeZh.includes('角色层'));
  assert.ok(readmeZh.includes('rules-*') || readmeZh.includes('`rules-common`'));
  assert.ok(readmeZh.includes('标准') || readmeZh.includes('约束'));
  assert.ok(readmeZh.includes('requesting-code-review'));
  assert.ok(readmeZh.includes('唯一'));
  assert.ok(readmeZh.includes('审查入口'));
  assert.ok(readmeZh.includes('security-reviewer'));
  assert.ok(readmeZh.includes('内部'));
});
