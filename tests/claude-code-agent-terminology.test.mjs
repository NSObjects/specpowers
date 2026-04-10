import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { createInstalledFixture } from './helpers/install-fixture.js';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function readMaterialized(tmpRoot, relativePath) {
  return fs.readFileSync(path.join(tmpRoot, relativePath), 'utf8');
}

const sourceExpectations = [
  ['skills/exploring/SKILL.md', /Claude Code: use the `Agent` tool/i],
  ['skills/requesting-code-review/SKILL.md', /Claude Code: use `Agent` tool/i],
  ['skills/spec-driven-development/implementer-prompt.md', /^Agent tool \(general-purpose\):/m],
  ['skills/spec-driven-development/spec-reviewer-prompt.md', /^Agent tool \(general-purpose\):/m],
  [
    'skills/spec-driven-development/code-quality-reviewer-prompt.md',
    /^Agent tool \(specpowers:code-reviewer subagent\):/m,
  ],
  ['skills/dispatching-parallel-agents/SKILL.md', /Agent\("Fix agent-tool-abort\.test\.ts failures"\)/],
  ['skills/using-skills/SKILL.md', /`Agent` tool \(or legacy `Task` references\)/],
  ['skills/using-skills/references/kiro-tools.md', /\| `Agent` tool \(dispatch subagent\) \|/],
  ['skills/using-skills/references/codex-tools.md', /\| `Agent` tool \(dispatch subagent\) \|/],
];

const materializedRelativePaths = [
  ['.codex/skills/exploring/SKILL.md', /Claude Code: use the `Agent` tool/i],
  ['.codex/skills/requesting-code-review/SKILL.md', /Claude Code: use `Agent` tool/i],
  ['.codex/skills/spec-driven-development/implementer-prompt.md', /^Agent tool \(general-purpose\):/m],
  ['.codex/skills/spec-driven-development/spec-reviewer-prompt.md', /^Agent tool \(general-purpose\):/m],
  [
    '.codex/skills/spec-driven-development/code-quality-reviewer-prompt.md',
    /^Agent tool \(specpowers:code-reviewer subagent\):/m,
  ],
  ['.codex/skills/dispatching-parallel-agents/SKILL.md', /Agent\("Fix agent-tool-abort\.test\.ts failures"\)/],
  ['.codex/skills/using-skills/SKILL.md', /`Agent` tool \(or legacy `Task` references\)/],
  ['.codex/skills/using-skills/references/kiro-tools.md', /\| `Agent` tool \(dispatch subagent\) \|/],
  ['.codex/skills/using-skills/references/codex-tools.md', /\| `Agent` tool \(dispatch subagent\) \|/],
];

test('source skills prefer current Claude Code Agent terminology', () => {
  for (const [relativePath, pattern] of sourceExpectations) {
    const content = read(relativePath);
    assert.match(content, pattern, `${relativePath} should use current Claude Code Agent terminology`);
  }

  assert.doesNotMatch(
    read('skills/dispatching-parallel-agents/SKILL.md'),
    /^Task\(/m,
    'parallel dispatch example should no longer use Task(...) as the canonical Claude Code syntax',
  );
  assert.doesNotMatch(
    read('skills/using-skills/references/kiro-tools.md'),
    /^\| `Task` tool \(dispatch subagent\) \|/m,
    'kiro mapping should not present Task as the primary Claude Code tool name',
  );
  assert.doesNotMatch(
    read('skills/using-skills/references/codex-tools.md'),
    /^\| `Task` tool \(dispatch subagent\) \|/m,
    'codex mapping should not present Task as the primary Claude Code tool name',
  );
});

test('materialized codex skills stay aligned with Agent terminology', async () => {
  const tmp = await createInstalledFixture('codex', 'developer');
  try {
    for (const [relativePath, pattern] of materializedRelativePaths) {
      const content = readMaterialized(tmp, relativePath);
      assert.match(content, pattern, `${relativePath} should mirror current Claude Code Agent terminology`);
    }

    assert.doesNotMatch(
      readMaterialized(tmp, '.codex/skills/dispatching-parallel-agents/SKILL.md'),
      /^Task\(/m,
      'materialized parallel dispatch example should no longer use Task(...) as the canonical Claude Code syntax',
    );
    assert.doesNotMatch(
      readMaterialized(tmp, '.codex/skills/using-skills/references/kiro-tools.md'),
      /^\| `Task` tool \(dispatch subagent\) \|/m,
      'materialized kiro mapping should not present Task as the primary Claude Code tool name',
    );
    assert.doesNotMatch(
      readMaterialized(tmp, '.codex/skills/using-skills/references/codex-tools.md'),
      /^\| `Task` tool \(dispatch subagent\) \|/m,
      'materialized codex mapping should not present Task as the primary Claude Code tool name',
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
