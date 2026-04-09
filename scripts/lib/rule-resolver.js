/**
 * Rule override resolution logic.
 *
 * Takes a common rule set and a language rule set, returns the resolved set
 * where language-specific overrides replace their common counterparts.
 *
 * Each rule has:
 *   - id: string (e.g. "1.1")
 *   - content: string
 *   - overrides?: string (the common rule ID this language rule replaces)
 */

/**
 * Resolve rules by merging common and language rule sets.
 * Language rules that declare an `overrides` field replace the matching common rule.
 * Language rules without `overrides` are appended as additions.
 * Common rules not overridden are kept as-is.
 *
 * @param {{ id: string, content: string }[]} commonRules
 * @param {{ id: string, content: string, overrides?: string }[]} languageRules
 * @returns {{ id: string, content: string, source: 'common' | 'language' }[]}
 */
export function resolveRules(commonRules, languageRules) {
  // Build a map of common-rule-id → language rule that overrides it
  const overrideMap = new Map();
  const additions = [];

  for (const langRule of languageRules) {
    if (langRule.overrides) {
      overrideMap.set(langRule.overrides, langRule);
    } else {
      additions.push(langRule);
    }
  }

  // Walk common rules: replace if overridden, keep otherwise
  const resolved = commonRules.map((commonRule) => {
    const override = overrideMap.get(commonRule.id);
    if (override) {
      return { id: override.id, content: override.content, source: 'language' };
    }
    return { id: commonRule.id, content: commonRule.content, source: 'common' };
  });

  // Append language-only rules (no override target)
  for (const addition of additions) {
    resolved.push({ id: addition.id, content: addition.content, source: 'language' });
  }

  return resolved;
}
