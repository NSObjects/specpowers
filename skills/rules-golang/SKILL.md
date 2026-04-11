---
name: rules-golang
description: Use when writing, reviewing, or modifying Go code — provides Go-specific coding rules that override and extend the universal rules from rules-common
language: golang
---

# Go Coding Rules

These rules apply to Go projects. They inherit all rules from `rules-common` and override specific entries where Go conventions differ. Overrides are marked with `[Overrides common: X.Y]` and include the reason.

The rules layer focuses on judgment-heavy guidance for writing and reviewing Go. Formatting, static analysis, race detection, and other mechanical checks belong to verification tooling rather than this skill.

---

## 1. Names, Packages, and Documentation

### 1.1 Naming Conventions `[Overrides common: 1.1]`

**Reason:** Go packages read like public APIs, so naming mistakes spread quickly.

- Exported names use `PascalCase`; unexported names use `camelCase`
- Acronyms stay capitalized (`HTTPClient`, `XMLParser`, `ID`, `URL`)
- Package names stay short, lowercase, and single-purpose
- Avoid stutter: `http.Client`, not `http.HTTPClient`
- Getter names omit `Get`: `Name()`, not `GetName()`

### 1.2 Function Size `[Overrides common: 1.2]`

**Reason:** Explicit error handling adds vertical space, but the function still needs one readable purpose.

- Aim for functions that stay understandable on one screen even after error handling is included
- Extract helper functions when control flow or branching hides the main behavior
- Keep error handling close to the call that can fail

### 1.3 File Organization `[Overrides common: 1.3]`

**Reason:** Go code is read package-first; file layout should reinforce package boundaries.

- Keep one package per directory
- Name files after the responsibility they contain, not after vague utility buckets
- Use `internal/` when code should stay private to the module tree
- Keep executable entry points under `cmd/`

### 1.4 Documentation and Comments

- Exported identifiers need doc comments that start with the identifier name
- Package docs explain purpose and constraints when the package name alone is not enough
- Doc comments should capture intent, invariants, and trade-offs instead of restating obvious code
- Keep public API docs closer to the seam than to the implementation detail

---

## 2. Tests and TDD `[Overrides common: 2.1]`

**Reason:** Go tests are easiest to review when scenarios are explicit and failure output names the broken case.

### 2.1 Use the Standard `testing` Package

Use the standard `testing` package. Test functions are `TestXxx(t *testing.T)`.

- During TDD, default to table-driven tests when expressing scenario variations
- Define a `tests` slice, iterate with `for _, tt := range tests`, and run each case with `t.Run(tt.name, ...)`
- Table-driven tests are the Go-specific default for functions with multiple input/output combinations
- Step away from table-driven tests only when the behavior is genuinely stateful or sequential

### 2.2 Test Coverage Strategy `[Overrides common: 2.4]`

**Reason:** Go's type system catches some classes of mistakes, so tests should concentrate on behavior, edges, and failures.

- Test behavior, not helper internals
- Cover happy paths, edge cases, and error paths
- Use `t.Run()` so failures identify the exact scenario that regressed
- Use `t.Parallel()` only when cases do not share mutable state
- Failure messages should name the input, branch, or scenario that broke

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

### 3.4 Public API Surface

- Keep exported APIs narrow; unexport names until another package genuinely needs them
- Prefer concrete return types unless the caller benefits from substitution
- Make the zero value useful when the type semantics allow it

---

## 4. Context, Interfaces, and Receivers

### 4.1 `context.Context` Boundaries

- Pass `context.Context` explicitly as the first parameter on request-scoped work
- Do not store `context.Context` on structs
- Do not pass `nil` contexts; use `context.Background()` or `context.TODO()` only at process boundaries

### 4.2 Interfaces `[Overrides common: 5.5]`

- Define interfaces where they are used, not where they are implemented
- Keep interfaces small; one or two methods is usually enough
- Accept interfaces when callers benefit from substitution, and return concrete types when ownership is clear
- Do not create an interface until multiple callers or a real seam justify it

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
- Buffered channels need a specific throughput or ownership reason
- Use `select` with `context.Done()` when a channel operation can block indefinitely

### 5.3 Resource Cleanup `[Overrides common: 4.3]`

**Reason:** `defer` makes cleanup readable, but only if resource ownership stays obvious.

- Use `defer` immediately after acquiring a resource
- In loops, use a helper function or explicit close so cleanup does not pile up unexpectedly
- Pair potentially blocking I/O with cancellation, deadlines, or both
- Close what you open, even on error paths

---

## 6. SQL and Injection Prevention `[Overrides common: 3.6]`

**Reason:** Query safety is a hard requirement, but library choice remains a project decision.

- Use parameterized queries or prepared statements
- Keep SQL construction separate from untrusted input
- Choose database helpers based on project context; this skill does not prescribe a specific library

---

## 7. Composition, Wiring, and Complexity

### 7.1 Composition `[Overrides common: 5.1]`

- Prefer small structs and explicit delegation over inheritance-like patterns
- Use embedding only when promoted methods make the public API clearer
- Do not hide coupling behind deep embedded graphs

### 7.2 Dependency Injection `[Overrides common: 5.2]`

- Pass dependencies as parameters or struct fields
- Keep wiring near `main()` or the package boundary that owns startup
- Avoid hidden globals and implicit setup paths

### 7.3 Algorithm Complexity `[Overrides common: 4.2]`

- Watch slice growth and copying when appending in loops
- Pre-allocate slices when a reasonable capacity estimate exists
- Remember that map iteration order is randomized
- Reach for additional complexity only after measurement shows it matters

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

---

## Iron Laws

1. **Handle every error.** No `_ = someFunc()` for functions that return errors. Check it, wrap it, or propagate it.
2. **Table-driven tests are the default for Go scenario matrices.** Reach for another pattern only when the behavior is genuinely stateful or sequential.
3. **Every goroutine has a shutdown path.** Leaked goroutines are memory leaks with latency attached.
4. **No `panic` in libraries.** Libraries return errors. Recovery belongs at top-level boundaries.
5. **Interfaces live at the consumer.** Define them where substitution is needed.
6. **Do not store `context.Context` on structs.** Pass it explicitly.

---

## Behavioral Shaping

### When Starting a New Go File

1. Match the package's existing public surface and naming conventions
2. Add doc comments when introducing exported identifiers
3. Keep package boundaries obvious to the next reader

### When Adding a New Dependency

1. Check the current codebase and the standard library first
2. Evaluate whether the dependency clarifies the design or just hides it
3. Document why the dependency fits this project instead of treating it as a Go default

### When Reviewing Go Code

1. Check for unhandled errors and weak error strings
2. Verify package APIs do not stutter or leak internal details
3. Confirm `context.Context` and receiver choices match ownership
4. Check goroutines for shutdown paths and resource leaks
5. Look for table-driven tests when multiple scenarios are being exercised
