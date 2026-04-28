import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('requesting-code-review keeps one surfaced entrypoint while allowing specialist deep dives', () => {
  const content = read('skills/requesting-code-review/SKILL.md');

  assert.ok(
    content.includes('single surfaced entrypoint'),
    'requesting-code-review should define itself as the single surfaced entrypoint',
  );
  assert.ok(
    content.includes('specialist reviewer'),
    'requesting-code-review should describe optional specialist reviewers',
  );
  assert.ok(
    content.includes('single final conclusion'),
    'requesting-code-review should require the main agent to return one final conclusion',
  );
  assert.ok(
    content.includes('security-reviewer-prompt.md'),
    'requesting-code-review should reference a specialist reviewer template',
  );
  assert.ok(
    content.includes('Claude Code') && content.includes('Codex'),
    'requesting-code-review should document the supported review dispatch platforms',
  );
});

test('code reviewer prompt can recommend specialist deep dives without becoming a separate entrypoint', () => {
  const content = read('skills/requesting-code-review/code-reviewer-prompt.md');

  assert.ok(
    content.includes('Deep Dive Recommendations'),
    'code reviewer prompt should allow recommending specialist deep dives',
  );
  assert.ok(
    content.includes('security-reviewer'),
    'code reviewer prompt should name specialist reviewer types when escalation is warranted',
  );
});

test('dispatching-parallel-agents keeps specialist reviewers behind unified review orchestration', () => {
  const content = read('skills/dispatching-parallel-agents/SKILL.md');

  assert.ok(
    content.includes('unified review orchestration'),
    'dispatching-parallel-agents should frame review specialists as part of unified review orchestration',
  );
  assert.ok(
    content.includes('requesting-code-review'),
    'dispatching-parallel-agents should point review usage back to requesting-code-review',
  );
});

test('README describes one review entrypoint with optional deep-dive specialists', () => {
  const readme = read('README.md');
  const readmeZh = read('README.zh-CN.md');

  assert.ok(
    readme.includes('unified review'),
    'README should describe requesting-code-review as unified review entrypoint',
  );
  assert.ok(
    readme.includes('deep-dive specialists'),
    'README should describe specialist reviewers as internal deep-dive roles',
  );
  assert.ok(
    readmeZh.includes('统一审查'),
    'README.zh-CN should describe requesting-code-review as unified review entrypoint',
  );
  assert.ok(
    readmeZh.includes('专项深审'),
    'README.zh-CN should describe specialist reviewers as internal deep-dive roles',
  );
});
