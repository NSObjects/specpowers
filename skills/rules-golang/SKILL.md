---
name: rules-golang
description: 编写、审查或修改 Go 代码时使用；提供 Go 语义、API、测试、并发和资源管理规则，覆盖并补充 rules-common。
language: golang
---

# Go Coding Rules（Go 编码规则）

`rules-golang` 适用于 AI Agent 编写、修改和审查 Go 代码与 Go tests。它继承 `rules-common`，并在 Go 约定、Go 语义或 Go tooling 需要不同判断时覆盖通用规则。

本 skill 关注需要判断的工程规则：API shape、错误处理、上下文传播、资源生命周期、并发所有权、测试有效性和 Go 版本兼容性。Formatting、`go test`、`go vet`、static analysis、race detection 和 linting 属于 verification tooling；可以建议或运行，但不要把 tooling 结果伪装成本 skill 已经证明的结论。

Effective Go（https://go.dev/doc/effective_go）是新代码的 idiom reference，尤其适用于 comments、names、errors 和 composition。它不是重写既有项目的许可；已有代码中，local conventions 和当前 task boundary 优先。

---

## 0. Scope, Precedence, and Agent Behavior（范围、优先级与 Agent 行为）

### 0.1 Use This Skill When（触发条件）

使用本 skill，当任务涉及：

- 编写、修改、审查 Go production code；
- 编写、修改、审查 Go tests；
- 判断 Go API、errors、context、goroutines、channels、mutexes、maps、slices、generics、receivers、resource cleanup 或 module compatibility；
- 解释 Go 代码中的 correctness、maintainability 或 test-quality risk。

不要用本 skill 规定 backend architecture、database/query policy、HTTP framework、deployment shape、logging stack、dependency version strategy、directory topology、团队命名清理或测试框架偏好。非 Go concerns 只有在 changed code 中已经出现并影响当前 task 时才提出，且标为 separate review concern，不要包装成 `rules-golang` violation。

### 0.2 Precedence（优先级）

发生冲突时，按以下顺序判断：

1. 当前用户请求、accepted spec、failing test、security/correctness requirement；
2. Public API compatibility 与 backward compatibility；
3. 当前 repository 的 local conventions、package boundaries、test organization；
4. `go.mod` 的 `go` directive 和 `toolchain` directive；
5. 本 skill；
6. Generic style preference。

处理既有 Go code 时，先读 nearby code、nearby tests 和 callers。采用满足任务的最小行为变更。除非当前 request、accepted spec、failing test 或 public API impact 要求，否则不要 reshape packages、rename working identifiers、move files、reorganize tests 或做 comment-only cleanup。

### 0.3 Review Output Discipline（审查输出纪律）

审查 Go code 时，先报 semantic risks，再报 style-only findings。输出 finding 时说明：affected operation、observable risk、local fix。不要列泛泛 Go pitfall checklist。

Severity guidance：

- **Blocker / Critical:** data race、goroutine leak、resource leak、unhandled error that changes behavior、panic in library expected path、public API break、Go version incompatibility、incorrect synchronization、incorrect context cancellation、typed nil returned as interface。
- **Major:** weak error identity、missing cleanup on error path、shadowing that changes observed value、mutable alias across boundary、tests that fail to prove changed behavior。
- **Minor:** naming、comments、function size、layout 或 formatting；只有当它影响 correctness、API contract、resource lifetime、concurrency safety、current-task readability 或 test diagnostics 时才进入 scope。
- **Out of scope:** 与当前 changed code 无关的 architecture、directory reshaping、dependency preference、broad cleanup。

### 0.4 Agent Operating Loop（执行流程）

1. Inspect `go.mod` / `toolchain` and nearby conventions before using new language features or APIs。
2. Identify public API, caller-visible behavior, resource ownership, concurrency ownership and test obligations。
3. Prefer direct implementation. Add abstraction only with current evidence。
4. Keep errors and cleanup close to the operation that can fail。
5. Add or update tests that prove observable behavior, not helper internals。
6. When reviewing, separate required fixes from optional cleanup。
7. If verification tooling was not run, say so; do not imply success。

---

## 1. Compatibility and Project Shape（兼容性与项目形状）

### 1.1 Go Version Compatibility（Go 版本兼容性）

Before using newer syntax, standard-library APIs or language semantics, check the module `go` directive and any `toolchain` directive. Existing module policy is a correctness constraint, not a suggestion.

