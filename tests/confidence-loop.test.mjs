import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('confidence-loop skill defines evidence-bound confidence without omniscience', () => {
  const content = read('skills/confidence-loop/SKILL.md');

  assert.ok(
    content.includes('Evidence-Bound Confidence Loop'),
    'confidence-loop should name the reusable loop',
  );
  assert.ok(
    content.includes('100% confidence'),
    'confidence-loop should preserve the user-facing confidence gate language',
  );
  assert.ok(
    content.includes('not omniscience'),
    'confidence-loop should reject literal omniscience as the meaning of 100% confidence',
  );
  assert.ok(
    content.includes('Unresolved Confidence Gaps'),
    'confidence-loop should expose missing evidence separately from issues',
  );
  assert.ok(
    content.includes('one full pass produces no new concrete blocking doubt'),
    'confidence-loop should define a concrete stopping condition',
  );
});

test('confidence-loop skill requires repeated doubt inspection before approval', () => {
  const content = read('skills/confidence-loop/SKILL.md');

  for (const expected of [
    'Define the reviewed scope',
    'List concrete doubts',
    'Investigate each doubt',
    'Fix, report, or convert',
    'Rerun relevant verification',
    'Ask the confidence gate again',
  ]) {
    assert.ok(content.includes(expected), `missing loop step: ${expected}`);
  }

  assert.ok(
    content.includes('Do not convert speculative concerns into findings'),
    'confidence-loop should prevent speculation from becoming fake certainty',
  );
});

test('implementer prompt blocks DONE when confidence gaps remain', () => {
  const content = read('skills/spec-driven-development/implementer-prompt.md');

  assert.ok(
    content.includes('specpowers:confidence-loop'),
    'implementer prompt should load or apply confidence-loop',
  );
  assert.ok(
    content.includes('Before returning DONE'),
    'implementer prompt should run the loop before returning DONE',
  );
  assert.ok(
    content.includes('unresolved confidence gap'),
    'implementer prompt should mention unresolved confidence gaps',
  );
  assert.ok(
    content.includes('must not return DONE'),
    'implementer prompt should forbid DONE with unresolved gaps',
  );
});

test('spec-driven-development requires confidence loop evidence before task completion', () => {
  const content = read('skills/spec-driven-development/SKILL.md');

  assert.ok(
    content.includes('specpowers:confidence-loop'),
    'spec-driven-development should list confidence-loop as a supporting skill',
  );
  assert.ok(
    content.includes('Evidence-bound confidence loop'),
    'spec-driven-development should insert the loop into task execution',
  );
  assert.ok(
    content.includes('Confidence Loop:'),
    'task reports should include confidence-loop evidence',
  );
  assert.ok(
    content.includes('Do not mark `tasks.md` complete while any unresolved confidence gap remains'),
    'task completion should be blocked by unresolved confidence gaps',
  );
});

test('verification-before-completion blocks completion claims on confidence gaps', () => {
  const content = read('skills/verification-before-completion/SKILL.md');

  assert.ok(
    content.includes('specpowers:confidence-loop'),
    'verification-before-completion should reference confidence-loop',
  );
  assert.ok(
    content.includes('Unresolved Confidence Gaps'),
    'completion verification should report unresolved confidence gaps',
  );
  assert.ok(
    content.includes('must not claim complete, fixed, passing, PR-ready, or approved'),
    'completion claims should be blocked when confidence gaps remain',
  );
});

test('using-skills treats confidence-loop as a support skill', () => {
  const content = read('skills/using-skills/SKILL.md');

  assert.ok(
    content.includes('| `confidence-loop` |'),
    'using-skills should route confidence-loop as support only',
  );
  assert.ok(
    content.includes('Support skills are not primary routes'),
    'confidence-loop should not become a primary workflow route',
  );
});

test('install manifest includes confidence-loop in foundation', () => {
  const manifest = JSON.parse(read('manifests/install-modules.json'));
  const foundation = manifest.modules.find((module) => module.id === 'foundation');

  assert.ok(foundation, 'foundation module should exist');
  assert.ok(
    foundation.paths.includes('skills/confidence-loop'),
    'foundation module should install confidence-loop by default',
  );
});
