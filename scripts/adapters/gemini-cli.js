/**
 * Platform adapter for Gemini CLI.
 * Maps SpecPowers module paths to root directory (flat structure).
 */

const PLATFORM = 'gemini-cli';
const TARGET_DIR = '.gemini';

/**
 * Map a source module path to its Gemini CLI install location.
 * Gemini CLI uses a flat structure under .gemini/.
 *
 * @param {string} modulePath - Relative source path (e.g. "skills/exploring").
 * @returns {string} Platform-specific install path.
 */
export function getInstallPath(modulePath) {
  return `${TARGET_DIR}/${modulePath}`;
}

/**
 * Return the root target directory for this platform.
 *
 * @returns {string}
 */
export function getTargetDir() {
  return TARGET_DIR;
}

export const platform = PLATFORM;
