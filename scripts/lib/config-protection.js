/**
 * Configuration File Protection
 *
 * Checks whether a given file path refers to a protected quality-tool
 * configuration file. Protected files should not be modified without
 * explicit user approval.
 */

import { basename } from 'node:path';

/**
 * Map of exact file names to their protection reason.
 * Keys are lowercase basenames for case-insensitive matching.
 */
const PROTECTED_EXACT = new Map([
  // ESLint
  ['.eslintrc', 'ESLint configuration'],
  ['.eslintrc.js', 'ESLint configuration'],
  ['.eslintrc.cjs', 'ESLint configuration'],
  ['.eslintrc.json', 'ESLint configuration'],
  ['.eslintrc.yml', 'ESLint configuration'],
  ['eslint.config.js', 'ESLint flat config'],
  ['eslint.config.mjs', 'ESLint flat config'],
  ['eslint.config.cjs', 'ESLint flat config'],

  // TypeScript
  ['tsconfig.json', 'TypeScript configuration'],

  // Prettier
  ['.prettierrc', 'Prettier configuration'],
  ['.prettierrc.js', 'Prettier configuration'],
  ['.prettierrc.cjs', 'Prettier configuration'],
  ['.prettierrc.json', 'Prettier configuration'],
  ['.prettierrc.yml', 'Prettier configuration'],
  ['.prettierrc.toml', 'Prettier configuration'],
  ['prettier.config.js', 'Prettier configuration'],
  ['prettier.config.cjs', 'Prettier configuration'],

  // Biome
  ['biome.json', 'Biome configuration'],
  ['biome.jsonc', 'Biome configuration'],

  // Python
  ['pyproject.toml', 'Python project configuration (may contain lint/format sections)'],
  ['.flake8', 'Flake8 configuration'],
  ['setup.cfg', 'Python setup configuration (may contain lint/type sections)'],
  ['.pylintrc', 'Pylint configuration'],
  ['.mypy.ini', 'mypy configuration'],
  ['mypy.ini', 'mypy configuration'],
  ['pyrightconfig.json', 'Pyright configuration'],
  ['.ruff.toml', 'Ruff configuration'],
  ['ruff.toml', 'Ruff configuration'],

  // Go
  ['.golangci.yml', 'golangci-lint configuration'],
  ['.golangci.yaml', 'golangci-lint configuration'],
  ['.golangci.json', 'golangci-lint configuration'],
  ['.golangci.toml', 'golangci-lint configuration'],

  // Rust
  ['rustfmt.toml', 'rustfmt configuration'],
  ['.rustfmt.toml', 'rustfmt configuration'],
  ['clippy.toml', 'Clippy configuration'],
  ['.clippy.toml', 'Clippy configuration'],

  // Multi-language / Editor
  ['.editorconfig', 'EditorConfig configuration'],
  ['.clang-format', 'clang-format configuration'],
  ['.clang-tidy', 'clang-tidy configuration'],
  ['.swiftlint.yml', 'SwiftLint configuration'],
  ['analysis_options.yaml', 'Dart analyzer configuration'],
  ['checkstyle.xml', 'Checkstyle configuration'],
  ['.scalafmt.conf', 'Scalafmt configuration'],
  ['ktlint-baseline.xml', 'ktlint baseline'],
]);

/**
 * Patterns for file names that match via prefix/pattern rather than exact name.
 * Each entry: { test: (basename) => boolean, reason: string }
 */
const PROTECTED_PATTERNS = [
  {
    test: (name) => /^tsconfig\..*\.json$/i.test(name) && name.toLowerCase() !== 'tsconfig.json',
    reason: 'TypeScript extended configuration',
  },
];

/**
 * Check whether a file path refers to a protected configuration file.
 *
 * @param {string} filePath - The file path to check (absolute or relative).
 * @returns {{ protected: boolean, reason: string | null }}
 *   `protected` is true when the file is a protected config.
 *   `reason` explains why the file is protected (null when not protected).
 */
export function isProtectedConfig(filePath) {
  if (typeof filePath !== 'string' || filePath.length === 0) {
    return { protected: false, reason: null };
  }

  const name = basename(filePath);
  const nameLower = name.toLowerCase();

  // Check exact matches (case-insensitive on the basename)
  const exactReason = PROTECTED_EXACT.get(nameLower);
  if (exactReason) {
    return { protected: true, reason: exactReason };
  }

  // Check pattern matches
  for (const pattern of PROTECTED_PATTERNS) {
    if (pattern.test(nameLower)) {
      return { protected: true, reason: pattern.reason };
    }
  }

  return { protected: false, reason: null };
}
