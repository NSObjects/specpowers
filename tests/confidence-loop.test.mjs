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
    content.includes('artifact handoff'),
    'using-skills should route confidence-loop for artifact handoff gates',
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

test('review package adequacy gate blocks under-specified subagent reviews', () => {
  const content = read('skills/confidence-loop/SKILL.md');

  for (const expected of [
    '## Review Package Adequacy Gate',
    'scope',
    'current artifact or diff',
    'confirmed user decisions',
    'in-scope and out-of-scope boundaries',
    'open questions',
    'relevant specs, design, tasks, and tests',
    'known risks',
    'prior findings or gaps',
    'Do not infer missing context',
    'NEEDS_CONTEXT',
    'NEEDS_USER_DECISION',
    'Unresolved Confidence Gaps',
  ]) {
    assert.ok(content.includes(expected), `missing adequacy gate text: ${expected}`);
  }
});

test('workflow handoff reviewer prompt defines read-only dialogue loop', () => {
  const oldPromptPath = path.join(repoRoot, 'skills/confidence-loop/transition-confidence-reviewer-prompt.md');
  const newPromptPath = path.join(repoRoot, 'skills/confidence-loop/workflow-handoff-reviewer-prompt.md');

  assert.ok(!fs.existsSync(oldPromptPath), 'old transition reviewer prompt should be removed after rename');
  assert.ok(fs.existsSync(newPromptPath), 'workflow handoff reviewer prompt should exist');

  const content = read('skills/confidence-loop/workflow-handoff-reviewer-prompt.md');

  for (const expected of [
    'Workflow Handoff Reviewer',
    'read-only',
    'Do not edit files',
    'Handoff Under Review',
    'Review Package Adequacy Gate',
    'Resolution Package',
    'PASS | NEEDS_CHANGES | NEEDS_USER_DECISION',
    'Unresolved Confidence Gaps',
    'Repeat until PASS or NEEDS_USER_DECISION',
    '[source stage → target stage]',
    'Examples:',
  ]) {
    assert.ok(content.includes(expected), `missing reviewer prompt text: ${expected}`);
  }

  assert.ok(
    !content.includes('[exploring → proposing | proposing → specifying | specifying → designing | designing → planning]'),
    'workflow handoff reviewer prompt should not lock the generic handoff slot to four workflow examples',
  );
});

test('confidence-loop centralizes workflow handoff reviewer dialogue loop', () => {
  const content = read('skills/confidence-loop/SKILL.md');

  for (const expected of [
    '## Workflow Handoff Confidence Loop',
    'workflow-handoff-reviewer-prompt.md',
    'Resolution Package',
    'repeat until `PASS` or `NEEDS_USER_DECISION`',
    'Do not proceed while Critical or Important findings or Unresolved Confidence Gaps remain',
  ]) {
    assert.ok(content.includes(expected), `missing centralized handoff loop text: ${expected}`);
  }

  assert.ok(
    content.includes('planning → spec-driven-development'),
    'workflow handoff loop should explicitly include planning to implementation handoff',
  );
  assert.ok(
    !content.includes('transition-confidence-reviewer-prompt.md'),
    'confidence-loop should not reference the old transition reviewer prompt path',
  );
});

test('artifact workflow handoffs delegate loop mechanics to confidence-loop', () => {
  const handoffs = [
    {
      file: 'skills/exploring/SKILL.md',
      handoff: 'exploring → proposing',
    },
    {
      file: 'skills/proposing/SKILL.md',
      handoff: 'proposing → specifying',
    },
    {
      file: 'skills/specifying/SKILL.md',
      handoff: 'specifying → designing',
    },
    {
      file: 'skills/designing/SKILL.md',
      handoff: 'designing → planning',
    },
    {
      file: 'skills/planning/SKILL.md',
      handoff: 'planning → spec-driven-development',
    },
  ];

  for (const { file, handoff } of handoffs) {
    const content = read(file);

    assert.ok(
      content.includes('Workflow Handoff Confidence Loop'),
      `${file} should require the workflow handoff loop`,
    );
    assert.ok(content.includes(handoff), `${file} should name handoff ${handoff}`);
    assert.ok(
      content.includes('workflow-handoff-reviewer-prompt.md'),
      `${file} should reference the handoff reviewer prompt`,
    );
    assert.ok(
      content.includes('Use the Workflow Handoff Confidence Loop from'),
      `${file} should delegate dialogue mechanics to confidence-loop`,
    );
    assert.ok(
      content.includes('Review package must include'),
      `${file} should define handoff-specific review package fields`,
    );
    assert.ok(
      !content.includes('submit a Resolution Package for re-review'),
      `${file} should not duplicate the centralized Resolution Package mechanics`,
    );
    assert.ok(
      !content.includes('If the reviewer returns `NEEDS_CHANGES`'),
      `${file} should not duplicate the centralized reviewer return handling`,
    );
  }
});

test('planning handoff package includes implementation readiness evidence', () => {
  const content = read('skills/planning/SKILL.md');

  for (const expected of [
    'tasks.md',
    'Spec Coverage Summary',
    'design constraints',
    'test commands',
    'execution mode decision',
    'Open Planning Blockers',
  ]) {
    assert.ok(content.includes(expected), `planning handoff package should include: ${expected}`);
  }

  assert.ok(
    content.includes('If the handoff loop changes `tasks.md`, assumptions, scope, test commands, or execution-relevant content'),
    'planning handoff should require renewed approval after execution-relevant plan changes',
  );
  assert.ok(
    content.includes('obtain user approval and execution mode confirmation again'),
    'planning handoff should not proceed to implementation after unapproved plan changes',
  );
});

test('confidence-loop documents artifact handoff and review confidence scopes', () => {
  const content = read('skills/confidence-loop/SKILL.md');

  assert.ok(
    content.includes('artifact handoff'),
    'confidence-loop should cover artifact handoffs',
  );
  assert.ok(
    content.includes('artifact or handoff package'),
    'confidence-loop reports should allow artifact handoff packages as scope',
  );
  assert.ok(
    content.includes('## Review Confidence Loop'),
    'confidence-loop should define a shared review confidence loop',
  );
  assert.ok(
    content.includes('workflow-handoff-reviewer-prompt.md'),
    'confidence-loop should point to the workflow handoff reviewer prompt',
  );
});
