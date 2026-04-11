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

test('tdd language integration keeps rules-common active before language rules', () => {
  const tdd = read('skills/test-driven-development/SKILL.md');

  assert.match(
    tdd,
    /rules-common[\s\S]*rules-\{language\}/,
    'TDD language integration should keep rules-common active before language rules',
  );
});
