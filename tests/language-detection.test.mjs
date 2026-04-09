/**
 * Property 2: Language Detection and Skill Suggestion
 *
 * **Feature: absorb-ecc-capabilities, Property 2: Language Detection and Skill Suggestion**
 * **Validates: Requirements 1.6**
 *
 * For any file list with various extensions, detection returns correct
 * `rules-{language}` names and never suggests languages not present in the project.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import fc from 'fast-check';
import { detectLanguages, EXT_TO_SKILL } from '../scripts/lib/language-detect.js';

// --- Helpers ---

/** All known extensions from the EXT_TO_SKILL map. */
const KNOWN_EXTS = [...EXT_TO_SKILL.keys()];

/** All unique skill names the map can produce. */
const ALL_SKILLS = [...new Set(EXT_TO_SKILL.values())].sort();

/** Extensions that are NOT in the map. */
const UNKNOWN_EXTS = ['.txt', '.md', '.json', '.yaml', '.xml', '.csv', '.log', '.cfg', '.ini', '.toml'];

// --- Arbitraries ---

/** Generate a simple file basename (letters and digits). */
const basenameArb = fc.string({ minLength: 1, maxLength: 20, unit: fc.constantFrom(
  ...'abcdefghijklmnopqrstuvwxyz0123456789'.split(''),
) });

/** Generate a file name with a known extension. */
const knownFileArb = fc.tuple(
  basenameArb,
  fc.constantFrom(...KNOWN_EXTS),
).map(([name, ext]) => `src/${name}${ext}`);

/** Generate a file name with an unknown extension. */
const unknownFileArb = fc.tuple(
  basenameArb,
  fc.constantFrom(...UNKNOWN_EXTS),
).map(([name, ext]) => `src/${name}${ext}`);

/** Generate a mixed file list with both known and unknown extensions. */
const mixedFileListArb = fc.tuple(
  fc.array(knownFileArb, { minLength: 0, maxLength: 20 }),
  fc.array(unknownFileArb, { minLength: 0, maxLength: 10 }),
).map(([known, unknown]) => [...known, ...unknown]);

// --- Property tests ---

test('Property 2: Language Detection and Skill Suggestion', async (t) => {
  await t.test(
    'every returned skill corresponds to at least one file in the input',
    () => {
      fc.assert(
        fc.property(mixedFileListArb, (fileList) => {
          const result = detectLanguages(fileList);

          for (const skill of result) {
            // Find at least one file whose extension maps to this skill
            const hasMatchingFile = fileList.some((f) => {
              const dotIdx = f.lastIndexOf('.');
              if (dotIdx === -1) return false;
              const ext = f.slice(dotIdx).toLowerCase();
              return EXT_TO_SKILL.get(ext) === skill;
            });
            assert.ok(
              hasMatchingFile,
              `Skill "${skill}" was returned but no file in the input maps to it`,
            );
          }
        }),
        { numRuns: 150 },
      );
    },
  );

  await t.test(
    'no skill is returned for extensions not present in the input',
    () => {
      fc.assert(
        fc.property(mixedFileListArb, (fileList) => {
          const result = detectLanguages(fileList);

          // Collect the set of skills that SHOULD be present based on input files
          const expectedSkills = new Set();
          for (const f of fileList) {
            const dotIdx = f.lastIndexOf('.');
            if (dotIdx === -1) continue;
            const ext = f.slice(dotIdx).toLowerCase();
            const skill = EXT_TO_SKILL.get(ext);
            if (skill) expectedSkills.add(skill);
          }

          for (const skill of result) {
            assert.ok(
              expectedSkills.has(skill),
              `Skill "${skill}" returned but not expected from input extensions`,
            );
          }
        }),
        { numRuns: 150 },
      );
    },
  );

  await t.test(
    'result is sorted and deduplicated',
    () => {
      fc.assert(
        fc.property(mixedFileListArb, (fileList) => {
          const result = detectLanguages(fileList);

          // Check sorted
          for (let i = 1; i < result.length; i++) {
            assert.ok(
              result[i - 1] < result[i],
              `Result not sorted: "${result[i - 1]}" should come before "${result[i]}"`,
            );
          }

          // Deduplicated follows from strict < ordering above, but verify explicitly
          const unique = new Set(result);
          assert.equal(result.length, unique.size, 'Result contains duplicates');
        }),
        { numRuns: 150 },
      );
    },
  );

  await t.test(
    'empty input returns empty array',
    () => {
      fc.assert(
        fc.property(
          fc.constantFrom([], undefined, null, 0, '', false),
          (input) => {
            const result = detectLanguages(input);
            assert.ok(Array.isArray(result), 'Result should be an array');
            assert.equal(result.length, 0, 'Empty/invalid input should return empty array');
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  await t.test(
    'files with only unknown extensions return empty array',
    () => {
      fc.assert(
        fc.property(
          fc.array(unknownFileArb, { minLength: 1, maxLength: 15 }),
          (fileList) => {
            const result = detectLanguages(fileList);
            assert.equal(result.length, 0, 'Unknown extensions should produce no skills');
          },
        ),
        { numRuns: 150 },
      );
    },
  );

  await t.test(
    'detection returns exactly the expected skill set for known files',
    () => {
      fc.assert(
        fc.property(
          fc.array(knownFileArb, { minLength: 1, maxLength: 20 }),
          (fileList) => {
            const result = detectLanguages(fileList);

            // Compute expected
            const expectedSkills = new Set();
            for (const f of fileList) {
              const dotIdx = f.lastIndexOf('.');
              if (dotIdx === -1) continue;
              const ext = f.slice(dotIdx).toLowerCase();
              const skill = EXT_TO_SKILL.get(ext);
              if (skill) expectedSkills.add(skill);
            }
            const expected = [...expectedSkills].sort();

            assert.deepStrictEqual(result, expected);
          },
        ),
        { numRuns: 150 },
      );
    },
  );
});
