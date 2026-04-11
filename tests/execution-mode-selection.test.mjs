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

test('workflow guidance requires choosing an execution mode before resuming unchecked tasks', () => {
  const usingSkills = read('skills/using-skills/SKILL.md');
  const workflowSteering = read('steering/specpowers-workflow.md');

  assert.match(
    usingSkills,
    /If tasks\.md exists and has unchecked items[\s\S]*If the user has not explicitly chosen `Step-by-Step` or `Fast`[\s\S]*ask the user to choose/i,
  );
  assert.match(
    workflowSteering,
    /If a change directory exists with `tasks\.md`[\s\S]*If the execution mode has not been established[\s\S]*ask the user to choose `Step-by-Step` or `Fast` before activating `spec-driven-development`/i,
  );
});

test('execution guidance keeps mode selection explicit across skills and docs', () => {
  const planning = read('skills/planning/SKILL.md');
  const execution = read('skills/spec-driven-development/SKILL.md');
  const readme = read('README.md');
  const readmeZh = read('README.zh-CN.md');

  assert.match(planning, /Which mode\?/);
  assert.match(
    execution,
    /If no execution mode has been established for the current change[\s\S]*ask the user to choose `Step-by-Step` or `Fast` before resuming/i,
  );
  assert.match(
    readme,
    /choose `Step-by-Step` or `Fast` before execution begins or resumes/i,
  );
  assert.match(
    readmeZh,
    /执行开始或恢复前，先选择 `Step-by-Step` 或 `Fast`/i,
  );
});
