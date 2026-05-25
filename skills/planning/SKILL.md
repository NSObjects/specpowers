---
name: planning
description: "当已批准的 requirements 和 design 需要一份可追溯、bite-sized、test-first 的实现计划时使用。"
---

# 规划 Skill（Planning Skill）

当 requirements/spec scenarios 和 design direction 已经达成一致，下一步是创建由小型 test-first tasks 组成的 implementation plan 时，使用此 skill。

**开始时宣布：**“我正在使用 planning skill 创建 implementation plan。”

**角色：Tech Lead。** 把 approved specs 和 design 拆成可执行、可独立验证的 tasks。每个 task 必须足够具体，让另一个 engineer 或 agent 不需要猜测即可实现。

**主要输出：** `specs/changes/<change-name>/tasks.md`

## 硬门槛（Hard Gates）

- 不要在此 skill 中写 implementation code。
- Task descriptions 中不要包含 code blocks、diffs、pseudocode、function bodies、imports、具体 control flow 或 inline implementation snippets。
- Tasks 只能命名 files、tests、responsibilities、observable behavior、acceptance criteria 和 verification commands。精确代码留给 `spec-driven-development`。
- 没有用户明确批准 plan 前，不要进入 implementation。
- 写 tasks 前读取相关 specs、design 和 existing code。如果找不到必需 source，提出一个聚焦问题，不要发明细节。
- 每个 task 必须包含 `Covers specs:` field。
- Business-logic、validation、error-handling、integration 和 UI tasks 必须映射到至少一个具体 Spec Scenario。
- Pure infrastructure tasks 只有在启用后续行为时才允许。标记为 `Covers specs: Infrastructure — enables <specific scenario/task>`。
- 每个 behavior task 必须以 failing test step 开始，并包含 RED/GREEN verification。
- 每个 task 必须列出具体 file paths、test command(s) 和 acceptance criteria。
- No placeholders：绝不写 `TBD`、`TODO`、`implement later`、`similar to above`，也不要写没有确切 acceptance criteria 的含糊说明，例如 "add validation"。

## 必需输入（Required Inputs）

Planning 前，识别或推断：

- **Change name:** 用于 `specs/changes/<change-name>/tasks.md`。
- **Spec files:** scenario definitions、requirements、acceptance criteria 或 GIVEN/WHEN/THEN statements。
- **Design files:** architecture、API choices、data model、interfaces、constraints 或 implementation approach。
- **Repository context:** source layout、naming conventions、test framework、existing commands。
- **Execution constraints:** user preferences、language rules、CI expectations、backwards-compatibility constraints。

如果存在多种解释，选择最直接被 specs/design 支持的一种。在 plan 的 `Assumptions` 下写明任何假设。

## 规划工作流（Planning Workflow）

1. **读取 specs 和 design**
   - 把每个 Spec Scenario 抽取到 scenario inventory。
   - 捕获每个 scenario 的 preconditions、action、expected result 和 edge cases。

2. **读取 existing code**
   - 识别 existing modules、interfaces、test conventions、fixtures、mocks 和 command patterns。
   - 尽可能复用 established naming 和 structure。

3. **映射 files**
   - 精确决定哪些 files 会被创建或修改。
   - 区分 production files 和 test files。
   - 记录 files 与 tasks 之间的依赖。

4. **拆解 tasks**
   - 每个 task 应实现一个连贯 behavior 或一个 enabling infrastructure unit。
   - Business behavior 必须追溯到 Spec Scenarios。
   - Edge cases 和 error handling 是一等行为，不是事后补充。

5. **按依赖排序**
   - Foundation first：configuration、types、interfaces、fixtures。
   - Core behavior next：business rules 和 domain logic。
   - Integration/wiring next：API routes、adapters、handlers、UI wiring。
   - Edge cases、error paths 和 regression coverage 在依赖存在后尽早处理。

6. **写 TDD steps**
   - RED：写一个带具体名称和预期失败原因的 failing test。
   - GREEN：描述满足测试的最小 production responsibility，不写代码。
   - VERIFY：运行具体 test command，并写明 expected result。

7. **自审和修复**
   - 检查 traceability、granularity、dependency order、file paths、commands 和 placeholder language。
   - 在呈现 plan 前修复问题。

8. **停止等待批准**
   - 呈现或保存 plan。
   - 请用户选择 execution mode。
   - 用户批准前，不要调用 implementation。

当 subagents 可用时，在用户批准 plan 并选择 execution mode 后、`planning → spec-driven-development` handoff 前，使用 `../confidence-loop/SKILL.md` 中的 Workflow Handoff Confidence Loop，并使用 `../confidence-loop/workflow-handoff-reviewer-prompt.md`。

