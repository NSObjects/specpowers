---
name: rules-golang
description: 编写、审查或修改 Go code 时使用；提供 Go-specific coding rules，覆盖并扩展 rules-common 的通用规则。
language: golang
---

# Go Coding Rules（Go 编码规则）

这些规则适用于 Go projects。它们继承 `rules-common` 的全部规则，并在 Go conventions 不同的地方用 `[Overrides common: X.Y]` 标记覆盖条目和原因。

Rules layer 聚焦写作和审查 Go 时需要判断的 guidance。Formatting、static analysis、race detection 和其他 mechanical checks 属于 verification tooling，不属于此 skill。

新 Go code 的 idiom reference 使用 Effective Go（https://go.dev/doc/effective_go），尤其是 comments、names、errors 和 composition。它是 language guide，不是重写既有项目的许可：pre-existing code 中，local conventions 和当前 task boundary 仍然优先。

## Scope for AI Agents（AI Agent 范围）

`rules-golang` 是用于 writing、modifying 和 reviewing Go code 的 AI Agent rule set。它为 Agent 在当前 task 中生成的 new Go code 和 tests 提供 default constraints for new Go code。

处理 pre-existing Go code 时，先读 surrounding code，并保留 directory layout、package boundaries、naming、layering 和 test organization 的 local conventions。除非当前 request、accepted spec、failing test 或 public API impact 要求，否则这些规则不是 not a license to rewrite existing projects，也不是 not a license to reshape 既有项目、rename working code、reorganize packages 或 move tests 的许可。

## What This Skill Does Not Own（此 Skill 不负责什么）

不要用 `rules-golang` 规定 backend architecture、database or query-safety policy、HTTP framework choice、deployment shape、logging stack、dependency versions、directory topology、naming cleanup 或 test framework preferences。这些事项在真实项目中可能重要，但它们不是 Go language rules。

只有 non-Go concerns 已经出现在 changed code 中并影响当前 task 时，才提出它们。将它们标为 separate review concern，不要呈现为 `rules-golang` violations。

## Go Version Compatibility（Go 版本兼容性）

使用新的 language features、standard library APIs 或 syntax 前，检查 module 的 go directive 和任何 toolchain directive。既有 module policy 是 compatibility constraint，不是建议。

除非 accepted task requires，否则不要 raise the module's Go version、添加 toolchain directive，或要求 newer compiler。确实需要新版 Go 时，将它报告为 separate compatibility decision，并说明 reason、affected files 和 rollback path。

当 newer API 只是便利写法时，优先选择适合当前 go directive 的 local fallback。不要仅因新版 Go 提供更短写法就 modernize code。

## Go Semantic Risk Checklist（Go 语义风险清单）

写作或审查 Go 时，先看 semantic risks before style-only findings。检查 error propagation、error wrapping、context propagation、resource cleanup、goroutine lifecycle、channel or mutex ownership、nil and zero value behavior、typed nil and nil interface behavior、short variable declaration shadowing、slice and map ownership、interface boundaries、generics、low-level runtime contracts 和 test effectiveness。

Style-only findings 是次要项。除非 naming、layout 或 formatting 差异影响 correctness、resource lifetime、concurrency safety、当前 task 的 readability 或 public API behavior，否则不要提升其严重性。

## Go Abstraction Discipline（Go 抽象纪律）

Interfaces、wrappers、helpers、generics 和 dependency indirection 都需要 current evidence。只有 current behavior、caller substitution needs 或 established project patterns 要求 replacement、reuse 或 isolation 时才使用。

不要为了 future extension、testing convenience 或 generic Go style 添加这些结构。先选择 more direct implementation，并将 unsupported extension ideas 作为 out-of-scope observations 报告。

---

## 1. Names, Packages, and Documentation（命名、包和文档）

### 1.1 Naming Conventions（命名约定）`[Overrides common: 1.1]`

**Reason:** Go names 读起来像 public APIs，但 existing project conventions 强于 generic style preferences。

- 对 new exported API，使用适合 surrounding package 的 idiomatic Go names。
- 除非当前 task 或 public API impact 要求变更，否则保留 pre-existing code 中的 existing naming patterns。
- 不要仅因 nearby names 和 generic Go preference 不同就 do not perform naming cleanup。
- Naming-only observations 只有影响 correctness、当前 change 的 readability、tests 或 public API 时才进入 scope；否则作为 out-of-scope observation。

