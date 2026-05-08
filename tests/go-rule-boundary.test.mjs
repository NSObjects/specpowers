import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function section(content, heading) {
  const start = content.indexOf(heading);
  assert.notEqual(start, -1, `missing section heading: ${heading}`);

  const bodyStart = start + heading.length;
  const rest = content.slice(bodyStart);
  const next = rest.search(/\n## /);

  return next === -1 ? rest : rest.slice(0, next);
}

const goRuleGateCoverage = [
  { gate: 'effective go reference boundary', marker: 'Effective Go' },
  { gate: 'new-code default constraints', marker: 'default constraints for new Go code' },
  { gate: 'old-code local conventions', marker: 'local conventions' },
  { gate: 'non-go concern boundary', marker: 'What This Skill Does Not Own' },
  { gate: 'go version compatibility', marker: 'Go Version Compatibility' },
  { gate: '40-line complexity limit', marker: '40 lines' },
  { gate: 'scoped public API documentation', marker: 'New exported identifiers' },
  { gate: 'no-information helper rejection', marker: 'no-information helper' },
  { gate: 'semantic risk priority', marker: 'semantic risks before style-only findings' },
  { gate: 'abstraction evidence', marker: 'current evidence' },
  { gate: 'go-specific composition', marker: 'value semantics' },
  { gate: 'nil interface discipline', marker: 'typed nil' },
  { gate: 'dynamic typing boundary', marker: 'reflect' },
  { gate: 'range variable discipline', marker: 'address of the range variable' },
  { gate: 'shadowing and return discipline', marker: 'short variable declaration' },
  { gate: 'map and interface comparability', marker: 'assignment to entry in nil map' },
  { gate: 'context value discipline', marker: 'context.Value' },
  { gate: 'channel panic and nil-channel discipline', marker: 'nil channel' },
  { gate: 'waitgroup lifecycle discipline', marker: 'WaitGroup.Add' },
  { gate: 'defer evaluation discipline', marker: 'defer arguments are evaluated immediately' },
  { gate: 'string and numeric semantics', marker: 'byte versus rune' },
  { gate: 'append and concurrent map discipline', marker: 'append returns the updated slice' },
  { gate: 'low-level runtime boundary', marker: 'Low-level runtime contracts' },
  { gate: 'go test process state discipline', marker: 't.Setenv' },
  { gate: 'red flag reinforcement', marker: 'Existing project shape wins' },
  { gate: 'parallel subtest discipline', marker: 'loop variable capture' },
  { gate: 'error assertion discipline', marker: 'errors.Is' },
  { gate: 'context cancellation discipline', marker: 'defer cancel()' },
  { gate: 'deterministic concurrency tests', marker: 'time.Sleep()' },
  { gate: 'shared state ownership', marker: 'copy values containing' },
  { gate: 'test-writing entrypoint', marker: 'When Writing Go Tests' },
  { gate: 'effective tests', marker: 'effective tests' },
  { gate: 'scenario matrix tests', marker: 'scenario matrices' },
];

test('rules-golang focuses on judgment-heavy Go guidance', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /doc comments/i);
  assert.match(content, /error strings/i);
  assert.match(content, /context\.Context/);
  assert.match(content, /receiver/i);
  assert.match(content, /goroutine/i);
  assert.match(content, /table-driven tests/i);
  assert.match(content, /verification tooling/i);
});

test('rules-golang defines agent scope for new and existing Go code', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /AI Agent/i);
  assert.match(content, /Effective Go/);
  assert.match(content, /https:\/\/go\.dev\/doc\/effective_go/);
  assert.match(content, /not a license to rewrite existing projects/i);
  assert.match(content, /new Go code/i);
  assert.match(content, /default constraints/i);
  assert.match(content, /pre-existing Go code/i);
  assert.match(content, /local conventions/i);
  assert.match(content, /not a license to reshape/i);
});

