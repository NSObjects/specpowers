/**
 * Install State Management
 *
 * Reads, writes, and updates the install state file that tracks which
 * modules are installed, when they were installed, and on which platform.
 * Handles missing or corrupted state files gracefully by returning defaults.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

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

function cloneDefaultState() {
  return {
    ...DEFAULT_STATE,
    modules: [...DEFAULT_STATE.modules],
    extraModules: [...DEFAULT_STATE.extraModules],
    excludedModules: [...DEFAULT_STATE.excludedModules],
  };
}

function getLegacyStatePath(rootDir) {
  return resolve(rootDir, 'manifests', 'install-state.json');
}

export function getStatePath(rootDir, platform) {
  return resolve(rootDir, 'manifests', 'install-state', `${platform}.json`);
}

function isNullableString(value) {
  return value === null || typeof value === 'string';
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

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
      return cloneDefaultState();
    }

    return {
      version: typeof parsed.version === 'number' ? parsed.version : DEFAULT_STATE.version,
      platform: isNullableString(parsed.platform) ? parsed.platform : DEFAULT_STATE.platform,
      installedAt: isNullableString(parsed.installedAt) ? parsed.installedAt : DEFAULT_STATE.installedAt,
      sourceVersion: isNullableString(parsed.sourceVersion)
        ? parsed.sourceVersion
        : DEFAULT_STATE.sourceVersion,
      profile: isNullableString(parsed.profile) ? parsed.profile : DEFAULT_STATE.profile,
      modules: parsed.modules,
      extraModules: isStringArray(parsed.extraModules)
        ? parsed.extraModules
        : [...DEFAULT_STATE.extraModules],
      excludedModules: isStringArray(parsed.excludedModules)
        ? parsed.excludedModules
        : [...DEFAULT_STATE.excludedModules],
    };
  } catch {
    // File missing, permission error, or invalid JSON — return defaults
    return cloneDefaultState();
  }
}

export function readPlatformState(rootDir, platform) {
  const platformStatePath = getStatePath(rootDir, platform);
  if (existsSync(platformStatePath)) {
    return readState(platformStatePath);
  }

  const legacyState = readState(getLegacyStatePath(rootDir));
  if (legacyState.platform === platform || legacyState.platform === null) {
    return legacyState;
  }

  return cloneDefaultState();
}


/**
 * Write a complete install state object to a JSON file.
 *
 * @param {string} filePath - Path to the install-state.json file.
 * @param {object} state - The full state object to persist.
 */
export function writeState(filePath, state) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(state, null, 2) + '\n', 'utf-8');
}

export function writePlatformState(rootDir, platform, state) {
  writeState(getStatePath(rootDir, platform), state);
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