### 1.2 Function Size（函数规模）`[Overrides common: 1.2]`

**Reason:** Explicit error handling 会增加垂直空间，但 AI-generated Go code 需要具体的 reviewability limit。

- New production functions 默认应保持在 40 lines 内。
- 更长函数需要 current-task reason，例如 test data、dispatch tables、compatibility logic、clear sequential flow 或 necessary error handling。
- 不要把长函数拆成 no-information helper；这类 helper 只转发参数、包装一次调用、重命名同一个概念，或让读者为理解一个 behavior 到处跳转。
- 只有 helper 能减少真实 branching、隔离独立概念，或让 main behavior 更容易 review 时才提取。
- Error handling 保持靠近可能失败的 call。

### 1.3 File Organization（文件组织）`[Overrides common: 1.3]`

**Reason:** Go code 按 package-first 阅读，但老项目和团队差异很大，此规则不能强推一种 layout。

- 遵循被修改代码附近已经使用的 package、file、directory 和 test organization。
- 不要仅凭此 skill do not force directory layout、package reshaping、file moves 或 test organization changes。
- 新文件的位置和命名应符合 project conventions 与当前 package 的 local pattern。
- 无关 package 或 directory concerns 作为 out-of-scope observation 报告，不要在当前 task 中修改。

### 1.4 Documentation and Comments（文档和注释）

- New exported identifiers 需要以 identifier name 开头的 doc comments。
- Pre-existing exported identifiers 不需要 comment-only cleanup，除非当前 task 改变了它们的 public API、behavior contract 或 compatibility promise。
- 当 package name 不足以说明目的时，package docs 应解释 purpose 和 constraints。
- Comments 应解释 invariants、compatibility constraints、resource lifetime、concurrency ownership 或 non-obvious trade-offs；not restate obvious code。
- Public API docs 保留在 exported boundary，不要埋在 implementation detail 里。

---

## 2. Tests and TDD（测试和 TDD）`[Overrides common: 2.1]`

**Reason:** Go tests 在 scenarios 明确、failure output 能指出 broken case 时最容易 review。

### 2.1 Use the Standard `testing` Package（使用标准 `testing` 包）

使用标准 `testing` package。Test functions 形如 `TestXxx(t *testing.T)`。

- 遵循 Go Wiki table-driven tests guidance：https://go.dev/wiki/TableDrivenTests。
- 对包含多个 inputs、boundary conditions、error paths 或 expected results 的 scenario matrices，默认使用 table-driven tests。
- 定义 `tests` slice 或 map，遍历每个 case，并用 `t.Run(tt.name, ...)` 或 `t.Run(name, ...)` 运行 named subtests。
- 每个 case 应包含 readable name、inputs、expected results，以及理解 scenario 所需的 behavior context。
- Failure messages 应使用 got/want wording 或等价 diagnostic detail。
- 不要为 single behavior 或 direct/step-by-step test 更清晰的 sequential behavior 强推 table-driven tests；not force。
- 当 table cases 作为 parallel subtests 运行时，避免 shared mutable state 和 loop variable capture；对 pre-Go 1.22 modules，或 local codebase 已采用该模式时，在 `t.Run` 前使用 `tt := tt`。

### 2.2 Test Coverage Strategy（测试覆盖策略）`[Overrides common: 2.4]`

**Reason:** Go 的 type system 会捕捉部分错误，因此 Agent-written effective tests 必须证明 meaningful behavior，而不是只满足形式测试要求。

