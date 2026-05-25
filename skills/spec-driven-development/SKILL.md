---
name: spec-driven-development
summary: 按 task 执行已批准的 specification plan，包含 TDD、spec traceability、分阶段 review 和用户控制的 commits。
description: "当已批准 task plan 存在，且用户希望开始或恢复 implementation 时使用。"
---

# Spec-Driven Development（规格驱动开发）

用 test-first discipline、到 Spec 的明确 traceability，以及严格 review gates 执行已批准 implementation plan。

**面向用户的启动说明：**
> 我正在使用 spec-driven-development skill 来实现已批准的 plan。

**角色：** Engineering controller。你协调 implementation、verification 和 reporting。你可以直接写 code，也可以 dispatch subagents，但最终结果仍由你负责。

## Non-Negotiable Gates（不可协商关卡）

<HARD-GATE>
- Implementation 期间不要更改 Spec、Design、Proposal 或 acceptance criteria。如果它们看起来错误或不完整，停止并向用户说明冲突。
- Behavior-changing work 不得跳过 TDD。每个 implementation task 都从创建或扩展一个 failing automated test 开始，并映射到 linked Spec scenario。
- 不要运行 mutating git commands：不运行 `git add`、`git commit`、`git push`、`git reset`、`git checkout`、`git rebase`、`git merge` 或 stash operations。需要时可运行 read-only inspection commands，例如 `git status` 或 `git diff`。
- Step-by-Step mode 中，除非用户明确要求继续，否则不要进入下一个 task。
</HARD-GATE>

此 skill 中唯一允许对 `tasks.md` 做的编辑，是在某个 task 通过所有 required gates 后，将该 task checkbox 从 `- [ ]` 改成 `- [x]`。

## Definitions（定义）

- **Change:** 正在实现的 active spec change，通常位于 `specs/changes/<change-name>/`。
- **Task:** `tasks.md` 中一个 unchecked item。Task 是 uninterrupted execution 的最小单位。
- **Feature group:** 共享相同顶层编号的一组 tasks，例如 `1.1`、`1.2`、`1.3` 属于 feature group `1`。如果 tasks 按 headings 而非编号组织，则每个 heading section 视为一个 feature group。
- **Subtask:** 为 verification-boundary 目的，feature group 内的一个 task。
- **Linked Spec Scenarios:** Task 明确引用的 GIVEN/WHEN/THEN scenarios。如果 task 没有列出 scenario references，从 Spec 中推断最接近的 scenarios，并在 task report 中说明该推断。
- **Controller:** 运行此 skill 的 main agent。
- **Worker:** 执行 task 的 subagent，或 controller 自己。

## Execution Modes（执行模式）

### Step-by-Step Mode — Default（逐步模式，默认）

只执行一个 task，完成所有 gates，标记 task checkbox，报告结果，然后暂停。用户手动 review changes 并 commit。只有用户明确说继续后才继续。

### Fast Mode（快速模式）

连续执行所有 unchecked tasks。每个 task 仍然必须经过 TDD、Stage 1 spec compliance review、Stage 2 code quality review、task checkbox update 和 milestone verification。最后统一报告一次。

Fast Mode 只在用户明确要求时使用；否则使用 Step-by-Step Mode。

## Startup Procedure（启动流程）

1. 宣告正在使用此 skill。
2. 识别 active change 和 task file。优先使用用户点名的 change 或 task file；否则检查 `specs/changes/`，只有一个 active change 且无歧义时才选择它。
3. 至少读取：
   - `tasks.md`
   - linked Spec scenarios
   - relevant Design sections
   - relevant existing code and tests
4. 确定 execution mode：
   - 用户明确要求 Fast Mode → Fast Mode
   - 否则 → Step-by-Step Mode
   - 执行开始或恢复前，先选择 `Step-by-Step` 或 `Fast`。
5. 确定 execution mechanism：
   - 如果平台支持 subagents，使用此 skill directory 中的 prompt templates dispatch workers/reviewers。
   - 否则使用下方 self-checks inline execute/review，并明确报告 fallback。
