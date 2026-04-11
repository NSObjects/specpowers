import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(readFileSync(resolve(ROOT, relativePath), 'utf-8'));
}

test('distribution metadata versions stay aligned with package.json', async (t) => {
  const packageVersion = readJson('package.json').version;

  await t.test('package-lock.json matches package.json', () => {
    const lockfile = readJson('package-lock.json');
    assert.equal(lockfile.version, packageVersion);
    assert.equal(lockfile.packages[''].version, packageVersion);
  });

  await t.test('.codex-plugin/plugin.json matches package.json', () => {
    assert.equal(readJson('.codex-plugin/plugin.json').version, packageVersion);
  });

  await t.test('.cursor-plugin/plugin.json matches package.json', () => {
    assert.equal(readJson('.cursor-plugin/plugin.json').version, packageVersion);
  });

  await t.test('.claude-plugin/plugin.json matches package.json', () => {
    assert.equal(readJson('.claude-plugin/plugin.json').version, packageVersion);
  });

  await t.test('.claude-plugin/marketplace.json advertises the package version', () => {
    const marketplace = readJson('.claude-plugin/marketplace.json');
    const plugin = marketplace.plugins.find((entry) => entry.name === 'specpowers');
    assert.ok(plugin, 'Expected specpowers entry in .claude-plugin/marketplace.json');
    assert.equal(plugin.version, packageVersion);
  });

  await t.test('gemini-extension.json matches package.json', () => {
    assert.equal(readJson('gemini-extension.json').version, packageVersion);
  });
});
