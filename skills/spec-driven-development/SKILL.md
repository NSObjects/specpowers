---
name: spec-driven-development
summary: 按已批准的规格计划逐项执行任务，强制 TDD、规格可追溯、分阶段审查，并由用户控制提交。
description: "当已有已批准的任务计划，且用户希望开始或继续实现时使用。"
---

# 规格驱动开发（Spec-Driven Development）

基于已批准的实现计划执行开发：先测试、后实现；每个改动都可追溯到 Spec；每个任务必须通过明确的审查门禁。

**面向用户的启动说明：**
> 我将使用 spec-driven-development skill 来执行已批准的实现计划。

**角色：** 工程控制器。你负责协调实现、验证和汇报。你可以直接写代码，也可以派发子代理，但最终结果由你负责。

## 不可协商的门禁

<HARD-GATE>
- 实现期间不得修改 Spec、Design、Proposal 或验收标准。若发现它们错误、不完整或互相冲突，立即停止实现，并向用户说明具体冲突。
- 行为变更类任务不得跳过 TDD。每个实现任务必须先创建或扩展一个会失败的自动化测试，并且该测试要映射到关联的 Spec 场景。
- 不得运行会改变 Git 状态的命令：禁止 `git add`、`git commit`、`git push`、`git reset`、`git checkout`、`git rebase`、`git merge` 或 stash 操作。必要时可运行只读检查命令，例如 `git status`、`git diff`。
- Step-by-Step 模式下，未获得用户明确继续指令，不得开始下一个任务。
</HARD-GATE>

本 skill 期间，唯一允许对 `tasks.md` 做出的编辑是：在某个任务通过所有门禁后，将该任务复选框从 `- [ ]` 改为 `- [x]`。

## 术语

- **Change：** 当前正在实现的规格变更，通常位于 `specs/changes/<change-name>/`。
- **Task：** `tasks.md` 中一个未完成的任务项。任务是最小的不中断执行单元。
- **Feature group：** 具有相同一级编号的一组任务，例如 `1.1`、`1.2`、`1.3` 属于功能组 `1`。若任务按标题组织，则将每个标题章节视为一个功能组。
- **Subtask：** 功能组内的一个任务，用于判断里程碑验证边界。
- **Linked Spec Scenarios：** 任务明确引用的 GIVEN/WHEN/THEN 场景。若任务没有列出场景引用，应从 Spec 推断最接近的场景，并在任务报告中说明该推断。
- **Controller：** 运行本 skill 的主代理。
- **Worker：** 子代理，或由 Controller 直接扮演的任务实现者。

## 执行模式

### Step-by-Step 模式（默认）

只执行一个任务：完成所有门禁、更新任务复选框、汇报结果，然后停止。用户审查代码并手动提交。只有当用户明确说继续时，才继续下一个任务。

### Fast 模式

连续执行所有未完成任务。每个任务仍然必须经过 TDD、Stage 1 规格符合性审查、Stage 2 代码质量审查、任务复选框更新和里程碑验证。全部完成后统一汇报。

只有当用户明确要求 Fast 模式时才使用该模式。其他情况均使用 Step-by-Step 模式。

## 启动流程

1. 宣布正在使用本 skill。
2. 识别当前 Change 和任务文件。优先使用用户指定的 change 或 task 文件；否则检查 `specs/changes/`，仅当存在唯一明确的活跃 change 时才自动选择。
3. 至少读取：
   - `tasks.md`
   - 关联的 Spec 场景
   - 相关 Design 章节
   - 相关现有代码和测试
4. 确定执行模式：
   - 用户明确要求 Fast 模式 → Fast 模式
   - 否则 → Step-by-Step 模式
5. 确定执行机制：
   - 若平台支持子代理，使用本 skill 目录下的 prompt 模板派发 worker/reviewer
   - 否则，使用下方自检流程内联执行和审查，并在报告中明确说明 fallback 原因
6. 找到第一个未完成任务。若没有未完成任务，运行最终完成检查，并汇报实现已完成。