6. 找到第一个 unchecked task。如果没有剩余 unchecked tasks，运行 final completion checks 并报告 implementation complete。

## Subagent Dispatch（Subagent 派发）

平台支持时使用 subagents。每个 task 派发 fresh worker，降低 context contamination。

- Implementer worker: `./implementer-prompt.md`
- Stage 1 reviewer: `./spec-reviewer-prompt.md`
- Stage 2 reviewer: `./code-quality-reviewer-prompt.md`

Resolve concrete language rules before dispatch（派发前解析具体语言规则）：

- 对 task files、known implementation files 和 reviewer changed files 运行 `scripts/lib/language-detect.js`，识别具体 language rule skills。
- 在每个 worker 或 reviewer prompt 的 `Resolved Language Rules` section 中填入具体 `specpowers:rules-*` skill names，例如 `specpowers:rules-typescript`、`specpowers:rules-python`、`specpowers:rules-golang`、`specpowers:rules-rust` 或 `specpowers:rules-java`。
- 如果没有 installed language rule 匹配 task 或 review scope，在该 section 写 `none`，并继续使用 `rules-common`。
- 当 `specpowers:rules-{language}` 仍 unresolved 时，不要派发 worker 或 reviewer prompt（do not dispatch）。该 placeholder 是 template marker，不是可加载 skill。

Review dispatch is mandatory after implementation reaches GREEN and before `tasks.md` is updated。也就是：implementation 到达 GREEN 后、更新 `tasks.md` 前，review dispatch 是强制的。

- 在 subagent-capable platforms 上，将两个 reviewer stages 作为 separate review steps 派发并等待结果。
- 不要因为 task 看起来简单或 controller 已经检查过 code，就用 inline self-check 替代 reviewer dispatch（do not replace reviewer dispatch with inline self-check）。
- 如果 reviewer dispatch 因 platform/tooling 原因不可用或失败，controller 可以使用下方 inline self-checks，但必须报告 fallback reason 和 exact self-check result。
- 每个 reviewer package 必须包含 task、linked scenarios、changed files 或 diff summary、relevant test results 和 implementer report。
- 派发 reviewer 前，应用 `specpowers:confidence-loop` 的 Review Package Adequacy Gate。如果 task、linked scenarios、design constraints、diff context、test evidence、known risks 或 prior findings/gaps 缺失，先补齐再 review；否则将 reviewer result 视为 `NEEDS_CONTEXT`。

如果 subagents 不可用，controller inline 执行同等工作。不要仅因 subagents 不可用就跳过任一 review stage。

## Worker Status Handling（Worker 状态处理）

Workers 必须报告以下 status 之一：

| Status | Meaning | Controller action |
|---|---|---|
| `DONE` | Task 已实现并 self-reviewed | 开始 Stage 1 review |
| `DONE_WITH_CONCERNS` | Task 已实现，但 worker 有疑虑 | Review 前阅读 concerns；Stage 1 前解决 correctness/scope concerns |
| `NEEDS_CONTEXT` | Worker 缺少信息，无法安全继续 | 补充 missing context 后重试；如果只有用户能决定，则询问用户 |
| `BLOCKED` | Worker 已尝试 task，但无法完成 | 诊断 blocker；用更窄 scope、更强 context 重试，或升级给用户 |

不要忽略 `DONE_WITH_CONCERNS`、`NEEDS_CONTEXT` 或 `BLOCKED`。把它们当作 control signals，而不是 narrative details。

## Task Execution Protocol（Task 执行协议）

<CRITICAL>
One task is one uninterrupted execution unit。不要在 RED、GREEN、refactor 和 review 之间暂停。唯一有效 pause points 是：
- task 开始前缺少 required context；
- task 已通过所有 gates 并已报告；
- blocker 或 spec conflict 阻止安全推进。
</CRITICAL>

对每个 task：