- Do not raise the module Go version or add/change a `toolchain` directive unless the accepted task requires it。
- If a newer Go version is required, report it as a separate compatibility decision with reason, affected files and rollback path。
- If a newer API is only a convenience, use a local fallback compatible with the current module。
- For loop variable capture, respect the module Go version and local pattern. In pre-Go 1.22 modules, or when the codebase already does so, rebind loop variables before subtests, goroutines or closures, e.g. `tt := tt`。

### 1.2 Existing Project Shape Wins（既有项目形状优先）`[Overrides common: 1.3]`

- Match nearby package boundaries, file naming, directory layout, layering and test organization。
- New files should live where this package’s existing pattern suggests。
- Do not force package reshaping, file moves, directory reorganization or test relocation from this skill alone。
- Package or directory concerns unrelated to the current task belong in out-of-scope observations。

### 1.3 Names and Documentation（命名与文档）`[Overrides common: 1.1]`

- For new exported APIs, use idiomatic names that fit the surrounding package。
- Preserve existing naming patterns unless the task or public API impact requires change。
- Exported identifiers introduced or behaviorally changed by the task need doc comments beginning with the identifier name。
- Existing exported identifiers do not need comment-only cleanup unless their public contract changed。
- Comments should explain invariants, compatibility constraints, resource lifetime, concurrency ownership or non-obvious trade-offs; do not restate obvious code。

### 1.4 Function Size and Helpers（函数规模与 helper）`[Overrides common: 1.2]`

- New production functions should normally stay within 40 lines。
- Longer functions need a current-task reason: dispatch table, compatibility branch, clear sequential workflow, necessary error handling or test data。
- Do not extract no-information helpers. A helper is unjustified if it only forwards parameters, wraps one call, renames the same concept or makes readers jump around to understand one behavior。
- Extract helpers only when they reduce real branching, isolate a separate concept, improve testability of an external seam or make the main behavior easier to review。
- Keep error handling near the call that can fail。

---

## 2. Errors and Public APIs（错误与公开 API）`[Overrides common: 5.6]`

### 2.1 Errors Are Values（错误是值）

- Functions that can fail return `error` as the last return value。
- Check errors immediately after calls. Do not use `_ = someFunc()` for a returned error unless the ignored error is explicitly safe and documented locally。
- Error strings start with lowercase and do not end with punctuation, unless a domain term requires otherwise。
- Use `errors.New` for static errors。
- Use `fmt.Errorf("...: %w", err)` when callers need the error chain。
- Introduce sentinel errors or exported error types only when callers must branch on them。
- Do not compare `err.Error()` for logic. Use `errors.Is` or `errors.As` when identity or type matters。

### 2.2 Error Wrapping and Context（错误包装与上下文）

- Add useful context at each boundary, but do not repeat what the wrapped error already says。
- Preserve caller-visible identity with `%w` when callers may use `errors.Is` or `errors.As`。
- If cancellation is the observable result, return or wrap `ctx.Err()`。
- In tests, assert error identity with `errors.Is` / `errors.As` when identity is the contract. Compare error text only when the text itself is the contract。

### 2.3 Panic, Recover, and API Failure（panic、recover 与 API 失败）

- Use `panic` for unrecoverable programmer errors or impossible states, not expected runtime failures。
- Libraries return errors for expected failures。
- Use `recover` only at defined process or goroutine boundaries。
- Boundary recovery must preserve diagnostic context and convert caller-visible expected failures back to errors。

### 2.4 Public API Surface（公开 API 表面）

- Keep exported APIs narrow. Export only when another package actually needs the name。
- Prefer returning concrete types unless callers benefit from substitution。
- Prefer accepting interfaces when callers benefit from substitution。
- Preserve useful zero value behavior when the type semantics allow it。
- Document nil receiver, nil field, nil map, nil slice or zero value behavior if it is part of the API contract。

### 2.5 Nil, Interfaces, and Returns（nil、接口与返回值）

- Avoid returning typed nil as `error` or another interface. An interface holding a concrete nil pointer is not a nil interface。
- For functions returning `error`, return plain `nil` on success。
- Treat `:=` as a scope decision. Check that it does not shadow an outer `err`, result, context, transaction or cancel function later observed by the code。
- Use named return values only when they clarify result meaning or a deferred cleanup must adjust the returned error。
- Avoid naked returns except in very small functions where every named result is obvious。

---

## 3. Context, Interfaces, and Receivers（Context、接口与 Receiver）

### 3.1 `context.Context` Boundaries（Context 边界）

