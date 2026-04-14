#!/usr/bin/env node

/**
 * SpecPowers Install Script
 *
 * Orchestrates selective installation of SpecPowers modules:
 *   1. Parse CLI args (--profile, --add, --exclude, --platform)
 *   2. Load module catalog and profiles
 *   3. Resolve dependencies
 *   4. Run platform adapter to compute install paths
 *   5. Write install state
 *
 * Usage:
 *   node scripts/install.js --platform claude-code
 *   node scripts/install.js --platform kiro-ide --profile developer
 *   node scripts/install.js --platform cursor --profile core --add rules-typescript
 *   node scripts/install.js --platform codex --profile full --exclude rules-rust
 */

import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveProfile, resolveModules } from './lib/dependency-resolver.js';
import {
  getStatePath,
  readPlatformState,
  readState,
  writePlatformState,
} from './lib/install-state.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

/**
 * Parse process.argv into a simple key-value map.
 * Supports: --key value and --key=value forms.
 * Repeatable flags (--add, --exclude) are collected into arrays.
 *
 * @param {string[]} argv
 * @returns {{ platform?: string, profile?: string, add: string[], exclude: string[] }}
 */
function parseArgs(argv) {
  const args = { add: [], exclude: [] };
  const raw = argv.slice(2); // skip node + script path

  for (let i = 0; i < raw.length; i++) {
    const token = raw[i];
    let key, value;

    if (token.includes('=')) {
      [key, value] = token.split('=', 2);
    } else if (token.startsWith('--') && i + 1 < raw.length) {
      key = token;
      value = raw[++i];
    } else {
      continue;
    }

    key = key.replace(/^--/, '');

    if (key === 'add') {
      args.add.push(value);
    } else if (key === 'exclude') {
      args.exclude.push(value);
    } else {
      args[key] = value;
    }
  }

  return args;
}

// ---------------------------------------------------------------------------
// Platform adapter loader
// ---------------------------------------------------------------------------

const SUPPORTED_PLATFORMS = [
  'claude-code', 'cursor', 'gemini-cli', 'kiro-ide', 'codex', 'opencode',
];

/**
 * Dynamically import the platform adapter for the given platform name.
 *
 * @param {string} platformName
 * @returns {Promise<{ getInstallPath: (p: string) => string, getTargetDir: () => string }>}
 */
async function loadAdapter(platformName) {
  if (!SUPPORTED_PLATFORMS.includes(platformName)) {
    throw new Error(
      `Unsupported platform "${platformName}". Supported: ${SUPPORTED_PLATFORMS.join(', ')}`
    );
  }
  return import(`./adapters/${platformName}.js`);
}

/**
 * Copy one source path from the repo into its managed install target.
 *
 * @param {string} rootDir
 * @param {string} sourceRelativePath
 * @param {string} targetRelativePath
 */
function materializePath(rootDir, sourceRelativePath, targetRelativePath) {
  const sourcePath = resolve(rootDir, sourceRelativePath);
  const targetPath = resolve(rootDir, targetRelativePath);

  rmSync(targetPath, { recursive: true, force: true });
  mkdirSync(dirname(targetPath), { recursive: true });
  cpSync(sourcePath, targetPath, { recursive: true });
}

/**
 * Remove a managed target path from disk.
 *
 * @param {string} rootDir
 * @param {string} targetRelativePath
 */
function removeManagedPath(rootDir, targetRelativePath) {
  rmSync(resolve(rootDir, targetRelativePath), { recursive: true, force: true });
}

/**
 * Take a raw snapshot of install-state.json so it can be restored on failure.
 *
 * @param {string} statePath
 * @returns {{ existed: boolean, raw: string|null }}
 */
function snapshotStateFile(statePath) {
  if (!existsSync(statePath)) {
    return { existed: false, raw: null };
  }

  return {
    existed: true,
    raw: readFileSync(statePath, 'utf-8'),
  };
}

/**
 * Restore install-state.json from a raw snapshot.
 *
 * @param {string} statePath
 * @param {{ existed: boolean, raw: string|null }} snapshot
 */
