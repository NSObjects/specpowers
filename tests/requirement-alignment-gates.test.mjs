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

  assert.match(content, /behavior-affecting open questions/i);
  assert.match(content, /do not create `proposal\.md`/i);
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

  assert.match(content, /behavior-affecting open questions/i);
  assert.match(content, /do not create behavioral specifications/i);
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
  assert.match(content, /rewrite them as concrete scenarios/i);
  assert.match(content, /blocking issue/i);
});

test('specifying blocks unconfirmed user-visible behavior assumptions', () => {
  const content = read('skills/specifying/SKILL.md');

  assert.match(content, /## Behavior Assumption Boundary/);
  assert.match(content, /non-behavioral assumption/i);
  assert.match(content, /user-visible behavior decision/i);
  assert.match(content, /scope, permissions, failure outcomes, or success criteria/i);
  assert.match(content, /must be confirmed by the user/i);
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

  assert.match(content, /return to `specifying`/i);
  assert.match(content, /trace.*Requirement/i);
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
