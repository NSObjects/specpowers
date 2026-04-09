/**
 * Property 10: Platform Adapter Path Generation
 *
 * **Feature: absorb-ecc-capabilities, Property 10: Platform Adapter Path Generation**
 * **Validates: Requirements 6.6**
 *
 * For any module and platform combination, adapter generates valid
 * platform-specific paths; different platforms produce different directory
 * structures for the same module.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import fc from 'fast-check';

import * as claudeCode from '../scripts/adapters/claude-code.js';
import * as cursor from '../scripts/adapters/cursor.js';
import * as geminiCli from '../scripts/adapters/gemini-cli.js';
import * as kiroIde from '../scripts/adapters/kiro-ide.js';
import * as codex from '../scripts/adapters/codex.js';
import * as opencode from '../scripts/adapters/opencode.js';

// --- All adapters keyed by platform name ---

const ADAPTERS = {
  'claude-code': claudeCode,
  'cursor': cursor,
  'gemini-cli': geminiCli,
  'kiro-ide': kiroIde,
  'codex': codex,
  'opencode': opencode,
};

const PLATFORM_NAMES = Object.keys(ADAPTERS);

// --- Generators ---

/** Arbitrary module path like "skills/exploring" or "skills/rules-typescript". */
const modulePathArb = fc
  .tuple(
    fc.constantFrom('skills', 'agents', 'rules'),
    fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-z][a-z0-9-]*$/.test(s)),
  )
  .map(([prefix, name]) => `${prefix}/${name}`);

/** Arbitrary pair of distinct platform names. */
const distinctPlatformPairArb = fc
  .tuple(
    fc.constantFrom(...PLATFORM_NAMES),
    fc.constantFrom(...PLATFORM_NAMES),
  )
  .filter(([a, b]) => a !== b);

// --- Property tests ---

test('Property 10: Platform Adapter Path Generation', async (t) => {
  await t.test(
    'each adapter generates paths starting with its target directory',
    () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PLATFORM_NAMES),
          modulePathArb,
          (platformName, modulePath) => {
            const adapter = ADAPTERS[platformName];
            const installPath = adapter.getInstallPath(modulePath);
            const targetDir = adapter.getTargetDir();

            assert.ok(
              installPath.startsWith(targetDir + '/'),
              `Install path "${installPath}" should start with target dir "${targetDir}/"`,
            );
          },
        ),
        { numRuns: 200 },
      );
    },
  );

  await t.test(
    'install path contains the original module path',
    () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PLATFORM_NAMES),
          modulePathArb,
          (platformName, modulePath) => {
            const adapter = ADAPTERS[platformName];
            const installPath = adapter.getInstallPath(modulePath);

            assert.ok(
              installPath.includes(modulePath),
              `Install path "${installPath}" should contain module path "${modulePath}"`,
            );
          },
        ),
        { numRuns: 200 },
      );
    },
  );

  await t.test(
    'different platforms produce different paths for the same module',
    () => {
      fc.assert(
        fc.property(
          distinctPlatformPairArb,
          modulePathArb,
          ([platformA, platformB], modulePath) => {
            const pathA = ADAPTERS[platformA].getInstallPath(modulePath);
            const pathB = ADAPTERS[platformB].getInstallPath(modulePath);

            assert.notEqual(
              pathA,
              pathB,
              `Platforms "${platformA}" and "${platformB}" should produce different paths for "${modulePath}"`,
            );
          },
        ),
        { numRuns: 200 },
      );
    },
  );

  await t.test(
    'each adapter exports a matching platform identifier',
    () => {
      for (const [name, adapter] of Object.entries(ADAPTERS)) {
        assert.equal(
          adapter.platform,
          name,
          `Adapter platform export "${adapter.platform}" should match key "${name}"`,
        );
      }
    },
  );

  await t.test(
    'all 6 platforms have distinct target directories',
    () => {
      const targetDirs = PLATFORM_NAMES.map((name) => ADAPTERS[name].getTargetDir());
      const uniqueDirs = new Set(targetDirs);
      assert.equal(
        uniqueDirs.size,
        PLATFORM_NAMES.length,
        `All ${PLATFORM_NAMES.length} platforms should have distinct target directories`,
      );
    },
  );

  await t.test(
    'getTargetDir returns a non-empty string for every platform',
    () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PLATFORM_NAMES),
          (platformName) => {
            const targetDir = ADAPTERS[platformName].getTargetDir();
            assert.ok(
              typeof targetDir === 'string' && targetDir.length > 0,
              `Target dir for "${platformName}" should be a non-empty string`,
            );
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});
