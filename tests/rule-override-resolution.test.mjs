/**
 * Property 1: Rule Override Resolution
 *
 * **Feature: absorb-ecc-capabilities, Property 1: Rule Override Resolution**
 * **Validates: Requirements 1.3**
 *
 * For any common rule set and language rule set, when a language rule declares
 * an override for a common rule ID, the resolved set contains the language
 * version; otherwise the resolved set contains the common version.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import fc from 'fast-check';
import { resolveRules } from '../scripts/lib/rule-resolver.js';

// --- Arbitraries ---

/** Generate a rule ID like "1.1", "2.3", etc. */
const ruleIdArb = fc.tuple(
  fc.integer({ min: 1, max: 9 }),
  fc.integer({ min: 1, max: 9 }),
).map(([section, item]) => `${section}.${item}`);

/** Generate a common rule: { id, content } */
const commonRuleArb = fc.record({
  id: ruleIdArb,
  content: fc.string({ minLength: 1, maxLength: 80 }),
});

/**
 * Generate a set of common rules with unique IDs.
 * Uses uniqueArray to guarantee no duplicate IDs.
 */
const commonRuleSetArb = fc.uniqueArray(commonRuleArb, {
  minLength: 1,
  maxLength: 15,
  selector: (r) => r.id,
});

/**
 * Given a set of common rules, generate language rules where some override
 * common rules and some are additions.
 */
function languageRuleSetArb(commonRules) {
  const commonIds = commonRules.map((r) => r.id);

  // Overriding rules: pick a subset of common IDs to override
  const overridingArb = commonIds.length > 0
    ? fc.subarray(commonIds, { minLength: 0 }).chain((idsToOverride) =>
        fc.tuple(
          ...idsToOverride.map((targetId) =>
            fc.record({
              id: ruleIdArb,
              content: fc.string({ minLength: 1, maxLength: 80 }),
              overrides: fc.constant(targetId),
            })
          )
        )
      )
    : fc.constant([]);

  // Additional language rules (no override)
  const additionsArb = fc.array(
    fc.record({
      id: ruleIdArb,
      content: fc.string({ minLength: 1, maxLength: 80 }),
    }),
    { minLength: 0, maxLength: 5 },
  );

  return fc.tuple(overridingArb, additionsArb).map(([overrides, additions]) => [
    ...overrides,
    ...additions,
  ]);
}

// --- Property tests ---

test('Property 1: Rule Override Resolution', async (t) => {
  await t.test(
    'overridden common rules resolve to language version, non-overridden resolve to common version',
    () => {
      fc.assert(
        fc.property(
          commonRuleSetArb.chain((commonRules) =>
            languageRuleSetArb(commonRules).map((langRules) => ({
              commonRules,
              langRules,
            }))
          ),
          ({ commonRules, langRules }) => {
            const resolved = resolveRules(commonRules, langRules);

            // Build lookup: which common IDs are overridden, and by which lang rule
            const overrideMap = new Map();
            for (const lr of langRules) {
              if (lr.overrides) {
                overrideMap.set(lr.overrides, lr);
              }
            }

            // The resolved array preserves common rule order for the first
            // commonRules.length entries (overridden or not).
            for (let i = 0; i < commonRules.length; i++) {
              const commonRule = commonRules[i];
              const resolvedEntry = resolved[i];
              const override = overrideMap.get(commonRule.id);

              if (override) {
                // Language override should replace this position
                assert.equal(resolvedEntry.id, override.id);
                assert.equal(resolvedEntry.content, override.content);
                assert.equal(resolvedEntry.source, 'language');
              } else {
                // Common version should be kept at this position
                assert.equal(resolvedEntry.id, commonRule.id);
                assert.equal(resolvedEntry.content, commonRule.content);
                assert.equal(resolvedEntry.source, 'common');
              }
            }
          }
        ),
        { numRuns: 150 },
      );
    }
  );

  await t.test(
    'language-only rules (no override) appear in resolved set',
    () => {
      fc.assert(
        fc.property(
          commonRuleSetArb.chain((commonRules) =>
            languageRuleSetArb(commonRules).map((langRules) => ({
              commonRules,
              langRules,
            }))
          ),
          ({ commonRules, langRules }) => {
            const resolved = resolveRules(commonRules, langRules);

            const additions = langRules.filter((lr) => !lr.overrides);
            for (const addition of additions) {
              const found = resolved.some(
                (r) => r.id === addition.id && r.content === addition.content && r.source === 'language'
              );
              assert.ok(
                found,
                `Language-only rule ${addition.id} should appear in resolved set`,
              );
            }
          }
        ),
        { numRuns: 150 },
      );
    }
  );

  await t.test(
    'resolved set size equals common rules count plus language-only additions',
    () => {
      fc.assert(
        fc.property(
          commonRuleSetArb.chain((commonRules) =>
            languageRuleSetArb(commonRules).map((langRules) => ({
              commonRules,
              langRules,
            }))
          ),
          ({ commonRules, langRules }) => {
            const resolved = resolveRules(commonRules, langRules);
            const additionCount = langRules.filter((lr) => !lr.overrides).length;
            assert.equal(resolved.length, commonRules.length + additionCount);
          }
        ),
        { numRuns: 150 },
      );
    }
  );
});