- For request-scoped work, pass `context.Context` explicitly as the first parameter。
- Do not store `context.Context` in structs。
- Do not pass nil contexts. Use `context.Background()` or `context.TODO()` only at process boundaries。
- Propagate cancellation and deadlines into blocking work。
- After `context.WithCancel`, `context.WithTimeout` or `context.WithDeadline`, call `defer cancel()` immediately unless ownership is intentionally transferred and documented。
- Use `context.Value` only for request-scoped metadata that must cross API boundaries. Do not use it for optional parameters or required dependencies。
- Context keys should use an unexported key type, and value extraction should check type assertions at the boundary。

### 3.2 Interfaces（接口）`[Overrides common: 5.5]`

- Define interfaces at the consumer, not the producer。
- Keep interfaces small; one or two methods is usually enough。
- Do not create interfaces before a real substitution need, multiple callers or established project pattern exists。
- Return concrete types when ownership is clear and callers do not need substitution。
- Use `any`, `interface{}` and `reflect` only at real untyped boundaries: decoding, plugin integration, generic adapters or compatibility layers。
- After boundary validation, do not spread dynamic typing through typed code。

### 3.3 Receivers（Receiver 纪律）

- Receiver names should be short, consistent and derived from the type name。
- Use pointer receivers when methods mutate state or copying the value is expensive or unsafe。
- Avoid mixing pointer and value receivers on the same type without a specific reason。
- Types containing synchronization fields or shared mutable state should use pointer receivers and pointer parameters。

---

## 4. Concurrency and Resource Lifecycle（并发与资源生命周期）

### 4.1 Goroutine Lifecycle（Goroutine 生命周期）

- Before starting a goroutine, know who owns its lifetime。
- Every goroutine needs a shutdown path and a completion strategy。
- At the spawn point, account for cancellation, backpressure and error propagation。
- Do not let goroutines silently outlive their owner, tests or request scope。
- Worker goroutine failures in tests must be reported back to the test goroutine; do not call `t.Fatal`, `t.Fatalf` or `t.FailNow` from a non-test goroutine。

### 4.2 Channel Discipline（Channel 纪律）

- The sender closes the channel. Receivers do not close channels they do not own。
- Document the close owner when multiple goroutines observe a channel。
- Nil channels block forever on send and receive; use them only intentionally, such as disabling a `select` case。
- Sending on a closed channel or closing a closed channel panics。
- Buffered channels need a concrete throughput, ownership or backpressure reason。
- Potentially blocking channel operations should use `select` with `ctx.Done()` when cancellation matters。

### 4.3 Shared State Ownership（共享状态所有权）

- Choose one ownership model: one goroutine owns the state, a mutex protects the state, or channels transfer ownership. Do not silently mix models。
- Do not copy values containing `sync.Mutex`, `sync.RWMutex`, `sync.WaitGroup`, `sync.Once`, atomic fields or shared mutable state after first use。
- Call `WaitGroup.Add` before launching the goroutine. Inside the goroutine, use `defer wg.Done()`。
- Use `sync/atomic` only for simple shared state with clear ownership. Prefer locks for compound invariants。
- Plain maps are not safe for concurrent writes. Protect shared maps with a mutex, single goroutine ownership or channel ownership transfer。
- Do not expose internal maps, slices or pointer fields without defined ownership. Return copies when caller mutation can cause a data race or break invariants。

### 4.4 Resource Cleanup（资源清理）`[Overrides common: 4.3]`

- Close what you open, including on error paths。
- After acquiring a resource, defer cleanup immediately when the function boundary owns the resource。
- Avoid `defer` in loops unless each iteration has its own function boundary or the deferred call count is intentionally bounded。
- In loops, prefer a helper function or explicit close to avoid accidental cleanup accumulation。
- Remember defer arguments are evaluated immediately. Use a deferred closure only when cleanup needs the final value at function return。
- Timers and tickers need explicit lifetime ownership. Stop them when they can outlive the operation。
- Potentially blocking I/O should have cancellation, deadlines or both when request scope matters。

### 4.5 Low-Level Runtime Contracts（低层 Runtime 契约）

Only raise low-level runtime contracts when touched code depends on that behavior. Keep findings narrow: affected operation, observable risk and local fix。

Examples: panic recovery, process exit, `unsafe`, `sync.Once`, atomic ordering, timer reuse, stream reads, closed-channel receive, non-blocking `select`, append capacity behavior, interface comparability, range variable capture。

---

## 5. Values, Data Structures, and Complexity（值、数据结构与复杂度）`[Overrides common: 4.2, 5.1, 5.2]`

### 5.1 Value Semantics and Embedding（值语义与嵌入）

