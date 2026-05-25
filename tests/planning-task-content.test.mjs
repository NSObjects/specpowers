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

test('planning tasks forbid embedding implementation content', () => {
  const planning = read('skills/planning/SKILL.md');

  assert.match(
    planning,
    /不要包含 code blocks、diffs、pseudocode、function bodies、imports、具体 control flow 或 inline implementation snippets/u,
  );
  assert.match(
    planning,
    /Tasks 只能命名 files、tests、responsibilities、observable behavior、acceptance criteria 和 verification commands/u,
  );
  assert.match(
    planning,
    /精确代码留给 `spec-driven-development`/u,
  );
});

test('planning GREEN step describes responsibility instead of code', () => {
  const planning = read('skills/planning/SKILL.md');

  assert.match(
    planning,
    /GREEN：描述满足测试的最小 production responsibility，不写代码/u,
  );
  assert.match(
    planning,
    /Responsibility: `<observable responsibility the implementation must provide; do not include code, pseudocode, or control-flow steps>`/i,
  );
  assert.doesNotMatch(
    planning,
    /Step 3: Implement minimal code/i,
  );
});
