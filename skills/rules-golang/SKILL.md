---
name: rules-golang
description: Use when writing, reviewing, or modifying Go code — provides Go-specific coding rules that override and extend the universal rules from rules-common
language: golang
---

# Go Coding Rules

These rules apply to Go projects. They inherit all rules from `rules-common` and override specific entries where Go conventions differ. Overrides are marked with `[Overrides common: X.Y]` and include the reason.

The rules layer focuses on judgment-heavy guidance for writing and reviewing Go. Formatting, static analysis, race detection, and other mechanical checks belong to verification tooling rather than this skill.

Use Effective Go (https://go.dev/doc/effective_go) as the idiom reference for new Go code, especially comments, names, errors, and composition. Treat it as a language guide, not a license to rewrite existing projects: local conventions and the current task boundary still win for pre-existing code.

## Scope for AI Agents

`rules-golang` is an AI Agent rule set for writing, modifying, and reviewing Go code. It provides default constraints for new Go code and tests that the Agent generates in the current task.

For pre-existing Go code, read the surrounding code first and preserve local conventions for directory layout, package boundaries, naming, layering, and test organization. These rules are not a license to reshape an existing project, rename working code, reorganize packages, or move tests unless the current request, accepted spec, failing test, or public API impact requires it.

## What This Skill Does Not Own

Do not use `rules-golang` to prescribe backend architecture, database or query-safety policy, HTTP framework choice, deployment shape, logging stack, dependency versions, directory topology, naming cleanup, or test framework preferences. Those concerns may matter in a real project, but they are not Go language rules.

Raise non-Go concerns only when they are visible in changed code and affect the current task. Label them as a separate review concern instead of presenting them as `rules-golang` violations.

## Go Version Compatibility

Before using new language features, standard library APIs, or syntax, check the module's go directive and any toolchain directive. Existing module policy is a compatibility constraint, not a suggestion.

Do not raise the module's Go version, add a toolchain directive, or require a newer compiler unless the accepted task requires it. When a newer Go version is necessary, report it as a separate compatibility decision with the reason, affected files, and rollback path.

Prefer a local fallback that fits the current go directive when the newer API is only a convenience. Do not modernize code merely because a newer Go release offers a shorter spelling.

## Go Semantic Risk Checklist

When writing or reviewing Go, prioritize semantic risks before style-only findings. Check error propagation, error wrapping, context propagation, resource cleanup, goroutine lifecycle, channel or mutex ownership, nil and zero value behavior, typed nil and nil interface behavior, short variable declaration shadowing, slice and map ownership, interface boundaries, generics, low-level runtime contracts, and test effectiveness.

Style-only findings are secondary. Do not elevate a naming, layout, or formatting difference unless it affects correctness, resource lifetime, concurrency safety, the current task's readability, or public API behavior.

## Go Abstraction Discipline

Interfaces, wrappers, helpers, generics, and dependency indirection need current evidence. Use them when current behavior, caller substitution needs, or established project patterns require replacement, reuse, or isolation.

Do not add these structures for future extension, testing convenience, or generic Go style. Choose a more direct implementation first, and report unsupported extension ideas as out-of-scope observations.

---

## 1. Names, Packages, and Documentation

### 1.1 Naming Conventions `[Overrides common: 1.1]`

**Reason:** Go names read like public APIs, but existing project conventions are stronger than generic style preferences.

- For new exported API, use idiomatic Go names that fit the surrounding package
- Preserve existing naming patterns in pre-existing code unless the current task or public API impact requires a change
- Do not perform naming cleanup merely because nearby names differ from a generic Go preference
- Treat naming-only observations as an out-of-scope observation unless they affect correctness, readability of the current change, tests, or public API

### 1.2 Function Size `[Overrides common: 1.2]`

**Reason:** Explicit error handling adds vertical space, but AI-generated Go code needs a concrete reviewability limit.

- New production functions should stay within 40 lines by default
- A longer function needs a current-task reason, such as test data, dispatch tables, compatibility logic, a clear sequential flow, or necessary error handling
- Do not split a long function into a no-information helper that only forwards parameters, wraps one call, renames the same idea, or makes the reader jump around to understand one behavior
- Extract helpers only when they reduce real branching, isolate a separate concept, or make the main behavior easier to review
- Keep error handling close to the call that can fail

### 1.3 File Organization `[Overrides common: 1.3]`

**Reason:** Go code is read package-first, but old projects and teams vary too much for this rule to impose one layout.

- Follow the package, file, directory, and test organization already used near the code being changed
- Do not force directory layout, package reshaping, file moves, or test organization changes from this skill alone
- For new files, choose names and locations that fit project conventions and the current package's local pattern
- Report unrelated package or directory concerns as an out-of-scope observation instead of changing them during the current task

### 1.4 Documentation and Comments

- New exported identifiers need doc comments that start with the identifier name
- Pre-existing exported identifiers do not need comment-only cleanup unless the current task changes their public API, behavior contract, or compatibility promise
- Package docs explain purpose and constraints when the package name alone is not enough
- Comments should explain invariants, compatibility constraints, resource lifetime, concurrency ownership, or non-obvious trade-offs; do not restate obvious code
- Keep public API docs at the exported boundary instead of burying API behavior in implementation detail

---

## 2. Tests and TDD `[Overrides common: 2.1]`

**Reason:** Go tests are easiest to review when scenarios are explicit and failure output names the broken case.

### 2.1 Use the Standard `testing` Package

Use the standard `testing` package. Test functions are `TestXxx(t *testing.T)`.

- Follow the Go Wiki table-driven tests guidance: https://go.dev/wiki/TableDrivenTests
- For scenario matrices with multiple inputs, boundary conditions, error paths, or expected results, default to table-driven tests
- Define a `tests` slice or map, iterate through each case, and run named subtests with `t.Run(tt.name, ...)` or `t.Run(name, ...)`
- Each case should include a readable name, inputs, expected results, and any behavior context needed to understand the scenario
- Failure messages should use got/want wording or equivalent diagnostic detail
- Do not force table-driven tests for a single behavior or sequential behavior where a direct or step-by-step test is clearer
- When table cases run as parallel subtests, avoid shared mutable state and loop variable capture; use `tt := tt` before `t.Run` for pre-Go 1.22 modules or when the local codebase already follows that pattern

### 2.2 Test Coverage Strategy `[Overrides common: 2.4]`

**Reason:** Go's type system catches some classes of mistakes, so Agent-written effective tests must prove meaningful behavior instead of only satisfying a formal test requirement.

- Test behavior, not helper internals
- Cover happy paths, boundary conditions, error paths, resource lifetime, and concurrency risk when those are relevant to the current behavior
- Use `t.Run()` so failures identify the exact scenario that regressed
- Use `t.Parallel()` only when cases do not share mutable state
- Use `t.Cleanup()` for temporary resources, environment variables, and process-wide test changes that must be restored per test
- For error paths, assert error identity with `errors.Is` or `errors.As` when the caller-visible contract promises wrapping, a sentinel, or an error type; compare error strings only when the text itself is the contract
- Prefer deterministic synchronization over `time.Sleep()`; use channels, `sync.WaitGroup`, context cancellation, or a fake clock when the project provides one. A short sleep or deadline can be a last-resort guard, not the synchronization mechanism
- Failure messages should name the input, branch, or scenario that broke
- Treat shallow tests, mirror implementation tests, weak assertions, and non-diagnostic failures as low-quality tests that must be rewritten
- Do not mock the system under test; use mocks only for external dependencies that cannot reasonably be exercised directly
- A test helper that accepts `*testing.T` or `testing.TB` should call `t.Helper()` before reporting failures so the failure location and line number point to the test case, not the helper body
- Use `t.TempDir()` for per-test filesystem scratch space instead of shared directories
- Use `t.Setenv` for environment changes, and do not combine process-wide state changes with `t.Parallel()`
- Do not call `t.Fatal`, `t.Fatalf`, or `t.FailNow` from a goroutine that is not running the test body; report failures back to the test goroutine through a channel or synchronized result

### 2.3 Test Naming

Use descriptive subtest names in table-driven tests: `t.Run("empty input returns error", ...)`. The test name should read as a sentence describing the scenario.

---

## 3. Errors and APIs `[Overrides common: 5.6]`

**Reason:** Go treats errors as ordinary values, so API shape and error text both affect maintainability.

### 3.1 Errors Are Values

- Return `error` as the last return value from functions that can fail
- Check errors immediately after the call
- Error strings start lowercase and do not end with punctuation unless a domain term requires it
- Use `errors.New()` for simple errors and `fmt.Errorf()` with `%w` when callers need the chain
- Introduce sentinel errors only when callers must branch on them

### 3.2 Error Wrapping

- Add context at each layer, but do not repeat what the wrapped error already says
- Use `errors.Is()` and `errors.As()` to inspect wrapped errors
- Never compare error strings to drive logic

### 3.3 Panic Sparingly

- `panic` is for unrecoverable programmer errors or impossible states
- Libraries return errors instead of panicking on expected failures
- Use `recover` only at well-defined process or goroutine boundaries
- When recovering at a boundary, preserve enough context for diagnosis and convert expected caller-visible failures back to errors

### 3.4 Public API Surface

- Keep exported APIs narrow; unexport names until another package genuinely needs them
- Prefer concrete return types unless the caller benefits from substitution
- Make the zero value useful when the type semantics allow it

### 3.5 Nil and Interface Values

- Avoid returning a typed nil as an `error` or other interface; an interface value with a concrete type is not a nil interface even when the concrete pointer is nil
- For success from a function that returns `error`, return nil explicitly instead of a nil pointer to a concrete error type
- Keep zero value behavior explicit when nil receivers, nil fields, nil maps, or nil slices are part of the API contract

### 3.6 Return Values and Shadowing

- Treat short variable declaration `:=` as a scope decision; confirm it is not shadowing an outer err, result value, context, transaction, or cancel function that later code expects to observe
- Use named return values only when they clarify result meaning or a deferred cleanup must adjust the returned error
- Avoid naked return except in tiny functions where every named result value is obvious; return explicitly in ordinary Agent-written code

---

## 4. Context, Interfaces, and Receivers

### 4.1 `context.Context` Boundaries

- Pass `context.Context` explicitly as the first parameter on request-scoped work
- Do not store `context.Context` on structs
- Do not pass `nil` contexts; use `context.Background()` or `context.TODO()` only at process boundaries
- Propagate cancellation and deadlines into blocking work, and return or wrap `ctx.Err()` when cancellation is the observable result
- When creating derived contexts with `context.WithCancel`, `context.WithTimeout`, or `context.WithDeadline`, call `defer cancel()` promptly to avoid a timer leak unless ownership is deliberately transferred and documented
- Use `context.Value` only for request-scoped metadata that must cross API boundaries, not for optional parameters or required dependencies
- Use an unexported key type for context values and check type assertions at the boundary where the value is read

### 4.2 Interfaces `[Overrides common: 5.5]`

- Define interfaces where they are used, not where they are implemented
- Keep interfaces small; one or two methods is usually enough
- Accept interfaces when callers benefit from substitution, and return concrete types when ownership is clear
- Do not create an interface until multiple callers or a real seam justify it
- Use `any`, `interface{}`, and `reflect` only at a real untyped boundary, such as decoding, plugin integration, generic adapters, or compatibility layers
- Prefer concrete types, small interfaces, a type parameter, or a type switch when they make behavior explicit
- Avoid spreading dynamic typing through typed code after the boundary has been checked

### 4.3 Receiver Discipline

- Keep receiver names short, consistent, and derived from the type name
- Use pointer receivers when methods mutate state or copying the value would be expensive
- Do not mix pointer and value receivers on the same type without a specific reason
- Receiver method sets should make the type's mutability obvious at a glance

---

## 5. Concurrency and Resource Cleanup

### 5.1 Goroutine Lifecycle

- Never launch a goroutine without knowing who owns its lifetime
- Every goroutine needs a shutdown path and completion strategy
- Document cancellation, backpressure, and error propagation at the spawn point
- Use channels when they clarify ownership; use a mutex when shared state is the clearer model

### 5.2 Channel Discipline

- The sender closes the channel, never the receiver
- Sender owns channel close; document the owner when multiple goroutines can observe the channel
- A nil channel blocks forever on send and receive; use it only intentionally, such as disabling a `select` case
- Sending on a closed channel or closing a closed channel will panic
- Buffered channels need a specific throughput or ownership reason
- Use `select` with `context.Done()` when a channel operation can block indefinitely

### 5.3 Shared State Ownership

- Decide whether one goroutine owns the state, a `sync.Mutex` or `sync.RWMutex` protects it, or channels transfer ownership; do not mix these models silently
- Do not copy values containing `sync.Mutex`, `sync.RWMutex`, `sync.WaitGroup`, `sync.Once`, or atomic fields after first use
- Call `WaitGroup.Add` before launching the goroutine, use `defer wg.Done()` inside the goroutine, and avoid Add inside the goroutine where it can race with `Wait`
- Use `sync/atomic` only for simple shared state with a clear ownership comment; prefer locks when compound invariants matter
- Use pointer receivers and pointer parameters when a type contains synchronization fields or shared mutable state
- Do not expose internal maps or slices without defining ownership; return copies when callers can mutate the result and create a data race or broken invariant
- Treat returned maps, slices, and pointer fields as a mutable alias unless the API clearly documents that callers own the value

### 5.4 Resource Cleanup `[Overrides common: 4.3]`

**Reason:** `defer` makes cleanup readable, but only if resource ownership stays obvious.

- Use `defer` immediately after acquiring a resource
- In loops, use a helper function or explicit close so cleanup does not pile up unexpectedly
- Remember that defer arguments are evaluated immediately; use a deferred closure only when cleanup needs the final value observed at function return
- Avoid `defer` in a loop unless each iteration has its own function boundary or the number of deferred calls is deliberately bounded
- Own timer and ticker lifetimes explicitly when they can outlive one receive or one function call
- Pair potentially blocking I/O with cancellation, deadlines, or both
- Close what you open, even on error paths

### 5.5 Low-Level Runtime Contracts

Low-level runtime contracts include panic recovery, process exit, `unsafe`, `sync.Once`, atomic operations, timer reuse, stream reads, closed-channel receive, non-blocking select, and append capacity behavior. Raise these only when touched code depends on that behavior.

When such a contract matters, keep the note narrow: state the affected operation, the observable risk, and the local fix. Do not expand this skill into a full Go runtime pitfall catalogue.

---

## 6. Composition, Wiring, and Complexity

### 6.1 Value Semantics and Embedding `[Overrides common: 5.1]`

- Prefer explicit fields and method calls when they make ownership clearer than embedding
- Use embedding only when promoted methods are intentionally part of the type's API
- Preserve useful zero value behavior when the type semantics allow it
- Make pointer and value semantics visible through constructors, receivers, and field mutability
- Do not hide coupling behind deep embedded graphs or anonymous fields that surprise callers

### 6.2 Initialization and Dependencies `[Overrides common: 5.2]`

- Pass dependencies as parameters or struct fields
- Keep wiring at the process boundary or package boundary that owns startup
- Avoid package-level mutable state unless the package already uses that pattern and the state has a clear lifecycle
- Avoid `init()` side effects for configuration, I/O, goroutines, registration, or hidden dependency setup
- Prefer explicit constructors only when they establish invariants, validate configuration, or make dependency ownership obvious

### 6.3 Slices, Maps, Generics, and Complexity `[Overrides common: 4.2]`

- Watch slice aliasing, capacity growth, and copying when appending in loops or returning subslices
- append returns the updated slice; assign the result and remember it may reallocate the underlying array when capacity is exceeded
- Pre-allocate slices when a reasonable capacity estimate exists
- Preserve nil versus empty slice or map behavior when callers can observe it through JSON, equality checks, or API contracts
- Initialize a map before writing to it; assignment to entry in nil map will panic even though reads, `len`, and `range` on a nil map are valid
- Plain maps are not safe for concurrent map writes; protect shared maps with a mutex, single goroutine ownership, or channel ownership transfer
- Remember that map iteration order is randomized; sort keys before producing deterministic output
- Do not take the address of the range variable when callers need the underlying element; index into the slice and use `&items[i]`, or copy the value intentionally
- When launching a goroutine or creating a closure inside a loop, copy per iteration when needed for the module Go version or local pattern
- Only use interface comparison or interface values as map keys when the dynamic value is known to be comparable; comparing an interface whose dynamic value is a map, slice, or function can panic
- Use generics only when they remove real duplication while preserving type-safe behavior
- Do not use generics to simulate dynamic typing, obscure concrete behavior, or create future-only extension points
- Reach for additional complexity only after measurement shows it matters

### 6.4 Strings, Numbers, and Time Values

- Be explicit about byte versus rune semantics; indexing a string reads bytes, while `range over a string` decodes UTF-8 into runes and byte offsets
- Avoid byte slicing of user-visible text unless the code deliberately works on bytes and handles invalid UTF-8
- Treat integer conversion as a potential behavior change; check bounds before narrowing, changing signedness, or converting values that may overflow
- Do not rely on overflow for ordinary business logic; make wraparound behavior explicit when it is truly required
- Treat `time.Duration` values as nanoseconds; convert counts with an explicit expression such as `n * time.Second`, and in review require callers to multiply by time.Second or the intended unit instead of passing raw integers

---

## Red Flags

| Thought | Reality |
|---------|---------|
| "I'll ignore this error for now" | `_ = someFunc()` is a bug waiting to happen. Handle every error. |
| "I'll use `panic` for this error" | `panic` is for programmer errors, not runtime conditions. Return an error. |
| "This goroutine will just run forever" | Every goroutine needs a shutdown path. |
| "This test matrix is too small for table-driven tests" | If you are comparing multiple scenarios, table-driven tests keep the cases explicit and reviewable. |
| "I'll create an interface first" | Wait until you need it. Define interfaces at the consumer, not the producer. |
| "I can stash context on the struct" | Request-scoped state belongs in parameters, not shared object state. |
| "Channels are always better than mutexes" | Choose the model that makes ownership clearest. |
| "I'll reshape this package while I'm here" | Existing project shape wins. Do not move packages, rename identifiers, or reorganize tests unless the task requires it. |
| "I'll add a helper just to make the function shorter" | A no-information helper is worse than a slightly longer readable function. Extract only a real concept. |
| "This shallow test is enough" | A shallow test that only calls code, mirrors implementation, or checks a weak assertion does not prove behavior. |
| "I'll hide setup in `init()`" | A hidden `init()` makes startup order and dependencies harder to review. Prefer explicit wiring. |
| "I'll compare `err.Error()` in the test" | Check error identity with `errors.Is` or `errors.As` unless the message text is the behavior under test. |
| "I'll wait with `time.Sleep()`" | Use a real synchronization mechanism: channels, `sync.WaitGroup`, context cancellation, or a project fake clock. |
| "I'll skip `cancel()` because the test is short" | Pair derived contexts with `defer cancel()` so timers and cancellation resources are released. |
| "I'll just pass this struct by value" | Do not copy values containing locks, wait groups, once guards, atomic fields, or shared mutable state. |
| "Returning this map is convenient" | A returned map or slice can be a mutable alias; return copies or document caller ownership. |

---

## Iron Laws

1. **Handle every error.** No `_ = someFunc()` for functions that return errors. Check it, wrap it, or propagate it.
2. **Table-driven tests are the default for Go scenario matrices.** Reach for another pattern only when the behavior is genuinely stateful or sequential.
3. **Every goroutine has a shutdown path.** Leaked goroutines are memory leaks with latency attached.
4. **No `panic` in libraries.** Libraries return errors. Recovery belongs at top-level boundaries.
5. **Interfaces live at the consumer.** Define them where substitution is needed.
6. **Do not store `context.Context` on structs.** Pass it explicitly.
7. **Existing project shape wins.** Do not force directory layout, package boundaries, naming cleanup, or test organization from this skill alone.
8. **New production functions have a size budget.** Keep them within 40 lines by default, or state the current-task reason for the exception.
9. **Tests must prove behavior.** A Go test needs meaningful assertions, named scenarios, and failure output that points to the broken case.
10. **No hidden startup behavior.** Avoid package-level mutable state and `init()` side effects unless the existing package pattern and lifecycle justify them.
11. **Cancellation is owned.** Derived contexts need `defer cancel()` unless cancellation ownership is intentionally handed off and documented.
12. **Concurrency tests synchronize.** `time.Sleep()` is a last-resort guard, not the primary way to prove goroutine or channel behavior.
13. **Shared state has one ownership model.** Use one goroutine, a lock, or channel ownership transfer; mixing models invites a data race.
14. **Do not copy synchronization state.** Values containing locks, wait groups, once guards, atomic fields, or shared mutable state need pointer semantics.
15. **Go version compatibility is part of correctness.** Respect the module's `go` directive and do not change `toolchain` policy unless the task requires it.

---

## Behavioral Shaping

### When Touching Existing Go Code

1. Read nearby tests and callers before editing
2. Make the smallest behavior change that satisfies the task
3. Do not move packages, rename identifiers, reorganize tests, or clean up comments unless the task requires it
4. Do not add comment-only cleanup to pre-existing exported identifiers unless their public API contract changes

### When Starting a New Go File

1. Match the package's existing public surface and naming conventions
2. Add doc comments when introducing exported identifiers
3. Keep package boundaries obvious to the next reader

### When Writing Go Tests

1. Start with a failing test that demonstrates the behavior gap
2. Use table-driven tests for scenario matrices, not for one-off sequential behavior
3. Name each table case so the failing subtest identifies the broken scenario
4. Assert observable behavior, returned errors, state changes, resource cleanup, or concurrency outcomes rather than helper internals
5. Avoid shared mutable state before using `t.Parallel()`
6. Rebind table cases with `tt := tt` when loop variable capture can affect the module's Go version or local pattern
7. Use `t.Cleanup()` for environment variables and temporary resources that need per-test restoration
8. Assert error identity with `errors.Is` or `errors.As` when the contract exposes wrapping, sentinels, or error types
9. Pair `context.WithCancel`, `context.WithTimeout`, and `context.WithDeadline` with `defer cancel()`
10. Use channels, `sync.WaitGroup`, context cancellation, or a project fake clock instead of `time.Sleep()` for synchronization
11. Mark test helpers that receive `*testing.T` or `testing.TB` with `t.Helper()` before they fail the test
12. Use `t.TempDir()` and `t.Setenv` for per-test resources, and avoid `t.Parallel()` when the test mutates process-wide state
13. Report goroutine failures back to the test goroutine instead of calling `t.Fatal` inside worker goroutines
14. Mock only external dependencies that cannot reasonably be exercised directly

### When Adding a New Dependency

1. Check the current codebase and the standard library first
2. Evaluate whether the dependency clarifies the design or just hides it
3. Document why the dependency fits this project instead of treating it as a Go default

### When Reviewing Go Code

1. Check for unhandled errors and weak error strings
2. Verify exported APIs, doc comments, zero value behavior, and concrete-versus-interface return choices
3. Confirm `context.Context`, `ctx.Err()`, `defer cancel()`, and `context.Value` usage match request ownership
4. Check goroutines, channel or mutex ownership, `WaitGroup.Add`, and resource cleanup for leaks or races
5. Confirm maps, slices, pointer fields, and sync-containing values do not expose mutable alias or copy-lock risks
6. Check typed nil returns, nil map writes, nil channel use, and interface comparability only where they affect the current behavior
7. Keep `any`, `interface{}`, `reflect`, generics, interfaces, wrappers, and helpers tied to current evidence
8. Check range variable address use, closure capture, short variable declaration shadowing, naked return, and defer evaluation around changed code
9. Check byte versus rune behavior, integer conversion, overflow assumptions, and `time.Duration` units when data crosses those boundaries
10. Raise low-level runtime contracts only when touched code depends on that behavior
11. Reject no-information helpers, speculative interfaces, and hidden startup behavior
12. Look for table-driven tests when multiple scenarios are being exercised
13. Reject shallow tests, mirror implementation tests, weak assertions, and non-diagnostic failures
14. Confirm error assertions use `errors.Is` or `errors.As` when identity is the contract
15. Confirm concurrency tests use deterministic synchronization instead of `time.Sleep()`
16. Check test helpers, temporary resources, environment variables, and goroutine failure reporting for useful diagnostics
