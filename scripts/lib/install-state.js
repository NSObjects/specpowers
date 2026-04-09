/**
 * Install State Management
 *
 * Reads, writes, and updates the install state file that tracks which
 * modules are installed, when they were installed, and on which platform.
 * Handles missing or corrupted state files gracefully by returning defaults.
 */

import { readFileSync, writeFileSync } from 'node:fs';

/**
 * Default state returned when the state file is missing or corrupted.
 */
const DEFAULT_STATE = {
  version: 1,
  platform: null,
  installedAt: null,
  sourceVersion: null,
  profile: null,
  modules: [],
  extraModules: [],
  excludedModules: [],
};

/**
 * Read install state from a JSON file.
 * Returns a default empty state if the file is missing or contains invalid JSON.
 *
 * @param {string} filePath - Path to the install-state.json file.
 * @returns {{ version: number, platform: string|null, installedAt: string|null, sourceVersion: string|null, profile: string|null, modules: Array<{ id: string, installedAt: string, paths: string[] }>, extraModules: string[], excludedModules: string[] }}
 */
export function readState(filePath) {
  try {
    const raw = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    // Basic shape validation — must be a non-null object with a modules array
    if (parsed === null || typeof parsed !== 'object' || !Array.isArray(parsed.modules)) {
      return { ...DEFAULT_STATE };
    }
    return parsed;
  } catch {
    // File missing, permission error, or invalid JSON — return defaults
    return { ...DEFAULT_STATE };
  }
}


/**
 * Write a complete install state object to a JSON file.
 *
 * @param {string} filePath - Path to the install-state.json file.
 * @param {object} state - The full state object to persist.
 */
export function writeState(filePath, state) {
  writeFileSync(filePath, JSON.stringify(state, null, 2) + '\n', 'utf-8');
}

/**
 * Merge partial changes into the existing state and persist.
 * Reads the current state, shallow-merges the changes, and writes back.
 *
 * @param {string} filePath - Path to the install-state.json file.
 * @param {object} changes - Partial state fields to merge (e.g. { profile: 'developer' }).
 * @returns {object} The updated state after merging.
 */
export function updateState(filePath, changes) {
  const current = readState(filePath);
  const updated = { ...current, ...changes };
  writeState(filePath, updated);
  return updated;
}
