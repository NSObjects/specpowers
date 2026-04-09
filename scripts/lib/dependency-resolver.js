/**
 * Module Dependency Resolution
 *
 * Resolves a set of requested module IDs into a complete set including all
 * transitive dependencies. Detects circular dependencies and supports
 * adding/excluding individual modules on top of a profile.
 */

/**
 * Build a lookup map from the catalog array for O(1) access by module ID.
 *
 * @param {Array<{ id: string, dependencies: string[] }>} catalog
 * @returns {Map<string, { id: string, dependencies: string[] }>}
 */
function buildCatalogMap(catalog) {
  const map = new Map();
  for (const mod of catalog) {
    map.set(mod.id, mod);
  }
  return map;
}

/**
 * Resolve a set of requested module IDs into a complete, dependency-ordered
 * list that includes all transitive dependencies.
 *
 * The returned array is in dependency order — dependencies appear before the
 * modules that depend on them.
 *
 * @param {string[]} requestedIds - Module IDs the user wants installed.
 * @param {Array<{ id: string, dependencies: string[] }>} catalog - The full module catalog.
 * @returns {string[]} Deduplicated, dependency-ordered array of module IDs.
 * @throws {Error} If a requested ID is not found in the catalog.
 * @throws {Error} If a circular dependency is detected (message includes the cycle path).
 */
export function resolveModules(requestedIds, catalog) {
  const catalogMap = buildCatalogMap(catalog);

  // Validate all requested IDs exist
  for (const id of requestedIds) {
    if (!catalogMap.has(id)) {
      throw new Error(`Module "${id}" not found in catalog`);
    }
  }

  const resolved = [];       // final dependency-ordered list
  const resolvedSet = new Set(); // for O(1) "already resolved?" checks
  const visiting = new Set();    // currently on the DFS stack (cycle detection)

  /**
   * Depth-first visit. Resolves dependencies before the module itself.
   * @param {string} id
   * @param {string[]} path - ancestor chain for error reporting
   */
  function visit(id, path) {
    if (resolvedSet.has(id)) return;

    if (visiting.has(id)) {
      const cycleStart = path.indexOf(id);
      const cyclePath = [...path.slice(cycleStart), id].join(' → ');
      throw new Error(`Circular dependency detected: ${cyclePath}`);
    }

    const mod = catalogMap.get(id);
    if (!mod) {
      throw new Error(`Module "${id}" not found in catalog`);
    }

    visiting.add(id);
    path.push(id);

    for (const depId of mod.dependencies) {
      visit(depId, path);
    }

    path.pop();
    visiting.delete(id);
    resolvedSet.add(id);
    resolved.push(id);
  }

  for (const id of requestedIds) {
    visit(id, []);
  }

  return resolved;
}

/**
 * Resolve a profile's module list with optional additions and exclusions.
 *
 * 1. Combines profileModules with options.add (if any)
 * 2. Resolves all transitive dependencies via resolveModules
 * 3. Removes any IDs listed in options.exclude from the final result
 *
 * @param {string[]} profileModules - Module IDs from the chosen profile.
 * @param {Array<{ id: string, dependencies: string[] }>} catalog - The full module catalog.
 * @param {{ add?: string[], exclude?: string[] }} [options={}] - Additional modules to add or exclude.
 * @returns {string[]} Deduplicated, dependency-ordered array of module IDs.
 */
export function resolveProfile(profileModules, catalog, options = {}) {
  const { add = [], exclude = [] } = options;

  // Merge profile modules with additions, deduplicate
  const combined = [...new Set([...profileModules, ...add])];

  // Remove excluded modules
  if (exclude.length === 0) {
    return resolveModules(combined, catalog);
  }

  const excludeSet = new Set(exclude);
  const roots = combined.filter((id) => !excludeSet.has(id));
  return resolveModules(roots, catalog);
}