1. **宣告 task start**

   ```markdown
   开始 Task N.M：[Task Name]
   覆盖 specs：[Scenario IDs or names]
   Mode：[Step-by-Step | Fast]
   ```

2. **构建 task context**

   读取 task text、linked scenarios、relevant Design sections，以及 relevant existing code/tests。保持 task boundary 明确：只实现当前 task 请求的内容。

   Maintain traceable changes: every changed file and key edit must trace to the current request, accepted specification, task, failing test, review feedback, or current-change orphan cleanup。删除 drive-by refactors、comment rewrites、naming churn、formatting noise 和 unrelated file changes，除非用户明确扩大 scope。

3. **运行 TDD implementation**

   - 编写或扩展一个会因 linked scenario 失败的 test。
   - 运行 targeted test，并确认它因 expected reason 达到 **RED**。
   - 实现能满足 test 的最小 change。
   - 再次运行 targeted test，并确认 **GREEN**。
   - 只有 GREEN 后才 refactor，然后重跑 relevant tests。
   - 避免 unrelated cleanup、broad rewrites 和 speculative features。

   对确实不改变 behavior 的 tasks，先创建最接近的 meaningful verification，例如 compile check、configuration validation、migration test 或 fixture-based assertion。不要假装发生了 TDD；要清楚说明 verification strategy。

4. **Evidence-bound confidence loop（证据绑定信心循环）**

   Run or verify `specpowers:confidence-loop` over the task scope after GREEN/refactor and before Stage 1 review。Loop 必须列出由 diff、linked scenarios、tests、touched code paths、user feedback、review feedback 和 stated risks 引出的 concrete doubts。

   如果 in-scope doubt 被确认且可修复，修复它，重跑 relevant verification，并重复 loop。如果 loop 发现阻止可靠判断的 unresolved confidence gap，停止并先获取 missing evidence 或 context。

5. **Stage 1: Spec Compliance Review（规格符合性审查）**

   目的：确认 implementation 精确匹配 requested Spec，完整、无 missing requirements、无 extra behavior。

   - With subagents: dispatch `./spec-reviewer-prompt.md` and wait for `PASS`。
   - Without subagents：运行下方 Spec Compliance Self-Check，并记录 fallback reason。

   如果 Stage 1 发现 issues，修复、重跑 relevant tests，并重复 Stage 1。Stage 1 通过前不要开始 Stage 2。

6. **Stage 2: Code Quality Review（代码质量审查）**

   目的：确认 implementation maintainable、idiomatic、tested 且 safe。

   - With subagents: dispatch `./code-quality-reviewer-prompt.md` and wait for `APPROVED`。
   - Without subagents：运行下方 Code Quality Self-Check，并记录 fallback reason。

   如果 Stage 2 发现 blocking issues，修复、重跑 relevant tests，并重复 Stage 2。如果 Stage 2 fix 改变 behavior 或 public interfaces，也要重跑 Stage 1。

7. **Milestone verification（里程碑验证）**

   If this task is the last subtask in a feature group, run `verification-loop` for that feature group。Intermediate subtasks do not trigger `verification-loop` by count alone。Verification result 存在且 passed 前，不要开始下一个 feature group。

8. **标记 task complete**

   TDD、Stage 1、Stage 2，以及任何 due feature-group verification 全部通过后，将此 task 在 `tasks.md` 中从 `- [ ]` 更新为 `- [x]`。

   不要在存在任何 unresolved confidence gap 时标记 `tasks.md` complete（do not mark `tasks.md` complete while any unresolved confidence gap remains）。

9. **Report（报告）**

   使用下方 Step-by-Step 或 Fast Mode report format。

## Step-by-Step Mode Flow（逐步模式流程）

只处理第一个 unchecked task：

1. 执行完整 Task Execution Protocol。
2. 标记 task checkbox complete。
3. 报告 completed task。
4. 停止，不开始下一个 task。
5. 等待 user instruction。

当用户说继续时，从第一个 unchecked task 恢复。除非用户要求 changes，不要重新运行或重新标记上一个 task。

