import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');
const codexToolsPath = path.join(repoRoot, 'skills/using-skills/references/codex-tools.md');

function readCodexTools() {
  return fs.readFileSync(codexToolsPath, 'utf8');
}

test('codex tools reference treats subagents as native support', () => {
  const content = readCodexTools();

  assert.doesNotMatch(
    content,
    /Subagent dispatch requires multi-agent support/i,
    'codex tools reference should not require extra multi-agent enablement',
  );
  assert.doesNotMatch(
    content,
    /multi_agent\s*=\s*true/i,
    'codex tools reference should not instruct users to enable multi_agent explicitly',
  );
  assert.match(
    content,
    /Codex supports subagent dispatch natively/i,
    'codex tools reference should describe native subagent support',
  );
  assert.match(
    content,
    /wait_agent/i,
    'codex tools reference should use the current wait_agent tool name',
  );
});
