import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const disciplineGateCoverage = [
  { surface: 'rules-common', file: 'skills/rules-common/SKILL.md', marker: '## 7. Change Discipline' },
  { surface: 'spec-driven-development', file: 'skills/spec-driven-development/SKILL.md', marker: 'Maintain traceable changes' },
  { surface: 'implementer-prompt', file: 'skills/spec-driven-development/implementer-prompt.md', marker: 'Complexity Evidence' },
  { surface: 'task-code-quality-reviewer', file: 'skills/spec-driven-development/code-quality-reviewer-prompt.md', marker: '## Scope and Simplicity Discipline' },
  { surface: 'standalone-code-reviewer', file: 'skills/requesting-code-review/code-reviewer-prompt.md', marker: '### Focused Diff Discipline' },
];

test('rules-common requires evidence-based simplicity default', () => {
  const content = read('skills/rules-common/SKILL.md');

  assert.match(content, /minimum necessary complexity/i);
  assert.match(content, /least complex solution/i);
  assert.match(content, /current evidence/i);
  assert.match(content, /confirmed user request, specifications, task, tests, and repository constraints/i);
});

test('rules-common rejects speculative complexity', () => {
  const content = read('skills/rules-common/SKILL.md');

  assert.match(content, /hypothetical future requirements/i);
  assert.match(content, /speculative configuration/i);
  assert.match(content, /plugin points/i);
  assert.match(content, /strategy interfaces/i);
  assert.match(content, /out-of-scope observations/i);
});

test('rules-common limits cleanup to current-change orphans', () => {
  const content = read('skills/rules-common/SKILL.md');

  assert.match(content, /current-change orphan cleanup/i);
  assert.match(content, /imports, variables, functions, test helpers, or documentation fragments/i);
  assert.match(content, /pre-existing dead code/i);
  assert.match(content, /bad names, formatting inconsistencies, or neighboring design problems/i);
});

test('rules-common cleanup red flag respects current-change boundary', () => {
  const content = read('skills/rules-common/SKILL.md');

  assert.doesNotMatch(content, /"I'll clean this up later"\s*\|\s*Later never comes\. Fix it now or file a tracked issue\./);
  assert.match(
    content,
    /\|\s*"I'll clean this up later"\s*\|[^|]*current scope[^|]*out-of-scope observation[^|]*\|/i,
  );
});

test('spec-driven-development and implementer enforce surgical task boundaries', () => {
  const controller = read('skills/spec-driven-development/SKILL.md');
  const implementer = read('skills/spec-driven-development/implementer-prompt.md');

  for (const content of [controller, implementer]) {
    assert.match(content, /traceable changes/i);
    assert.match(content, /current request, accepted specification, task, failing test, review feedback, or current-change orphan cleanup/i);
    assert.match(content, /drive-by refactors/i);
    assert.match(content, /comment rewrites/i);
    assert.match(content, /formatting noise/i);
  }
});

test('implementer report records complexity evidence and current orphan cleanup', () => {
  const content = read('skills/spec-driven-development/implementer-prompt.md');

  for (const expected of [
    'Complexity Evidence',
    'Necessary Related Changes',
    'Current-Change Orphan Cleanup',
    'Out-of-Scope Observations',
  ]) {
    assert.ok(content.includes(expected), `implementer report should include ${expected}`);
  }

  assert.match(content, /extra structure/i);
  assert.match(content, /current evidence/i);
});

test('task code quality reviewer blocks inflated or untraceable diffs', () => {
  const content = read('skills/spec-driven-development/code-quality-reviewer-prompt.md');

  for (const expected of [
    'Scope and Simplicity Discipline',
    'scope drift',
    'over-abstracted implementation',
    'unrelated cleanup',
    'formatting noise',
    'unexplained complexity',
    'untraceable complexity',
    'NEEDS_CHANGES or NEEDS_CONTEXT',
  ]) {
    assert.ok(content.includes(expected), `task reviewer should include ${expected}`);
  }
});

test('standalone code reviewer checks focused and inflated diff discipline', () => {
  const content = read('skills/requesting-code-review/code-reviewer-prompt.md');

  for (const expected of [
    'Focused Diff Discipline',
    'focused diff',
    'inflated diff',
    'current-change orphan cleanup',
    'scope drift',
    'over-abstracted implementation',
    'formatting noise',
    'unexplained complexity',
  ]) {
    assert.ok(content.includes(expected), `standalone reviewer should include ${expected}`);
  }
});

test('simplicity and surgical discipline coverage matrix names every execution surface', () => {
  const source = read('tests/simplicity-surgical-discipline.test.mjs');

  assert.match(source, /^const disciplineGateCoverage = \[/m);

  assert.deepEqual(
    disciplineGateCoverage.map(({ surface }) => surface),
    ['rules-common', 'spec-driven-development', 'implementer-prompt', 'task-code-quality-reviewer', 'standalone-code-reviewer'],
  );

  for (const { surface, file, marker } of disciplineGateCoverage) {
    assert.match(
      source,
      new RegExp(`^  \\{ surface: '${surface}', file: '${file}'`, 'm'),
      `coverage matrix should bind ${surface} to ${file}`,
    );
    assert.ok(read(file).includes(marker), `${file} should contain ${marker}`);
  }
});