- 测试 behavior，不测试 helper internals。
- 当这些内容与当前 behavior 相关时，覆盖 happy paths、boundary conditions、error paths、resource lifetime 和 concurrency risk。
- 使用 `t.Run()`，让 failures 标出具体 regression scenario。
- 只有 cases 不共享 mutable state 时才使用 `t.Parallel()`。
- 对 temporary resources、environment variables 和需要按 test 恢复的 process-wide test changes，使用 `t.Cleanup()`。
- Error paths 中，如果 caller-visible contract 承诺 wrapping、sentinel 或 error type，用 `errors.Is` 或 `errors.As` 断言 error identity；只有 text itself is the contract 时才比较 error strings。
- 相比 `time.Sleep()`，优先 deterministic synchronization：channels、`sync.WaitGroup`、context cancellation，或项目提供的 fake clock。Short sleep 或 deadline 只能作为 last-resort guard，不是主要 synchronization mechanism。
- Failure messages 应指出 broken 的 input、branch 或 scenario。
- Shallow tests、mirror implementation tests、weak assertions 和 non-diagnostic failures 都是 low-quality tests，必须改写。
- 不要 mock the system under test；mocks 只用于无法合理直接 exercise 的 external dependencies。
- 接受 `*testing.T` 或 `testing.TB` 的 test helper 应在报告 failure 前调用 `t.Helper()`，让 failure location 和 line number 指向 test case，而不是 helper body。
- 使用 `t.TempDir()` 作为 per-test filesystem scratch space，避免 shared directories。
- 使用 `t.Setenv` 处理 environment changes；不要把 process-wide state changes 和 `t.Parallel()` 组合。
- 不要在非 test body 的 goroutine 中调用 `t.Fatal`、`t.Fatalf` 或 `t.FailNow`；通过 channel 或 synchronized result 将 failures 报回 test goroutine。

### 2.3 Test Naming（测试命名）

Table-driven tests 中使用描述性的 subtest names，例如 `t.Run("empty input returns error", ...)`。Test name 应像一句描述 scenario 的话。

---

## 3. Errors and APIs（错误和 API）`[Overrides common: 5.6]`

**Reason:** Go 将 errors 视为普通 values，因此 API shape 和 error text 都影响 maintainability。

### 3.1 Errors Are Values（错误是值）

- 可能失败的 functions 将 `error` 作为最后一个 return value。
- Call 之后立即检查 errors。
- Error strings 以小写开头，且不以 punctuation 结尾，除非 domain term 要求。
- 简单 errors 使用 `errors.New()`；callers 需要 chain 时，用 `fmt.Errorf()` 和 `%w`。
- 只有 callers 必须 branch 时才引入 sentinel errors。

### 3.2 Error Wrapping（错误包装）

- 每层都添加 context，但不要重复 wrapped error 已经说明的内容。
- 使用 `errors.Is()` 和 `errors.As()` 检查 wrapped errors。
- 不要通过比较 error strings 驱动 logic。

### 3.3 Panic Sparingly（谨慎使用 panic）

- `panic` 用于不可恢复的 programmer errors 或 impossible states。
- Libraries 对 expected failures 返回 errors，而不是 panic。
- `recover` 只用于明确定义的 process 或 goroutine boundaries。
- 在 boundary recover 时，保留足够诊断 context，并将 expected caller-visible failures 转回 errors。

### 3.4 Public API Surface（公开 API 表面）

- Exported APIs 保持 narrow；直到另一个 package 真正需要时再 export names。
- 除非 caller 从 substitution 中获益，否则优先返回 concrete return types。
- 当 type semantics 允许时，让 zero value useful。

### 3.5 Nil and Interface Values（Nil 和接口值）

- 避免将 typed nil 作为 `error` 或其他 interface 返回；interface value with a concrete type 即使具体 pointer 为 nil，也不是 nil interface。
- 对返回 `error` 的 function，成功时 return nil explicitly，而不是返回 pointer to a concrete error type 的 nil pointer。
- 当 nil receivers、nil fields、nil maps 或 nil slices 属于 API contract 时，zero value behavior 必须明确。

### 3.6 Return Values and Shadowing（返回值和遮蔽）

- 将 short variable declaration `:=` 视为 scope decision；确认它没有 shadowing 外层 outer err、result value、context、transaction 或 cancel function，而后续代码还要观察这些值。
- 只有 named return values 能澄清 result meaning，或 deferred cleanup 必须调整返回 error 时才使用。
- 除非函数很小且每个 named result value 都显而易见，否则避免 naked return；普通 Agent-written code 要 return explicitly。

---

## 4. Context, Interfaces, and Receivers（Context、接口和 Receiver）

### 4.1 `context.Context` Boundaries（`context.Context` 边界）

