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

test('receiving-code-review pushback guidance avoids user-facing catchphrases', () => {
  const content = read('skills/receiving-code-review/SKILL.md');

  assert.doesNotMatch(
    content,
    /\bsignal phrase\b/i,
    'receiving-code-review should not require a fixed signal phrase in user-facing replies',
  );
  assert.doesNotMatch(
    content,
    /Strange things are afoot at the Circle K/i,
    'receiving-code-review should avoid unrelated pop-culture catchphrases',
  );
});

test('receiving-code-review reply guidance stays platform-neutral', () => {
  const content = read('skills/receiving-code-review/SKILL.md');

  assert.doesNotMatch(
    content,
    /GitHub|Yunxiao|云效/i,
    'receiving-code-review should avoid naming specific code hosting platforms',
  );
  assert.doesNotMatch(
    content,
    /\bgh api\b/i,
    'receiving-code-review should not prescribe GitHub CLI commands',
  );
});

test('receiving-code-review defines how to obtain missing feedback', () => {
  const content = read('skills/receiving-code-review/SKILL.md');

  assert.ok(
    content.includes('## Feedback Input Boundary'),
    'receiving-code-review should define the boundary for obtaining review feedback',
  );
  assert.ok(
    content.includes('configured review source'),
    'receiving-code-review should use the configured review source instead of assuming one provider',
  );
  assert.ok(
    content.includes('ask the user for the missing comments, link, review identifier, platform, or permissions'),
    'receiving-code-review should ask for missing review input instead of inventing comments',
  );
  assert.ok(
    content.includes('Do not invent, infer, or simulate review comments'),
    'receiving-code-review should forbid fabricated review feedback',
  );
});

test('receiving-code-review routes review comment acquisition by platform', () => {
  const content = read('skills/receiving-code-review/SKILL.md');

  assert.ok(
    content.includes('## Review Comment Acquisition'),
    'receiving-code-review should define how to acquire comments before processing them',
  );
  assert.ok(
    content.includes('native repository or code-host integration'),
    'receiving-code-review should allow platform-native repository integrations',
  );
  assert.ok(
    content.includes('MCP or platform integration'),
    'receiving-code-review should route platform integrations without naming a specific provider',
  );
  assert.ok(
    content.includes('MCP'),
    'receiving-code-review should explicitly support MCP-backed platforms',
  );
  assert.ok(
    content.includes('merge request') && content.includes('pull request'),
    'receiving-code-review should cover both MR and PR terminology',
  );
});

test('receiving-code-review acquisition guidance avoids rigid step scripts', () => {
  const content = read('skills/receiving-code-review/SKILL.md');
  const acquisition = content.split('## Review Comment Acquisition')[1]?.split('## Default Workflow')[0] ?? '';

  assert.doesNotMatch(
    acquisition,
    /^\d+\.\s/m,
    'comment acquisition should be priority guidance rather than a rigid numbered script',
  );
  assert.ok(
    acquisition.includes('Prefer this order'),
    'comment acquisition should describe a flexible preference order',
  );
});