### Step-by-Step Report Format（逐步模式报告格式）

```markdown
✅ Task N.M 完成：[Task Name]

**输出**
- 新建：path/to/new-file.ext
- 修改：path/to/modified-file.ext
- Task tracking：`tasks.md` 已更新（`- [ ]` → `- [x]`）

**测试**
- RED：`[command]` 在 implementation 前因 expected reason 失败
- GREEN：`[command]` 在 implementation 后通过
- 额外检查：`[command]` 通过

**Spec 覆盖**
- ✅ Scenario "[name]" — GIVEN/WHEN/THEN 已由 `[test name or file]` 覆盖

**Reviews**
- Stage 1 — Spec Compliance：✅ Passed（`spec-reviewer`，scope: [task/diff/files] | inline fallback: [reason]）
- Stage 2 — Code Quality：✅ Passed（`code-quality-reviewer`，scope: [task/diff/files] | inline fallback: [reason]）
- Review evidence: [reviewer result summary, rerun count, or self-check evidence]
- Fixed review issues: [none | summary]
- Confidence Loop: [checked doubts | fixed issues | unresolved gaps: None]

**Verification**
- Feature-group verification：[not due | ✅ passed | details]

**等待你的操作**
1. Review 上方 code changes 和 results。
2. 满意后手动 commit。
3. 说 "Continue" 执行下一个 task，或提供 feedback。
```

## Fast Mode Flow（快速模式流程）

使用完整 Task Execution Protocol 执行每个 unchecked task。

before starting the next feature group，确认 current feature group 已有 passing `verification-loop` result。如果 result missing or failed，do not proceed to the next feature group。

after all feature groups are complete，run a final `verification-loop` before the final completion report。

### Fast Mode Final Report Format（快速模式最终报告格式）

```markdown
🎉 所有 Tasks 完成

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

`tasks.md` 中所有 task checkboxes 都已更新。请 review 全部 code changes，满意后手动 commit。
完成后，你可以说 "Archive"，将 Delta Specs 合并进 main specifications。
```

## Resuming Progress（恢复进度）

恢复 change 时：

1. 读取 active `tasks.md`。
2. 找到第一个 unchecked task。
3. 如果此前 mode 已知，沿用此前 mode；否则默认 Step-by-Step Mode，除非用户明确要求 Fast Mode。
4. 宣告：

   ```markdown
   从 Task N.M 恢复：[Task Name]
   覆盖 specs：[Scenario IDs or names]
   ```

5. 继续 Task Execution Protocol。

如果上一个 task 看起来已实现但 checkbox 未勾选，先检查 code 和 review artifacts 再决定。不要盲目标记 complete。

## Spec Compliance Self-Check（规格符合性自检）

当 spec reviewer subagent 不可用时，inline 使用此检查。

对每个 linked scenario：

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

如果任何 linked scenario 缺少 implementation evidence、缺少 test coverage、只部分实现，或包含 Spec 之外的 behavior，Stage 1 失败。

## Code Quality Self-Check（代码质量自检）

当 code quality reviewer subagent 不可用时，inline 使用此检查。

至少检查：

- **Correctness risks:** edge cases、invalid inputs、concurrency/resource handling、error paths。
- **Maintainability:** clear names、small units、low coupling、无 unnecessary abstractions。
- **Architecture fit:** 遵循 existing project patterns 和 plan 中的 file structure。
- **Test quality:** tests assert behavior，覆盖 meaningful edge cases，且不是 over-mocked。
- **Scope control:** 无 unrelated refactors、无 speculative features、无 task 外 broad cleanup。
- **Surgical changes:** 每个 changed file 和 key edit 都可追溯到 current request, accepted specification, task, failing test, review feedback, or current-change orphan cleanup；没有 drive-by refactors、comment rewrites 或 formatting noise。
- **Operational safety:** 无 secret leakage、unsafe defaults、surprising side effects 或 avoidable performance regressions。
- **Evidence-backed confidence:** Stage 2 通过前，确认 diff、tests、task context、touched code paths 和 stated risks 引出的每个 concrete doubt 都已调查或报告。

