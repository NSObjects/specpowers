/**
 * Platform adapter for Kiro IDE.
 *
 * Kiro IDE surfaces skills as steering files under `.kiro/steering/`.
 * This adapter flattens the skills directory structure into the same
 * naming convention used by `sync-steering.js`:
 *
 *   skills/X/SKILL.md          → .kiro/steering/X.md
 *   skills/X/other.md          → .kiro/steering/X--other.md
 *   skills/X/subdir/file.md    → .kiro/steering/X--subdir--file.md
 *
 * Single-file paths (e.g. "skills/dispatching-parallel-agents/planner-agent-prompt.md")
 * are mapped directly to their steering name.
 */

import { readdirSync, readFileSync, statSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join, basename } from 'node:path';

const PLATFORM = 'kiro-ide';
const TARGET_DIR = '.kiro';
const STEERING_DIR = `${TARGET_DIR}/steering`;
const MARKER = '<!-- generated from skills/ by specpowers kiro-ide adapter -->';

/**
 * Map a source module path to its Kiro IDE install location.
 *
 * For directory paths (e.g. "skills/exploring"), returns the steering
 * directory itself since the actual files are expanded by expandModulePaths.
 * For single-file paths, returns the steering file path directly.
 *
 * @param {string} modulePath - Relative source path.
 * @returns {string} Platform-specific install path.
 */
export function getInstallPath(modulePath) {
  // Single-file path (e.g. "skills/dispatching-parallel-agents/planner-agent-prompt.md")
  if (modulePath.endsWith('.md')) {
    return steeringPathForFile(modulePath);
  }
  // Directory path — return the steering dir as a placeholder;
  // actual paths come from expandModulePaths.
  return STEERING_DIR;
}

/**
 * Return the root target directory for this platform.
 *
 * @returns {string}
 */
export function getTargetDir() {
  return TARGET_DIR;
}

/**
 * Expand a single source module path into all the steering file paths
 * it produces. This is the key difference from other adapters: one source
 * directory fans out into multiple target files.
 *
 * @param {string} rootDir - SpecPowers root directory.
 * @param {string} modulePath - Relative source path (e.g. "skills/exploring").
 * @returns {Array<{ source: string, target: string }>} Source→target file pairs.
 */
export function expandModulePaths(rootDir, modulePath) {
  const fullPath = resolve(rootDir, modulePath);

  // Single-file source (e.g. agent prompt files)
  if (modulePath.endsWith('.md')) {
    return [{ source: modulePath, target: steeringPathForFile(modulePath) }];
  }

  // Directory source — enumerate .md files like sync-steering.js
  if (!existsSync(fullPath) || !statSync(fullPath).isDirectory()) {
    return [];
  }

  const skillName = basename(modulePath); // e.g. "exploring"
  const pairs = [];
  const entries = readdirSync(fullPath);

  // Root-level .md files
  for (const file of entries) {
    const filePath = join(fullPath, file);
    if (!file.endsWith('.md') || !statSync(filePath).isFile()) continue;

    const targetName = file === 'SKILL.md'
      ? `${skillName}.md`
      : `${skillName}--${file}`;
    pairs.push({
      source: `${modulePath}/${file}`,
      target: `${STEERING_DIR}/${targetName}`,
    });
  }

  // Subdirectory .md files (e.g. skills/using-skills/references/)
  for (const entry of entries) {
    const entryPath = join(fullPath, entry);
    if (!statSync(entryPath).isDirectory()) continue;

    const subFiles = readdirSync(entryPath).filter(
      (f) => f.endsWith('.md') && statSync(join(entryPath, f)).isFile()
    );

    for (const file of subFiles) {
      const targetName = `${skillName}--${entry}--${file}`;
      pairs.push({
        source: `${modulePath}/${entry}/${file}`,
        target: `${STEERING_DIR}/${targetName}`,
      });
    }
  }

  return pairs;
}

/**
 * Custom materialize function for Kiro IDE.
 * Copies a single .md source file to its steering target, prepending
 * the generation marker comment.
 *
 * @param {string} rootDir
 * @param {string} sourceRelativePath - e.g. "skills/exploring/SKILL.md"
 * @param {string} targetRelativePath - e.g. ".kiro/steering/exploring.md"
 */
export function materializeFile(rootDir, sourceRelativePath, targetRelativePath) {
  const sourcePath = resolve(rootDir, sourceRelativePath);
  const targetPath = resolve(rootDir, targetRelativePath);

  mkdirSync(dirname(targetPath), { recursive: true });
  const content = readFileSync(sourcePath, 'utf-8');
  writeFileSync(targetPath, `${MARKER}\n${content}`, 'utf-8');
}

/**
 * Compute the steering file path for a single .md source file.
 *
 * @param {string} modulePath - e.g. "skills/dispatching-parallel-agents/planner-agent-prompt.md"
 * @returns {string} e.g. ".kiro/steering/dispatching-parallel-agents--planner-agent-prompt.md"
 */
function steeringPathForFile(modulePath) {
  // "skills/dispatching-parallel-agents/planner-agent-prompt.md"
  // → parts = ["skills", "dispatching-parallel-agents", "planner-agent-prompt.md"]
  const parts = modulePath.split('/');
  // Remove "skills" prefix
  const relevant = parts.slice(1); // ["dispatching-parallel-agents", "planner-agent-prompt.md"]
  const steeringName = relevant.join('--');
  return `${STEERING_DIR}/${steeringName}`;
}

export const platform = PLATFORM;
