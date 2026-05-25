import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const frontHalfWorkflowGateCoverage = [
  { stage: 'exploring', file: 'skills/exploring/SKILL.md', marker: '## Alignment Checkpoint' },
  { stage: 'proposing', file: 'skills/proposing/SKILL.md', marker: '## Proposal Boundary Contract' },
  { stage: 'specifying', file: 'skills/specifying/SKILL.md', marker: '## Concrete Behavior Gate' },
  { stage: 'designing', file: 'skills/designing/SKILL.md', marker: '## Spec Adequacy Gate' },
];

test('exploring requires a reviewable alignment checkpoint before proposing', () => {
  const content = read('skills/exploring/SKILL.md');

  assert.match(content, /## Alignment Checkpoint/);

  for (const requiredField of [
    'problem statement',
    'target users',
    'primary workflow',
    'inputs and outputs',
    'in-scope behavior',
    'out-of-scope behavior',
    'constraints',
    'failure modes',
    'open questions',
  ]) {
    assert.ok(
      content.includes(requiredField),
      `exploring alignment checkpoint should include ${requiredField}`,
    );
  }

  assert.match(content, /影响行为的 open questions|behavior-affecting open question/u);
  assert.match(content, /不要创建 `proposal\.md`/u);
});

test('proposing requires a reviewable boundary contract before specifying', () => {
  const content = read('skills/proposing/SKILL.md');

  assert.match(content, /## Proposal Boundary Contract/);

  for (const requiredField of [
    'Intent',
    'In-scope behavior',
    'Out-of-scope behavior',
    'User Workflow',
    'Boundary Decisions',
    'Definitions',
    'Open Questions',
    'Approach',
    'Observable Success Criteria',
  ]) {
    assert.ok(
      content.includes(requiredField),
      `proposal boundary contract should include ${requiredField}`,
    );
  }

  assert.match(content, /影响行为的 open questions|behavior-affecting open question/u);
  assert.match(content, /不要从未解决的假设创建 behavioral specifications/u);
});

test('specifying rejects abstract behavior and requires concrete scenarios', () => {
  const content = read('skills/specifying/SKILL.md');

  assert.match(content, /## Concrete Behavior Gate/);

  for (const requiredField of [
    'actor',
    'precondition',
    'trigger action',
    'expected outcome',
    'edge or error condition',
  ]) {
    assert.match(
      content,
      new RegExp(requiredField, 'i'),
      `specifying concrete behavior gate should mention ${requiredField}`,
    );
  }

  assert.match(content, /abstract behavior descriptions/i);
  assert.match(content, /重写成 concrete scenarios/u);
  assert.match(content, /blocking issue/i);
});

test('specifying blocks unconfirmed user-visible behavior assumptions', () => {
  const content = read('skills/specifying/SKILL.md');

  assert.match(content, /## Behavior Assumption Boundary/);
  assert.match(content, /non-behavioral assumption/i);
  assert.match(content, /user-visible behavior decision/i);
  assert.match(content, /scope、permissions、failure outcomes 或 success criteria/u);
  assert.match(content, /由用户确认/u);
});

test('designing requires adequate specifications before technical design', () => {
  const content = read('skills/designing/SKILL.md');

  assert.match(content, /## Spec Adequacy Gate/);

  for (const blocker of [
    'unresolved behavioral questions',
    'undefined terms',
    'missing edge or error scenarios',
    'unclear boundaries',
    'abstract expected outcomes',
  ]) {
    assert.ok(
      content.includes(blocker),
      `designing spec adequacy gate should mention ${blocker}`,
    );
  }

  assert.match(content, /回到 `specifying`/u);
  assert.match(content, /Requirement.*追溯/u);
});

test('requirement alignment gate coverage names every front-half workflow stage', () => {
  const source = read('tests/requirement-alignment-gates.test.mjs');

  assert.match(source, /^const frontHalfWorkflowGateCoverage = \[/m);

  assert.deepEqual(
    frontHalfWorkflowGateCoverage.map(({ stage }) => stage),
    ['exploring', 'proposing', 'specifying', 'designing'],
  );

  for (const { stage, file, marker } of frontHalfWorkflowGateCoverage) {
    assert.match(
      source,
      new RegExp(`^  \\{ stage: '${stage}', file: '${file}'`, 'm'),
      `coverage matrix should bind ${stage} to ${file}`,
    );
    assert.ok(
      read(file).includes(marker),
      `${file} should contain ${marker}`,
    );
  }
});