Stage 2 在任何 Critical/Important issue 或 approval-blocking confidence gap 上失败。Minor issues 可以报告，但不应阻塞 completion，除非累积成 maintainability risk。如果 missing evidence 阻止可靠 self-check，将其视为 blocker，并先获取 missing context 或 verification，再标记 task complete。

## Existing Failures and Blockers（既有失败和阻塞）

如果 tests 在 task 的 RED test 引入前已经失败：

1. 判断 failure 是否 pre-existing 且 unrelated。
2. 不隐藏或重写 unrelated failures。
3. 只有 task 能被 independent verification 且 unrelated failure 已明确记录时，才继续。
4. 如果 failure 阻止 reliable verification，停止并询问用户。

如果 implementation 暴露 Spec/Design conflict：

1. 停止 implementation。
2. 用 file/section references 说明 exact conflict。
3. 提出 options，但在用户授权 planning/spec update workflow 前，不编辑 Spec/Design/Proposal。

## Iron Laws（铁律）

- 不要为 routine progress updates 在 task 中途暂停。完成 task unit，或只因真实 blocker 停止。
- Step-by-Step Mode 中，没有 explicit user continuation 不开始下一个 task。
- 不运行 mutating git commands。Commits 和 branch management 由用户负责。
- Behavior-changing work 不跳过 TDD。
- Implementation 期间不修改 Spec、Design 或 Proposal。
- Stage 2 前不跳过 Stage 1。
- 在 subagent-capable platform 上，除非 dispatch 不可用或失败且报告 fallback，否则不用 inline self-check 替代 reviewer dispatch。
- 当 Stage 1、Stage 2、required tests 或 due milestone verification 失败时，不报告 task complete。
- 仍有 unresolved confidence gap 时，不报告或标记 task complete。
- 不把 worker report 当作 proof。直接验证 code 和 tests。
- 不忽略 user feedback。如果用户说结果不对，停止正常 flow 并处理。

## Red Flags（风险信号）

| Temptation | Correct response |
|---|---|
| "This task is simple; do the next one too." | Step-by-Step Mode 中，一个 task 完成后停止。 |
| "The task passed tests, so skip spec review." | Stage 1 mandatory。Tests 可能编码了错误 behavior。 |
| "The code looks fine, so skip code review." | Stage 2 mandatory。Spec-compliant code 仍可能 fragile。 |
| "The reviewer found a small blocking issue; mention it and move on." | 修复 blocking issues 并重跑 relevant review。 |
| "The Spec is slightly wrong; patch it while implementing." | 停止，并和用户讨论 Spec conflict。 |
| "Mark the task after the user commits." | Gates 通过后、报告前标记，让用户手动 commit 捕获 completed state。 |
| "Use git commit to checkpoint." | 不 commit。清楚报告，让用户 commit。 |
| "Subagents are unavailable, so skip reviews." | Inline 运行 self-checks。 |

## Integration（集成）

**Required skills**
- `specpowers:test-driven-development` — behavior-changing tasks 必须使用。
- `specpowers:planning` — 产出此 skill 执行的 task plan。

**Supporting skills**
- `specpowers:rules-common` — implementation 和 review 的 universal engineering rules。
- `specpowers:rules-{language}` — language-specific rules，例如 `rules-golang`、`rules-typescript` 或 `rules-python`。
- `specpowers:verification-loop` — milestone 和 final verification pipeline。
- `specpowers:requesting-code-review` — 此 per-task flow 之外的 optional standalone review workflow。
- `specpowers:confidence-loop` — task completion 前，围绕 concrete doubts 和 unresolved confidence gaps 的 evidence-bound loop。
- `specpowers:archiving` — 仅在所有 tasks 完成且用户要求 archive 后使用。

所有 tasks 完成后，告诉用户：

> 所有 tasks 都已完成。你可以说 "Archive"，将 Delta Specs 合并进 main specifications。
