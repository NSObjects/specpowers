/**
 * Platform adapter for Claude Code.
 * Maps SpecPowers module paths to the `.claude/` directory convention.
 */

const PLATFORM = 'claude-code';
const TARGET_DIR = '.claude';

/**
 * Map a source module path to its Claude Code install location.
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