## 子代理派发

平台支持子代理时，应使用子代理。每个任务派发一个新的 worker，以降低上下文污染。

- 实现 worker：`./implementer-prompt.md`
- Stage 1 reviewer：`./spec-reviewer-prompt.md`
- Stage 2 reviewer：`./code-quality-reviewer-prompt.md`

派发前必须解析具体语言规则：

- 针对任务文件、已知实现文件、reviewer 需检查的变更文件，运行 `scripts/lib/language-detect.js` 来识别具体语言规则 skill。
- 在 worker 或 reviewer prompt 的 `Resolved Language Rules` 区域填入具体的 `specpowers:rules-*` skill 名称，例如 `specpowers:rules-typescript`、`specpowers:rules-python`、`specpowers:rules-golang`、`specpowers:rules-rust`、`specpowers:rules-java`。
- 若没有安装任何匹配的语言规则，在该区域写 `none`，并继续应用 `rules-common`。
- 不得在 `specpowers:rules-{language}` 仍未解析时派发 worker 或 reviewer。该占位符只是模板标记，不是可加载 skill。

实现达到 GREEN 之后、更新 `tasks.md` 之前，必须执行审查派发。

- 在支持子代理的平台上，将两个 reviewer stage 作为独立审查步骤派发，并等待结果。
- 不得因为任务看起来简单，或 Controller 已经检查过代码，就用内联自检替代 reviewer 派发。
- 若 reviewer 派发因平台或工具原因不可用或失败，Controller 可以使用下方内联自检，但必须报告 fallback 原因和精确自检结果。
- 每个 reviewer 包必须包含任务、关联场景、变更文件或 diff 摘要、相关测试结果和 implementer 报告。
- 派发 reviewer 前，应用 `specpowers:confidence-loop` 的 Review Package Adequacy Gate。若缺少任务、关联场景、设计约束、diff 上下文、测试证据、已知风险或此前发现/缺口，应先补齐；无法补齐时，将 reviewer 结果视为 `NEEDS_CONTEXT`。

若子代理不可用，Controller 内联完成同等工作。不得因为子代理不可用而跳过任何审查阶段。

## Worker 状态处理

Worker 必须返回以下状态之一：

| 状态 | 含义 | Controller 动作 |
|---|---|---|
| `DONE` | 任务已实现并完成自查 | 启动 Stage 1 审查 |
| `DONE_WITH_CONCERNS` | 任务已实现，但 worker 存在疑虑 | 审查前读取疑虑；先解决正确性或范围疑虑，再进入 Stage 1 |
| `NEEDS_CONTEXT` | 缺少必要信息，无法安全继续 | 补充上下文后重试；若只有用户能决策，则询问用户 |
| `BLOCKED` | 已尝试实现但无法完成 | 诊断阻塞点；用更窄范围或更强上下文重试，必要时上报用户 |

不得忽略 `DONE_WITH_CONCERNS`、`NEEDS_CONTEXT` 或 `BLOCKED`。它们是控制信号，不是叙述性细节。

## 任务执行协议

<CRITICAL>
一个任务是一个不可中断的执行单元。不得在 RED、GREEN、重构和审查之间为常规进度暂停。唯一有效暂停点是：
- 开始任务前发现必要上下文缺失；
- 任务通过全部门禁并已完成报告；
- 出现阻塞或 Spec 冲突，无法安全继续。
</CRITICAL>

每个任务按以下步骤执行：

1. **宣布任务开始**

   ```markdown
   Starting Task N.M: [Task Name]
   Covers specs: [Scenario IDs or names]
   Mode: [Step-by-Step | Fast]
   ```

2. **构建任务上下文**

   读取任务文本、关联场景、相关 Design 章节以及相关现有代码/测试。明确任务边界：只实现当前任务要求的内容。

   保持变更可追溯：每个变更文件和关键编辑都必须能追溯到当前用户请求、已批准 Spec、任务、失败测试、审查反馈或当前变更导致的孤儿清理。删除顺手重构、注释重写、命名抖动、格式噪音和无关文件变更，除非用户明确扩大任务范围。

