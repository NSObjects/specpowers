import { execSync } from 'node:child_process';

/**
 * The fixed order in which verification stages are executed.
 */
const STAGE_ORDER = ['build', 'types', 'lint', 'test', 'security'];

/**
 * Display labels for the report (aligned for readability).
 */
const STAGE_LABELS = {
  build: 'Build:    ',
  types: 'Types:    ',
  lint: 'Lint:     ',
  test: 'Tests:    ',
  security: 'Security: ',
};

/**
 * Default command executor using child_process.execSync.
 * Returns { exitCode, output }.
 *
 * @param {string} command
 * @returns {{ exitCode: number, output: string }}
 */
function defaultExecutor(command) {
  try {
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    return { exitCode: 0, output };
  } catch (err) {
    return {
      exitCode: err.status ?? 1,
      output: (err.stdout ?? '') + (err.stderr ?? ''),
    };
  }
}

/**
 * Execute verification stages sequentially, stopping at the first failure.
 *
 * @param {Record<string, { command: string|null, skip?: string }>} stages
 * @param {{ executor?: (cmd: string) => { exitCode: number, output: string } }} [options]
 * @returns {Array<{ stage: string, status: 'pass'|'fail'|'skip'|'not_run', command: string|null, output?: string, exitCode?: number, reason?: string }>}
 */
export function runVerification(stages, options = {}) {
  const executor = options.executor ?? defaultExecutor;
  const results = [];
  let failed = false;

  for (const stage of STAGE_ORDER) {
    const def = stages[stage];

    if (failed) {
      results.push({ stage, status: 'not_run', command: null });
      continue;
    }

    if (!def || def.command === null || def.command === undefined) {
      const reason = (def && def.skip) ? def.skip : 'no command configured';
      results.push({ stage, status: 'skip', command: null, reason });
      continue;
    }

    const { exitCode, output } = executor(def.command);

    if (exitCode === 0) {
      results.push({ stage, status: 'pass', command: def.command, output, exitCode });
    } else {
      results.push({ stage, status: 'fail', command: def.command, output, exitCode });
      failed = true;
    }
  }

  return results;
}

/**
 * Generate a structured verification report string from stage results.
 *
 * @param {Array<{ stage: string, status: 'pass'|'fail'|'skip'|'not_run' }>} results
 * @returns {string}
 */
export function generateReport(results) {
  const statusDisplay = {
    pass: 'PASS',
    fail: 'FAIL',
    skip: 'SKIP',
    not_run: 'NOT RUN',
  };

  const lines = ['VERIFICATION REPORT', '=================='];

  for (const result of results) {
    const label = STAGE_LABELS[result.stage] ?? `${result.stage}: `;
    const display = statusDisplay[result.status] ?? result.status.toUpperCase();
    lines.push(`${label} ${display}`);
  }

  // Overall: READY only if every non-skipped stage passed
  const nonSkipped = results.filter(r => r.status !== 'skip');
  const allPassed = nonSkipped.length > 0 && nonSkipped.every(r => r.status === 'pass');
  const overall = allPassed ? 'READY' : 'NOT READY';

  lines.push('');
  lines.push(`Overall:   ${overall}`);

  return lines.join('\n');
}

export { STAGE_ORDER, STAGE_LABELS };