- 对 request-scoped work，将 `context.Context` 作为第一个参数显式传入。
- 不要把 `context.Context` 存在 structs 上。
- 不要传 `nil` contexts；仅在 process boundaries 使用 `context.Background()` 或 `context.TODO()`。
- 将 cancellation 和 deadlines 传播到 blocking work；当 cancellation 是 observable result 时，返回或包装 `ctx.Err()`。
- 创建 derived contexts（`context.WithCancel`、`context.WithTimeout` 或 `context.WithDeadline`）后，立即 `defer cancel()`，避免 timer leak，除非 ownership 被有意转移并记录。
- `context.Value` 只用于必须跨 API boundaries 的 request-scoped metadata，不用于 optional parameters 或 required dependencies。
- Context values 使用 unexported key type，并在读取 value 的 boundary 检查 type assertions。

### 4.2 Interfaces（接口）`[Overrides common: 5.5]`

- Interfaces 定义在使用处，而不是实现处。
- Interfaces 保持小；一两个 methods 通常够用。
- 当 callers 从 substitution 中获益时 accept interfaces；ownership 清楚时 return concrete types。
- 多个 callers 或真实 seam 尚未证明需要前，不创建 interface。
- `any`、`interface{}` 和 `reflect` 只在真实 untyped boundary 使用，例如 decoding、plugin integration、generic adapters 或 compatibility layers。
- 当 concrete types、small interfaces、type parameter 或 type switch 能让 behavior 更明确时，优先使用它们。
- Boundary 检查完成后，避免 spreading dynamic typing through typed code（avoid spreading dynamic typing）。

### 4.3 Receiver Discipline（Receiver 纪律）

- Receiver names 保持短小、一致，并源自 type name。
- Methods 会 mutate state 或 copying value 成本高时，使用 pointer receivers。
- 没有具体原因时，不要在同一个 type 上混用 pointer 和 value receivers。
- Receiver method sets 应让 type 的 mutability 一眼可见。

---

## 5. Concurrency and Resource Cleanup（并发和资源清理）

### 5.1 Goroutine Lifecycle（Goroutine 生命周期）

- 启动 goroutine 前，必须知道谁 owns its lifetime。
- Every goroutine needs a shutdown path and completion strategy。
- 在 spawn point 记录 cancellation、backpressure 和 error propagation。
- Channels 能澄清 ownership 时使用 channels；shared state 模型更清楚时使用 mutex。

### 5.2 Channel Discipline（Channel 纪律）

- Sender closes the channel，receiver 不关闭 channel。
- Sender owns channel close；多个 goroutines 能观察 channel 时，document the owner。
- nil channel 在 send 和 receive 上都会 blocks forever；只在有意禁用 `select` case 等场景使用。
- sending on a closed channel 或 closing a closed channel 会 panic。
- Buffered channels 需要具体 throughput 或 ownership reason。
- Channel operation 可能无限 block 时，使用带 `context.Done()` 的 `select`。

### 5.3 Shared State Ownership（共享状态所有权）

- 明确是 one goroutine owns state、由 `sync.Mutex` 或 `sync.RWMutex` 保护，还是 channels transfer ownership；不要静默混合这些模型。
- 第一次使用后，不要 copy values containing `sync.Mutex`、`sync.RWMutex`、`sync.WaitGroup`、`sync.Once` 或 atomic fields。
- 在 launching goroutine 前调用 `WaitGroup.Add`（before launching）；goroutine 内使用 `defer wg.Done()`；避免 Add inside the goroutine 导致它和 `Wait` 竞争。
- `sync/atomic` 只用于简单 shared state，并带清楚 ownership comment；compound invariants 重要时优先 locks。
- Type 包含 synchronization fields 或 shared mutable state 时，使用 pointer receivers 和 pointer parameters。
- 不要在未定义 ownership 时暴露 internal maps 或 slices；当 callers can mutate result 并造成 data race 或 broken invariant 时，return copies。
- Returned maps、slices 和 pointer fields 默认视为 mutable alias，除非 API 明确记录 caller owns the value。

### 5.4 Resource Cleanup（资源清理）`[Overrides common: 4.3]`

**Reason:** `defer` 会让 cleanup 可读，但前提是 resource ownership 保持明显。