3. **执行 TDD 实现**

   - 编写或扩展一个会因关联场景失败的测试。
   - 运行目标测试，确认 **RED**，且失败原因为预期原因。
   - 实现能让测试通过的最小变更。
   - 运行目标测试，确认 **GREEN**。
   - 只有在 GREEN 之后才允许必要重构，并重新运行相关测试。
   - 避免无关清理、宽泛重写和推测性功能。

   对于确实不改变行为的任务，先创建最接近的有意义验证，例如编译检查、配置校验、迁移测试或 fixture 断言。不得假装进行了经典 RED/GREEN TDD；必须清楚说明验证策略。

4. **证据约束信心循环**

   在 GREEN/重构之后、Stage 1 审查之前，对任务范围运行或验证 `specpowers:confidence-loop`。循环必须列出由 diff、关联场景、测试、触达代码路径、用户反馈、审查反馈和已知风险引出的具体疑虑。

   若发现范围内疑虑属实且可修复，应修复、重新运行相关验证，并重复信心循环。若存在无法可靠判断的未解决信心缺口，应停止并获取缺失证据或上下文。

5. **Stage 1：规格符合性审查**

   目的：验证实现与请求的 Spec 完全一致——无遗漏要求、无额外行为。

   - 有子代理：派发 `./spec-reviewer-prompt.md`，并等待 `PASS`。
   - 无子代理：运行下方 Spec Compliance Self-Check，并记录 fallback 原因。

   若 Stage 1 发现问题，修复、重新运行相关测试，并重复 Stage 1。Stage 1 未通过前不得进入 Stage 2。

6. **Stage 2：代码质量审查**

   目的：验证实现可维护、符合惯例、测试充分且安全。

   - 有子代理：派发 `./code-quality-reviewer-prompt.md`，并等待 `APPROVED`。
   - 无子代理：运行下方 Code Quality Self-Check，并记录 fallback 原因。

   若 Stage 2 发现阻塞问题，修复、重新运行相关测试，并重复 Stage 2。若 Stage 2 修复改变了行为或公共接口，必须重新运行 Stage 1。

7. **里程碑验证**

   若当前任务是某个功能组中的最后一个 subtask，则对该功能组运行 `verification-loop`。中间 subtask 不因数量本身触发 `verification-loop`。在当前功能组验证通过前，不得开始下一个功能组。

8. **标记任务完成**

   在 TDD、Stage 1、Stage 2 以及任何到期的功能组验证都通过后，将 `tasks.md` 中该任务从 `- [ ]` 更新为 `- [x]`。

   只要仍存在未解决信心缺口，就不得标记 `tasks.md` 完成。

9. **报告**

   使用下方 Step-by-Step 或 Fast 模式报告格式。

## Step-by-Step 模式流程

只处理第一个未完成任务：

1. 执行完整任务执行协议。
2. 标记任务复选框完成。
3. 汇报已完成任务。
4. 停止。不得开始下一个任务。
5. 等待用户指令。

用户说继续后，从第一个未完成任务恢复。除非用户要求修改，否则不要重新运行或重新标记上一个任务。

### Step-by-Step 报告格式

```markdown
✅ Task N.M Complete: [Task Name]

**Output**
- Created: path/to/new-file.ext
- Modified: path/to/modified-file.ext
- Deleted: [paths or none]
- Task tracking: `tasks.md` updated (`- [ ]` → `- [x]`)

**Tests**
- RED: `[command]` failed for the expected reason before implementation
- GREEN: `[command]` passed after implementation
- Additional checks: `[command]` passed

**Spec Coverage**
- ✅ Scenario "[name]" — GIVEN/WHEN/THEN covered by `[test name or file]`

**Reviews**
- Stage 1 — Spec Compliance: ✅ Passed (`spec-reviewer`, scope: [task/diff/files] | inline fallback: [reason])
- Stage 2 — Code Quality: ✅ Passed (`code-quality-reviewer`, scope: [task/diff/files] | inline fallback: [reason])
- Review evidence: [reviewer result summary, rerun count, or self-check evidence]
- Fixed review issues: [none | summary]
- Confidence Loop: [checked doubts | fixed issues | unresolved gaps: None]

**Verification**
- Feature-group verification: [not due | ✅ passed | details]

**Waiting for your action**
1. Review the code changes and results above.
2. Manually commit if satisfied.
3. Say "Continue" to execute the next task, or provide feedback.
```

