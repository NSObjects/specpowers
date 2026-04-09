/**
 * Session Bootstrap
 *
 * Executes the full session bootstrap flow: detects project languages,
 * checks install state, and installs missing language rule modules.
 * Handles both first-run (no Install_State) and incremental scenarios.
 */

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPlatformState } from './install-state.js';
import { detectLanguages } from './language-detect.js';
import {
  install,
  getMissingLanguageModules,
  installModules,
} from '../install.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

/**
 * Format a human-readable install summary.
 *
 * @param {'first_run'|'incremental'|'up_to_date'|'skipped'} action
 * @param {string[]} installedModules - Module IDs installed in this run
 * @param {string} [profile] - Profile name used (for first-run)
 * @returns {string}
 */
function formatSummary(action, installedModules, profile) {
  if (action === 'first_run') {
    const base = `Welcome to SpecPowers! Installed profile "${profile || 'developer'}".`;
    if (installedModules.length > 0) {
      return `${base} Language modules: ${installedModules.join(', ')}.`;
    }
    return base;
  }

  if (action === 'incremental' && installedModules.length > 0) {
    return `Installed language modules: ${installedModules.join(', ')}.`;
  }

  return '';
}

/**
 * @typedef {Object} BootstrapResult
 * @property {'first_run'|'incremental'|'up_to_date'|'skipped'} action
 * @property {string[]} installedModules - Module IDs installed in this run
 * @property {string} summary - Human-readable install summary
 */

/**
 * Execute the full session bootstrap flow.
 *
 * @param {Object} options
 * @param {string} options.platform - Current platform name
 * @param {string[]} options.fileList - Project file list for language detection
 * @param {string} [options.rootDir] - SpecPowers root directory (defaults to auto-detected ROOT)
 * @returns {Promise<BootstrapResult>}
 */
export async function bootstrap({ platform, fileList, rootDir = ROOT }) {
  let state = readPlatformState(rootDir, platform);

  let isFirstRun = false;

  // First-run: Install_State doesn't exist (platform is null)
  if (state.platform === null) {
    isFirstRun = true;
    const firstRunResult = await install({ platform, profile: 'developer', rootDir });
    if (!firstRunResult.success) {
      return {
        action: 'first_run',
        installedModules: [],
        summary: `Error: ${firstRunResult.error}`,
      };
    }
    state = readPlatformState(rootDir, platform);
  }

  // Detect languages from project files
  const detectedSkills = detectLanguages(fileList);
  if (detectedSkills.length === 0) {
    if (isFirstRun) {
      return {
        action: 'first_run',
        installedModules: [],
        summary: formatSummary('first_run', [], 'developer'),
      };
    }
    return { action: 'skipped', installedModules: [], summary: '' };
  }

  // Compare installed modules with detected languages
  const installedIds = state.modules.map((module) => module.id);
  const missingModules = getMissingLanguageModules(installedIds, detectedSkills);

  if (missingModules.length === 0) {
    if (isFirstRun) {
      return {
        action: 'first_run',
        installedModules: [],
        summary: formatSummary('first_run', [], 'developer'),
      };
    }
    return { action: 'up_to_date', installedModules: [], summary: '' };
  }

  // Install missing language rule modules
  const result = await installModules({ platform, moduleIds: missingModules, rootDir });
  if (!result.success) {
    return {
      action: isFirstRun ? 'first_run' : 'incremental',
      installedModules: [],
      summary: `Error: ${result.error}`,
    };
  }

  const action = isFirstRun ? 'first_run' : 'incremental';
  return {
    action,
    installedModules: result.installedModules,
    summary: formatSummary(action, result.installedModules, 'developer'),
  };
}
