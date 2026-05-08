import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const diagnosticGateCoverage = [
  { surface: 'routing', file: 'skills/using-skills/SKILL.md', marker: 'diagnostic discussion mode' },
  { surface: 'debugging', file: 'skills/systematic-debugging/SKILL.md', marker: '## Diagnostic Discussion Gate' },
];

test('using-skills routes bug reports to diagnostic discussion', () => {
  const content = read('skills/using-skills/SKILL.md');

  for (const expected of [
    'bug report',
    'error report',
    'test failure',
    'regression',
    'unexpected behavior',
    'failure-related why-question',
    'systematic-debugging',
    'diagnostic discussion mode',
    'not edit authorization',
  ]) {
    assert.match(content, new RegExp(expected, 'i'), `using-skills should mention ${expected}`);
  }
});

test('using-skills does not treat every why-question as a bug diagnostic', () => {
  const content = read('skills/using-skills/SKILL.md');

  assert.doesNotMatch(content, /or why-question defaults/i);
  assert.match(content, /failure-related why-question/i);
  assert.match(content, /design, trade-off, architecture, workflow, or explanation-only why-questions/i);
  assert.match(content, /do not treat it as a bug diagnostic/i);
});

test('using-skills keeps ordinary bug diagnostics out of the full artifact workflow', () => {
  const content = read('skills/using-skills/SKILL.md');

  assert.match(content, /ordinary bug diagnostics/i);
  assert.match(content, /lightweight path/i);
  assert.match(content, /read-only diagnostic work does not require `proposing`, `specifying`, `designing`, or `planning`/i);
  assert.match(content, /behavior change or expanded scope/i);
});

test('using-skills keeps authorized bug fixes bound to specs or existing contracts', () => {
  const content = read('skills/using-skills/SKILL.md');

  for (const expected of [
    'fix authorization is not an artifact-workflow bypass',
    'bind the fix to an existing accepted spec, existing observable contract, or failing test',
    'create or confirm a minimal bug specification',
    'no new spec artifact is required',
  ]) {
    assert.match(content, new RegExp(expected, 'i'), `using-skills should include authorized fix boundary: ${expected}`);
  }
});

test('systematic-debugging requires read-only discussion before fixes', () => {
  const content = read('skills/systematic-debugging/SKILL.md');

  for (const expected of [
    '## Diagnostic Discussion Gate',
    'A bug report is not edit authorization',
    'diagnostic discussion mode',
    'read-only',
    'Do not edit files',
    'Do not generate patches',
    'Do not refactor',
    'Do not attempt fixes',
  ]) {
    assert.ok(content.includes(expected), `systematic-debugging should include ${expected}`);
  }
});

test('systematic-debugging requires code reading and evidence tracing before implementation', () => {
  const content = read('skills/systematic-debugging/SKILL.md');

  for (const expected of [
    'Read the relevant code carefully',
    'entry points',
    'call flow',
    'data flow',
    'configuration',
    'tests',
    'recent changes',
  ]) {
    assert.match(content, new RegExp(expected, 'i'), `debugging gate should require ${expected}`);
  }
});

test('systematic-debugging discusses findings and asks for confirmation before implementation', () => {
  const content = read('skills/systematic-debugging/SKILL.md');

  for (const expected of [
    'confirmed facts',
    'suspected root cause',
    'unresolved doubts',
    'smallest repair direction',
    'Ask for user confirmation',
    'Phase 4 Implementation',
    'explicitly authorized a direct fix',
  ]) {
    assert.match(content, new RegExp(expected, 'i'), `debugging gate should mention ${expected}`);
  }
});

test('systematic-debugging requires bug fix implementation to keep specification traceability', () => {
  const content = read('skills/systematic-debugging/SKILL.md');

  for (const expected of [
    'Fix authorization is not permission to skip specification discipline',
    'existing accepted spec',
    'existing observable contract',
    'failing test',
    'minimal bug spec',
    'No new spec artifact is required',
  ]) {
    assert.match(content, new RegExp(expected, 'i'), `debugging gate should preserve spec traceability: ${expected}`);
  }
});

test('bug diagnostic discussion gate coverage names every protected surface', () => {
  const source = read('tests/bug-diagnostic-discussion-gate.test.mjs');

  assert.match(source, /^const diagnosticGateCoverage = \[/m);

  assert.deepEqual(
    diagnosticGateCoverage.map(({ surface }) => surface),
    ['routing', 'debugging'],
  );

  for (const { surface, file, marker } of diagnosticGateCoverage) {
    assert.match(
      source,
      new RegExp(`^  \\{ surface: '${surface}', file: '${file}'`, 'm'),
      `coverage matrix should bind ${surface} to ${file}`,
    );
    assert.ok(read(file).includes(marker), `${file} should contain ${marker}`);
  }
});
