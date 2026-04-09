/**
 * Platform adapter for Kiro IDE.
 * Maps SpecPowers module paths to the `.kiro/` directory convention.
 */

const PLATFORM = 'kiro-ide';
const TARGET_DIR = '.kiro';

/**
 * Map a source module path to its Kiro IDE install location.
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
