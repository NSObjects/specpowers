import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('rules-golang focuses on judgment-heavy Go guidance', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /doc comments/i);
  assert.match(content, /error strings/i);
  assert.match(content, /context\.Context/);
  assert.match(content, /receiver/i);
  assert.match(content, /goroutine/i);
  assert.match(content, /table-driven tests/i);
  assert.match(content, /verification tooling/i);
});

test('rules-golang avoids tool-owned checks and library preference drift', () => {
  const content = read('skills/rules-golang/SKILL.md');

  const forbidden = [
    'sqlx',
    'sqlc',
    'pgx',
    'testify',
    'go-cmp',
    'rapid',
    'gopter',
    'gofmt',
    'goimports',
    'golangci-lint',
    'go vet',
    'go test -race',
  ];

  for (const term of forbidden) {
    assert.ok(!content.includes(term), `rules-golang should not treat ${term} as a core rule`);
  }
});