test('rules-golang limits new production functions without empty helpers', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /new production functions/i);
  assert.match(content, /40 lines/i);
  assert.match(content, /test data/i);
  assert.match(content, /dispatch tables/i);
  assert.match(content, /compatibility logic/i);
  assert.match(content, /clear sequential flow/i);
  assert.match(content, /no-information helper/i);
});

test('rules-golang scopes documentation rules to new API and non-obvious behavior', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /new exported identifiers/i);
  assert.match(content, /pre-existing exported identifiers/i);
  assert.match(content, /comment-only cleanup/i);
  assert.match(content, /invariants/i);
  assert.match(content, /compatibility/i);
  assert.match(content, /resource lifetime/i);
  assert.match(content, /concurrency/i);
  assert.match(content, /not restate/i);
});

test('rules-golang preserves project shape and local naming conventions', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /project conventions/i);
  assert.match(content, /do not force directory layout/i);
  assert.match(content, /do not perform naming cleanup/i);
  assert.match(content, /out-of-scope observation/i);
  assert.doesNotMatch(content, /Keep one package per directory/);
  assert.doesNotMatch(content, /Use `internal\/`/);
  assert.doesNotMatch(content, /Keep executable entry points under `cmd\/`/);
});

test('rules-golang explicitly excludes non-go backend and platform concerns', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /What This Skill Does Not Own/);
  assert.match(content, /backend architecture/i);
  assert.match(content, /database or query-safety policy/i);
  assert.match(content, /HTTP framework/i);
  assert.match(content, /deployment/i);
  assert.match(content, /logging stack/i);
  assert.match(content, /separate review concern/i);
});

test('rules-golang preserves go version compatibility without mutating module policy', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /Go Version Compatibility/);
  assert.match(content, /go directive/i);
  assert.match(content, /toolchain directive/i);
  assert.match(content, /language features/i);
  assert.match(content, /standard library APIs/i);
  assert.match(content, /raise the module's Go version/i);
  assert.match(content, /accepted task requires/i);
  assert.match(content, /separate compatibility decision/i);
  assert.match(content, /local fallback/i);
});

test('rules-golang prioritizes semantic risks over style-only findings', () => {
  const content = read('skills/rules-golang/SKILL.md');

  const semanticRiskMarkers = [
    /error propagation/i,
    /error wrapping/i,
    /context propagation/i,
    /resource cleanup/i,
    /goroutine lifecycle/i,
    /channel or mutex/i,
    /nil and zero value/i,
    /slice and map/i,
    /generics/i,
    /style-only findings/i,
  ];

  for (const marker of semanticRiskMarkers) {
    assert.match(content, marker);
  }
});

test('rules-golang requires evidence for interfaces wrappers helpers and generics', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /current behavior/i);
  assert.match(content, /caller substitution needs/i);
  assert.match(content, /established project patterns/i);
  assert.match(content, /future extension/i);
  assert.match(content, /testing convenience/i);
  assert.match(content, /generic Go style/i);
  assert.match(content, /more direct implementation/i);
});

test('rules-golang keeps composition and initialization guidance Go-specific', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /value semantics/i);
  assert.match(content, /embedding/i);
  assert.match(content, /promoted methods/i);
  assert.match(content, /zero value/i);
  assert.match(content, /package-level mutable state/i);
  assert.match(content, /init\(\)/);
  assert.match(content, /slice aliasing/i);
  assert.match(content, /nil versus empty/i);
  assert.match(content, /map iteration order/i);
  assert.match(content, /simulate dynamic typing/i);
  assert.doesNotMatch(content, /inheritance-like patterns/i);
  assert.doesNotMatch(content, /Keep wiring near `main\(\)`/i);
});

test('rules-golang covers nil interface and typed nil traps', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /typed nil/i);
  assert.match(content, /nil interface/i);
  assert.match(content, /interface value with a concrete type/i);
  assert.match(content, /return nil explicitly/i);
  assert.match(content, /pointer to a concrete error type/i);
  assert.match(content, /zero value/i);
});

