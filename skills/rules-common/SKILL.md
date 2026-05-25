---
name: rules-common
description: 编写、审查或修改任何语言的代码时使用；提供跨语言通用编码规则，并可被语言专属 rule skills 覆盖。
---

# 通用编码规则（Universal Coding Rules）

这些规则适用于所有 programming languages。语言专属 rule skills（例如 `rules-typescript`、`rules-python`）继承这些规则，并可覆盖标记为 `[Overridable]` 的条目。

**覆盖机制：** 当语言规则声明 `[Overrides common: X.Y]` 时，该语言专属版本会替换使用该语言的项目中的 common rule。

---

## 1. Coding Style（编码风格）

### 1.1 Naming Clarity（命名清晰度）`[Overridable]`

使用描述性、能表达意图的命名。除非缩写在领域内被普遍理解（例如 `id`、`url`、`http`），否则避免缩写。

- Variables：描述保存的内容，而不是类型。
- Functions：描述要做的动作，通常以动词开头。
- Booleans：使用 `is`、`has`、`should`、`can` 等前缀。

### 1.2 Function Size（函数规模）`[Overridable]`

函数应聚焦单一责任。如果函数需要注释解释“它做什么”，说明它已经太复杂，应拆分。

- 目标是函数能放进一个屏幕内（约 30 行）。
- 当逻辑分支超过 2 层嵌套时，考虑提取 helper functions。

### 1.3 File Organization（文件组织）`[Overridable]`

一个 module 对应一个概念。把相关功能放进内聚文件。避免 “utils” 或 “helpers” 大杂烩；文件名应表达其中包含的概念。

### 1.4 Comments and Documentation（注释和文档）

注释解释 **why**，不是 **what**。代码说明发生了什么；注释说明意图、取舍和不明显的决定。

- Public APIs 需要记录 purpose、parameters、return values 和 edge cases。
- 删除 commented-out code；version control 已经保存历史。

### 1.5 Consistent Formatting（一致格式化）`[Overridable]`

使用项目既有 formatter。若项目没有 formatter，采用语言社区标准 formatter。不要在同一项目中混用多种格式风格。

### 1.6 Magic Values（魔法值）

逻辑中不要出现 magic numbers 或 magic strings。将它们提取为命名常量，并用名称说明用途。

---

## 2. Testing（测试）

### 2.1 Test-First When Possible（可行时测试先行）`[Overridable]`

在实现前或实现过程中编写 tests。Tests 是 specifications；它们记录代码应做什么。

### 2.2 Test Naming（测试命名）

Test names 描述场景，而不是实现。使用模式：`[unit] [condition] [expected result]`。

### 2.3 Test Independence（测试独立性）

每个 test 必须独立；不要在 tests 之间共享 mutable state，也不要依赖执行顺序。单独运行失败但 suite 中通过，或反过来的 test，都是有问题的。

### 2.4 Test Coverage Strategy（测试覆盖策略）`[Overridable]`

测试 behavior，而不是 implementation。重点覆盖：

- Happy path（常见路径）。
- Edge cases（空输入、边界、nulls）。
- Error paths（无效输入、失败）。
- Algorithmic logic 的 property-based tests。

### 2.5 No Mocks for Core Logic（核心逻辑不做 mock）

不要 mock system under test。Mocks 用于 external dependencies（network、filesystem、databases），不是用于正在验证的代码。

### 2.6 Assertion Quality（断言质量）

每个 test 应有清晰、具体的 assertions。避免一个 test 验证太多事情。每个 test 聚焦一个 logical assertion；如果多个 `assert` 调用验证的是同一行为，也可以接受。

---

## 3. Security（安全）

### 3.1 Input Validation（输入校验）

在 system boundaries 校验所有 external input。来自 users、APIs、files 或 environment variables 的数据，未经 validation 一律不可信。

### 3.2 Secrets Management（密钥管理）

不要 hardcode secrets、API keys、tokens 或 passwords。使用 environment variables 或 secret management systems。即使是 debug level，也不要记录 secrets。

### 3.3 Least Privilege（最小权限）

只请求所需 permissions。File access、network access、database access 都应限制到最小必要范围。

### 3.4 Dependency Awareness（依赖意识）

了解 dependencies。新增 dependency 前先 audit。优先选择维护良好、具备活跃 security response 的 packages。Production 中固定 versions。

### 3.5 Error Message Safety（错误信息安全）

展示给 users 的 error messages 不得泄露 internal details（stack traces、file paths、database schemas、internal IPs）。内部日志可记录细节，外部只展示 generic messages。

### 3.6 SQL and Injection Prevention（SQL 和注入防护）`[Overridable]`

