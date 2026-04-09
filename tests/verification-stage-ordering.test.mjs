/**
 * Property 3: Verification Stage Sequential Execution and Fail-Stop
 *
 * **Feature: absorb-ecc-capabilities, Property 3: Verification Stage Sequential Execution and Fail-Stop**
 * **Validates: Requirements 2.1, 2.2**
 *
 * For any sequence of 5 stage results (pass/fail), the verification loop
 * executes stages in order (build, types, lint, test, security), stops at
 * the first failure, and does not execute any stages after the failure.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import fc from 'fast-check';
import { runVerification, STAGE_ORDER } from '../scripts/lib/verification-engine.js';

// --- Arbitraries ---

/**
 * Generate a pass/fail pattern for each of the 5 stages.
 * true = pass (exit code 0), false = fail (exit code 1).
 */
const stagePatternArb = fc.tuple(
  fc.boolean(), // build
  fc.boolean(), // types
  fc.boolean(), // lint
  fc.boolean(), // test
  fc.boolean(), // security
);

// --- Helpers ---

/**
 * Build a stages config object where every stage has a command.
 */
function buildStages() {
  const stages = {};
  for (const name of STAGE_ORDER) {
    stages[name] = { command: `run-${name}` };
  }
  return stages;
}

/**
 * Create a mock executor that returns pass/fail based on the generated pattern.
 * Also records the order of calls for verification.
 */
function createMockExecutor(pattern) {
  const calls = [];
  const executor = (command) => {
    calls.push(command);
    // Find which stage this command belongs to
    const stageIndex = STAGE_ORDER.findIndex((name) => command === `run-${name}`);
    const shouldPass = pattern[stageIndex];
    return {
      exitCode: shouldPass ? 0 : 1,
      output: shouldPass ? 'ok' : 'error',
    };
  };
  return { executor, calls };
}

/**
 * Return the index of the first false in the pattern, or -1 if all true.
 */
function firstFailureIndex(pattern) {
  return pattern.indexOf(false);
}

// --- Property tests ---

test('Property 3: Verification Stage Sequential Execution and Fail-Stop', async (t) => {
  await t.test(
    'stages execute in correct order and stop at first failure',
    () => {
      fc.assert(
        fc.property(stagePatternArb, (pattern) => {
          const stages = buildStages();
          const { executor, calls } = createMockExecutor(pattern);
          const results = runVerification(stages, { executor });

          const failIdx = firstFailureIndex(pattern);
          const expectedCallCount = failIdx === -1 ? 5 : failIdx + 1;

          // Executor called exactly the right number of times
          assert.equal(
            calls.length,
            expectedCallCount,
            `Expected ${expectedCallCount} executor calls, got ${calls.length}`,
          );

          // Calls are in the correct stage order
          for (let i = 0; i < calls.length; i++) {
            assert.equal(
              calls[i],
              `run-${STAGE_ORDER[i]}`,
              `Call ${i} should be for stage ${STAGE_ORDER[i]}`,
            );
          }

          // Results array always has 5 entries, one per stage
          assert.equal(results.length, 5);

          // Verify each result status
          for (let i = 0; i < 5; i++) {
            assert.equal(results[i].stage, STAGE_ORDER[i]);

            if (failIdx === -1) {
              // All pass
              assert.equal(results[i].status, 'pass');
            } else if (i < failIdx) {
              // Before the failure: pass
              assert.equal(results[i].status, 'pass');
            } else if (i === failIdx) {
              // The failing stage
              assert.equal(results[i].status, 'fail');
            } else {
              // After the failure: not_run
              assert.equal(results[i].status, 'not_run');
            }
          }
        }),
        { numRuns: 150 },
      );
    },
  );

  await t.test(
    'when all stages pass, every result has status pass',
    () => {
      fc.assert(
        fc.property(
          fc.constant([true, true, true, true, true]),
          (pattern) => {
            const stages = buildStages();
            const { executor } = createMockExecutor(pattern);
            const results = runVerification(stages, { executor });

            for (const result of results) {
              assert.equal(result.status, 'pass');
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  await t.test(
    'no stages after the first failure are executed',
    () => {
      fc.assert(
        fc.property(stagePatternArb, (pattern) => {
          const failIdx = firstFailureIndex(pattern);
          if (failIdx === -1) return; // skip all-pass cases

          const stages = buildStages();
          const { executor, calls } = createMockExecutor(pattern);
          const results = runVerification(stages, { executor });

          // No command after the failing stage should have been called
          for (let i = failIdx + 1; i < 5; i++) {
            const stageCmd = `run-${STAGE_ORDER[i]}`;
            assert.ok(
              !calls.includes(stageCmd),
              `Stage ${STAGE_ORDER[i]} should not have been executed after failure at ${STAGE_ORDER[failIdx]}`,
            );
            assert.equal(results[i].status, 'not_run');
          }
        }),
        { numRuns: 150 },
      );
    },
  );
});