test('rules-golang keeps any and reflection at real boundaries', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /\bany\b/);
  assert.match(content, /interface\{\}/);
  assert.match(content, /reflect/);
  assert.match(content, /untyped boundary/i);
  assert.match(content, /type switch/i);
  assert.match(content, /type parameter/i);
  assert.match(content, /avoid spreading dynamic typing/i);
});

test('rules-golang handles range variable address and closure traps', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /range variable/i);
  assert.match(content, /address of the range variable/i);
  assert.match(content, /underlying element/i);
  assert.match(content, /index into the slice/i);
  assert.match(content, /goroutine/i);
  assert.match(content, /closure/i);
  assert.match(content, /copy per iteration/i);
});

test('rules-golang covers short declaration shadowing and return traps', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /short variable declaration/i);
  assert.match(content, /:=/);
  assert.match(content, /shadowing/i);
  assert.match(content, /outer err/i);
  assert.match(content, /named return values/i);
  assert.match(content, /naked return/i);
  assert.match(content, /return explicitly/i);
});

test('rules-golang covers nil map writes and interface comparability', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /nil map/i);
  assert.match(content, /assignment to entry in nil map/i);
  assert.match(content, /panic/i);
  assert.match(content, /interface comparison/i);
  assert.match(content, /dynamic value/i);
  assert.match(content, /comparable/i);
  assert.match(content, /map, slice, or function/i);
});

test('rules-golang constrains context values to request metadata', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /context\.Value/);
  assert.match(content, /request-scoped metadata/i);
  assert.match(content, /optional parameters/i);
  assert.match(content, /required dependencies/i);
  assert.match(content, /unexported key type/i);
  assert.match(content, /type assertions/i);
});

test('rules-golang covers channel close send and nil-channel traps', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /nil channel/i);
  assert.match(content, /blocks forever/i);
  assert.match(content, /sending on a closed channel/i);
  assert.match(content, /closing a closed channel/i);
  assert.match(content, /panic/i);
  assert.match(content, /sender owns channel close/i);
  assert.match(content, /document the owner/i);
});

test('rules-golang covers waitgroup lifecycle traps', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /WaitGroup\.Add/);
  assert.match(content, /before launching/i);
  assert.match(content, /goroutine/i);
  assert.match(content, /defer wg\.Done\(\)/);
  assert.match(content, /Add inside the goroutine/i);
});

test('rules-golang covers defer evaluation traps', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /defer arguments are evaluated immediately/i);
  assert.match(content, /deferred closure/i);
  assert.match(content, /final value/i);
  assert.match(content, /defer.*in a loop/i);
  assert.match(content, /function boundary/i);
});

test('rules-golang covers string numeric and duration semantics', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /byte versus rune/i);
  assert.match(content, /UTF-8/i);
  assert.match(content, /range over a string/i);
  assert.match(content, /integer conversion/i);
  assert.match(content, /overflow/i);
  assert.match(content, /time\.Duration/);
  assert.match(content, /multiply by time\.Second/i);
});

test('rules-golang covers append results and concurrent map writes', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /append returns the updated slice/i);
  assert.match(content, /assign the result/i);
  assert.match(content, /underlying array/i);
  assert.match(content, /capacity/i);
  assert.match(content, /concurrent map writes/i);
  assert.match(content, /plain maps are not safe/i);
});

test('rules-golang folds low-level runtime traps into a bounded section', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /Low-level runtime contracts/i);
  assert.match(content, /panic recovery/i);
  assert.match(content, /process exit/i);
  assert.match(content, /\bunsafe\b/);
  assert.match(content, /sync\.Once/);
  assert.match(content, /atomic operations/i);
  assert.match(content, /timer reuse/i);
  assert.match(content, /stream reads/i);
  assert.match(content, /closed-channel receive/i);
  assert.match(content, /non-blocking select/i);
  assert.match(content, /append capacity behavior/i);
  assert.match(content, /only when touched code depends on that behavior/i);
  assert.match(content, /full Go runtime pitfall catalogue/i);
});

