import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');

function readSkill(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('spec-driven-development references verification-loop', () => {
  const content = readSkill('skills/spec-driven-development/SKILL.md');
  assert.ok(
    content.includes('verification-loop'),
    'spec-driven-development should reference verification-loop for milestone verification',
  );
});

test('exploring embeds implementation research and optional delegation', () => {
  const content = readSkill('skills/exploring/SKILL.md');
  assert.ok(
    content.includes('implementation research'),
    'exploring should describe implementation research as part of the stage',
  );
  assert.ok(
    content.includes('subagent'),
    'exploring should allow optional subagent delegation for complex research',
  );
  assert.ok(
    content.includes('Platform dispatch'),
    'exploring should document platform-specific research dispatch',
  );
  assert.ok(
    content.includes('Claude Code'),
    'exploring should mention Claude Code dispatch',
  );
  assert.ok(
    content.includes('Kiro'),
    'exploring should mention Kiro dispatch',
  );
  assert.ok(
    content.includes('Codex'),
    'exploring should mention Codex dispatch',
  );
  assert.ok(
    content.includes('Cursor, Gemini CLI, OpenCode'),
    'exploring should document inline fallback on platforms without subagents',
  );
  assert.ok(
    content.includes('implementation-researcher-prompt.md'),
    'exploring should reference the research subagent prompt template',
  );
});

test('verification-before-completion references quality-gate', () => {
  const content = readSkill('skills/verification-before-completion/SKILL.md');
  assert.ok(
    content.includes('quality-gate'),
    'verification-before-completion should reference quality-gate as automated evidence gathering',
  );
});

test('designing and rules-common enforce research-first decision guidance', () => {
  const designing = readSkill('skills/designing/SKILL.md');
  const rules = readSkill('skills/rules-common/SKILL.md');

  assert.ok(
    designing.includes('rules-common'),
    'designing should reference rules-common for research-first guidance',
  );
  assert.ok(
    rules.includes('Adopt / Extend / Compose / Build'),
    'rules-common should require explicit adopt/extend/compose/build decisions',
  );
});

test('dispatching-parallel-agents references role agent templates', () => {
  const content = readSkill('skills/dispatching-parallel-agents/SKILL.md');

  assert.ok(
    content.includes('planner-agent-prompt.md'),
    'dispatching-parallel-agents should reference planner agent template',
  );
  assert.ok(
    content.includes('security-reviewer-prompt.md'),
    'dispatching-parallel-agents should reference security reviewer template',
  );
  assert.ok(
    content.includes('tdd-guide-prompt.md'),
    'dispatching-parallel-agents should reference TDD guide template',
  );
});
