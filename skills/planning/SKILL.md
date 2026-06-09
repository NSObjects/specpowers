---
name: planning
description: "当已批准的需求、Spec 场景和设计方向需要被拆解为可追踪、小粒度、测试先行的实施计划时使用。"
---

# Planning Skill（规划技能）

## 适用场景

当需求、Spec 场景和设计方向已经达成一致，并且下一步是创建由小粒度、测试先行任务组成的实施计划时，使用本 Skill。

**启动说明：** “我正在使用 planning skill 创建实施计划。”

**角色：** 技术负责人（Tech Lead）。将已批准的规格和设计拆解为可执行、可独立验证的任务。每个任务都必须具体到另一名工程师或 agent 无需猜测即可执行。

**主要产物：** `specs/changes/<change-name>/tasks.md`

**核心原则：** 本 Skill 只负责规划，不负责编写实现代码。计划必须可追踪、可验证、可审阅，并在进入实现前获得用户明确批准。

> 兼容性约定：为了便于既有工作流、审阅器或自动化脚本识别，任务模板中的关键字段名保留英文，例如 `Task N.M`、`Type:`、`Covers specs:`、`Depends on:`、`Files:`、`Test command:`、`Acceptance criteria:`、`Spec Coverage Summary`、`Self-Review`、`Open Planning Blockers`。字段内容可以使用中文。

## 硬性门槛

- 不得在本 Skill 中编写实现代码。
- 任务描述中不得包含代码块、diff、伪代码、函数体、imports、具体控制流或内联实现片段。
- 任务只能描述文件、测试、职责、可观察行为、验收标准和验证命令。具体代码留给 `spec-driven-development` 或仓库配置的实现 Skill。
- 未获得用户对计划的明确批准之前，不得进入实现。
- 编写任务前必须阅读相关 specs、设计文档和现有代码。如果必要来源缺失，提出一个聚焦问题；不要编造细节。
- 每个任务都必须包含 `Covers specs:` 字段。
- 业务逻辑、校验、错误处理、集成和 UI 任务必须映射到至少一个具体的 Spec Scenario。
- 纯基础设施任务只允许在它能支撑后续行为时出现，并标记为 `Covers specs: Infrastructure — enables <specific scenario/task>`。
- 每个行为任务都必须从失败测试开始，并包含 RED/GREEN 验证。
- 每个任务都必须列出具体文件路径、测试命令和验收标准。
- 禁止占位符：不得写 `TBD`、`TODO`、`implement later`、`similar to above`，也不得写“添加校验”“处理错误”等没有精确验收标准的模糊指令。
- 计划中的每个任务完成后，项目都应保持可编译、可运行相关测试的状态；不得故意把破损状态留给后续任务修复。

## 必需输入

开始规划前，需要识别或合理推断以下信息：

- **Change name：** 用于生成 `specs/changes/<change-name>/tasks.md`。
- **Spec files：** 场景定义、需求、验收标准或 GIVEN/WHEN/THEN 语句。
- **Design files：** 架构、API 选择、数据模型、接口、约束或实现方向。
- **Repository context：** 源码结构、命名约定、测试框架、已有命令和 CI 习惯。
- **Execution constraints：** 用户偏好、语言规则、CI 预期、向后兼容约束和仓库特定限制。

如果存在多种解释，优先采用 specs/design 中最直接支持的解释，并在计划的 `Assumptions` 中明确说明。如果 specs 与 design 冲突，或缺少足以规划的来源，将相关内容列入 `Open Planning Blockers`，不要静默忽略。

## 规划工作流

1. **阅读 specs 和设计**
   - 提取每个 Spec Scenario，形成场景清单。
   - 捕获每个场景的前置条件、触发动作、期望结果和边界情况。
   - 标记冲突、缺失或无法验证的场景。

2. **阅读现有代码**
   - 识别已有模块、接口、测试约定、fixtures、mocks 和命令模式。
   - 尽量复用既有命名、目录结构和测试风格。
   - 确认可用的最小验证命令，避免使用近似命令。

3. **映射文件**
   - 明确哪些文件会被创建或修改。
   - 区分生产文件和测试文件。
   - 记录文件之间、任务之间的依赖关系。

4. **拆解任务**
   - 每个任务实现一个连贯行为，或一个必要的基础设施单元。
   - 业务行为必须回溯到 Spec Scenario。
   - 边界情况、错误路径和回归覆盖是一等行为，不是附属工作。

5. **按依赖排序**
   - 先放基础：配置、类型、接口、fixtures。
   - 再放核心行为：业务规则、领域逻辑。
   - 然后放集成/装配：API routes、adapters、handlers、UI wiring。
   - 在依赖满足后，尽早安排边界情况、错误路径和回归覆盖。

6. **编写 TDD 步骤**
   - RED：写一个具名失败测试，并说明预期失败原因。
   - GREEN：描述满足该测试所需的最小生产职责，不写代码。
   - VERIFY：给出具体测试命令和预期结果。

7. **自审并修复**
   - 检查可追踪性、粒度、依赖顺序、文件路径、命令和占位语言。
   - 在展示计划前修复发现的问题。

8. **停止并等待批准**
   - 展示或保存计划。
   - 要求用户选择执行模式。
   - 用户批准前，不得调用实现 Skill。

## Handoff 信心循环

当 subagents 可用时，在用户批准计划并选择执行模式后、从 `planning` 交接到 `spec-driven-development` 之前，使用 `../confidence-loop/SKILL.md` 中的 Workflow Handoff Confidence Loop，并结合 `../confidence-loop/workflow-handoff-reviewer-prompt.md` 执行交接审查。

审查包必须包含：

- `tasks.md`
- `Spec Coverage Summary`
- 相关 specs
- 相关设计约束
- 精确测试命令
- 执行模式决策
- assumptions
- repository constraints
- 所有 `Open Planning Blockers`