function restoreStateFile(statePath, snapshot) {
  if (!snapshot.existed) {
    rmSync(statePath, { force: true });
    return;
  }

  mkdirSync(dirname(statePath), { recursive: true });
  writeFileSync(statePath, snapshot.raw, 'utf-8');
}

/**
 * Snapshot the managed target paths that may be mutated by an install.
 *
 * @param {string} rootDir
 * @param {string[]} targetRelativePaths
 * @returns {{ backupRoot: string, snapshots: Array<{ targetRelativePath: string, existed: boolean }> }}
 */
function snapshotManagedPaths(rootDir, targetRelativePaths) {
  const backupRoot = mkdtempSync(join(tmpdir(), 'sp-install-backup-'));
  const snapshots = [];

  for (const targetRelativePath of [...new Set(targetRelativePaths)]) {
    const targetPath = resolve(rootDir, targetRelativePath);
    const existed = existsSync(targetPath);
    snapshots.push({ targetRelativePath, existed });

    if (!existed) {
      continue;
    }

    const backupPath = resolve(backupRoot, targetRelativePath);
    mkdirSync(dirname(backupPath), { recursive: true });
    cpSync(targetPath, backupPath, { recursive: true });
  }

  return { backupRoot, snapshots };
}

/**
 * Restore managed target paths from a snapshot.
 *
 * @param {string} rootDir
 * @param {string} backupRoot
 * @param {Array<{ targetRelativePath: string, existed: boolean }>} snapshots
 */
function restoreManagedPaths(rootDir, backupRoot, snapshots) {
  for (const { targetRelativePath, existed } of snapshots) {
    const targetPath = resolve(rootDir, targetRelativePath);
    rmSync(targetPath, { recursive: true, force: true });

    if (!existed) {
      continue;
    }

    const backupPath = resolve(backupRoot, targetRelativePath);
    mkdirSync(dirname(targetPath), { recursive: true });
    cpSync(backupPath, targetPath, { recursive: true });
  }

  rmSync(backupRoot, { recursive: true, force: true });
}

/**
 * Execute an install mutation with filesystem + state rollback on failure.
 *
 * @template T
 * @param {string} rootDir
 * @param {string} statePath
 * @param {string[]} targetRelativePaths
 * @param {() => T} operation
 * @returns {T}
 */
function withRollback(rootDir, statePath, targetRelativePaths, operation) {
  const stateSnapshot = snapshotStateFile(statePath);
  const { backupRoot, snapshots } = snapshotManagedPaths(rootDir, targetRelativePaths);

  try {
    const result = operation();
    rmSync(backupRoot, { recursive: true, force: true });
    return result;
  } catch (err) {
    restoreManagedPaths(rootDir, backupRoot, snapshots);
    restoreStateFile(statePath, stateSnapshot);
    throw err;
  }
}

/**
 * Build state records for the provided modules on a platform.
 *
 * When the adapter exports `expandModulePaths`, each source path is expanded
 * into its individual target files (used by kiro-ide to flatten skills into
 * steering files). Otherwise falls back to the standard 1:1 path mapping.
 *
 * @param {string[]} moduleIds
 * @param {Map<string, { id: string, paths: string[] }>} catalogMap
 * @param {{ getInstallPath: (path: string) => string, expandModulePaths?: (rootDir: string, path: string) => Array<{ source: string, target: string }> }} adapter
 * @param {string} installedAt
 * @param {string} rootDir - SpecPowers root directory (needed for expandModulePaths)
 * @returns {{ id: string, installedAt: string, paths: string[] }[]}
 */
function buildModuleRecords(moduleIds, catalogMap, adapter, installedAt, rootDir) {
  return moduleIds.map((id) => {
    const mod = catalogMap.get(id);
    let paths;

    if (typeof adapter.expandModulePaths === 'function') {
      // Expand each source path into its individual target files
      paths = mod.paths.flatMap((p) => {
        const expanded = adapter.expandModulePaths(rootDir, p);
        return expanded.map((pair) => pair.target);
      });
    } else {
      paths = mod.paths.map((p) => adapter.getInstallPath(p));
    }

    return { id, installedAt, paths };
  });
}

