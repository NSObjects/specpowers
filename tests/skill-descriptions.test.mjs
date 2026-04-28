import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');

function readDescription(relativePath) {
  const file = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
  const match = file.match(/^---\n[\s\S]*?\ndescription:\s*(.+)\n---/m);

  assert.ok(match, `missing description frontmatter in ${relativePath}`);

  return match[1].trim().replace(/^"(.*)"$/, '$1');
}

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const workflowSkills = [
  'skills/archiving/SKILL.md',
  'skills/designing/SKILL.md',
  'skills/exploring/SKILL.md',
  'skills/planning/SKILL.md',
  'skills/proposing/SKILL.md',
  'skills/spec-driven-development/SKILL.md',
  'skills/specifying/SKILL.md',
];

const forbiddenWorkflowShortcuts = [
  /\.md\b/,
  /GIVEN\/WHEN\/THEN/,
  /\bcreates?\b/i,
  /\bexecutes?\b/i,
  /\bmerges?\b/i,
  /\bbefore creating any artifacts\b/i,
  /\bthe spine of the entire workflow\b/i,
];

test('workflow skill descriptions focus on trigger conditions, not workflow summaries', () => {
  for (const relativePath of workflowSkills) {
    const description = readDescription(relativePath);

    assert.match(
      description,
      /^Use when /,
      `${relativePath} should start with "Use when" to stay discovery-friendly`,
    );

    for (const pattern of forbiddenWorkflowShortcuts) {
      assert.doesNotMatch(
        description,
        pattern,
        `${relativePath} should describe when to use the skill, not summarize its workflow`,
      );
    }
  }
});

// Capability skills — not workflow skills, but must have valid YAML frontmatter with description
const capabilitySkills = [
  'skills/rules-common/SKILL.md',
  'skills/verification-loop/SKILL.md',
  'skills/quality-gate/SKILL.md',
  'skills/selective-install/SKILL.md',
];

test('capability skills have valid YAML frontmatter with description', () => {
  for (const relativePath of capabilitySkills) {
    const description = readDescription(relativePath);

    assert.ok(
      description.length > 0,
      `${relativePath} should have a non-empty description`,
    );
  }
});

test('using-skills keeps routing in one primary decision table', () => {
  const content = read('skills/using-skills/SKILL.md');

  assert.ok(
    content.includes('## Routing Decision Table'),
    'using-skills should expose one routing decision table',
  );
  assert.ok(
    content.includes('Support skills are not primary routes'),
    'using-skills should separate primary workflow routing from support skills',
  );
  assert.ok(
    content.includes('| User request or repository state | Primary skill | Notes |'),
    'using-skills should make primary route selection table-driven',
  );
  assert.ok(
    content.includes('| `quality-gate` | The user asks for automated quality checks or an active workflow reaches that checkpoint. |'),
    'quality-gate should remain a support checkpoint, not a top-level route',
  );
  assert.ok(
    !content.includes('### Code quality, review, or standards check'),
    'using-skills should not keep broad overlapping routing subsections',
  );
});
