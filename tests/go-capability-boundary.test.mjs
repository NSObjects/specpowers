import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('change artifacts keep go-specific capability inside rules-golang', () => {
  const design = read('specs/changes/separate-go-rules-and-verification/design.md');
  const tasks = read('specs/changes/separate-go-rules-and-verification/tasks.md');

  const designFileChanges = design
    .split('\n')
    .filter((line) => line.startsWith('- Create:') || line.startsWith('- Modify:') || line.startsWith('- Delete:'))
    .join('\n');
  const taskFileDeclarations = tasks
    .split('\n')
    .filter((line) => line.startsWith('**Files:**'))
    .join('\n');

  const forbidden = [
    'Modify: `skills/verification-loop/SKILL.md`',
    'Modify: `skills/quality-gate/SKILL.md`',
    'Modify: `scripts/lib/toolchain-detect.js`',
    'Modify: `scripts/lib/verification-engine.js`',
  ];

  for (const term of forbidden) {
    const filePath = term.replace('Modify: ', '');
    assert.ok(!designFileChanges.includes(term), `design should keep ${term} out of scope`);
    assert.ok(!taskFileDeclarations.includes(filePath), `tasks should keep ${filePath} out of scope`);
  }
});
