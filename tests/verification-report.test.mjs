/**
 * Property 4: Verification Report Generation Correctness
 *
 * **Feature: absorb-ecc-capabilities, Property 4: Verification Report Generation Correctness**
 * **Validates: Requirements 2.3**
 *
 * For any set of stage results, the generated report includes each executed
 * stage's status label, and overall is READY iff all non-skipped stages
 * have status 'pass'; NOT READY otherwise.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import fc from 'fast-check';
import { generateReport, STAGE_ORDER } from '../scripts/lib/verification-engine.js';

// --- Arbitraries ---

const validStatuses = ['pass', 'fail', 'skip', 'not_run'];

/**
 * Generate a result entry for a single stage with a random valid status.
 */
function stageResultArb(stage) {
  return fc.constantFrom(...validStatuses).map((status) => ({ stage, status }));
}

/**
 * Generate a full set of results for all 5 stages, each with a random status.
 */
const allStageResultsArb = fc.tuple(
  ...STAGE_ORDER.map((stage) => stageResultArb(stage)),
);

// --- Helpers ---

const STATUS_DISPLAY = {
  pass: 'PASS',
  fail: 'FAIL',
  skip: 'SKIP',
  not_run: 'NOT RUN',
};

// --- Property tests ---

test('Property 4: Verification Report Generation Correctness', async (t) => {
  await t.test(
    'report contains each stage with its correct status label',
    () => {
      fc.assert(
        fc.property(allStageResultsArb, (results) => {
          const report = generateReport(results);

          for (const result of results) {
            const displayStatus = STATUS_DISPLAY[result.status];
            assert.ok(
              report.includes(displayStatus),
              `Report should contain status "${displayStatus}" for stage "${result.stage}"`,
            );
          }
        }),
        { numRuns: 150 },
      );
    },
  );

  await t.test(
    'overall is READY iff all non-skipped stages pass',
    () => {
      fc.assert(
        fc.property(allStageResultsArb, (results) => {
          const report = generateReport(results);

          const nonSkipped = results.filter((r) => r.status !== 'skip');
          const allPassed =
            nonSkipped.length > 0 && nonSkipped.every((r) => r.status === 'pass');

          if (allPassed) {
            assert.ok(
              report.includes('Overall:   READY'),
              'Overall should be READY when all non-skipped stages pass',
            );
            assert.ok(
              !report.includes('NOT READY'),
              'Report should not contain NOT READY when all non-skipped stages pass',
            );
          } else {
            assert.ok(
              report.includes('NOT READY'),
              'Overall should be NOT READY when any non-skipped stage did not pass',
            );
          }
        }),
        { numRuns: 150 },
      );
    },
  );

  await t.test(
    'overall is NOT READY if any stage has status fail or not_run',
    () => {
      // Generate results where at least one stage is fail or not_run
      const resultsWithFailureArb = allStageResultsArb.filter((results) =>
        results.some((r) => r.status === 'fail' || r.status === 'not_run'),
      );

      fc.assert(
        fc.property(resultsWithFailureArb, (results) => {
          const report = generateReport(results);

          assert.ok(
            report.includes('NOT READY'),
            'Overall should be NOT READY when any stage has fail or not_run status',
          );
        }),
        { numRuns: 100 },
      );
    },
  );

  await t.test(
    'report includes the VERIFICATION REPORT header',
    () => {
      fc.assert(
        fc.property(allStageResultsArb, (results) => {
          const report = generateReport(results);

          assert.ok(
            report.includes('VERIFICATION REPORT'),
            'Report should include the header',
          );
          assert.ok(
            report.includes('=================='),
            'Report should include the separator line',
          );
        }),
        { numRuns: 100 },
      );
    },
  );
});
