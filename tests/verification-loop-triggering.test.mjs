import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function read(relativePath) {
  return readFileSync(resolve(ROOT, relativePath), 'utf-8');
}

test('planning defines level-2 task groups as feature-group boundaries', () => {
  const planning = read('skills/planning/SKILL.md');

  assert.match(
    planning,
    /`## 1\. \[Module Name\]`[\s\S]*feature group/i,
  );
  assert.match(
    planning,
    /`Task N\.M`[\s\S]*subtasks? within that feature group/i,
  );
});

test('spec-driven-development runs verification-loop at feature-group completion instead of task-count milestones', () => {
  const execution = read('skills/spec-driven-development/SKILL.md');

  assert.doesNotMatch(execution, /Every 3-4 completed tasks/i);
  assert.match(
    execution,
    /last subtask in a feature group[\s\S]*run `verification-loop`/i,
  );
  assert.match(
    execution,
    /intermediate subtasks?[\s\S]*do not trigger `verification-loop` by count alone/i,
  );
});

test('spec-driven-development blocks handoff to the next feature group until verification completes', () => {
  const execution = read('skills/spec-driven-development/SKILL.md');

  assert.match(
    execution,
    /before starting the next feature group[\s\S]*current feature group[\s\S]*`verification-loop` result/i,
  );
  assert.match(
    execution,
    /missing or failed[\s\S]*do not proceed to the next feature group/i,
  );
});

test('final completion requires a global verification-loop pass even for a single feature group', () => {
  const execution = read('skills/spec-driven-development/SKILL.md');
  const verification = read('skills/verification-loop/SKILL.md');

  assert.match(
    execution,
    /after all feature groups are complete[\s\S]*run a final `verification-loop` before the final completion report/i,
  );
  assert.match(
    verification,
    /single feature-group change[\s\S]*still requires a final `verification-loop` pass/i,
  );
  assert.doesNotMatch(verification, /every 3-4 completed tasks/i);
});