Review package 必须包含 `tasks.md`、`Spec Coverage Summary`、相关 specs、相关 design constraints、精确 test commands、execution mode decision、assumptions、repository constraints 和任何 `Open Planning Blockers`。

当仍有 Critical 或 Important findings、`NEEDS_USER_DECISION` 或 Unresolved Confidence Gaps 时，不要进入 `spec-driven-development`。

如果 handoff loop 改变了 `tasks.md`、assumptions、scope、test commands 或 execution-relevant content，必须呈现更新后的 plan，并再次获得用户批准和 execution mode confirmation，然后才能进入 `spec-driven-development`。

## Scenario Inventory 格式

在 task list 前包含简洁 inventory，便于审计 coverage：

```markdown
## Spec Coverage Summary

| Spec Scenario | Requirement | Covered by Task(s) | Notes |
| --- | --- | --- | --- |
| `specs/<domain>/spec.md` → Scenario "<name>" | "<requirement name>" | Task 1.1 | <important constraint or edge case> |
```

每个 scenario 都必须出现在表中。如果某个 scenario 因 spec 缺失或矛盾而无法规划，把它列入 `Open Planning Blockers`，不要静默遗漏。

## Task 粒度规则（Task Granularity Rules）

好的 task：

- 能在一次短实现中完成。
- 可用 1-3 个聚焦 tests 验证。
- 能用一句话描述。
- 适合一个有意义 commit。
- 完成后可独立 compile 和 test。

如果满足以下任一条件，task **太大**：

- 触碰超过 3 个 production files。
- 超过 5 个 steps。
- 覆盖超过 2 个 Spec Scenarios。
- 混合无关 concerns，例如 schema changes、business rules 和 API wiring。
- 无法用一句话总结。

如果满足以下任一条件，task **太小**：

- 只重命名一个变量或添加一个 import。
- 没有 observable behavior、compile 或 test impact。
- 会产生无意义 commit。

Task 太大时，按 behavior、dependency 或 boundary 拆分。Task 太小时，合并到最近的相关 behavior task。

## 依赖规则（Dependency Rules）

Tasks 必须排序，确保每个 task 完成后项目仍处于可工作状态。

- 如果 Task B import 或 call Task A 创建的内容，Task A 必须先做。
- 如果 Task B 修改 Task A 创建的文件，明确说明依赖。
- 如果 task 需要 fixture、mock、schema 或 interface，在更早 infrastructure task 中创建，或在同一个小 task 中创建。
- 绝不要写一个故意让 compilation 或 tests 坏到后续 task 才修复的 task。

## Task 格式

使用 `## N. [Module or Feature Boundary]` 表示 feature group。`## 1. [Module Name]` 是 canonical feature group heading shape。每个 task 使用 `### Task N.M: [Specific behavior]`；`Task N.M` entries 是该 feature group 中的 subtasks。

````markdown
# Tasks

## Assumptions

- [Only include assumptions that are necessary and grounded in the specs/design.]

## Spec Coverage Summary

| Spec Scenario | Requirement | Covered by Task(s) | Notes |
| --- | --- | --- | --- |
| `specs/<domain>/spec.md` → Scenario "<name>" | "<requirement name>" | Task 1.1 | <constraint> |

## 1. [Module or Feature Boundary]

### Task 1.1: [Specific Behavior]
**Type:** behavior | infrastructure | integration | error-path | regression
**Covers specs:** `specs/<domain>/spec.md` → Requirement "<name>" → Scenario "<name>"
**Depends on:** none | Task N.M
**Files:**
- `path/to/test_file.ext` — add/modify focused tests
- `path/to/source_file.ext` — implement the required behavior
**Test command:** `<exact command>`

**Acceptance criteria:**
- GIVEN <specific precondition> WHEN <specific action> THEN <specific expected result>
- GIVEN <specific edge case> WHEN <specific action> THEN <specific expected result>

- [ ] **Step 1: Write failing test**
  File: `path/to/test_file.ext`
  Test name: `<descriptive test name>`
  Expected RED result: FAIL because `<specific missing behavior or assertion failure>`

- [ ] **Step 2: Verify RED**
  Run: `<exact command>`
  Expected: FAIL for `<specific reason>`, not because of compile/setup errors.

- [ ] **Step 3: Describe minimal production responsibility**
  File: `path/to/source_file.ext`
  Responsibility: `<observable responsibility the implementation must provide; do not include code, pseudocode, or control-flow steps>`

- [ ] **Step 4: Verify GREEN**
  Run: `<exact command>`
  Expected: PASS
````

### 基础设施任务变体（Infrastructure Task Variant）

