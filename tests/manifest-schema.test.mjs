/**
 * Unit tests for JSON manifest schema validation
 *
 * **Feature: absorb-ecc-capabilities**
 * **Validates: Requirements 6.1, 6.2**
 *
 * Validates install-modules.json has required fields per module
 * (id, kind, paths, targets, dependencies) and install-profiles.json
 * profiles reference only valid module IDs.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXT_TO_SKILL } from '../scripts/lib/language-detect.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFESTS_DIR = join(__dirname, '..', 'manifests');
const ROOT = resolve(__dirname, '..');
const SUPPORTED_TARGETS = new Set(['claude-code', 'codex']);

const modulesManifest = JSON.parse(
  readFileSync(join(MANIFESTS_DIR, 'install-modules.json'), 'utf-8'),
);
const profilesManifest = JSON.parse(
  readFileSync(join(MANIFESTS_DIR, 'install-profiles.json'), 'utf-8'),
);

// --- install-modules.json tests ---

test('install-modules.json schema validation', async (t) => {
  await t.test('has a version field', () => {
    assert.equal(typeof modulesManifest.version, 'number');
  });

  await t.test('has a non-empty modules array', () => {
    assert.ok(Array.isArray(modulesManifest.modules));
    assert.ok(modulesManifest.modules.length > 0, 'modules array should not be empty');
  });

  await t.test('each module has required field: id (non-empty string)', () => {
    for (const mod of modulesManifest.modules) {
      assert.ok(
        typeof mod.id === 'string' && mod.id.length > 0,
        `Module missing valid id: ${JSON.stringify(mod)}`,
      );
    }
  });

  await t.test('each module has required field: kind (non-empty string)', () => {
    for (const mod of modulesManifest.modules) {
      assert.ok(
        typeof mod.kind === 'string' && mod.kind.length > 0,
        `Module "${mod.id}" missing valid kind`,
      );
    }
  });

  await t.test('each module has required field: paths (non-empty array of strings)', () => {
    for (const mod of modulesManifest.modules) {
      assert.ok(
        Array.isArray(mod.paths) && mod.paths.length > 0,
        `Module "${mod.id}" missing valid paths array`,
      );
      for (const p of mod.paths) {
        assert.ok(
          typeof p === 'string' && p.length > 0,
          `Module "${mod.id}" has invalid path entry: ${p}`,
        );
      }
    }
  });

  await t.test('each module path exists in the authored source tree', () => {
    for (const mod of modulesManifest.modules) {
      for (const p of mod.paths) {
        assert.ok(
          existsSync(join(ROOT, p)),
          `Module "${mod.id}" references missing path "${p}"`,
        );
      }
    }
  });

  await t.test('each module has required field: targets (non-empty array of strings)', () => {
    for (const mod of modulesManifest.modules) {
      assert.ok(
        Array.isArray(mod.targets) && mod.targets.length > 0,
        `Module "${mod.id}" missing valid targets array`,
      );
      for (const t of mod.targets) {
        assert.ok(
          typeof t === 'string' && t.length > 0,
          `Module "${mod.id}" has invalid target entry: ${t}`,
        );
      }
    }
  });

  await t.test('each module target is one of the supported plugin platforms', () => {
    for (const mod of modulesManifest.modules) {
      for (const target of mod.targets) {
        assert.ok(
          SUPPORTED_TARGETS.has(target),
          `Module "${mod.id}" declares unsupported target "${target}"`,
        );
      }
    }
  });

  await t.test('each module has required field: dependencies (array of strings)', () => {
    for (const mod of modulesManifest.modules) {
      assert.ok(
        Array.isArray(mod.dependencies),
        `Module "${mod.id}" missing dependencies array`,
      );
      for (const d of mod.dependencies) {
        assert.ok(
          typeof d === 'string' && d.length > 0,
          `Module "${mod.id}" has invalid dependency entry: ${d}`,
        );
      }
    }
  });

  await t.test('all module IDs are unique', () => {
    const ids = modulesManifest.modules.map((m) => m.id);
    const unique = new Set(ids);
    assert.equal(ids.length, unique.size, 'Module IDs must be unique');
  });

  await t.test('all dependency references point to existing module IDs', () => {
    const validIds = new Set(modulesManifest.modules.map((m) => m.id));
    for (const mod of modulesManifest.modules) {
      for (const dep of mod.dependencies) {
        assert.ok(
          validIds.has(dep),
          `Module "${mod.id}" depends on unknown module "${dep}"`,
        );
      }
    }
  });

  await t.test('each module description does not contain Chinese characters', () => {
    for (const mod of modulesManifest.modules) {
      assert.ok(
        typeof mod.description === 'string' && mod.description.length > 0,
        `Module "${mod.id}" missing valid description`,
      );
      assert.ok(
        !/[\u3400-\u9FFF\uF900-\uFAFF]/.test(mod.description),
        `Module "${mod.id}" description must not contain Chinese characters`,
      );
    }
  });
});

// --- install-profiles.json tests ---

test('install-profiles.json schema validation', async (t) => {
  await t.test('has a version field', () => {
    assert.equal(typeof profilesManifest.version, 'number');
  });

  await t.test('has a profiles object with expected profiles', () => {
    assert.ok(
      typeof profilesManifest.profiles === 'object' && profilesManifest.profiles !== null,
      'profiles should be an object',
    );
    const expectedProfiles = ['core', 'developer', 'security', 'full'];
    for (const name of expectedProfiles) {
      assert.ok(
        name in profilesManifest.profiles,
        `Expected profile "${name}" to exist`,
      );
    }
  });

  await t.test('each profile has a description and modules array', () => {
    for (const [name, profile] of Object.entries(profilesManifest.profiles)) {
      assert.ok(
        typeof profile.description === 'string' && profile.description.length > 0,
        `Profile "${name}" missing valid description`,
      );
      assert.ok(
        Array.isArray(profile.modules) && profile.modules.length > 0,
        `Profile "${name}" missing valid modules array`,
      );
    }
  });

  await t.test('all profile module references point to valid module IDs', () => {
    const validIds = new Set(modulesManifest.modules.map((m) => m.id));
    for (const [name, profile] of Object.entries(profilesManifest.profiles)) {
      for (const modId of profile.modules) {
        assert.ok(
          validIds.has(modId),
          `Profile "${name}" references unknown module "${modId}"`,
        );
      }
    }
  });

  await t.test('core profile is a subset of developer profile', () => {
    const coreModules = new Set(profilesManifest.profiles.core.modules);
    const devModules = new Set(profilesManifest.profiles.developer.modules);
    for (const id of coreModules) {
      assert.ok(
        devModules.has(id),
        `Core module "${id}" should also be in developer profile`,
      );
    }
  });

  await t.test('full profile includes all modules from developer profile', () => {
    const devModules = new Set(profilesManifest.profiles.developer.modules);
    const fullModules = new Set(profilesManifest.profiles.full.modules);
    for (const id of devModules) {
      assert.ok(
        fullModules.has(id),
        `Developer module "${id}" should also be in full profile`,
      );
    }
  });

  await t.test('all auto-detected language rules are installable modules', () => {
    const validIds = new Set(modulesManifest.modules.map((m) => m.id));
    const detectedRuleIds = [...new Set(EXT_TO_SKILL.values())];
    for (const ruleId of detectedRuleIds) {
      assert.ok(
        validIds.has(ruleId),
        `Detected language rule "${ruleId}" must exist in install-modules.json`,
      );
    }
  });

  await t.test('full profile includes every auto-detected language rule', () => {
    const fullModules = new Set(profilesManifest.profiles.full.modules);
    const detectedRuleIds = [...new Set(EXT_TO_SKILL.values())];
    for (const ruleId of detectedRuleIds) {
      assert.ok(
        fullModules.has(ruleId),
        `Full profile should include detected language rule "${ruleId}"`,
      );
    }
  });
});