- Prefer explicit fields and method calls when they better reveal ownership。
- Use embedding only when promoted methods are intentionally part of the type API。
- Do not hide surprising coupling behind deep embedded graphs or anonymous fields。
- Use constructors when they establish invariants, validate configuration or clarify dependency ownership。
- Avoid package-level mutable state unless the package already has that pattern and the lifecycle is clear。
- Avoid `init()` side effects for configuration, I/O, goroutines, registration or hidden dependency setup unless the package already owns that lifecycle pattern。

### 5.2 Slices and Maps（切片与 Map）

- Assign the result of `append`; it may reallocate the underlying array。
- Pre-allocate slices when there is a reasonable capacity estimate。
- Be explicit about nil versus empty slices/maps when JSON output, equality checks or API contracts can observe the difference。
- Initialize maps before writes. Reads, `len` and `range` on nil maps are valid; assignment to a nil map panics。
- Map iteration order is randomized. Sort keys before deterministic output。
- Treat returned maps, slices and pointer fields as mutable aliases unless the API documents caller ownership or returns copies。
- Do not take the address of a range variable when the caller needs the underlying element. Index into the slice, e.g. `&items[i]`, or intentionally copy the value。

### 5.3 Generics and Dynamic Typing（泛型与动态类型）

- Use generics only when they remove real duplication while preserving type-safe behavior。
- Do not use generics to simulate dynamic typing, hide concrete behavior or create future-only extension points。
- Use `any`, type switches or reflection only when they make a real boundary clearer。
- Compare interface values or use them as map keys only when the dynamic values are known comparable. Interface comparison can panic when the dynamic value is a map, slice or function。
- Add complexity only when current evidence or measurement justifies it。

### 5.4 Strings, Numbers, and Time（字符串、数字与时间）

- Be explicit about byte versus rune semantics. Indexing a string reads bytes; ranging over a string decodes UTF-8 into runes and byte offsets。
- Do not byte-slice user-visible text unless the code intentionally handles bytes and invalid UTF-8。
- Check bounds before integer narrowing, signedness changes or conversions that may overflow。
- Normal business logic should not depend on overflow. If wraparound is intended, express it clearly。
- `time.Duration` is nanoseconds. Convert counts with explicit units, e.g. `n * time.Second`, instead of passing raw integers。

---

## 6. Tests and TDD（测试与 TDD）`[Overrides common: 2.1, 2.4]`

### 6.1 Standard Go Tests（标准 Go 测试）

- Use the standard `testing` package unless the existing project clearly uses another pattern。
- Test functions use `TestXxx(t *testing.T)`。
- Prefer tests that first expose the behavior gap, then implement the fix。
- Test observable behavior: return values, errors, state changes, resource cleanup, concurrency outcomes and public contracts. Do not test helper internals。

### 6.2 Table-Driven Tests（表驱动测试）

- For scenario matrices with multiple inputs, boundary conditions, error paths or expected results, table-driven tests are the default。
- Define a `tests` slice or map, include readable case names, inputs, expected results and scenario-specific context。
- Use `t.Run(tt.name, ...)` or `t.Run(name, ...)` so failures identify the broken scenario。
- Use got/want wording or equivalent diagnostic detail。
- Do not force table-driven tests for one-off sequential behavior when direct steps are clearer。
- When table cases run as parallel subtests, avoid shared mutable state and loop variable capture. Rebind per-case variables when module version or local pattern requires it。

### 6.3 Test Quality Bar（测试质量线）

- Cover happy paths, boundary conditions, error paths, resource lifetime and concurrency risk when relevant to changed behavior。
- Failure messages should identify the broken input, branch or scenario。
- Reject shallow tests, mirror-implementation tests, weak assertions and non-diagnostic failures。
- Mock only external dependencies that cannot reasonably be exercised directly. Do not mock the system under test。
- Test helpers accepting `*testing.T` or `testing.TB` must call `t.Helper()` before reporting failures。

### 6.4 Test Resources and Process State（测试资源与进程状态）

- Use `t.TempDir()` for per-test filesystem scratch space。
- Use `t.Setenv()` for environment changes。
- Use `t.Cleanup()` for temporary resources and process-wide state restoration。
- Do not combine process-wide state changes with `t.Parallel()`。
- Use `t.Parallel()` only when cases do not share mutable state。

### 6.5 Concurrency Tests（并发测试）

- Prefer deterministic synchronization: channels, `sync.WaitGroup`, context cancellation or a project fake clock。
- `time.Sleep()` is a last-resort guard, not the primary mechanism proving goroutine or channel behavior。
- Use deadlines to prevent hung tests, but do not make timing the behavior proof unless timing is the contract。
- Report worker goroutine failures to the test goroutine via channels or synchronized results。

