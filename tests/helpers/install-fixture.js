import { mkdtempSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

/**
 * Create a temporary repository fixture with the given platform installed.
 * Copies manifests, scripts, skills, and package.json into a temp dir,
 * runs the install flow, and returns the temp dir path.
 *
 * Caller is responsible for cleaning up: fs.rmSync(tmp, { recursive: true, force: true })
 *
 * @param {string} platform - e.g. 'codex', 'claude-code'
 * @param {string} [profile='developer']
 * @returns {Promise<string>} absolute path to the temp root
 */
export async function createInstalledFixture(platform, profile = 'developer') {
  const tmp = mkdtempSync(join(tmpdir(), 'sp-fixture-'));
  for (const entry of ['manifests', 'scripts', 'skills', 'package.json']) {
    cpSync(join(ROOT, entry), join(tmp, entry), { recursive: true });
  }
  rmSync(join(tmp, 'manifests', 'install-state.json'), { force: true });

  const { install } = await import(pathToFileURL(join(tmp, 'scripts/install.js')).href);
  await install({ platform, profile, rootDir: tmp });
  return tmp;
}
