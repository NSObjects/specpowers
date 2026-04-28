/**
 * Install Scope Boundary Control
 *
 * Determines which modules may be installed by installer-managed helper flows
 * without turning runtime skill routing into an implicit file-writing step.
 */

/**
 * Checks whether a module is within the language-rule helper install scope.
 * Rule: kind === "rules" AND id starts with "rules-" prefix.
 *
 * @param {string} moduleId - Module ID
 * @param {Array<{id: string, kind: string}>} catalog - Module catalog
 * @returns {boolean}
 */
export function isInstallHelperEligible(moduleId, catalog) {
  const mod = catalog.find((m) => m.id === moduleId);
  return mod != null && mod.kind === 'rules' && mod.id.startsWith('rules-');
}

/**
 * Partitions module IDs into installer-helper-eligible and confirmation-required groups.
 *
 * @param {string[]} moduleIds - Module ID list
 * @param {Array<{id: string, kind: string}>} catalog - Module catalog
 * @returns {{ helperEligible: string[], needsConfirmation: string[] }}
 */
export function partitionByInstallHelperScope(moduleIds, catalog) {
  const helperEligible = [];
  const needsConfirmation = [];
  for (const id of moduleIds) {
    if (isInstallHelperEligible(id, catalog)) {
      helperEligible.push(id);
    } else {
      needsConfirmation.push(id);
    }
  }
  return { helperEligible, needsConfirmation };
}

/**
 * Creates an install log entry for installer-managed helper flows.
 *
 * @param {string[]} moduleIds - Installed module IDs
 * @param {string[]} detectedLanguages - Detected language rules that triggered the install helper
 * @returns {{ moduleIds: string[], trigger: string[], timestamp: string }}
 */
export function createInstallLog(moduleIds, detectedLanguages) {
  return {
    moduleIds,
    trigger: detectedLanguages,
    timestamp: new Date().toISOString(),
  };
}
