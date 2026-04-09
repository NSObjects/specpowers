/**
 * Unit tests for role agent template structure.
 *
 * Validates that each role agent prompt template defines:
 * - Role description (# title with role name)
 * - Input section (Inputs / Your Inputs)
 * - Output Format section
 * - Constraints or Process section
 *
 * Specific checks:
 * - Planner: read-only tools (Read, Grep, Glob); MUST NOT use Write/Edit
 * - Security reviewer: read-only tools; MUST NOT use Write/Edit; severity levels (CRITICAL, HIGH, MEDIUM, LOW)
 * - TDD guide: red-green-refactor cycle
 * - Code reviewer: severity levels (Critical, Important, Minor)
 *
 * Requirements: 4.1, 4.2, 4.3, 4.6
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');

const templates = [
  {
    name: 'planner-agent',
    path: 'skills/dispatching-parallel-agents/planner-agent-prompt.md',
  },
  {
    name: 'security-reviewer',
    path: 'skills/dispatching-parallel-agents/security-reviewer-prompt.md',
  },
  {
    name: 'tdd-guide',
    path: 'skills/dispatching-parallel-agents/tdd-guide-prompt.md',
  },
  {
    name: 'code-reviewer',
    path: 'skills/requesting-code-review/code-reviewer-prompt.md',
  },
  {
    name: 'implementation-researcher',
    path: 'skills/exploring/implementation-researcher-prompt.md',
  },
];

// Load all template contents once
const templateContents = {};
for (const t of templates) {
  templateContents[t.name] = fs.readFileSync(path.join(repoRoot, t.path), 'utf8');
}

// --- Common structure tests for all templates ---

test('role agent templates common structure', async (t) => {
  for (const tmpl of templates) {
    const content = templateContents[tmpl.name];

    await t.test(`${tmpl.name} has a role description (# title)`, () => {
      assert.match(content, /^# .+/m, `${tmpl.name} should have a # title heading`);
    });

    await t.test(`${tmpl.name} has an Inputs section`, () => {
      assert.match(
        content,
        /^## (Your Inputs|Inputs)/m,
        `${tmpl.name} should have a ## Inputs or ## Your Inputs section`,
      );
    });

    await t.test(`${tmpl.name} has an Output Format section`, () => {
      assert.match(
        content,
        /^## (Output Format|Report Format)/m,
        `${tmpl.name} should have an Output Format or Report Format section`,
      );
    });

    await t.test(`${tmpl.name} has a Constraints or Process section`, () => {
      assert.match(
        content,
        /^## (Constraints|Process|Guidance Process|Review Process|Planning Process)/m,
        `${tmpl.name} should have a Constraints or Process section`,
      );
    });
  }
});

// --- Planner-specific tests ---

test('planner agent template specifics', async (t) => {
  const content = templateContents['planner-agent'];

  await t.test('mentions Read as allowed tool', () => {
    assert.match(content, /\bRead\b/, 'planner should mention Read as allowed tool');
  });

  await t.test('mentions Grep as allowed tool', () => {
    assert.match(content, /\bGrep\b/, 'planner should mention Grep as allowed tool');
  });

  await t.test('mentions Glob as allowed tool', () => {
    assert.match(content, /\bGlob\b/, 'planner should mention Glob as allowed tool');
  });

  await t.test('restricts to read-only — MUST NOT use Write/Edit', () => {
    assert.match(
      content,
      /MUST NOT/i,
      'planner should contain a MUST NOT restriction',
    );
    assert.match(content, /Write/i, 'planner should mention Write as forbidden');
    assert.match(content, /Edit/i, 'planner should mention Edit as forbidden');
  });
});

// --- Security reviewer-specific tests ---

test('security reviewer template specifics', async (t) => {
  const content = templateContents['security-reviewer'];

  await t.test('mentions Read as allowed tool', () => {
    assert.match(content, /\bRead\b/, 'security-reviewer should mention Read');
  });

  await t.test('mentions Grep as allowed tool', () => {
    assert.match(content, /\bGrep\b/, 'security-reviewer should mention Grep');
  });

  await t.test('mentions Glob as allowed tool', () => {
    assert.match(content, /\bGlob\b/, 'security-reviewer should mention Glob');
  });

  await t.test('restricts to read-only — MUST NOT use Write/Edit', () => {
    assert.match(content, /MUST NOT/i, 'security-reviewer should contain MUST NOT restriction');
    assert.match(content, /Write/i, 'security-reviewer should mention Write as forbidden');
    assert.match(content, /Edit/i, 'security-reviewer should mention Edit as forbidden');
  });

  await t.test('includes CRITICAL severity level', () => {
    assert.match(content, /CRITICAL/i, 'security-reviewer should mention CRITICAL severity');
  });

  await t.test('includes HIGH severity level', () => {
    assert.match(content, /HIGH/i, 'security-reviewer should mention HIGH severity');
  });

  await t.test('includes MEDIUM severity level', () => {
    assert.match(content, /MEDIUM/i, 'security-reviewer should mention MEDIUM severity');
  });

  await t.test('includes LOW severity level', () => {
    assert.match(content, /LOW/i, 'security-reviewer should mention LOW severity');
  });
});

// --- TDD guide-specific tests ---

test('tdd guide template specifics', async (t) => {
  const content = templateContents['tdd-guide'];

  await t.test('mentions red phase', () => {
    assert.match(content, /\bred\b/i, 'tdd-guide should mention the red phase');
  });

  await t.test('mentions green phase', () => {
    assert.match(content, /\bgreen\b/i, 'tdd-guide should mention the green phase');
  });

  await t.test('mentions refactor phase', () => {
    assert.match(content, /\brefactor\b/i, 'tdd-guide should mention the refactor phase');
  });
});

// --- Code reviewer-specific tests ---

test('code reviewer template specifics', async (t) => {
  const content = templateContents['code-reviewer'];

  await t.test('includes Critical severity level', () => {
    assert.match(content, /Critical/i, 'code-reviewer should mention Critical severity');
  });

  await t.test('includes Important severity level', () => {
    assert.match(content, /Important/i, 'code-reviewer should mention Important severity');
  });

  await t.test('includes Minor severity level', () => {
    assert.match(content, /Minor/i, 'code-reviewer should mention Minor severity');
  });
});

// --- Implementation researcher-specific tests ---

test('implementation researcher template specifics', async (t) => {
  const content = templateContents['implementation-researcher'];

  await t.test('mentions codebase-first research order', () => {
    assert.match(content, /codebase first/i, 'implementation-researcher should search the codebase first');
  });

  await t.test('requires structured research output', () => {
    assert.match(content, /Decision/i, 'implementation-researcher should include a decision section');
    assert.match(content, /Candidates/i, 'implementation-researcher should include candidates in output');
  });

  await t.test('restricts itself to research rather than implementation', () => {
    assert.match(content, /MUST NOT/i, 'implementation-researcher should contain MUST NOT restriction');
    assert.match(content, /implement/i, 'implementation-researcher should forbid implementation work');
  });
});
