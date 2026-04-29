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
  const execution = read('skills/spec-driven-development/SKILL.md');

  assert.match(
    usingSkills,
    /Approved `tasks\.md` exists and the user wants implementation to begin or resume[\s\S]*Reuse the current execution mode if already chosen; otherwise ask for `Step-by-Step` or `Fast`/i,
  );
  assert.match(
    execution,
    /Use Fast Mode only when the user explicitly asks for it\. Otherwise use Step-by-Step Mode\./i,
  );
});

test('execution guidance keeps mode selection explicit across skills and docs', () => {
  const planning = read('skills/planning/SKILL.md');
  const execution = read('skills/spec-driven-development/SKILL.md');
  const readme = read('README.md');
  const readmeZh = read('README.zh-CN.md');

  assert.match(planning, /Ask the user to choose an execution mode\./);
  assert.match(
    execution,
    /Determine execution mode:[\s\S]*explicit user request for Fast Mode → Fast Mode[\s\S]*otherwise → Step-by-Step Mode/i,
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