使用 parameterized queries 或 prepared statements。不要把 user input 拼接进 queries、commands 或 templates。

---

## 4. Performance（性能）

### 4.1 Measure Before Optimizing（优化前先测量）

没有 evidence 不做优化。先 profile，识别 bottleneck，再优化具体路径。Premature optimization 会遮蔽意图。

### 4.2 Algorithm Complexity Awareness（算法复杂度意识）`[Overridable]`

选择合适的数据结构和 algorithms。了解 operations 的 Big-O。隐藏在 O(n) loop 内的 O(n²) loop 实际是 O(n³)；注意 nested iterations。

### 4.3 Resource Cleanup（资源清理）`[Overridable]`

打开的资源要关闭。File handles、database connections、network sockets、timers 都必须在 error paths 上也能 cleanup。使用语言提供的 resource management patterns（try-with-resources、defer、using、context managers）。

### 4.4 Avoid Premature Caching（避免过早缓存）

Caching 会增加 complexity（invalidation、staleness、memory pressure）。只有 measurement 表明需要时才添加 caching，并且必须定义 invalidation strategy。

### 4.5 Batch Over Chatty（批量优先）`[Overridable]`

优先使用 batch operations，避免大量小操作。一次 query 返回 100 rows 优于 100 次 query 各返回 1 row。Database calls、API requests 和 file I/O 都适用。

---

## 5. Design Patterns（设计模式）

### 5.1 Composition Over Inheritance（组合优于继承）`[Overridable]`

优先从小而聚焦的 components 组合 behavior，避免深层 inheritance hierarchies。Inheritance 会产生 tight coupling；composition 更灵活。

### 5.2 Dependency Injection（依赖注入）`[Overridable]`

通过参数传入 dependencies，而不是在内部创建。这样代码更容易测试和配置。Hard-coded dependencies 是隐藏耦合。

### 5.3 Fail Fast（快速失败）

尽早验证 preconditions，并用清晰 error messages 立即失败。不要让 invalid state 在系统中继续传播。

### 5.4 Immutability by Default（默认不可变）`[Overridable]`

优先使用 immutable data structures。Mutation 是常见 bug 来源，尤其在 concurrent code 中。需要 mutation 时，要限制范围，最小化 mutable state。

### 5.5 Interface Segregation（接口隔离）

不要强迫 consumers 依赖不用的方法。优先使用小而聚焦的 interfaces，而不是庞大的 general-purpose interfaces。

### 5.6 Error Handling Strategy（错误处理策略）`[Overridable]`

显式处理 errors。不要静默吞掉 exceptions。为项目选择一致 error handling pattern（exceptions、result types、error codes）并坚持使用。

### 5.7 Research Before Reinvention（复用前先调研）

推荐 custom code 前，先研究已有方案。先看 current codebase，再查看项目 language 和 runtime 中最相关的 external solutions。

- 先搜索 project codebase，避免重复内部实现。
- Research 用于 implementation 或 technology decisions，不作为单独 workflow stage。
- 决策必须明确：**Adopt / Extend / Compose / Build**。
- 选择 Build 时，记录 existing solutions 为什么不足。

---

## 6. Git Workflow（Git 工作流）

### 6.1 Atomic Commits（原子提交）

每个 commit 表示一个 logical change。不要混合 refactoring 与 feature work；不要混合 formatting changes 与 behavior changes。

### 6.2 Commit Messages（提交信息）

Commit messages 解释变更的 **why**，不仅是 what。Diff 展示改了什么；message 说明意图。

格式：`<type>: <short summary>`，可选 body 用于补充 context。

### 6.3 Branch Hygiene（分支卫生）

Branches 应短生命周期且聚焦。一个 branch 对应一个 feature 或 fix。定期从 main rebase 或 merge，避免漂移。

### 6.4 Review Before Merge（合并前审查）

所有 code changes 合并前都应 review。最低要求是 self-review；像审查别人写的代码一样读自己的 diff。

### 6.5 No Generated Files in VCS（VCS 中不提交生成文件）`[Overridable]`

不要 commit generated files（build artifacts、compiled output、非 root packages 的 lock files）。用 `.gitignore` 排除。例外：project root 的 lock files（如 `package-lock.json`、`pnpm-lock.yaml`）应提交。

### 6.6 Sensitive Data Protection（敏感数据保护）

不要把 secrets、credentials 或 PII commit 到 version control。使用 pre-commit hooks 或 scanning tools 捕捉误提交。若 secret 已提交，应立即 rotate；仅从 history 移除不够。

---

## 7. Change Discipline（变更纪律）

### 7.1 Minimum Necessary Complexity（最小必要复杂度）

优先选择满足已确认 user request、specifications、task、tests 和 repository constraints 的最简单方案（minimum necessary complexity / least complex solution）。

