import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('go-specific judgment guidance stays inside rules-golang', () => {
  const rulesGolang = read('skills/rules-golang/SKILL.md');
  const mechanicalCapabilityFiles = [
    'skills/verification-loop/SKILL.md',
    'skills/quality-gate/SKILL.md',
    'scripts/lib/toolchain-detect.js',
    'scripts/lib/verification-engine.js',
  ];
  const goJudgmentTerms = [
    'doc comments',
    'error strings',
    'context.Context',
    'receiver choices',
    'goroutine',
    'table-driven tests',
  ];

  for (const term of goJudgmentTerms) {
    assert.ok(
      rulesGolang.includes(term),
      `rules-golang should own Go judgment guidance for "${term}"`,
    );
  }

  for (const filePath of mechanicalCapabilityFiles) {
    const content = read(filePath);
    for (const term of goJudgmentTerms) {
      assert.ok(
        !content.includes(term),
        `${filePath} should not duplicate Go judgment guidance for "${term}"`,
      );
    }
  }
});