仅在 setup 会启用后续 behavior tasks 时使用此变体。

````markdown
### Task 1.0: [Specific infrastructure setup]
**Type:** infrastructure
**Covers specs:** Infrastructure — enables Task 1.1 for `specs/<domain>/spec.md` → Scenario "<name>"
**Depends on:** none | Task N.M
**Files:**
- `path/to/file.ext` — create shared type/interface/config/fixture
**Test command:** `<compile, lint, or smoke-test command>`

**Acceptance criteria:**
- GIVEN the project is checked out WHEN `<command>` runs THEN it completes successfully.
- GIVEN Task 1.1 starts WHEN it imports this artifact THEN the referenced file/type/function exists.

- [ ] **Step 1: Create infrastructure artifact**
  File: `path/to/file.ext`
  Responsibility: `<specific enabling responsibility; do not include code, pseudocode, or control-flow steps>`

- [ ] **Step 2: Verify infrastructure**
  Run: `<exact command>`
  Expected: PASS
````

## 禁止占位符规则（No-Placeholder Rules）

以下内容会让 plan 失败，呈现 plan 前必须重写：

- `TBD`、`TODO`、`later`、`future work`、`fill in details`。
- 没有命名 error condition 和 expected behavior 的 `Add proper error handling`。
- 没有确切 invalid inputs 和 expected outputs 的 `Add validation`。
- 没有 test file、test name、GIVEN/WHEN/THEN 和 expected RED reason 的 `Write tests`。
- 没有 source file 和 responsibility 的 `Implement the logic`。
- Task 中出现任何 fenced code block、diff、pseudocode、function body、import list 或具体 control-flow sequence。
- `Same as previous task`、`similar to Task N`，或迫使读者推断缺失细节的引用。
- 不精确 file path。
- 不精确 command。

## 自审清单（Self-Review Checklist）

起草完整 plan 后，执行此 review 并在结尾包含结果。

```markdown
## Self-Review

- [ ] **Spec coverage:** Every Spec Scenario appears in `Spec Coverage Summary` and maps to at least one Task.
- [ ] **No unmapped behavior:** Every non-infrastructure task has a concrete Spec Scenario mapping.
- [ ] **Infrastructure justified:** Every infrastructure task names the behavior task or scenario it enables.
- [ ] **No placeholders:** The plan contains no `TBD`, `TODO`, vague validation/error handling, or inferred steps.
- [ ] **No implementation content:** The plan contains no code blocks, diffs, pseudocode, function bodies, imports, or concrete control-flow steps.
- [ ] **Test-first:** Every behavior, integration, error-path, and regression task starts with a failing test.
- [ ] **Concrete commands:** Every task has an exact test, compile, lint, or smoke-test command.
- [ ] **Concrete files:** Every task lists exact file paths and responsibilities.
- [ ] **Granularity:** No task has more than 5 steps, more than 3 production files, or more than 2 Spec Scenarios.
- [ ] **Dependency order:** Tasks are ordered so the project compiles and relevant tests pass after each task.
- [ ] **Consistency:** Later tasks reference files, types, and responsibilities created by earlier tasks accurately.
```

如果任何条目失败，在呈现 plan 前修订。

## 红旗和修正（Red Flags and Corrections）

| Red Flag | Correction |
| --- | --- |
| "This is one big task, but it is all related." | 按 behavior、file boundary 或 scenario 拆分。 |
| "The implementation details can be decided later." | Planning 定义哪些 behavior 改变以及在哪里改变。除非 design 要求，不要指定 internal algorithms。 |
| "Tests are obvious." | 写出 GIVEN/WHEN/THEN 和 expected RED reason。 |
| "Dependency order does not matter." | 重新排序 tasks，直到每个 task 都能独立通过。 |
| "Error handling can be a later task." | Error handling 是 behavior。把它映射到相关 scenario，或创建 scenario-backed error-path task。 |
| "This infrastructure task has no spec mapping." | 把它标为 infrastructure，并命名它启用的 scenario 或 task。 |

## Planning 后最终回复（Final Response After Planning）

保存或呈现 plan 后，回复：

```markdown
Implementation plan saved to `specs/changes/<change-name>/tasks.md`.

Summary:
- [N] tasks
- [M] Spec Scenarios covered
- [K] infrastructure tasks
- [0 or list] open planning blockers

Two execution modes are available:
1. **Step-by-Step Mode** — implement one task at a time; review and commit after each task.
2. **Fast Mode** — implement tasks continuously; review all completed work at the end.

Which mode should be used?
```

用户选择 mode 后，转入 implementation skill，例如 `spec-driven-development` 或仓库配置的 execution skill。
