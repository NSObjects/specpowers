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
    /Fast Mode 只在用户明确要求时使用；否则使用 Step-by-Step Mode/u,
  );
});

test('execution guidance keeps mode selection explicit across skills and docs', () => {
  const planning = read('skills/planning/SKILL.md');
  const execution = read('skills/spec-driven-development/SKILL.md');
  const readme = read('README.md');
  const readmeZh = read('README.zh-CN.md');

  assert.match(planning, /请用户选择 execution mode/u);
  assert.match(
    execution,
    /确定 execution mode：[\s\S]*用户明确要求 Fast Mode → Fast Mode[\s\S]*否则 → Step-by-Step Mode/u,
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
