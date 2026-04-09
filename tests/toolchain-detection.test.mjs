/**
 * Property 5: Toolchain and Package Manager Detection
 *
 * **Feature: absorb-ecc-capabilities, Property 5: Toolchain and Package Manager Detection**
 * **Validates: Requirements 2.4, 5.1**
 *
 * For any combination of project config files, detection returns correct
 * package manager and toolchain commands; never returns commands for absent tools.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import fc from 'fast-check';
import {
  detectToolchain,
  MARKER_FILES,
  NODE_PM_LOCK_FILES,
  LANGUAGE_STAGES,
} from '../scripts/lib/toolchain-detect.js';

// --- Arbitraries ---

/** Generate an arbitrary subset of marker files. */
const markerSubsetArb = fc.subarray(
  MARKER_FILES.map((m) => m.file),
  { minLength: 0 },
);

/** Generate an arbitrary subset of Node.js lock files. */
const lockFileSubsetArb = fc.subarray(
  NODE_PM_LOCK_FILES.map((l) => l.file),
  { minLength: 0 },
);

// --- Helpers ---

/**
 * Create a temp directory with the given files (empty content).
 * Returns the temp dir path.
 */
function createTempProject(files) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'toolchain-test-'));
  for (const file of files) {
    fs.writeFileSync(path.join(tmpDir, file), '');
  }
  return tmpDir;
}

/** Remove a temp directory and its contents. */
function cleanupTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

/**
 * Compute the expected set of unique languages from a list of marker files.
 */
function expectedLanguages(markerFiles) {
  const langs = [];
  for (const { file, language } of MARKER_FILES) {
    if (markerFiles.includes(file) && !langs.includes(language)) {
      langs.push(language);
    }
  }
  return langs;
}

/**
 * Compute the expected package manager from lock files.
 * Returns the first matching PM in priority order, or 'npm' as default.
 * Only relevant when javascript is detected.
 */
function expectedPackageManager(lockFiles) {
  for (const { file, pm } of NODE_PM_LOCK_FILES) {
    if (lockFiles.includes(file)) return pm;
  }
  return 'npm';
}

// --- Property tests ---

test('Property 5: Toolchain and Package Manager Detection', async (t) => {
  await t.test(
    'detected languages match exactly the marker files present',
    () => {
      fc.assert(
        fc.property(markerSubsetArb, lockFileSubsetArb, (markers, locks) => {
          const allFiles = [...markers, ...locks];
          const tmpDir = createTempProject(allFiles);
          try {
            const result = detectToolchain(tmpDir);
            const expected = expectedLanguages(markers);

            assert.deepStrictEqual(
              result.languages,
              expected,
              `Languages should be ${JSON.stringify(expected)} for markers ${JSON.stringify(markers)}`,
            );
          } finally {
            cleanupTempDir(tmpDir);
          }
        }),
        { numRuns: 150 },
      );
    },
  );

  await t.test(
    'package manager detected correctly based on lock files (only when JS present)',
    () => {
      fc.assert(
        fc.property(markerSubsetArb, lockFileSubsetArb, (markers, locks) => {
          const allFiles = [...markers, ...locks];
          const tmpDir = createTempProject(allFiles);
          try {
            const result = detectToolchain(tmpDir);
            const hasJS = markers.includes('package.json');

            if (!hasJS) {
              assert.equal(
                result.packageManager,
                null,
                'packageManager should be null when no package.json',
              );
            } else {
              const expectedPM = expectedPackageManager(locks);
              assert.equal(
                result.packageManager,
                expectedPM,
                `packageManager should be ${expectedPM} for locks ${JSON.stringify(locks)}`,
              );
            }
          } finally {
            cleanupTempDir(tmpDir);
          }
        }),
        { numRuns: 150 },
      );
    },
  );

  await t.test(
    'stage commands correspond to detected languages only',
    () => {
      fc.assert(
        fc.property(markerSubsetArb, lockFileSubsetArb, (markers, locks) => {
          const allFiles = [...markers, ...locks];
          const tmpDir = createTempProject(allFiles);
          try {
            const result = detectToolchain(tmpDir);
            const detectedLangs = expectedLanguages(markers);

            // Collect all stage names that detected languages define
            const allowedStages = new Set();
            for (const lang of detectedLangs) {
              if (LANGUAGE_STAGES[lang]) {
                for (const stage of Object.keys(LANGUAGE_STAGES[lang])) {
                  allowedStages.add(stage);
                }
              }
            }

            // Every returned stage must be in the allowed set
            for (const stage of Object.keys(result.stages)) {
              assert.ok(
                allowedStages.has(stage),
                `Stage "${stage}" should not be present — no detected language defines it`,
              );
            }

            // Every allowed stage must be present in the result
            for (const stage of allowedStages) {
              assert.ok(
                stage in result.stages,
                `Stage "${stage}" should be present for detected languages ${JSON.stringify(detectedLangs)}`,
              );
            }
          } finally {
            cleanupTempDir(tmpDir);
          }
        }),
        { numRuns: 150 },
      );
    },
  );

  await t.test(
    'no commands returned for languages whose marker files are absent',
    () => {
      fc.assert(
        fc.property(markerSubsetArb, lockFileSubsetArb, (markers, locks) => {
          const allFiles = [...markers, ...locks];
          const tmpDir = createTempProject(allFiles);
          try {
            const result = detectToolchain(tmpDir);
            const detectedLangs = new Set(expectedLanguages(markers));

            // For each language NOT detected, none of its unique commands should appear
            for (const [lang, stages] of Object.entries(LANGUAGE_STAGES)) {
              if (detectedLangs.has(lang)) continue;

              for (const [stageName, def] of Object.entries(stages)) {
                if (def.cmd === null) continue;
                // If this stage exists in the result, its command must NOT come
                // from the absent language. It may come from a detected language
                // that defines the same stage name.
                if (stageName in result.stages && result.stages[stageName].command !== null) {
                  // The command in the result should not be the absent language's command
                  // (after pm substitution for JS)
                  let absentCmd = def.cmd;
                  if (result.packageManager) {
                    absentCmd = absentCmd.replace(/\{pm\}/g, result.packageManager);
                  }
                  // Only assert mismatch if no detected language also defines this stage
                  // with the same command template
                  const couldMatchDetected = [...detectedLangs].some((dl) => {
                    const dlStages = LANGUAGE_STAGES[dl];
                    if (!dlStages || !dlStages[stageName]) return false;
                    let dlCmd = dlStages[stageName].cmd;
                    if (dlCmd && result.packageManager) {
                      dlCmd = dlCmd.replace(/\{pm\}/g, result.packageManager);
                    }
                    return dlCmd === absentCmd;
                  });
                  if (!couldMatchDetected) {
                    assert.notEqual(
                      result.stages[stageName].command,
                      absentCmd,
                      `Command for stage "${stageName}" should not come from absent language "${lang}"`,
                    );
                  }
                }
              }
            }
          } finally {
            cleanupTempDir(tmpDir);
          }
        }),
        { numRuns: 150 },
      );
    },
  );

  await t.test(
    'empty project returns no languages, null packageManager, and no stages',
    () => {
      fc.assert(
        fc.property(fc.constant([]), () => {
          const tmpDir = createTempProject([]);
          try {
            const result = detectToolchain(tmpDir);
            assert.deepStrictEqual(result.languages, []);
            assert.equal(result.packageManager, null);
            assert.deepStrictEqual(result.stages, {});
          } finally {
            cleanupTempDir(tmpDir);
          }
        }),
        { numRuns: 100 },
      );
    },
  );
});
