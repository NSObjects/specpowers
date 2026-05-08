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

test('code reviewer prompt requires a factual confidence loop before approval', () => {
  const content = read('skills/requesting-code-review/code-reviewer-prompt.md');

  assert.ok(
    content.includes('Factual Confidence Loop'),
    'code reviewer prompt should require an explicit confidence loop',
  );
  assert.ok(
    content.includes('100% confidence'),
    'code reviewer prompt should preserve the user-facing confidence gate language',
  );
  assert.ok(
    content.includes('Unresolved Confidence Gaps'),
    'code reviewer prompt should expose evidence gaps separately from findings',
  );
});

test('requesting-code-review re-review loop keeps confidence gaps blocking', () => {
  const content = read('skills/requesting-code-review/SKILL.md');

  assert.ok(
    content.includes('unresolved confidence gaps'),
    'requesting-code-review should keep unresolved confidence gaps in the re-review loop',
  );
  assert.ok(
    content.includes('approval-blocking confidence gaps'),
    'requesting-code-review final result should surface confidence gaps as blocking issues',
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

test('spec-driven-development requires dispatched review gates before task completion', () => {
  const content = read('skills/spec-driven-development/SKILL.md');

  assert.ok(
    content.includes('Review dispatch is mandatory after implementation reaches GREEN and before `tasks.md` is updated'),
    'spec-driven-development should pin review dispatch between GREEN and task completion',
  );
  assert.ok(
    content.includes('Do not replace reviewer dispatch with inline self-check'),
    'spec-driven-development should not allow inline self-check to silently replace reviewer dispatch',
  );
  assert.match(
    content,
    /dispatch `\.\/spec-reviewer-prompt\.md` and wait for `PASS`/i,
    'Stage 1 should require a dispatched spec reviewer PASS when subagents are available',
  );
  assert.match(
    content,
    /dispatch `\.\/code-quality-reviewer-prompt\.md` and wait for `APPROVED`/i,
    'Stage 2 should require a dispatched code quality reviewer APPROVED when subagents are available',
  );
  assert.ok(
    content.includes('Review evidence:'),
    'task reports should include review evidence instead of only a claim',
  );
  assert.ok(
    content.includes('approval-blocking confidence gap'),
    'inline Code Quality Self-Check should not pass with unresolved confidence gaps',
  );
});

test('task code quality reviewer shares the evidence-backed confidence gate', () => {
  const content = read('skills/spec-driven-development/code-quality-reviewer-prompt.md');

  assert.ok(
    content.includes('100% confidence'),
    'task code quality reviewer should use the same evidence-backed confidence gate before approval',
  );
  assert.ok(
    content.includes('Unresolved Confidence Gaps'),
    'task code quality reviewer should report evidence gaps explicitly',
  );
  assert.ok(
    content.includes('Return NEEDS_CONTEXT when missing evidence prevents a reliable review'),
    'task code quality reviewer should map approval-blocking evidence gaps to NEEDS_CONTEXT',
  );
});

test('Codex mapping names the task-internal code quality reviewer prompt', () => {
  const content = read('skills/using-skills/references/codex-tools.md');

  assert.ok(
    content.includes('skills/spec-driven-development/code-quality-reviewer-prompt.md'),
    'Codex named-agent translation should point task-internal review to the spec-driven-development code quality reviewer prompt',
  );
  assert.ok(
    content.includes('skills/requesting-code-review/code-reviewer-prompt.md'),
    'Codex named-agent translation should keep standalone review mapped to requesting-code-review',
  );
});

test('role agent manifest includes task review templates', () => {
  const manifest = JSON.parse(read('manifests/install-modules.json'));
  const roleAgents = manifest.modules.find((module) => module.id === 'role-agents');

  assert.ok(roleAgents, 'role-agents module should exist');
  assert.ok(
    roleAgents.paths.includes('skills/spec-driven-development/spec-reviewer-prompt.md'),
    'role-agents should expose the Stage 1 spec reviewer template',
  );
  assert.ok(
    roleAgents.paths.includes('skills/spec-driven-development/code-quality-reviewer-prompt.md'),
    'role-agents should expose the Stage 2 code quality reviewer template',
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