---

## 7. Dependencies and Wiring（依赖与装配）

- Check the current codebase and standard library before adding dependencies。
- Add a dependency only when it makes current design clearer or provides necessary behavior; do not add one merely to hide complexity。
- Pass dependencies through parameters or struct fields。
- Put wiring at the process boundary or package boundary that owns startup。
- If adding a dependency is necessary, state why it fits this project and what alternatives were considered。

---

## 8. Review Checklist（审查清单）

When reviewing Go code, check in this order:

1. Error propagation, wrapping, identity and ignored errors。
2. Public API compatibility, exported comments, zero value behavior, concrete-vs-interface choices。
3. `context.Context` propagation, `ctx.Err()`, `defer cancel()` and `context.Value` boundaries。
4. Goroutine lifetime, cancellation, channel ownership, mutex ownership, `WaitGroup.Add` placement and error propagation。
5. Resource cleanup, defer evaluation, loops, timers, tickers and blocking I/O。
6. Map/slice aliasing, nil map writes, concurrent map writes, copied synchronization values and pointer-field ownership。
7. Shadowing, typed nil returns, naked returns, range variable address use, closure capture and interface comparability。
8. Generics, helpers, wrappers and interfaces: each must have current evidence。
9. Byte/rune behavior, integer conversions, overflow assumptions and `time.Duration` units。
10. Test effectiveness: named scenarios, got/want diagnostics, meaningful assertions, error identity checks and deterministic concurrency synchronization。

---

## Iron Laws（铁律）

1. **Handle every error.** 不忽略 returned errors；检查、wrap、propagate 或明确说明安全忽略的原因。
2. **Existing project shape wins.** 除非任务要求，不重塑 packages、directories、tests 或 naming。
3. **Go version compatibility is correctness.** 尊重 `go.mod` 的 `go` 和 `toolchain` policy。
4. **Every goroutine has an owner.** 每个 goroutine 都需要 shutdown path、completion strategy 和 error propagation plan。
5. **Cancellation is owned.** Derived contexts 需要 `defer cancel()`，除非 ownership 被有意转移并记录。
6. **Libraries return errors for expected failures.** 不在 library expected path 使用 `panic`。
7. **Interfaces live at the consumer.** 只在真实 substitution seam 处定义小接口。
8. **No speculative abstraction.** 不为 future extension 创建 interfaces、wrappers、generics 或 no-information helpers。
9. **Shared state has one ownership model.** 单 goroutine、lock 或 channel ownership transfer 三选一，避免混用。
10. **Do not copy synchronization state.** 包含 locks、wait groups、once、atomic 或 shared mutable state 的 values 使用 pointer semantics。
11. **Returned mutable data needs ownership.** Maps、slices 和 pointer fields 要么返回 copies，要么明确 caller ownership。
12. **Tests must prove behavior.** 使用 named scenarios、meaningful assertions、useful failure output 和 deterministic synchronization。
13. **Table-driven tests are the default for scenario matrices.** 但不要强迫单一顺序行为表驱动化。
14. **No hidden startup behavior.** 避免 package-level mutable state 和 `init()` side effects，除非 existing lifecycle pattern 支持。
15. **Style is secondary.** Style-only findings 只有影响当前 correctness、API、resource/concurrency safety、readability 或 diagnostics 时才升级。

---

## Red Flags（风险信号）

| Thought | Reality |
|---|---|
| “I’ll ignore this error for now.” | 这通常会变成 bug。处理、传播或记录安全忽略的理由。 |
| “I’ll use `panic` for this runtime error.” | Expected runtime failures return errors。 |
| “This goroutine can just run forever.” | Leaked goroutines are delayed memory and latency leaks。 |
| “I’ll create an interface first.” | Interfaces belong at the consumer and require current substitution evidence。 |
| “I’ll store `context.Context` on the struct.” | Request-scoped state belongs in parameters。 |
| “Channels are always better than mutexes.” | Use the model that makes ownership clearest。 |
| “I’ll reshape this package while I’m here.” | Local project shape wins unless task requires reshaping。 |
| “I’ll add a helper just to reduce line count.” | No-information helpers reduce reviewability。 |
| “This shallow test is enough.” | Tests must prove observable behavior and produce useful diagnostics。 |
| “I’ll compare `err.Error()`.” | Use `errors.Is` / `errors.As` unless text is the contract。 |
| “I’ll wait with `time.Sleep()`.” | Use deterministic synchronization; sleep is only a guard。 |
| “Returning this map is convenient.” | Returned maps/slices can be mutable aliases; copy or document ownership。 |
