/**
 * Property 9: Install State Round-Trip Consistency
 *
 * **Feature: absorb-ecc-capabilities, Property 9: Install State Round-Trip Consistency**
 * **Validates: Requirements 6.5**
 *
 * For any sequence of install/uninstall operations, reading state after
 * operations accurately reflects current installed module set.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { tmpdir } from 'node:os';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import fc from 'fast-check';
import { readState, writeState, updateState } from '../scripts/lib/install-state.js';

// --- Helpers ---

/** Create a fresh temp directory for each test run. */
function makeTmpDir() {
  return mkdtempSync(join(tmpdir(), 'sp-state-'));
}

/**
 * Normalize an object through JSON round-trip so that null-prototype objects
 * (produced by fast-check's fc.record) become regular objects, matching what
 * JSON.parse returns.
 */
function normalize(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/** Arbitrary installed module entry. */
const moduleEntryArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-z0-9-]+$/.test(s)),
  installedAt: fc.constant(new Date().toISOString()),
  paths: fc.array(
    fc.string({ minLength: 1, maxLength: 30 }).filter((s) => /^[a-z0-9/.-]+$/.test(s)),
    { minLength: 1, maxLength: 4 },
  ),
});

/** Arbitrary full state object. */
const stateArb = fc.record({
  version: fc.constant(1),
  platform: fc.constantFrom('claude-code', 'codex', null),
  installedAt: fc.oneof(fc.constant(null), fc.constant(new Date().toISOString())),
  sourceVersion: fc.oneof(fc.constant(null), fc.constant('0.2.0')),
  profile: fc.constantFrom('core', 'developer', 'security', 'full', null),
  modules: fc.array(moduleEntryArb, { minLength: 0, maxLength: 6 }),
  extraModules: fc.array(
    fc.string({ minLength: 1, maxLength: 15 }).filter((s) => /^[a-z0-9-]+$/.test(s)),
    { minLength: 0, maxLength: 3 },
  ),
  excludedModules: fc.array(
    fc.string({ minLength: 1, maxLength: 15 }).filter((s) => /^[a-z0-9-]+$/.test(s)),
    { minLength: 0, maxLength: 3 },
  ),
});

// --- Property tests ---

test('Property 9: Install State Round-Trip Consistency', async (t) => {
  await t.test(
    'write then read returns the same state (round-trip)',
    () => {
      fc.assert(
        fc.property(stateArb, (rawState) => {
          const state = normalize(rawState);
          const dir = makeTmpDir();
          try {
            const filePath = join(dir, 'install-state.json');
            writeState(filePath, state);
            const readBack = readState(filePath);
            assert.deepStrictEqual(
              readBack,
              state,
              'State read back should equal state written',
            );
          } finally {
            rmSync(dir, { recursive: true, force: true });
          }
        }),
        { numRuns: 100 },
      );
    },
  );

  await t.test(
    'updateState merges changes and persists correctly',
    () => {
      fc.assert(
        fc.property(
          stateArb,
          fc.record({
            profile: fc.constantFrom('core', 'developer', 'full'),
            extraModules: fc.array(
              fc.string({ minLength: 1, maxLength: 10 }).filter((s) => /^[a-z0-9-]+$/.test(s)),
              { minLength: 0, maxLength: 2 },
            ),
          }),
          (rawInitialState, rawChanges) => {
            const initialState = normalize(rawInitialState);
            const changes = normalize(rawChanges);
            const dir = makeTmpDir();
            try {
              const filePath = join(dir, 'install-state.json');
              writeState(filePath, initialState);
              const updated = updateState(filePath, changes);

              // Updated state should have the changed fields
              assert.equal(updated.profile, changes.profile);
              assert.deepStrictEqual(updated.extraModules, changes.extraModules);

              // Unchanged fields should remain from initial state
              assert.equal(updated.version, initialState.version);
              assert.equal(updated.platform, initialState.platform);
              assert.deepStrictEqual(updated.modules, initialState.modules);

              // Reading back should match the updated state
              const readBack = readState(filePath);
              assert.deepStrictEqual(readBack, updated);
            } finally {
              rmSync(dir, { recursive: true, force: true });
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  await t.test(
    'reading missing file returns default state',
    () => {
      const dir = makeTmpDir();
      try {
        const filePath = join(dir, 'nonexistent.json');
        const state = readState(filePath);
        assert.equal(state.version, 1);
        assert.equal(state.platform, null);
        assert.equal(state.profile, null);
        assert.ok(Array.isArray(state.modules));
        assert.equal(state.modules.length, 0);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    },
  );

  await t.test(
    'reading corrupted file returns default state',
    () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter((s) => {
            try { JSON.parse(s); return false; } catch { return true; }
          }),
          (garbage) => {
            const dir = makeTmpDir();
            try {
              const filePath = join(dir, 'install-state.json');
              writeFileSync(filePath, garbage, 'utf-8');
              const state = readState(filePath);
              assert.equal(state.version, 1);
              assert.equal(state.platform, null);
              assert.ok(Array.isArray(state.modules));
              assert.equal(state.modules.length, 0);
            } finally {
              rmSync(dir, { recursive: true, force: true });
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  await t.test(
    'sequential writes reflect the last written state',
    () => {
      fc.assert(
        fc.property(
          fc.array(stateArb, { minLength: 2, maxLength: 5 }),
          (rawStates) => {
            const states = rawStates.map(normalize);
            const dir = makeTmpDir();
            try {
              const filePath = join(dir, 'install-state.json');
              for (const state of states) {
                writeState(filePath, state);
              }
              const readBack = readState(filePath);
              const lastState = states[states.length - 1];
              assert.deepStrictEqual(
                readBack,
                lastState,
                'After sequential writes, read should return the last written state',
              );
            } finally {
              rmSync(dir, { recursive: true, force: true });
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});