## Fast 模式流程

按完整任务执行协议执行每个未完成任务。

开始下一个功能组之前，必须确认当前功能组已有通过的 `verification-loop` 结果。若结果缺失或失败，不得进入下一个功能组。

所有功能组完成后，在最终完成报告前运行一次最终 `verification-loop`。

### Fast 模式最终报告格式

```markdown
🎉 All Tasks Complete

| Task | Status | Output Files | Spec Coverage | Verification |
|---|---:|---|---|---|
| 1.1 [Name] | ✅ | file1.ext, test1.ext | Scenario "X" ✅ | not due |
| 1.2 [Name] | ✅ | file2.ext, test2.ext | Scenario "Y" ✅ | group 1 ✅ |

**Tests**
- Passing: [summary]
- Commands run: [commands]

**Reviews**
- Stage 1 Spec Compliance: ✅ all tasks passed
- Stage 2 Code Quality: ✅ all tasks passed
- Review evidence: [per-task reviewer summaries or inline fallback reasons]
- Confidence Loop: ✅ all task scopes had no unresolved confidence gaps

**Verification**
- Feature groups: ✅ all passed
- Final global verification-loop: ✅ passed

All task checkboxes in `tasks.md` have been updated. Please review all code changes, then manually commit if satisfied.
When finished, you can say "Archive" to merge Delta Specs into the main specifications.
```

## 恢复进度

恢复某个 change 时：

1. 读取当前 `tasks.md`。
2. 找到第一个未完成任务。
3. 若此前模式明确，则沿用；否则默认 Step-by-Step 模式，除非用户明确要求 Fast 模式。
4. 宣布：

   ```markdown
   Resuming from Task N.M: [Task Name]
   Covers specs: [Scenario IDs or names]
   ```

5. 继续执行任务执行协议。

若上一个任务看似已实现但复选框未勾选，应检查代码和审查产物后再判断。不得盲目标记完成。

## Spec Compliance Self-Check

当 spec reviewer 子代理不可用时，使用此内联检查。

针对每个关联场景：

```text
Scenario: [name]
GIVEN [precondition]
  - Test setup matches? yes/no
WHEN [action]
  - Test triggers the actual behavior? yes/no
THEN [expected result]
  - Assertion verifies the expected observable result? yes/no
Negative constraints
  - No unrequested behavior added? yes/no
Implementation evidence
  - Files/lines inspected: [file:line]
Result
  - PASS / NEEDS_CHANGES
```

若任一关联场景缺少实现证据、缺少测试覆盖、只部分实现，或包含 Spec 之外的行为，Stage 1 失败。

## Code Quality Self-Check

当 code quality reviewer 子代理不可用时，使用此内联检查。

至少检查：

- **正确性风险：** 边界条件、无效输入、并发/资源处理、错误路径。
- **可维护性：** 命名清晰、单元小、低耦合、无不必要抽象。
- **架构适配：** 遵循现有项目模式和计划中的文件结构。
- **测试质量：** 测试断言行为，覆盖有意义边界，不因过度 mock 而绕开真实行为。
- **范围控制：** 无无关重构、无推测性功能、无任务外宽泛清理。
- **手术式变更：** 每个变更文件和关键编辑都可追溯到当前请求、已批准 Spec、任务、失败测试、审查反馈或当前变更导致的孤儿清理；无顺手重构、注释重写、命名抖动或格式噪音。
- **运行安全：** 无密钥泄露、危险默认值、意外副作用或可避免性能回退。
- **证据支撑的信心：** Stage 2 通过前，确认由 diff、测试、任务上下文、触达代码路径和已知风险引出的每个具体疑虑都已调查或报告。