test('rules-golang rejects low-quality Go tests', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /meaningful behavior/i);
  assert.match(content, /boundary conditions/i);
  assert.match(content, /error paths/i);
  assert.match(content, /resource lifetime/i);
  assert.match(content, /concurrency risk/i);
  assert.match(content, /shallow tests/i);
  assert.match(content, /mirror implementation/i);
  assert.match(content, /mock the system under test/i);
  assert.match(content, /weak assertions/i);
  assert.match(content, /non-diagnostic failures/i);
});

test('rules-golang uses table-driven tests for scenario matrices without forcing sequential tests', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /https:\/\/go\.dev\/wiki\/TableDrivenTests/);
  assert.match(content, /scenario matrices/i);
  assert.match(content, /named subtests/i);
  assert.match(content, /got\/want/i);
  assert.match(content, /single behavior/i);
  assert.match(content, /sequential behavior/i);
  assert.match(content, /not force/i);
});

test('rules-golang covers parallel subtest and cleanup traps', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /t\.Parallel\(\)/);
  assert.match(content, /shared mutable state/i);
  assert.match(content, /loop variable capture/i);
  assert.match(content, /tt := tt/);
  assert.match(content, /pre-Go 1\.22/i);
  assert.match(content, /t\.Cleanup\(\)/);
  assert.match(content, /environment variables/i);
  assert.match(content, /temporary resources/i);
});

test('rules-golang requires useful test helpers to mark themselves', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /t\.Helper\(\)/);
  assert.match(content, /test helper/i);
  assert.match(content, /testing\.TB/);
  assert.match(content, /failure location/i);
  assert.match(content, /line number/i);
});

test('rules-golang defines error assertion and cancellation discipline', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /errors\.Is/);
  assert.match(content, /errors\.As/);
  assert.match(content, /error identity/i);
  assert.match(content, /text itself is the contract/i);
  assert.match(content, /context\.WithCancel/);
  assert.match(content, /context\.WithTimeout/);
  assert.match(content, /defer cancel\(\)/);
  assert.match(content, /timer leak/i);
  assert.match(content, /ctx\.Err\(\)/);
});

test('rules-golang discourages sleep-based concurrency tests', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /time\.Sleep\(\)/);
  assert.match(content, /synchronization mechanism/i);
  assert.match(content, /channels/i);
  assert.match(content, /sync\.WaitGroup/);
  assert.match(content, /fake clock/i);
  assert.match(content, /last-resort guard/i);
});

test('rules-golang defines shared state and copy-lock ownership', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /one goroutine owns/i);
  assert.match(content, /sync\.Mutex/);
  assert.match(content, /sync\.RWMutex/);
  assert.match(content, /sync\.WaitGroup/);
  assert.match(content, /sync\.Once/);
  assert.match(content, /atomic fields/i);
  assert.match(content, /copy values containing/i);
  assert.match(content, /mutable alias/i);
  assert.match(content, /return copies/i);
  assert.match(content, /callers can mutate/i);
  assert.match(content, /data race/i);
});

test('rules-golang avoids tool-owned checks and library preference drift', () => {
  const content = read('skills/rules-golang/SKILL.md');

  const forbidden = [
    'SQL and Injection Prevention',
    'parameterized queries',
    'prepared statements',
    'SQL construction',
    'sqlx',
    'sqlc',
    'pgx',
    'testify',
    'go-cmp',
    'rapid',
    'gopter',
    'gofmt',
    'goimports',
    'golangci-lint',
    'go vet',
    'go test -race',
  ];

  for (const term of forbidden) {
    assert.ok(!content.includes(term), `rules-golang should not treat ${term} as a core rule`);
  }
});

test('rules-golang reinforces common agent failure modes in red flags and iron laws', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /reshape this package/i);
  assert.match(content, /Existing project shape wins/i);
  assert.match(content, /no-information helper/i);
  assert.match(content, /New production functions have a size budget/i);
  assert.match(content, /shallow test/i);
  assert.match(content, /Tests must prove behavior/i);
  assert.match(content, /hidden `init\(\)`/i);
  assert.match(content, /No hidden startup behavior/i);
});

