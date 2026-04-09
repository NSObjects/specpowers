/**
 * Auto-Install Boundary Control
 *
 * Determines which modules can be auto-installed without user confirmation
 * and which require explicit approval.
 */

/**
 * Checks whether a module is within the auto-install scope.
 * Rule: kind === "rules" AND id starts with "rules-" prefix.
 * @param {string} moduleId - Module ID
 * @param {Array<{id: string, kind: string}>} catalog - Module catalog
 * @returns {boolean}
 */
export function isAutoInstallable(moduleId, catalog) {
  const mod = catalog.find((m) => m.id === moduleId);
  return mod != null && mod.kind === 'rules' && mod.id.startsWith('rules-');
}

/**
 * Partitions a list of module IDs into auto-installable and needs-confirmation groups.
 * @param {string[]} moduleIds - Module ID list
 * @param {Array<{id: string, kind: string}>} catalog - Module catalog
 * @returns {{ autoInstall: string[], needsConfirmation: string[] }}
 */
export function partitionByAutoInstallScope(moduleIds, catalog) {
  const autoInstall = [];
  const needsConfirmation = [];
  for (const id of moduleIds) {
    if (isAutoInstallable(id, catalog)) {
      autoInstall.push(id);
    } else {
      needsConfirmation.push(id);
    }
  }
  return { autoInstall, needsConfirmation };
}

/**
 * Creates an install log entry.
 * @param {string[]} moduleIds - Installed module IDs
 * @param {string[]} detectedLanguages - Detected languages that triggered the install
 * @returns {{ moduleIds: string[], trigger: string[], timestamp: string }}
 */
export function createInstallLog(moduleIds, detectedLanguages) {
  return {
    moduleIds,
    trigger: detectedLanguages,
    timestamp: new Date().toISOString(),
  };
}
