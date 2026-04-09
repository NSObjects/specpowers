/**
 * Platform adapter for Cursor.
 * Maps SpecPowers module paths to the `.cursor-plugin/` directory convention.
 */

const PLATFORM = 'cursor';
const TARGET_DIR = '.cursor-plugin';

/**
 * Map a source module path to its Cursor install location.
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
