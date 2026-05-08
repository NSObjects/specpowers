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

test('post-implementation confidence loop covers ordinary edits and bug fixes', () => {
  const content = read('skills/confidence-loop/SKILL.md');

  for (const expected of [
    '## Post-Implementation Confidence Loop',
    'ordinary code edits',
    'code modifications',
    'bug fix implementations',
    'before reporting complete, fixed, passing, ready for review, or safe to proceed',
    'original failure',
    'modified code paths',
    'verification evidence',
    'known risks',
  ]) {
    assert.ok(content.includes(expected), `missing post-implementation trigger text: ${expected}`);
  }
});

test('post-implementation confidence loop source guidance stays in English', () => {
  const content = read('skills/confidence-loop/SKILL.md');
  const start = content.indexOf('## Post-Implementation Confidence Loop');
  assert.notEqual(start, -1, 'missing post-implementation confidence loop section');

  const nextSection = content.indexOf('\n## ', start + 1);
  const section = nextSection === -1 ? content.slice(start) : content.slice(start, nextSection);

  assert.doesNotMatch(section, /[\u4E00-\u9FFF]/u);
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

test('post-implementation reports include evidence and block completion claims on gaps', () => {
  const confidenceLoop = read('skills/confidence-loop/SKILL.md');
  const completionGate = read('skills/verification-before-completion/SKILL.md');

  for (const expected of [
    'post-implementation reports',
    'checked doubts',
    'fixed issues',
    'Unresolved Confidence Gaps',
    '`PASS | BLOCKED` result',
  ]) {
    assert.ok(confidenceLoop.includes(expected), `missing implementation report evidence text: ${expected}`);
  }

  for (const expected of [
    'ready for review',
    'safe to proceed',
    'State the actual status and the missing evidence instead',
  ]) {
    assert.ok(completionGate.includes(expected), `missing expanded completion gate text: ${expected}`);
  }
});

test('post-implementation trigger preserves existing workflow gates', () => {
  const confidenceLoop = read('skills/confidence-loop/SKILL.md');
  const usingSkills = read('skills/using-skills/SKILL.md');
  const specDrivenDevelopment = read('skills/spec-driven-development/SKILL.md');

  for (const expected of [
    'extends ordinary implementation paths',
    'does not replace spec-driven implementation, review, handoff, or completion gates',
    'Do not proceed while Critical or Important findings or Unresolved Confidence Gaps remain',
  ]) {
    assert.ok(confidenceLoop.includes(expected), `missing existing gate preservation text: ${expected}`);
  }

  assert.ok(
    usingSkills.includes('Support skills are not primary routes'),
    'using-skills should still keep confidence-loop out of primary workflow routing',
  );
  assert.ok(
    specDrivenDevelopment.includes('Run or verify `specpowers:confidence-loop` over the task scope after GREEN/refactor and before Stage 1 review'),
    'spec-driven-development task gate should remain intact',
  );
});

test('post-implementation confidence loop is documented as agent-owned rather than background automation', () => {
  const confidenceLoop = read('skills/confidence-loop/SKILL.md');
  const readme = read('README.md');
  const readmeZh = read('README.zh-CN.md');

  for (const expected of [
    'Agent-owned behavior gate',
    'external file changes do not automatically run it',
    'file watcher',
    'Git hook',
    'daemon',
    'runtime enforcement',
  ]) {
    assert.ok(confidenceLoop.includes(expected), `missing no-background boundary in confidence-loop: ${expected}`);
  }

  assert.ok(
    readme.includes('Agent-owned post-implementation gate'),
    'README should describe the post-implementation gate as agent-owned',
  );
  assert.ok(
    readme.includes('not a file watcher, Git hook, daemon, or runtime enforcement'),
    'README should reject background automation claims',
  );
  assert.ok(
    readmeZh.includes('Agent 自己完成代码实现后的门禁'),
    'Chinese README should describe the post-implementation gate as agent-owned',
  );
  assert.ok(
    readmeZh.includes('不是文件监听、Git hook、daemon 或 runtime enforcement'),
    'Chinese README should reject background automation claims',
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

test('using-skills routes completed code implementation to confidence-loop without covering non-code work', () => {
  const content = read('skills/using-skills/SKILL.md');

  for (const expected of [
    'completed code implementation',
    'ordinary code implementation',
    'run or apply `confidence-loop`',
    'same evidence-bound confidence definition',
    'read-only investigation, proposal, spec, design, or planning',
    'does not trigger the post-implementation Confidence Loop',
  ]) {
    assert.ok(content.includes(expected), `missing post-implementation routing text: ${expected}`);
  }

  assert.ok(
    content.includes('Support skills are not primary routes'),
    'confidence-loop should remain support-only after ordinary implementation routing',
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
