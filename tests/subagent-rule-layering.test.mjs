import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('fresh subagent prompts keep rules-common before language rules', () => {
  const implementer = read('skills/spec-driven-development/implementer-prompt.md');
  const reviewer = read('skills/spec-driven-development/code-quality-reviewer-prompt.md');

  assert.match(
    implementer,
    /rules-common[\s\S]*rules-\{language\}/,
    'implementer prompt should keep rules-common before language rules',
  );
  assert.match(
    reviewer,
    /rules-common[\s\S]*rules-\{language\}/,
    'code quality reviewer prompt should keep rules-common before language rules',
  );
});

test('subagent prompts require concrete language rules instead of unresolved placeholders', () => {
  const prompts = [
    ['implementer', read('skills/spec-driven-development/implementer-prompt.md')],
    ['code quality reviewer', read('skills/spec-driven-development/code-quality-reviewer-prompt.md')],
  ];

  for (const [name, content] of prompts) {
    assert.ok(
      content.includes('Resolved Language Rules'),
      `${name} prompt should require the controller to provide resolved language rules`,
    );
    assert.ok(
      content.includes('Do not dispatch') && content.includes('specpowers:rules-{language}'),
      `${name} prompt should block dispatch when the language placeholder is unresolved`,
    );
    assert.doesNotMatch(
      content,
      /^\s*-\s+specpowers:rules-\{language\}\s+for the project's primary language/m,
      `${name} prompt should not present the language placeholder as a loadable skill`,
    );
  }
});

test('spec-driven-development resolves language rules before dispatching workers and reviewers', () => {
  const content = read('skills/spec-driven-development/SKILL.md');

  assert.ok(
    content.includes('Resolve concrete language rules before dispatch'),
    'controller workflow should name dispatch-time language rule resolution',
  );
  assert.ok(
    content.includes('scripts/lib/language-detect.js'),
    'controller workflow should use the existing language detection helper',
  );
  assert.ok(
    content.includes('changed files') && content.includes('task files'),
    'controller workflow should resolve rules from task files and changed files',
  );
  assert.ok(
    content.includes('Do not dispatch') && content.includes('specpowers:rules-{language}'),
    'controller workflow should block unresolved language placeholders before dispatch',
  );
});

test('tdd language integration keeps rules-common active before language rules', () => {
  const tdd = read('skills/test-driven-development/SKILL.md');

  assert.match(
    tdd,
    /rules-common[\s\S]*rules-\{language\}/,
    'TDD language integration should keep rules-common active before language rules',
  );
});
