/**
 * Search-first decision matrix evaluation.
 *
 * Applies the decision matrix from the search-first skill:
 *   - Exact match + active maintenance → Adopt
 *   - Partial match + active/stale maintenance → Extend
 *   - 2+ weak matches → Compose
 *   - Otherwise → Build
 */

/**
 * Evaluate search results and return a structured decision.
 *
 * @param {Array<{ name: string, matchQuality: 'exact'|'partial'|'weak'|'none', maintenanceStatus: 'active'|'stale'|'abandoned', licenseCompatible: boolean }>} results
 * @returns {{ decision: 'adopt'|'extend'|'compose'|'build', candidates: Array<{ name: string, matchQuality: string, maintenanceStatus: string, licenseCompatible: boolean }>, reasoning: string }}
 */
export function evaluateSearchResults(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return {
      decision: 'build',
      candidates: [],
      reasoning: 'No search results provided; defaulting to custom implementation.',
    };
  }

  // Step 1: Filter out license-incompatible results
  const compatible = results.filter(r => r.licenseCompatible);

  if (compatible.length === 0) {
    return {
      decision: 'build',
      candidates: [],
      reasoning: 'All results have incompatible licenses; defaulting to custom implementation.',
    };
  }

  // Step 2: Check for exact match + active maintenance → Adopt
  const exactActive = compatible.find(
    r => r.matchQuality === 'exact' && r.maintenanceStatus === 'active'
  );
  if (exactActive) {
    return {
      decision: 'adopt',
      candidates: [exactActive],
      reasoning: `"${exactActive.name}" is an exact match with active maintenance; adopt directly.`,
    };
  }

  // Step 3: Check for partial match + active or stale maintenance → Extend
  const partialViable = compatible.find(
    r => r.matchQuality === 'partial' && (r.maintenanceStatus === 'active' || r.maintenanceStatus === 'stale')
  );
  if (partialViable) {
    return {
      decision: 'extend',
      candidates: [partialViable],
      reasoning: `"${partialViable.name}" is a partial match (${partialViable.maintenanceStatus}); extend with wrapper.`,
    };
  }

  // Step 4: Check for 2+ weak matches → Compose
  const weakMatches = compatible.filter(r => r.matchQuality === 'weak');
  if (weakMatches.length >= 2) {
    return {
      decision: 'compose',
      candidates: weakMatches,
      reasoning: `${weakMatches.length} weak matches found; compose them together.`,
    };
  }

  // Step 5: Fallback → Build
  return {
    decision: 'build',
    candidates: [],
    reasoning: 'No suitable candidates for adopt, extend, or compose; build custom implementation.',
  };
}