/**
 * Materialize a full desired state and prune managed paths no longer selected.
 *
 * When the adapter exports `expandModulePaths` and `materializeFile`, uses
 * the adapter's custom file-level materialization (e.g. kiro-ide steering
 * flattening). Otherwise falls back to standard directory-level copy.
 *
 * @param {string} rootDir
 * @param {Array<{ paths: string[] }>} currentModules
 * @param {Array<{ id: string, paths: string[] }>} desiredModules
 * @param {Map<string, { id: string, paths: string[] }>} catalogMap
 * @param {{ expandModulePaths?: Function, materializeFile?: Function }} [adapter]
 */
function syncManagedModules(rootDir, currentModules, desiredModules, catalogMap, adapter) {
  const currentPaths = currentModules.flatMap((module) => module.paths);
  const desiredPaths = desiredModules.flatMap((module) => module.paths);
  const desiredPathSet = new Set(desiredPaths);

  for (const targetRelativePath of currentPaths) {
    if (!desiredPathSet.has(targetRelativePath)) {
      removeManagedPath(rootDir, targetRelativePath);
    }
  }

  if (typeof adapter?.expandModulePaths === 'function' && typeof adapter?.materializeFile === 'function') {
    // Adapter-driven file-level materialization
    for (const module of desiredModules) {
      const sourceModule = catalogMap.get(module.id);
      for (const sourcePath of sourceModule.paths) {
        const expanded = adapter.expandModulePaths(rootDir, sourcePath);
        for (const { source, target } of expanded) {
          adapter.materializeFile(rootDir, source, target);
        }
      }
    }
  } else {
    // Standard directory-level copy
    for (const module of desiredModules) {
      const sourceModule = catalogMap.get(module.id);
      sourceModule.paths.forEach((sourceRelativePath, index) => {
        materializePath(rootDir, sourceRelativePath, module.paths[index]);
      });
    }
  }
}

/**
 * Materialize only newly added modules without pruning existing ones.
 *
 * When the adapter exports `expandModulePaths` and `materializeFile`, uses
 * the adapter's custom file-level materialization. Otherwise falls back to
 * standard directory-level copy.
 *
 * @param {string} rootDir
 * @param {Array<{ id: string, paths: string[] }>} newModules
 * @param {Map<string, { id: string, paths: string[] }>} catalogMap
 * @param {{ expandModulePaths?: Function, materializeFile?: Function }} [adapter]
 */
