/**
 * Platform adapter for OpenCode.
 * Maps SpecPowers module paths to the `.opencode/` directory convention.
 */

const PLATFORM = 'opencode';
const TARGET_DIR = '.opencode';

/**
 * Map a source module path to its OpenCode install location.
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
