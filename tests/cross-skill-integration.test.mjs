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

test('exploring references search-first', () => {
  const content = readSkill('skills/exploring/SKILL.md');
  assert.ok(
    content.includes('search-first'),
    'exploring should reference search-first when proposing approaches',
  );
});

test('designing references search-first', () => {
  const content = readSkill('skills/designing/SKILL.md');
  assert.ok(
    content.includes('search-first'),
    'designing should reference search-first for technology selection',
  );
});

test('verification-before-completion references quality-gate', () => {
  const content = readSkill('skills/verification-before-completion/SKILL.md');
  assert.ok(
    content.includes('quality-gate'),
    'verification-before-completion should reference quality-gate as automated evidence gathering',
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
