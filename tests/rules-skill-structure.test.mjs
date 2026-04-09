/**
 * Unit tests for rule layering SKILL.md structure.
 *
 * Validates:
 * - rules-common has proper YAML frontmatter, Red Flags, Iron Laws, [可覆盖] tags, numbered rule IDs
 * - Each language rule SKILL.md has proper frontmatter (name, description, language),
 *   Red Flags, Iron Laws, [覆盖 common: X.Y] annotations referencing valid common rule IDs
 *
 * Requirements: 1.1, 1.2, 1.3, 1.7
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');
const commonPath = path.join(repoRoot, 'skills/rules-common/SKILL.md');
const commonContent = fs.readFileSync(commonPath, 'utf8');

/** Parse YAML frontmatter from a SKILL.md file. Returns key-value pairs. */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const pairs = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*(.+)$/);
    if (kv) pairs[kv[1]] = kv[2].trim().replace(/^"(.*)"$/, '$1');
  }
  return pairs;
}

/** Extract all rule IDs (### X.Y pattern) from content. */
function extractRuleIds(content) {
  const ids = [];
  for (const m of content.matchAll(/^### (\d+\.\d+)\b/gm)) {
    ids.push(m[1]);
  }
  return [...new Set(ids)];
}

/** Extract all override annotations [覆盖 common: X.Y] from content. */
function extractOverrideRefs(content) {
  const refs = [];
  for (const m of content.matchAll(/\[覆盖 common: (\d+\.\d+)\]/g)) {
    refs.push(m[1]);
  }
  return refs;
}

const languageSkills = [
  'rules-typescript',
  'rules-python',
  'rules-golang',
  'rules-rust',
  'rules-java',
  'rules-kotlin',
  'rules-cpp',
  'rules-swift',
  'rules-php',
  'rules-perl',
  'rules-csharp',
  'rules-dart',
];

// Pre-extract common rule IDs for cross-referencing
const commonRuleIds = extractRuleIds(commonContent);

// --- rules-common tests ---

test('rules-common SKILL.md structure', async (t) => {
  await t.test('has YAML frontmatter with name and description', () => {
    const fm = parseFrontmatter(commonContent);
    assert.ok(fm, 'rules-common should have YAML frontmatter');
    assert.equal(fm.name, 'rules-common', 'frontmatter name should be rules-common');
    assert.ok(fm.description, 'frontmatter should include a description');
  });

  await t.test('contains Red Flags section', () => {
    assert.match(commonContent, /^## Red Flags/m, 'should contain a ## Red Flags section');
  });

  await t.test('contains Iron Laws section', () => {
    assert.match(commonContent, /^## Iron Laws/m, 'should contain a ## Iron Laws section');
  });

  await t.test('contains [可覆盖] tags on overridable rules', () => {
    const overridableTags = commonContent.match(/\[可覆盖\]/g);
    assert.ok(overridableTags, 'should contain at least one [可覆盖] tag');
    assert.ok(overridableTags.length >= 3, `should have multiple [可覆盖] tags, found ${overridableTags.length}`);
  });

  await t.test('contains numbered rule IDs (### X.Y)', () => {
    assert.ok(commonRuleIds.length >= 5, `should have multiple rule IDs, found ${commonRuleIds.length}`);
    // Verify IDs follow the X.Y pattern
    for (const id of commonRuleIds) {
      assert.match(id, /^\d+\.\d+$/, `rule ID "${id}" should match X.Y pattern`);
    }
  });
});

// --- Language rule tests ---

test('language rule SKILL.md structure', async (t) => {
  for (const skillName of languageSkills) {
    await t.test(`${skillName} has valid structure`, async (t2) => {
      const filePath = path.join(repoRoot, `skills/${skillName}/SKILL.md`);
      const content = fs.readFileSync(filePath, 'utf8');

      await t2.test('has YAML frontmatter with name, description, and language', () => {
        const fm = parseFrontmatter(content);
        assert.ok(fm, `${skillName} should have YAML frontmatter`);
        assert.ok(fm.name, `${skillName} frontmatter should have name`);
        assert.ok(fm.description, `${skillName} frontmatter should have description`);
        assert.ok(fm.language, `${skillName} frontmatter should have language field`);
      });

      await t2.test('contains Red Flags section', () => {
        assert.match(content, /^## Red Flags/m, `${skillName} should contain ## Red Flags`);
      });

      await t2.test('contains Iron Laws section', () => {
        assert.match(content, /^## Iron Laws/m, `${skillName} should contain ## Iron Laws`);
      });

      await t2.test('contains override annotations [覆盖 common: X.Y]', () => {
        const overrides = extractOverrideRefs(content);
        assert.ok(overrides.length > 0, `${skillName} should have at least one [覆盖 common: X.Y] annotation`);
      });

      await t2.test('override annotations reference valid common rule IDs', () => {
        const overrides = extractOverrideRefs(content);
        for (const ref of overrides) {
          assert.ok(
            commonRuleIds.includes(ref),
            `${skillName} references common rule ${ref} which does not exist in rules-common (valid IDs: ${commonRuleIds.join(', ')})`,
          );
        }
      });
    });
  }
});
