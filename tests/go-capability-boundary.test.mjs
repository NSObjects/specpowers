import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(ROOT, relativePath), 'utf8');
}

const mechanicalCapabilityFiles = [
  'skills/verification-loop/SKILL.md',
  'skills/quality-gate/SKILL.md',
  'scripts/lib/toolchain-detect.js',
  'scripts/lib/verification-engine.js',
];

const goJudgmentTerms = [
  'Effective Go',
  'Go Version Compatibility',
  'standard library APIs',
  'doc comments',
  'error strings',
  'error propagation',
  'error wrapping',
  'errors.Is',
  'errors.As',
  'context.Context',
  'context propagation',
  'defer cancel()',
  'ctx.Err()',
  'receiver',
  'resource cleanup',
  'goroutine',
  'goroutine lifecycle',
  'channel or mutex',
  'sync.Mutex',
  'mutable alias',
  'copy values containing',
  'nil and zero value',
  'typed nil',
  'nil interface',
  'slice and map',
  'slice aliasing',
  'range variable',
  'short variable declaration',
  'shadowing',
  'named return values',
  'naked return',
  'nil map',
  'comparable',
  'context.Value',
  'nil channel',
  'closed channel',
  'WaitGroup.Add',
  'defer arguments are evaluated immediately',
  'byte versus rune',
  'UTF-8',
  'integer conversion',
  'time.Duration',
  'append returns the updated slice',
  'concurrent map writes',
  'Low-level runtime contracts',
  't.Setenv',
  't.TempDir()',
  't.Fatal',
  'value semantics',
  'package-level mutable state',
  'generics',
  'reflect',
  'meaningful behavior',
  'low-quality tests',
  'mock the system under test',
  'loop variable capture',
  't.Cleanup()',
  't.Helper()',
  'time.Sleep()',
  'table-driven tests',
];

test('go-specific judgment guidance stays inside rules-golang', () => {
  const rulesGolang = read('skills/rules-golang/SKILL.md');

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

test('go capability boundary coverage names every mechanical surface', () => {
  const source = read('tests/go-capability-boundary.test.mjs');

  assert.match(source, /^const mechanicalCapabilityFiles = \[/m);
  assert.deepEqual(
    mechanicalCapabilityFiles,
    [
      'skills/verification-loop/SKILL.md',
      'skills/quality-gate/SKILL.md',
      'scripts/lib/toolchain-detect.js',
      'scripts/lib/verification-engine.js',
    ],
  );
});