function materializeModules(rootDir, newModules, catalogMap, adapter) {
  if (typeof adapter?.expandModulePaths === 'function' && typeof adapter?.materializeFile === 'function') {
    for (const module of newModules) {
      const sourceModule = catalogMap.get(module.id);
      for (const sourcePath of sourceModule.paths) {
        const expanded = adapter.expandModulePaths(rootDir, sourcePath);
        for (const { source, target } of expanded) {
          adapter.materializeFile(rootDir, source, target);
        }
      }
    }
  } else {
    for (const module of newModules) {
      const sourceModule = catalogMap.get(module.id);
      sourceModule.paths.forEach((sourceRelativePath, index) => {
        materializePath(rootDir, sourceRelativePath, module.paths[index]);
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Programmatic API
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} InstallResult
 * @property {boolean} success - Whether the installation succeeded
 * @property {string[]} installedModules - Module IDs installed in this run
 * @property {string[]} skippedModules - Module IDs skipped (already installed)
 * @property {string|null} error - Error message (null on success)
 */

/**
 * Execute a full install flow (equivalent to CLI --profile + --add + --exclude).
 *
 * @param {Object} options
 * @param {string} options.platform - Target platform name
 * @param {string} [options.profile='developer'] - Install profile name
 * @param {string[]} [options.add=[]] - Extra module IDs to add
 * @param {string[]} [options.exclude=[]] - Module IDs to exclude
 * @param {string} [options.rootDir] - SpecPowers root directory (defaults to ROOT)
 * @returns {Promise<InstallResult>}
 */
export async function install(options) {
  const {
    platform,
    profile: profileName = 'developer',
    add = [],
    exclude = [],
    rootDir = ROOT,
  } = options;

  // Validate platform
  if (!platform || !SUPPORTED_PLATFORMS.includes(platform)) {
    return {
      success: false,
      installedModules: [],
      skippedModules: [],
      error: platform
        ? `Unsupported platform "${platform}". Supported: ${SUPPORTED_PLATFORMS.join(', ')}`
        : `Platform is required. Supported: ${SUPPORTED_PLATFORMS.join(', ')}`,
    };
  }

  // Load catalog and profiles
  const catalog = JSON.parse(
    readFileSync(resolve(rootDir, 'manifests/install-modules.json'), 'utf-8')
  );
  const profiles = JSON.parse(
    readFileSync(resolve(rootDir, 'manifests/install-profiles.json'), 'utf-8')
  );

  // Validate profile
  const profile = profiles.profiles[profileName];
  if (!profile) {
    return {
      success: false,
      installedModules: [],
      skippedModules: [],
      error: `Unknown profile "${profileName}". Available: ${Object.keys(profiles.profiles).join(', ')}`,
    };
  }

  // Resolve modules with dependencies, additions, and exclusions
  const resolvedIds = resolveProfile(profile.modules, catalog.modules, {
    add,
    exclude,
  });

  // Load platform adapter
  const adapter = await loadAdapter(platform);

  // Build module install records
  const catalogMap = new Map(catalog.modules.map((m) => [m.id, m]));
  const now = new Date().toISOString();
  const moduleRecords = buildModuleRecords(resolvedIds, catalogMap, adapter, now, rootDir);

  // Read package.json for sourceVersion
  let sourceVersion = 'unknown';
  try {
    const pkg = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf-8'));
    sourceVersion = pkg.version || 'unknown';
  } catch {
    // ignore
  }

  const statePath = getStatePath(rootDir, platform);
  const currentState = readPlatformState(rootDir, platform);
  const transactionalPaths = [
    ...currentState.modules.flatMap((module) => module.paths),
    ...moduleRecords.flatMap((module) => module.paths),
  ];

  const state = {
    version: 1,
    platform,
    installedAt: now,
    sourceVersion,
    profile: profileName,
    modules: moduleRecords,
    extraModules: add,
    excludedModules: exclude,
  };

  withRollback(rootDir, statePath, transactionalPaths, () => {
    // Sync managed files before updating install state
    syncManagedModules(rootDir, currentState.modules, moduleRecords, catalogMap, adapter);
    writePlatformState(rootDir, platform, state);
  });

  return {
    success: true,
    installedModules: resolvedIds,
    skippedModules: [],
    error: null,
  };
}

/**
 * Incrementally install specific modules (and their dependencies) without
 * affecting already-installed modules.
 *
 * @param {Object} options
 * @param {string} options.platform - Target platform name
 * @param {string[]} options.moduleIds - Module IDs to install
 * @param {string} [options.rootDir] - SpecPowers root directory (defaults to ROOT)
 * @returns {Promise<InstallResult>}
 */
export async function installModules(options) {
  const { platform, moduleIds, rootDir = ROOT } = options;

  // Validate platform
  if (!platform || !SUPPORTED_PLATFORMS.includes(platform)) {
    return {
      success: false,
      installedModules: [],
      skippedModules: [],
      error: platform
        ? `Unsupported platform "${platform}". Supported: ${SUPPORTED_PLATFORMS.join(', ')}`
        : `Platform is required. Supported: ${SUPPORTED_PLATFORMS.join(', ')}`,
    };
  }

  // Read current install state
  const statePath = getStatePath(rootDir, platform);
  const currentState = readPlatformState(rootDir, platform);
  if (currentState.platform !== null && currentState.platform !== platform) {
    return {
      success: false,
      installedModules: [],
      skippedModules: [],
      error: `Platform mismatch: install state is for "${currentState.platform}" but requested "${platform}"`,
    };
  }
  const installedIds = new Set(currentState.modules.map((m) => m.id));

  try {
    // Load catalog
    const catalog = JSON.parse(
      readFileSync(resolve(rootDir, 'manifests/install-modules.json'), 'utf-8')
    );

    // Resolve requested modules + transitive dependencies
    const resolvedIds = resolveModules(moduleIds, catalog.modules);

    // Partition into skipped (already installed) and new (to install)
    const skippedModules = resolvedIds.filter((id) => installedIds.has(id));
    const newModuleIds = resolvedIds.filter((id) => !installedIds.has(id));

    if (newModuleIds.length === 0) {
      return {
        success: true,
        installedModules: [],
        skippedModules,
        error: null,
      };
    }

    // Load platform adapter
    const adapter = await loadAdapter(platform);

    // Build module records for new modules
    const catalogMap = new Map(catalog.modules.map((m) => [m.id, m]));
    const now = new Date().toISOString();
    const newRecords = buildModuleRecords(newModuleIds, catalogMap, adapter, now, rootDir);
    const updatedState = {
      ...currentState,
      modules: [...currentState.modules, ...newRecords],
    };

    withRollback(
      rootDir,
      statePath,
      newRecords.flatMap((module) => module.paths),
      () => {
        materializeModules(rootDir, newRecords, catalogMap, adapter);
        writePlatformState(rootDir, platform, updatedState);
      },
    );

    return {
      success: true,
      installedModules: newModuleIds,
      skippedModules,
      error: null,
    };
  } catch (err) {
    // Rollback restores the previous filesystem payload and install state.
    return {
      success: false,
      installedModules: [],
      skippedModules: [],
      error: err.message,
    };
  }
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/**
 * Read install state and return the list of installed module IDs.
 *
 * @param {string} statePath - Absolute path to install-state.json.
 * @returns {string[]} Array of installed module ID strings.
 */
export function getInstalledModules(statePath) {
  const state = readState(statePath);
  return state.modules.map((m) => m.id);
}

/**
 * Compare installed modules with detected language skills and return the
 * module IDs that are missing (i.e. detected but not yet installed).
 *
 * @param {string[]} installedModuleIds - Currently installed module IDs.
 * @param {string[]} detectedSkills - Skill names returned by detectLanguages()
 *   (e.g. "rules-typescript"). These double as module IDs.
 * @returns {string[]} Module IDs that need to be installed.
 */
export function getMissingLanguageModules(installedModuleIds, detectedSkills) {
  const installed = new Set(installedModuleIds);
  return detectedSkills.filter((skill) => !installed.has(skill));
}

/**
 * Determine whether a module is within the auto-install scope.
 * Only modules with kind === "rules" and id starting with "rules-" qualify.
 *
 * @param {string} moduleId - Module ID to check.
 * @returns {boolean} true if the module can be auto-installed without user confirmation.
 */
export function isAutoInstallable(moduleId) {
  const catalog = JSON.parse(
    readFileSync(resolve(ROOT, 'manifests/install-modules.json'), 'utf-8')
  );
  const mod = catalog.modules.find((m) => m.id === moduleId);
  return mod != null && mod.kind === 'rules' && mod.id.startsWith('rules-');
}

// ---------------------------------------------------------------------------
// CLI Main (preserved for backward compatibility)
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv);

  // Validate required --platform flag
  if (!args.platform) {
    console.error('Error: --platform is required.');
    console.error(`Supported platforms: ${SUPPORTED_PLATFORMS.join(', ')}`);
    process.exit(1);
  }

  // Delegate to the programmatic API
  const result = await install({
    platform: args.platform,
    profile: args.profile,
    add: args.add,
    exclude: args.exclude,
  });

  if (!result.success) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }

  const profileName = args.profile || 'developer';
  console.log(`Installed ${result.installedModules.length} modules for ${args.platform} (profile: ${profileName})`);
  console.log(`Modules: ${result.installedModules.join(', ')}`);
  console.log(`State written to: ${getStatePath(ROOT, args.platform)}`);
}

// Guard: only run CLI main() when executed directly (not when imported as a module)
const __filename = fileURLToPath(import.meta.url);
const isDirectRun = process.argv[1] && resolve(process.argv[1]) === resolve(__filename);

if (isDirectRun) {
  main().catch((err) => {
    console.error(`Install failed: ${err.message}`);
    process.exit(1);
  });
}
