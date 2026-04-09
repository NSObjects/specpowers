/**
 * Property 7: Configuration File Protection
 *
 * **Feature: absorb-ecc-capabilities, Property 7: Configuration File Protection**
 * **Validates: Requirements 5.7**
 *
 * For any file path, the protection function correctly identifies protected
 * configs and returns a block signal for protected files, an allow signal
 * for non-protected files.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import fc from 'fast-check';
import { isProtectedConfig } from '../scripts/lib/config-protection.js';

// --- Known protected basenames (exhaustive list matching the implementation) ---

const PROTECTED_EXACT_NAMES = [
  // ESLint
  '.eslintrc', '.eslintrc.js', '.eslintrc.cjs', '.eslintrc.json', '.eslintrc.yml',
  'eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs',
  // TypeScript
  'tsconfig.json',
  // Prettier
  '.prettierrc', '.prettierrc.js', '.prettierrc.cjs', '.prettierrc.json',
  '.prettierrc.yml', '.prettierrc.toml', 'prettier.config.js', 'prettier.config.cjs',
  // Biome
  'biome.json', 'biome.jsonc',
  // Python
  'pyproject.toml', '.flake8', 'setup.cfg', '.pylintrc',
  '.mypy.ini', 'mypy.ini', 'pyrightconfig.json', '.ruff.toml', 'ruff.toml',
  // Go
  '.golangci.yml', '.golangci.yaml', '.golangci.json', '.golangci.toml',
  // Rust
  'rustfmt.toml', '.rustfmt.toml', 'clippy.toml', '.clippy.toml',
  // Multi-language / Editor
  '.editorconfig', '.clang-format', '.clang-tidy', '.swiftlint.yml',
  'analysis_options.yaml', 'checkstyle.xml', '.scalafmt.conf', 'ktlint-baseline.xml',
];

/**
 * Generate tsconfig.*.json pattern names (the pattern-matched protected files).
 */
const tsconfigExtendedArb = fc.string({ minLength: 1, maxLength: 10 })
  .filter(s => /^[a-z]+$/.test(s))
  .map(s => `tsconfig.${s}.json`);

// --- Safe file name generators (names that should never be protected) ---

const SAFE_EXTENSIONS = ['.ts', '.js', '.py', '.go', '.rs', '.java', '.md', '.txt', '.css', '.html', '.svg'];
const SAFE_PREFIXES = ['app', 'index', 'main', 'utils', 'helper', 'component', 'service', 'model'];

const safeFileNameArb = fc.tuple(
  fc.constantFrom(...SAFE_PREFIXES),
  fc.constantFrom(...SAFE_EXTENSIONS),
).map(([prefix, ext]) => `${prefix}${ext}`);

const directoryPrefixArb = fc.array(
  fc.string({ minLength: 1, maxLength: 8 }).filter(s => /^[a-z0-9]+$/.test(s)),
  { minLength: 0, maxLength: 4 },
).map(parts => parts.length > 0 ? parts.join('/') + '/' : '');

// --- Property tests ---

test('Property 7: Configuration File Protection', async (t) => {
  await t.test(
    'all known protected exact names are identified as protected',
    () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PROTECTED_EXACT_NAMES),
          directoryPrefixArb,
          (name, dirPrefix) => {
            const filePath = dirPrefix + name;
            const result = isProtectedConfig(filePath);
            assert.equal(
              result.protected,
              true,
              `Expected "${filePath}" to be protected`,
            );
            assert.ok(
              typeof result.reason === 'string' && result.reason.length > 0,
              `Expected a non-empty reason for protected file "${filePath}"`,
            );
          },
        ),
        { numRuns: 200 },
      );
    },
  );

  await t.test(
    'tsconfig.*.json pattern files are identified as protected',
    () => {
      fc.assert(
        fc.property(
          tsconfigExtendedArb,
          directoryPrefixArb,
          (name, dirPrefix) => {
            const filePath = dirPrefix + name;
            const result = isProtectedConfig(filePath);
            assert.equal(
              result.protected,
              true,
              `Expected "${filePath}" to be protected (tsconfig extended pattern)`,
            );
            assert.ok(
              typeof result.reason === 'string' && result.reason.length > 0,
              `Expected a non-empty reason for "${filePath}"`,
            );
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  await t.test(
    'non-config source files are not protected',
    () => {
      fc.assert(
        fc.property(
          safeFileNameArb,
          directoryPrefixArb,
          (name, dirPrefix) => {
            const filePath = dirPrefix + name;
            const result = isProtectedConfig(filePath);
            assert.equal(
              result.protected,
              false,
              `Expected "${filePath}" to NOT be protected`,
            );
            assert.equal(
              result.reason,
              null,
              `Expected null reason for non-protected file "${filePath}"`,
            );
          },
        ),
        { numRuns: 200 },
      );
    },
  );

  await t.test(
    'protected signal is block (true) and non-protected signal is allow (false)',
    () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constantFrom(...PROTECTED_EXACT_NAMES),
            safeFileNameArb,
          ),
          (name) => {
            const result = isProtectedConfig(name);
            // Block signal = protected: true, Allow signal = protected: false
            assert.equal(typeof result.protected, 'boolean');
            if (result.protected) {
              // Block signal: reason must be a non-empty string
              assert.ok(typeof result.reason === 'string' && result.reason.length > 0);
            } else {
              // Allow signal: reason must be null
              assert.equal(result.reason, null);
            }
          },
        ),
        { numRuns: 200 },
      );
    },
  );

  await t.test(
    'empty or invalid input returns allow signal',
    () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', null, undefined, 42, true, []),
          (input) => {
            const result = isProtectedConfig(input);
            assert.equal(result.protected, false);
            assert.equal(result.reason, null);
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});
