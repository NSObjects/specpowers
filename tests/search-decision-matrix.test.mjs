/**
 * Property 6: Research Decision Matrix
 *
 * **Feature: absorb-ecc-capabilities, Property 6: Research Decision Matrix**
 * **Validates: Requirements 3.2**
 *
 * For any search result scores (match quality, maintenance status, license),
 * the decision function returns the correct Adopt/Extend/Compose/Build decision.
 *
 * Decision priority: adopt > extend > compose > build
 * License-incompatible results are filtered out first.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import fc from 'fast-check';
import { evaluateSearchResults } from '../scripts/lib/search-decision.js';

// --- Arbitraries ---

const matchQualityArb = fc.constantFrom('exact', 'partial', 'weak', 'none');
const maintenanceStatusArb = fc.constantFrom('active', 'stale', 'abandoned');
const licenseCompatibleArb = fc.boolean();

const searchResultArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 30 }),
  matchQuality: matchQualityArb,
  maintenanceStatus: maintenanceStatusArb,
  licenseCompatible: licenseCompatibleArb,
});

const searchResultsArb = fc.array(searchResultArb, { minLength: 0, maxLength: 15 });

// --- Helpers ---

/**
 * Compute the expected decision from a results array using the same
 * priority logic the implementation should follow.
 */
function expectedDecision(results) {
  if (!Array.isArray(results) || results.length === 0) return 'build';

  const compatible = results.filter(r => r.licenseCompatible);
  if (compatible.length === 0) return 'build';

  const hasAdopt = compatible.some(
    r => r.matchQuality === 'exact' && r.maintenanceStatus === 'active',
  );
  if (hasAdopt) return 'adopt';

  const hasExtend = compatible.some(
    r => r.matchQuality === 'partial' && (r.maintenanceStatus === 'active' || r.maintenanceStatus === 'stale'),
  );
  if (hasExtend) return 'extend';

  const weakCount = compatible.filter(r => r.matchQuality === 'weak').length;
  if (weakCount >= 2) return 'compose';

  return 'build';
}

// --- Property tests ---

test('Property 6: Research Decision Matrix', async (t) => {
  await t.test(
    'decision matches expected priority for arbitrary search results',
    () => {
      fc.assert(
        fc.property(searchResultsArb, (results) => {
          const { decision } = evaluateSearchResults(results);
          const expected = expectedDecision(results);
          assert.equal(
            decision,
            expected,
            `For ${results.length} results, expected "${expected}" but got "${decision}"`,
          );
        }),
        { numRuns: 200 },
      );
    },
  );

  await t.test(
    'license-incompatible results are excluded from candidates',
    () => {
      fc.assert(
        fc.property(searchResultsArb, (results) => {
          const { candidates } = evaluateSearchResults(results);
          for (const c of candidates) {
            assert.equal(
              c.licenseCompatible,
              true,
              `Candidate "${c.name}" should be license-compatible`,
            );
          }
        }),
        { numRuns: 150 },
      );
    },
  );

  await t.test(
    'empty input always returns build with no candidates',
    () => {
      fc.assert(
        fc.property(fc.constant([]), (results) => {
          const { decision, candidates } = evaluateSearchResults(results);
          assert.equal(decision, 'build');
          assert.equal(candidates.length, 0);
        }),
        { numRuns: 100 },
      );
    },
  );

  await t.test(
    'exact+active compatible result always yields adopt',
    () => {
      fc.assert(
        fc.property(
          searchResultsArb,
          fc.string({ minLength: 1, maxLength: 20 }),
          (otherResults, name) => {
            const adoptCandidate = {
              name,
              matchQuality: 'exact',
              maintenanceStatus: 'active',
              licenseCompatible: true,
            };
            const results = [...otherResults, adoptCandidate];
            const { decision } = evaluateSearchResults(results);
            assert.equal(decision, 'adopt');
          },
        ),
        { numRuns: 150 },
      );
    },
  );

  await t.test(
    'partial+(active|stale) compatible result yields extend when no adopt candidate exists',
    () => {
      fc.assert(
        fc.property(
          // Generate results that cannot trigger adopt
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 20 }),
              matchQuality: fc.constantFrom('partial', 'weak', 'none'),
              maintenanceStatus: maintenanceStatusArb,
              licenseCompatible: licenseCompatibleArb,
            }),
            { minLength: 0, maxLength: 10 },
          ),
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.constantFrom('active', 'stale'),
          (otherResults, name, maintenance) => {
            const extendCandidate = {
              name,
              matchQuality: 'partial',
              maintenanceStatus: maintenance,
              licenseCompatible: true,
            };
            const results = [...otherResults, extendCandidate];
            const { decision } = evaluateSearchResults(results);
            assert.equal(decision, 'extend');
          },
        ),
        { numRuns: 150 },
      );
    },
  );

  await t.test(
    '2+ compatible weak matches yield compose when no adopt/extend candidates exist',
    () => {
      fc.assert(
        fc.property(
          // Generate results that cannot trigger adopt or extend
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 20 }),
              matchQuality: fc.constantFrom('weak', 'none'),
              maintenanceStatus: fc.constant('abandoned'),
              licenseCompatible: licenseCompatibleArb,
            }),
            { minLength: 0, maxLength: 10 },
          ),
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 20 }),
          (otherResults, name1, name2) => {
            const weak1 = {
              name: name1,
              matchQuality: 'weak',
              maintenanceStatus: 'abandoned',
              licenseCompatible: true,
            };
            const weak2 = {
              name: name2,
              matchQuality: 'weak',
              maintenanceStatus: 'abandoned',
              licenseCompatible: true,
            };
            const results = [...otherResults, weak1, weak2];
            const { decision } = evaluateSearchResults(results);
            // Other results might contain compatible weak matches too,
            // but we guaranteed at least 2 compatible weak matches and
            // no adopt/extend candidates (no exact, no partial+active/stale)
            assert.equal(decision, 'compose');
          },
        ),
        { numRuns: 150 },
      );
    },
  );
});
