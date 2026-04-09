---
name: rules-golang
description: Use when writing, reviewing, or modifying Go code — provides Go-specific coding rules that override and extend the universal rules from rules-common
language: golang
---

# Go Coding Rules

These rules apply to Go projects. They inherit all rules from `rules-common` and override specific entries where Go conventions differ. Overrides are marked with `[覆盖 common: X.Y]` and include the reason.

---

## 1. Coding Style

### 1.1 Naming Conventions `[覆盖 common: 1.1]`

**Reason:** Go has strong community conventions enforced by `gofmt` and Effective Go.

- Exported names: `PascalCase` (visibility is determined by capitalization)
- Unexported names: `camelCase`
- Acronyms: all caps (`HTTPClient`, `XMLParser`, `ID`, `URL`) — not `HttpClient`
- Interfaces: single-method interfaces use method name + `er` suffix (`Reader`, `Writer`, `Stringer`)
- Packages: short, lowercase, single-word (`http`, `fmt`, `io`) — no underscores, no camelCase
- Avoid stuttering: `http.Client`, not `http.HTTPClient`
- Getters: `Name()`, not `GetName()` — Go convention omits `Get` prefix

### 1.2 Function Size `[覆盖 common: 1.2]`

**Reason:** Go's explicit error handling adds lines — adjust expectations.

- Aim for ~50 lines including error handling blocks
- Error handling typically adds 3 lines per check (`if err != nil { return err }`) — this is expected, not bloat
- Extract complex logic into helper functions, but keep error handling inline

### 1.3 File Organization `[覆盖 common: 1.3]`

**Reason:** Go has strict package-level organization conventions.

- One package per directory — no exceptions
- File names: `snake_case.go`, test files: `snake_case_test.go`
- Group by responsibility, not by type: `user.go` contains `User` struct, methods, and related functions
- `internal/` directory for package-private code that should not be imported externally
- `cmd/` directory for executable entry points

### 1.4 Formatting `[覆盖 common: 1.5]`

**Reason:** Go has a single canonical formatter — there is no debate.

- Use `gofmt` (or `goimports`) — it is the only accepted formatter
- Tabs for indentation (enforced by `gofmt`)
- No configuration, no alternatives, no exceptions
- Run `goimports` to automatically manage import grouping

---

## 2. Error Handling `[覆盖 common: 5.6]`

**Reason:** Go uses explicit error returns as its primary error handling mechanism — not exceptions.

### 2.1 Errors Are Values

- Return `error` as the last return value from functions that can fail
- Check errors immediately after the call — never ignore a returned error
- Use `errors.New()` for simple errors, `fmt.Errorf()` with `%w` for wrapping
- Use sentinel errors (`var ErrNotFound = errors.New("not found")`) for errors that callers need to check

### 2.2 Error Wrapping

- Wrap errors with context using `fmt.Errorf("doing X: %w", err)` — this creates an error chain
- Use `errors.Is()` and `errors.As()` to check wrapped errors — never compare error strings
- Add context at each layer, but don't repeat information already in the chain

### 2.3 Panic Sparingly

- `panic` is for truly unrecoverable situations (programmer errors, impossible states)
- Never `panic` for expected error conditions (file not found, network timeout, invalid input)
- Libraries must never `panic` — always return errors to the caller
- Use `recover` only at goroutine boundaries (e.g., HTTP handlers) to prevent server crashes

---

## 3. Testing `[覆盖 common: 2.1]`

**Reason:** Go has a built-in testing framework with specific conventions.

### 3.1 Test-First with `testing` Package

Use the standard `testing` package. Test functions are `TestXxx(t *testing.T)`. Use table-driven tests as the default pattern.

### 3.2 Test Coverage Strategy `[覆盖 common: 2.4]`

**Reason:** Go's type system and explicit error handling reduce certain bug classes — focus testing on behavior.

- Use table-driven tests for functions with multiple input/output combinations
- Use `t.Run()` for subtests — they provide better failure reporting and can run in parallel
- Use `t.Parallel()` for tests that don't share state — Go tests run sequentially by default
- Use `testify/assert` or `go-cmp` for readable assertions, but the stdlib is sufficient
- Use `rapid` or `gopter` for property-based testing

### 3.3 Test Naming

Use descriptive subtest names in table-driven tests: `t.Run("empty input returns error", ...)`. The test name should read as a sentence describing the scenario.

---

## 4. Concurrency

### 4.1 Share by Communicating

"Don't communicate by sharing memory; share memory by communicating." Use channels for coordination between goroutines. Use `sync.Mutex` only when channels are awkward (e.g., protecting a shared cache).

### 4.2 Goroutine Lifecycle

- Every goroutine must have a clear shutdown path — use `context.Context` for cancellation
- Never launch a goroutine without knowing how it will stop
- Use `sync.WaitGroup` to wait for goroutine completion
- Use `errgroup.Group` for goroutines that return errors

### 4.3 Channel Discipline

- The sender closes the channel, never the receiver
- Use buffered channels only when you have a specific reason (known producer/consumer rate mismatch)
- Use `select` with `context.Done()` to make channel operations cancellable

---

## 5. Resource Cleanup `[覆盖 common: 4.3]`