test('rules-golang behavioral shaping gives concrete edit and test entrypoints', () => {
  const content = read('skills/rules-golang/SKILL.md');

  assert.match(content, /When Touching Existing Go Code/);
  assert.match(content, /read nearby tests and callers/i);
  assert.match(content, /smallest behavior change/i);
  assert.match(content, /do not move packages/i);
  assert.match(content, /comment-only cleanup/i);
  assert.match(content, /When Writing Go Tests/);
  assert.match(content, /start with a failing test/i);
  assert.match(content, /name each table case/i);
  assert.match(content, /assert observable behavior/i);
  assert.match(content, /external dependencies/i);
});

test('rules-golang stays compact instead of becoming a runtime pitfall encyclopedia', () => {
  const content = read('skills/rules-golang/SKILL.md');

  const redFlags = section(content, '## Red Flags');
  const redFlagRows = redFlags.match(/^\| "/gm) ?? [];
  assert.ok(redFlagRows.length <= 16, `expected at most 16 red flags, got ${redFlagRows.length}`);

  const ironLaws = section(content, '## Iron Laws');
  const ironLawRows = ironLaws.match(/^\d+\. \*\*/gm) ?? [];
  assert.ok(ironLawRows.length <= 15, `expected at most 15 iron laws, got ${ironLawRows.length}`);

  const reviewing = section(content, '### When Reviewing Go Code');
  const reviewRows = reviewing.match(/^\d+\. /gm) ?? [];
  assert.ok(reviewRows.length <= 16, `expected at most 16 review checklist items, got ${reviewRows.length}`);

  const topLevelReinforcement = `${redFlags}\n${ironLaws}`;
  const overSpecificTopLevelTerms = [
    /io\.Reader/,
    /io\.EOF/,
    /io\.ReadFull/,
    /time\.After in a loop/,
    /sync\.Once does not retry/,
    /recover only works/,
    /unsafe\.Pointer/,
    /os\.Exit/,
    /log\.Fatal/,
    /select default/,
    /receive from a closed channel/,
  ];

  for (const term of overSpecificTopLevelTerms) {
    assert.doesNotMatch(topLevelReinforcement, term);
  }

  assert.match(content, /Low-level runtime contracts/i);
  assert.match(content, /only when touched code depends on that behavior/i);
});

test('rules-golang regression coverage protects all Go Agent gates', () => {
  const content = read('skills/rules-golang/SKILL.md');
  const source = read('tests/go-rule-boundary.test.mjs');

  assert.match(source, /^const goRuleGateCoverage = \[/m);
  assert.deepEqual(
    goRuleGateCoverage.map(({ gate }) => gate),
    [
      'effective go reference boundary',
      'new-code default constraints',
      'old-code local conventions',
      'non-go concern boundary',
      'go version compatibility',
      '40-line complexity limit',
      'scoped public API documentation',
      'no-information helper rejection',
      'semantic risk priority',
      'abstraction evidence',
      'go-specific composition',
      'nil interface discipline',
      'dynamic typing boundary',
      'range variable discipline',
      'shadowing and return discipline',
      'map and interface comparability',
      'context value discipline',
      'channel panic and nil-channel discipline',
      'waitgroup lifecycle discipline',
      'defer evaluation discipline',
      'string and numeric semantics',
      'append and concurrent map discipline',
      'low-level runtime boundary',
      'go test process state discipline',
      'red flag reinforcement',
      'parallel subtest discipline',
      'error assertion discipline',
      'context cancellation discipline',
      'deterministic concurrency tests',
      'shared state ownership',
      'test-writing entrypoint',
      'effective tests',
      'scenario matrix tests',
    ],
  );

  for (const { gate, marker } of goRuleGateCoverage) {
    assert.ok(content.includes(marker), `rules-golang should preserve ${gate}: ${marker}`);
  }
});
