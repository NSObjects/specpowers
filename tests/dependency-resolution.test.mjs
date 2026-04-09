/**
 * Property 8: Module Dependency Resolution
 *
 * **Feature: absorb-ecc-capabilities, Property 8: Module Dependency Resolution**
 * **Validates: Requirements 6.3**
 *
 * For any dependency graph and install request, resolver returns complete set
 * with all transitive deps; never includes unrequested non-dependency modules.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import fc from 'fast-check';
import { resolveModules, resolveProfile } from '../scripts/lib/dependency-resolver.js';

// --- Helpers ---

/**
 * Generate an arbitrary DAG (no cycles) as a catalog.
 * Strategy: assign each module an index; a module can only depend on modules
 * with a *lower* index, which guarantees acyclicity.
 */
const catalogArb = fc
  .integer({ min: 1, max: 12 })
  .chain((size) => {
    // Generate `size` modules, each with deps only from earlier indices
    return fc.tuple(
      ...Array.from({ length: size }, (_, i) => {
        const depIndices =
          i === 0
            ? fc.constant([])
            : fc.subarray(
                Array.from({ length: i }, (_, j) => j),
                { minLength: 0, maxLength: Math.min(i, 3) },
              );
        return depIndices;
      }),
    ).map((depArrays) => {
      return depArrays.map((deps, i) => ({
        id: `mod-${i}`,
        dependencies: deps.map((d) => `mod-${d}`),
      }));
    });
  });

/**
 * Given a catalog, generate a non-empty subset of module IDs to request.
 */
function requestedIdsArb(catalog) {
  const ids = catalog.map((m) => m.id);
  return fc.subarray(ids, { minLength: 1, maxLength: ids.length });
}

/**
 * Collect all transitive dependencies of a set of IDs from a catalog map.
 */
function allTransitiveDeps(requestedIds, catalogMap) {
  const visited = new Set();
  const stack = [...requestedIds];
  while (stack.length > 0) {
    const id = stack.pop();
    if (visited.has(id)) continue;
    visited.add(id);
    const mod = catalogMap.get(id);
    if (mod) {
      for (const dep of mod.dependencies) {
        stack.push(dep);
      }
    }
  }
  return visited;
}

// --- Property tests ---

test('Property 8: Module Dependency Resolution', async (t) => {
  await t.test(
    'resolved set includes all transitive dependencies',
    () => {
      fc.assert(
        fc.property(
          catalogArb.chain((catalog) =>
            fc.tuple(fc.constant(catalog), requestedIdsArb(catalog)),
          ),
          ([catalog, requestedIds]) => {
            const resolved = resolveModules(requestedIds, catalog);
            const resolvedSet = new Set(resolved);
            const catalogMap = new Map(catalog.map((m) => [m.id, m]));
            const expected = allTransitiveDeps(requestedIds, catalogMap);

            // Every expected transitive dep must be in the resolved set
            for (const id of expected) {
              assert.ok(
                resolvedSet.has(id),
                `Expected transitive dep "${id}" to be in resolved set`,
              );
            }
          },
        ),
        { numRuns: 200 },
      );
    },
  );

  await t.test(
    'resolved set never includes unrequested non-dependency modules',
    () => {
      fc.assert(
        fc.property(
          catalogArb.chain((catalog) =>
            fc.tuple(fc.constant(catalog), requestedIdsArb(catalog)),
          ),
          ([catalog, requestedIds]) => {
            const resolved = resolveModules(requestedIds, catalog);
            const catalogMap = new Map(catalog.map((m) => [m.id, m]));
            const expected = allTransitiveDeps(requestedIds, catalogMap);

            // No module in resolved should be outside the expected set
            for (const id of resolved) {
              assert.ok(
                expected.has(id),
                `Module "${id}" should not be in resolved set — it is not requested and not a dependency`,
              );
            }
          },
        ),
        { numRuns: 200 },
      );
    },
  );

  await t.test(
    'resolved set contains no duplicates',
    () => {
      fc.assert(
        fc.property(
          catalogArb.chain((catalog) =>
            fc.tuple(fc.constant(catalog), requestedIdsArb(catalog)),
          ),
          ([catalog, requestedIds]) => {
            const resolved = resolveModules(requestedIds, catalog);
            assert.equal(
              resolved.length,
              new Set(resolved).size,
              'Resolved list should contain no duplicates',
            );
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  await t.test(
    'dependencies appear before the modules that depend on them',
    () => {
      fc.assert(
        fc.property(
          catalogArb.chain((catalog) =>
            fc.tuple(fc.constant(catalog), requestedIdsArb(catalog)),
          ),
          ([catalog, requestedIds]) => {
            const resolved = resolveModules(requestedIds, catalog);
            const catalogMap = new Map(catalog.map((m) => [m.id, m]));
            const indexMap = new Map(resolved.map((id, i) => [id, i]));

            for (const id of resolved) {
              const mod = catalogMap.get(id);
              for (const dep of mod.dependencies) {
                assert.ok(
                  indexMap.get(dep) < indexMap.get(id),
                  `Dependency "${dep}" should appear before "${id}" in resolved order`,
                );
              }
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  await t.test(
    'circular dependency detection throws',
    () => {
      // Manually construct catalogs with cycles
      const cyclicCatalogs = [
        [
          { id: 'a', dependencies: ['b'] },
          { id: 'b', dependencies: ['a'] },
        ],
        [
          { id: 'x', dependencies: ['y'] },
          { id: 'y', dependencies: ['z'] },
          { id: 'z', dependencies: ['x'] },
        ],
      ];

      for (const catalog of cyclicCatalogs) {
        assert.throws(
          () => resolveModules(catalog.map((m) => m.id), catalog),
          /[Cc]ircular dependency/,
          `Expected circular dependency error for catalog with cycle`,
        );
      }
    },
  );

  await t.test(
    'requesting a non-existent module throws',
    () => {
      const catalog = [{ id: 'a', dependencies: [] }];
      assert.throws(
        () => resolveModules(['nonexistent'], catalog),
        /not found/,
        'Expected error for non-existent module',
      );
    },
  );

  await t.test(
    'excluding a required dependency keeps it in the resolved profile',
    () => {
      const catalog = [
        { id: 'rules-common', dependencies: [] },
        { id: 'rules-typescript', dependencies: ['rules-common'] },
        { id: 'quality-gate', dependencies: [] },
      ];

      const resolved = resolveProfile(['rules-typescript', 'quality-gate'], catalog, {
        exclude: ['rules-common'],
      });

      assert.deepStrictEqual(resolved, ['rules-common', 'rules-typescript', 'quality-gate']);
    },
  );

  await t.test(
    'excluding an optional module still removes it from the resolved profile',
    () => {
      const catalog = [
        { id: 'rules-common', dependencies: [] },
        { id: 'rules-typescript', dependencies: ['rules-common'] },
        { id: 'quality-gate', dependencies: [] },
      ];

      const resolved = resolveProfile(['rules-typescript', 'quality-gate'], catalog, {
        exclude: ['quality-gate'],
      });

      assert.deepStrictEqual(resolved, ['rules-common', 'rules-typescript']);
    },
  );
});