- 获取 resource 后立即使用 `defer`。
- Loops 中用 helper function 或 explicit close，避免 cleanup 意外堆积。
- 记住 defer arguments are evaluated immediately；只有 cleanup 需要 function return 时的 final value 时，才使用 deferred closure。
- 避免 defer in a loop，除非每次 iteration 有自己的 function boundary，或 deferred calls 数量被有意限制。
- Timer 和 ticker 的 lifetimes 可能超过一次 receive 或一次 function call 时，要显式拥有。
- Potentially blocking I/O 要配对 cancellation、deadlines，或二者都用。
- Close what you open，即使在 error paths 上也一样。

### 5.5 Low-Level Runtime Contracts（低层 Runtime 契约）

Low-level runtime contracts 包括 panic recovery、process exit、`unsafe`、`sync.Once`、atomic operations、timer reuse、stream reads、closed-channel receive、non-blocking select 和 append capacity behavior。只有 touched code depends on that behavior 时才提出这些内容（only when touched code depends on that behavior）。

当这类 contract 重要时，note 要保持 narrow：说明 affected operation、observable risk 和 local fix。不要把此 skill 扩成 full Go runtime pitfall catalogue。

---

## 6. Composition, Wiring, and Complexity（组合、装配和复杂度）

### 6.1 Value Semantics and Embedding（值语义和嵌入）`[Overrides common: 5.1]`

- 当 explicit fields 和 method calls 比 embedding 更能说明 ownership 时，优先使用它们。
- 只有 promoted methods 被有意作为 type API 的一部分时，才使用 embedding。
- 当 type semantics 允许时，保留 useful zero value behavior。
- 通过 constructors、receivers 和 field mutability 让 pointer/value semantics 可见。
- 不要用 deep embedded graphs 或 anonymous fields 隐藏会惊讶 callers 的 coupling。

### 6.2 Initialization and Dependencies（初始化和依赖）`[Overrides common: 5.2]`

- Dependencies 通过 parameters 或 struct fields 传入。
- Wiring 放在拥有 startup 的 process boundary 或 package boundary。
- 除非 package 已有该 pattern 且 state 有清楚 lifecycle，否则避免 package-level mutable state。
- 避免 `init()` side effects 用于 configuration、I/O、goroutines、registration 或 hidden dependency setup。
- 只有 constructors 能建立 invariants、validate configuration 或说明 dependency ownership 时，才优先显式 constructors。

### 6.3 Slices, Maps, Generics, and Complexity（切片、Map、泛型和复杂度）`[Overrides common: 4.2]`

- 在 loops 中 append 或返回 subslices 时，注意 slice aliasing、capacity growth 和 copying。
- append returns the updated slice；assign the result，并记住容量不足时它可能 reallocate underlying array。
- 有合理 capacity estimate 时，pre-allocate slices。
- Callers 能通过 JSON、equality checks 或 API contracts 观察时，保留 nil versus empty slice or map behavior。
- 写入 map 前初始化；assignment to entry in nil map 会 panic，尽管 nil map 上的 reads、`len` 和 `range` 有效。
- Plain maps are not safe for concurrent map writes；shared maps 用 mutex、single goroutine ownership 或 channel ownership transfer 保护。
- Map iteration order 是 randomized；产生 deterministic output 前先 sort keys。
- 当 callers 需要 underlying element 时，不要 take the address of the range variable；index into the slice 并使用 `&items[i]`，或有意 copy value。
- 在 loop 中启动 goroutine 或创建 closure 时，根据 module Go version 或 local pattern 在需要时 copy per iteration。
- 只有 dynamic value 已知 comparable 时，才使用 interface comparison 或把 interface values 作为 map keys；比较 dynamic value 是 map, slice, or function 的 interface 可能 panic。
- Generics 只在消除真实 duplication 且保持 type-safe behavior 时使用。
- 不要用 generics simulate dynamic typing、掩盖 concrete behavior，或创建 future-only extension points。
- 只有 measurement 显示有意义时，才引入 additional complexity。

### 6.4 Strings, Numbers, and Time Values（字符串、数字和时间值）

- 明确 byte versus rune semantics；indexing string 读取 bytes，而 range over a string 会将 UTF-8 解码成 runes 和 byte offsets。
- 除非代码有意处理 bytes 并处理 invalid UTF-8，否则避免对 user-visible text 做 byte slicing。
- Integer conversion 可能改变 behavior；narrowing、changing signedness 或转换可能 overflow 的 values 前检查 bounds。
- 普通 business logic 不依赖 overflow；确实需要 wraparound behavior 时显式表达。
- `time.Duration` values 是 nanoseconds；用 `n * time.Second` 等显式表达式转换 counts，并在 review 中要求 callers multiply by time.Second 或 intended unit，而不是传 raw integers。