如果存在 Critical 或 Important findings、`NEEDS_USER_DECISION`、未解决的 Confidence Gaps，不得进入 `spec-driven-development`。

如果 handoff loop 修改了 `tasks.md`、assumptions、scope、测试命令或任何影响执行的内容，必须向用户展示更新后的计划，并重新获得计划批准和执行模式确认，然后才能进入 `spec-driven-development`。

## 场景清单格式

在任务列表之前包含精简清单，便于审计覆盖情况：

```markdown
## Spec Coverage Summary

| Spec Scenario | Requirement | Covered by Task(s) | Notes |
| --- | --- | --- | --- |
| `specs/<domain>/spec.md` → Scenario "<name>" | "<requirement name>" | Task 1.1 | <important constraint or edge case> |
```

每个场景都必须出现在该表中。如果某个场景因为 spec 缺失、冲突或不可验证而无法规划，将其列入 `Open Planning Blockers`，不要静默省略。

建议在 `Notes` 中记录重要边界条件、错误条件、向后兼容要求或验收限制。

## Open Planning Blockers 格式

当存在无法安全规划的内容时，在任务列表前加入该章节；没有阻塞项时可写“无”。

```markdown
## Open Planning Blockers

- `specs/<domain>/spec.md` → Scenario "<name>"
  - Blocker: <missing source, contradiction, or decision required>
  - Needed from user/repo: <specific document, decision, or clarification>
  - Impact: <which task or behavior cannot be planned>
```

## 任务粒度规则

一个好的任务应满足：

- 能在一次短实现周期内完成。
- 可用 1–3 个聚焦测试验证。
- 能用一句话描述。
- 适合作为一次有意义的 commit。
- 完成后可独立编译并通过相关测试。

如果满足以下任一条件，任务过大：

- 触及超过 3 个生产文件。
- 超过 5 个步骤。
- 覆盖超过 2 个 Spec Scenarios。
- 混合无关关注点，例如 schema 变更、业务规则和 API wiring 混在一个任务中。
- 无法用一句话概括。

如果满足以下任一条件，任务过小：

- 只是重命名变量或添加 import。
- 没有可观察行为、编译影响或测试影响。
- 会产生没有意义的 commit。

任务过大时，按行为、依赖或边界拆分。任务过小时，合并到最接近的相关行为任务中。

## 依赖规则

任务必须按顺序排列，确保每个任务完成后项目都处于可工作的状态。

- 如果 Task B 导入或调用 Task A 创建的内容，Task A 必须在前。
- 如果 Task B 修改 Task A 创建的文件，必须显式说明依赖。
- 如果某任务需要 fixture、mock、schema 或 interface，应在更早的基础设施任务中创建，或在同一个小任务中创建。
- 不得编写会故意让编译或测试保持失败、等待后续任务修复的任务。
- 每个任务的验证命令应只验证该任务影响范围；如仓库约定要求全量命令，可以同时列出聚焦命令和全量命令。

## 任务格式

使用 `## N. [Module or Feature Boundary]` 作为功能组标题。`## 1. [Module Name]` 是标准功能组标题形状。每个任务使用 `### Task N.M: [Specific behavior]`；`Task N.M` 是该功能组下的子任务编号。

字段名保持英文，字段值可以使用中文。模板如下：

````markdown
# Tasks

## Assumptions

- [Only include assumptions that are necessary and grounded in the specs/design.]

## Open Planning Blockers

- 无

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

### 基础设施任务变体

仅当某项设置能支撑后续行为任务时使用该变体。

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

## 禁止占位符规则

以下内容都属于计划失败，必须在展示计划前重写：

- `TBD`、`TODO`、`later`、`future work`、`fill in details`。
- “Add proper error handling”，但没有命名错误条件和期望行为。
- “Add validation”，但没有精确说明非法输入和期望输出。
- “Write tests”，但没有测试文件、测试名称、GIVEN/WHEN/THEN 和预期 RED 原因。
- “Implement the logic”，但没有源文件和职责描述。
- 在任务中出现任何代码块、diff、伪代码、函数体、import list 或具体控制流序列。
- “Same as previous task”“similar to Task N”，或任何要求读者自行推断缺失细节的引用。
- 近似文件路径，而非精确路径。
- 近似命令，而非精确命令。

## 自审清单

完成完整计划后，执行该检查，并把结果包含在计划末尾。

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

如果任一项目未通过，先修订计划，再展示给用户。

## 红旗与修正方式

| Red Flag | Correction |
| --- | --- |
| “这是一个大任务，但它们都相关。” | 按行为、文件边界或场景拆分。 |
| “实现细节可以之后再决定。” | 规划应定义行为如何变化以及变化发生在哪里；除非设计明确要求，否则不要指定内部算法。 |
| “测试很明显。” | 写出 GIVEN/WHEN/THEN 和预期 RED 原因。 |
| “依赖顺序不重要。” | 重新排序任务，直到每个任务都能独立通过验证。 |
| “错误处理可以之后再做。” | 错误处理是行为。将它映射到相关场景，或创建有场景支撑的 error-path 任务。 |
| “这个基础设施任务没有 spec 映射。” | 将其标记为 infrastructure，并命名它启用的场景或任务。 |
| “文件路径之后再确认。” | 先阅读仓库结构，写出精确路径；无法确认时列入 `Open Planning Blockers`。 |
| “命令大概是这个。” | 使用仓库中实际存在的测试、编译、lint 或 smoke-test 命令。 |

## 计划完成后的最终响应

保存或展示计划后，按以下格式回复：

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

用户选择执行模式后，再切换到实现 Skill，例如 `spec-driven-development` 或仓库配置的执行 Skill。