任何 Critical 或 Important 问题，或任何阻止批准的信心缺口，都会导致 Stage 2 失败。Minor 问题可报告但不必阻塞完成，除非数量过多并形成维护风险。若缺少证据导致无法可靠自检，应将其视为阻塞，并在标记任务完成前获取上下文或验证。

## 既有失败与阻塞

若在引入本任务 RED 测试之前已有测试失败：

1. 判断失败是否为既有且与当前任务无关。
2. 不得隐藏或重写无关失败。
3. 只有当当前任务可独立验证，且无关失败已清楚记录时，才可继续。
4. 若失败阻止可靠验证，停止并询问用户。

若实现过程中发现 Spec/Design 冲突：

1. 停止实现。
2. 带文件/章节引用说明具体冲突。
3. 提出选项，但在用户授权规划/规格更新流程前，不得编辑 Spec/Design/Proposal。

## 铁律

- 不得在任务中途为常规进度暂停。完成任务单元，或仅在真实阻塞时停止。
- Step-by-Step 模式下，未获用户明确继续指令，不得开始下一个任务。
- 不得运行会改变 Git 状态的命令。提交和分支管理由用户控制。
- 行为变更类工作不得跳过 TDD。
- 实现期间不得修改 Spec、Design 或 Proposal。
- 不得在 Stage 1 之前运行或通过 Stage 2。
- 在支持子代理的平台上，不得用内联自检替代 reviewer 派发，除非派发不可用或失败，并且必须报告 fallback。
- 当 Stage 1、Stage 2、必要测试或到期里程碑验证失败时，不得报告任务完成。
- 仍存在未解决信心缺口时，不得报告或标记任务完成。
- 不得把 worker 报告当作证明。必须直接核验代码和测试。
- 不得忽略用户反馈。若用户指出结果错误，停止常规流程并优先处理反馈。

## 风险信号

| 诱惑 | 正确处理 |
|---|---|
| “这个任务很简单，顺便做下一个。” | Step-by-Step 模式下，完成一个任务后立即停止。 |
| “测试过了，跳过规格审查。” | Stage 1 是强制门禁。测试可能编码了错误行为。 |
| “代码看起来不错，跳过代码审查。” | Stage 2 是强制门禁。符合 Spec 的代码仍可能脆弱。 |
| “reviewer 提了个小阻塞问题，提一下继续走。” | 修复阻塞问题，并重新运行相关审查。 |
| “Spec 有点问题，实现时顺手修。” | 停止并与用户讨论 Spec 冲突。 |
| “用户提交后再标记任务。” | 门禁通过后、报告前标记，确保用户手动提交捕获完成状态。 |
| “用 git commit 做检查点。” | 不提交。清楚汇报，让用户提交。 |
| “子代理不可用，所以跳过审查。” | 内联运行自检。 |

## 集成

**必需 skills**
- `specpowers:test-driven-development` — 行为变更类任务必须使用。
- `specpowers:planning` — 生成本 skill 执行的任务计划。

**辅助 skills**
- `specpowers:rules-common` — 实现和审查通用工程规则。
- `specpowers:rules-{language}` — 语言特定规则，例如 `rules-golang`、`rules-typescript`、`rules-python`。
- `specpowers:verification-loop` — 里程碑和最终验证流水线。
- `specpowers:requesting-code-review` — 可选的独立代码审查流程，不替代本任务流内的 Stage 2。
- `specpowers:confidence-loop` — 任务完成前用于具体疑虑与未解决信心缺口的证据约束循环。
- `specpowers:archiving` — 仅在所有任务完成且用户要求归档时使用。

所有任务完成后，告诉用户：

> All tasks are complete. You can say "Archive" to merge Delta Specs into the main specifications.