---

## Red Flags（风险信号）

| Thought | Reality |
|---------|---------|
| "I'll ignore this error for now" | `_ = someFunc()` 很可能成为 bug。每个 error 都要处理。 |
| "I'll use `panic` for this error" | `panic` 用于 programmer errors，不用于 runtime conditions。返回 error。 |
| "This goroutine will just run forever" | 每个 goroutine 都需要 shutdown path。 |
| "This test matrix is too small for table-driven tests" | 如果在比较 multiple scenarios，table-driven tests 能让 cases 明确且可 review。 |
| "I'll create an interface first" | 需要时再创建。Interfaces 定义在 consumer，而不是 producer。 |
| "I can stash context on the struct" | Request-scoped state 属于 parameters，不属于 shared object state。 |
| "Channels are always better than mutexes" | 选择最能说明 ownership 的模型。 |
| "I'll reshape this package while I'm here" | Existing project shape wins。除非 task 要求，否则不要 move packages、rename identifiers 或 reorganize tests。 |
| "I'll add a helper just to make the function shorter" | No-information helper 比稍长但可读的 function 更差。只提取真实概念。 |
| "This shallow test is enough" | Shallow test 如果只是调用代码、mirror implementation 或检查 weak assertion，并不能 prove behavior。 |
| "I'll hide setup in `init()`" | Hidden `init()` 会让 startup order 和 dependencies 更难 review。优先 explicit wiring。 |
| "I'll compare `err.Error()` in the test" | 除非 message text 是 behavior under test，否则用 `errors.Is` 或 `errors.As` 检查 error identity。 |
| "I'll wait with `time.Sleep()`" | 使用真实 synchronization mechanism：channels、`sync.WaitGroup`、context cancellation 或项目 fake clock。 |
| "I'll skip `cancel()` because the test is short" | Derived contexts 配 `defer cancel()`，释放 timers 和 cancellation resources。 |
| "I'll just pass this struct by value" | 不要 copy values containing locks、wait groups、once guards、atomic fields 或 shared mutable state。 |
| "Returning this map is convenient" | Returned map 或 slice 可能是 mutable alias；返回 copies 或记录 caller ownership。 |

---

## Iron Laws（铁律）

1. **Handle every error.** 对返回 errors 的 functions，不使用 `_ = someFunc()`；检查、wrap 或 propagate。
2. **Table-driven tests are the default for Go scenario matrices.** 只有 behavior 真正 stateful 或 sequential 时才选择其他模式。
3. **Every goroutine has a shutdown path.** Leaked goroutines 是带 latency 的 memory leaks。
4. **No `panic` in libraries.** Libraries 返回 errors；recovery 属于 top-level boundaries。
5. **Interfaces live at the consumer.** 在需要 substitution 的地方定义 interfaces。
6. **不要把 `context.Context` 存在 structs 上。** 显式传入。
7. **Existing project shape wins.** 不要仅凭此 skill 强推 directory layout、package boundaries、naming cleanup 或 test organization。
8. **New production functions have a size budget.** 默认保持在 40 lines 内，或说明 current-task exception reason。
9. **Tests must prove behavior.** Go test 需要 meaningful assertions、named scenarios，以及指出 broken case 的 failure output。
10. **No hidden startup behavior.** 除非 existing package pattern 和 lifecycle 支持，否则避免 package-level mutable state 和 `init()` side effects。
11. **Cancellation is owned.** Derived contexts 需要 `defer cancel()`，除非 cancellation ownership 被有意移交并记录。
12. **Concurrency tests synchronize.** `time.Sleep()` 是 last-resort guard，不是证明 goroutine 或 channel behavior 的主要方式。
13. **Shared state has one ownership model.** 使用一个 goroutine、lock 或 channel ownership transfer；混用模型容易 data race。
14. **不要复制 synchronization state。** 包含 locks、wait groups、once guards、atomic fields 或 shared mutable state 的 values 需要 pointer semantics。
15. **Go version compatibility is part of correctness.** 尊重 module 的 `go` directive，除非 task 要求，否则不改变 `toolchain` policy。

---

## Behavioral Shaping（行为塑形）