**Reason:** Go uses `defer` as its primary resource cleanup mechanism.

- Use `defer` immediately after acquiring a resource: `f, err := os.Open(...); if err != nil { return err }; defer f.Close()`
- `defer` runs in LIFO order — be aware when deferring in loops
- For resources in loops, use a helper function to scope the `defer`
- Use `context.Context` with timeouts for network operations and database queries

---

## 6. Interfaces `[覆盖 common: 5.5]`

**Reason:** Go interfaces are implicitly satisfied — this changes how you design them.

- Define interfaces where they are used (consumer side), not where they are implemented (producer side)
- Keep interfaces small — one or two methods is ideal
- Accept interfaces, return structs — this maximizes flexibility for callers
- Don't create interfaces preemptively — wait until you have two or more implementations

---

## 7. Composition `[覆盖 common: 5.1]`

**Reason:** Go has no inheritance — composition via embedding is the only option.

- Use struct embedding for "has-a" relationships and method forwarding
- Embedding is not inheritance — the embedded type's methods are promoted, not overridden
- Prefer explicit delegation over embedding when you need to control the interface
- Use functional options pattern (`func WithTimeout(d time.Duration) Option`) for configurable constructors

---

## 8. Dependency Injection `[覆盖 common: 5.2]`

**Reason:** Go favors explicit, simple DI over frameworks.

- Pass dependencies as function parameters or struct fields — no DI frameworks
- Use interfaces for dependencies that need to be swapped (testing, different implementations)
- Use functional options or config structs for optional dependencies
- The `main()` function is the composition root — wire everything there

---

## 9. Algorithm Complexity `[覆盖 common: 4.2]`

**Reason:** Go's performance characteristics make certain patterns more or less important.

- Go is compiled and fast — but slice operations can be surprising (append may copy)
- Pre-allocate slices with `make([]T, 0, expectedCap)` when the size is known or estimable
- Use `map` for O(1) lookups — but be aware that map iteration order is randomized
- Use `sync.Pool` for frequently allocated/deallocated objects in hot paths

---

## 10. SQL and Injection Prevention `[覆盖 common: 3.6]`

**Reason:** Go has specific database patterns and query builders.

- Use `database/sql` with parameterized queries (`$1`, `?` placeholders)
- Use `sqlx` for ergonomic extensions, or `sqlc` for type-safe generated code
- Never use `fmt.Sprintf` to build SQL queries with user input
- Use `pgx` for PostgreSQL-specific features and better performance

---

## 11. Git Workflow `[覆盖 common: 6.5]`

**Reason:** Go has specific generated and binary files to exclude.

- Never commit compiled binaries (`/bin`, `/dist`)
- Commit `go.mod` and `go.sum` — they are the dependency lock files
- Never commit `vendor/` unless the project explicitly uses vendoring mode
- Use `.gitignore` with Go-specific patterns

---

## Red Flags

| Thought | Reality |
|---------|---------|
| "I'll ignore this error for now" | `_ = someFunc()` is a bug waiting to happen. Handle every error. |
| "I'll use `panic` for this error" | `panic` is for programmer errors, not runtime conditions. Return an error. |
| "This goroutine will just run forever" | Every goroutine needs a shutdown path. Use `context.Context`. |
| "I need a DI framework" | You don't. Pass dependencies explicitly. Go is simple by design. |
| "I'll create an interface first" | Wait until you need it. Define interfaces at the consumer, not the producer. |
| "This package name needs to be descriptive" | Short, single-word package names. `httputil`, not `http_utility_helpers`. |
| "I'll use `init()` for setup" | `init()` is implicit and hard to test. Use explicit initialization in `main()`. |
| "Channels are always better than mutexes" | Use the right tool. Mutexes are fine for protecting shared state. |

---

## Iron Laws

1. **Handle every error.** No `_ = someFunc()` for functions that return errors. Check it, wrap it, or propagate it.
2. **`gofmt` is the law.** No alternative formatters, no custom styles. Run `gofmt` or `goimports` on every save.
3. **Every goroutine has a shutdown path.** Use `context.Context` for cancellation. Leaked goroutines are memory leaks.
4. **No `panic` in libraries.** Libraries return errors. Only `main` or top-level handlers may recover from panics.
5. **Interfaces at the consumer.** Define interfaces where they are used, not where they are implemented.
6. **No `init()` for business logic.** `init()` is for package-level variable initialization only. Everything else goes in explicit setup functions.

---

## Behavioral Shaping

### When Starting a New Go File

1. Run `go mod init` if starting a new module — choose a proper module path
2. Follow the standard project layout: `cmd/`, `internal/`, `pkg/` (if needed)
3. Use `goimports` to manage imports automatically

### When Adding a New Dependency

1. Check the Go standard library first — it is extensive and well-maintained
2. Evaluate with `go doc`, GitHub stars, last commit date, and open issues
3. Use `go get` to add and `go mod tidy` to clean up unused dependencies

### When Reviewing Go Code

1. Check for unhandled errors — every `error` return must be checked
2. Verify goroutines have cancellation via `context.Context`
3. Confirm interfaces are defined at the consumer, not the producer
4. Look for `panic` in library code — it should be `return err` instead
