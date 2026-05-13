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
    /Do \*\*not\*\* include code blocks, diffs, pseudocode, function bodies, imports, concrete control flow, or inline implementation snippets/i,
  );
  assert.match(
    planning,
    /Tasks may name files, tests, responsibilities, observable behavior, acceptance criteria, and verification commands only/i,
  );
  assert.match(
    planning,
    /Leave exact code to `spec-driven-development`/i,
  );
});

test('planning GREEN step describes responsibility instead of code', () => {
  const planning = read('skills/planning/SKILL.md');

  assert.match(
    planning,
    /GREEN: describe the smallest production responsibility that satisfies the test, without writing code/i,
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