- 以 current evidence 作为新增结构的边界：confirmed user request, specifications, task, tests, and repository constraints、failing tests、safety constraints、compatibility needs 或 established repository patterns。
- 只有 current evidence 要求时，才添加 abstraction、configuration、extension points、caching、strategy layers 或 wrappers。
- 如果 extra structure 必要，要在 implementation notes、review notes 或附近 documentation 中让原因可追溯。

### 7.2 No Speculative Complexity（不添加猜测性复杂度）

不要为 hypothetical future requirements 增加 complexity。

- 当 speculative configuration、plugin points、strategy interfaces、multi-backend support、generalized parameters、caches、adapters 或 wrappers 只服务于未确认未来需求时，拒绝实现它们。
- 如果 future extension 有价值但超出当前 scope，只作为 out-of-scope observations 报告，不放进当前实现。

### 7.3 Current-Change Orphan Cleanup Only（仅清理当前变更产生的孤儿）

除非用户或已接受 specification 明确要求更大范围 cleanup，否则 cleanup 限制为 current-change orphan cleanup。

- 删除或更新当前变更直接导致 unused 或 invalid 的 imports, variables, functions, test helpers, or documentation fragments。
- 保留 pre-existing dead code、bad names, formatting inconsistencies, or neighboring design problems，只要它们不影响当前 request、task、failing test 或 review feedback。
- 将既有无关问题作为 out-of-scope observations 报告，不要混入当前 change。

---

## Red Flags（风险信号）

出现这些想法时，说明你可能要违反规则；停下来重新判断：

| Thought | Reality |
|---------|---------|
| "I'll clean this up later" | 如果 cleanup 属于 current scope，现在处理；否则作为 out-of-scope observation 报告。 |
| "It's just a small hack" | 小 hack 会累积。遵守规则，或记录例外原因。 |
| "Nobody will see this code" | 三个月后你会再看到它，并忘记当时为什么这样写。 |
| "The tests are slowing me down" | Tests 正在帮未来的你节省调试时间。 |
| "I'll add tests after" | 没有 tests 的代码通常会以没有 tests 的状态交付。现在写。 |
| "This secret is just for testing" | Test secrets 也会泄漏到 production。从一开始就用 env vars。 |
| "Performance doesn't matter yet" | 也许暂时不重要，但 O(n³) 永远重要。知道你的 complexity。 |
| "I know this works, no need to test" | 没有 evidence 的 confidence 是 bug 的首要来源。 |
| "Let me just commit everything together" | Atomic commits 让 debugging、reverting 和 reviewing 成为可能。 |
| "This override is fine without documenting why" | 未记录原因的 override 会变成难解的 bug。始终解释。 |
| "I'll just build it; research can come later" | 重造已有方案会制造可避免的 maintenance burden。先搜索，再决定。 |

---

## Iron Laws（铁律）

这些规则不可协商；没有例外，也没有“就这一次”。

1. **代码中不得出现 secrets。** 永远不行。不是“临时”，也不是“只给本地开发”。只用 environment variables 或 secret managers。
2. **未经测试的代码不得交付。** 值得写的代码也值得测试。若无法测试，重新设计。
3. **不得静默失败。** 每条 error path 都必须显式处理。Swallowed exceptions 是隐藏 bug。
4. **外部输入必须校验。** 所有跨 trust boundary 的 data 都要 validation，没有例外。
5. **没有 review 不合并。** 至少 review 自己的 diff；最好让其他人 review。
6. **逻辑中不得有 magic values。** Conditional 或 calculation 里的 literal 都应有 named constant。
7. **不得复制粘贴重复代码。** 如果在复制代码，就应抽取。Duplication 会放大维护成本。

---

## Behavioral Shaping（行为塑形）

### When Starting a New File（开始新文件时）

1. 检查项目是否已有同类型文件的 established structure。
2. 遵循 existing patterns；一致性优先于个人偏好。
3. 将文件放到项目层级中的合适位置。

### When Modifying Existing Code（修改既有代码时）

1. 先读 surrounding code，理解 local conventions。
2. 匹配 existing style，即使你个人偏好不同。
3. 如果 existing style 违反这些规则，把风格修复放在独立 change 中处理。

### When Adding Dependencies（新增依赖时）

1. 先搜索 project codebase；功能可能已经存在。
2. 评估 dependency：maintenance status、security record、license compatibility、size。
3. 固定 version，并记录为什么选择这个 dependency。

### When Reviewing Code（审查代码时）

1. 系统地按这些规则检查，不要只靠直觉。
2. 优先级：security issues > correctness bugs > design problems > style nits。
3. 给出具体、可执行、带 examples 的 feedback。