### When Touching Existing Go Code（修改既有 Go 代码时）

1. 编辑前先 read nearby tests and callers。
2. 采用满足 task 的 smallest behavior change。
3. 除非 task 要求，否则 do not move packages、rename identifiers、reorganize tests 或 clean up comments。
4. 除非 public API contract 改变，否则不要对 pre-existing exported identifiers 做 comment-only cleanup。

### When Starting a New Go File（开始新的 Go 文件时）

1. 匹配 package 的 existing public surface 和 naming conventions。
2. 引入 exported identifiers 时添加 doc comments。
3. 让 package boundaries 对下一位读者保持明显。

### When Writing Go Tests（编写 Go 测试时）

1. Start with a failing test，证明 behavior gap。
2. 对 scenario matrices 使用 table-driven tests；不要用于 one-off sequential behavior。
3. Name each table case，让失败的 subtest 指出 broken scenario。
4. Assert observable behavior、returned errors、state changes、resource cleanup 或 concurrency outcomes，而不是 helper internals。
5. 使用 `t.Parallel()` 前避免 shared mutable state。
6. 当 loop variable capture 会受 module Go version 或 local pattern 影响时，用 `tt := tt` 重新绑定 table cases。
7. 对需要 per-test restoration 的 environment variables 和 temporary resources 使用 `t.Cleanup()`。
8. Contract 暴露 wrapping、sentinels 或 error types 时，用 `errors.Is` 或 `errors.As` 断言 error identity。
9. `context.WithCancel`、`context.WithTimeout` 和 `context.WithDeadline` 搭配 `defer cancel()`。
10. 用 channels、`sync.WaitGroup`、context cancellation 或 project fake clock 进行 synchronization，而不是 `time.Sleep()`。
11. 接收 `*testing.T` 或 `testing.TB` 的 test helpers 在失败前调用 `t.Helper()`。
12. 使用 `t.TempDir()` 和 `t.Setenv` 管理 per-test resources；test mutates process-wide state 时避免 `t.Parallel()`。
13. Worker goroutines 的 failures 报回 test goroutine，不在其中直接调用 `t.Fatal`。
14. 只 mock 无法合理直接 exercise 的 external dependencies。

### When Adding a New Dependency（新增依赖时）

1. 先检查 current codebase 和 standard library。
2. 评估 dependency 是让 design 更清晰，还是只是隐藏 complexity。
3. 记录 dependency 为什么适合此 project，而不是把它当成 Go default。

### When Reviewing Go Code（审查 Go 代码时）

1. 检查 unhandled errors 和 weak error strings。
2. 验证 exported APIs、doc comments、zero value behavior，以及 concrete-versus-interface return choices。
3. 确认 `context.Context`、`ctx.Err()`、`defer cancel()` 和 `context.Value` usage 匹配 request ownership。
4. 检查 goroutines、channel or mutex ownership、`WaitGroup.Add` 和 resource cleanup 是否有 leaks 或 races。
5. 确认 maps、slices、pointer fields 和 sync-containing values 没有暴露 mutable alias 或 copy-lock risks。
6. 只在影响当前 behavior 时检查 typed nil returns、nil map writes、nil channel use 和 interface comparability。
7. 将 `any`、`interface{}`、`reflect`、generics、interfaces、wrappers 和 helpers 绑定到 current evidence。
8. 检查 range variable address use、closure capture、short variable declaration shadowing、naked return 和 changed code 附近的 defer evaluation。
9. 数据跨 boundary 时检查 byte versus rune behavior、integer conversion、overflow assumptions 和 `time.Duration` units。
10. 只有 touched code 依赖相关 behavior 时才提出 low-level runtime contracts。
11. 拒绝 no-information helpers、speculative interfaces 和 hidden startup behavior。
12. 多个 scenarios 被 exercise 时，寻找 table-driven tests。
13. 拒绝 shallow tests、mirror implementation tests、weak assertions 和 non-diagnostic failures。
14. 当 identity 是 contract 时，确认 error assertions 使用 `errors.Is` 或 `errors.As`。
15. 确认 concurrency tests 使用 deterministic synchronization，而不是 `time.Sleep()`。
16. 检查 test helpers、temporary resources、environment variables 和 goroutine failure reporting 是否提供 useful diagnostics。
