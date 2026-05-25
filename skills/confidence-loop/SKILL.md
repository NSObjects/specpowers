---
name: confidence-loop
description: 在普通代码编辑、代码修改或 bug fix 实现后、最终回复前立即使用；也在 artifact handoff、review、或声明 done、complete、fixed、passing、ready for review、safe to proceed 前使用。
---

# 证据边界信心循环（Evidence-Bound Confidence Loop）

当 Agent 准备在 artifact 阶段之间移动、派发 subagent review、声明 `DONE`、`APPROVED`、complete、fixed、passing、PR-ready，或以其他方式表示可以安全继续时，使用这个 support skill。

## 核心定义

`100% confidence` 是 evidence-bound gate，不是 omniscience。它表示 reviewed scope 引出的每个具体疑点都已经被调查、修复，或带着所需缺失证据被报告出来。

Reviewed scope 可以是 task、diff、file set、Spec scenario set、review package、bug fix、completion claim、artifact 或 handoff package。除非调查暴露真实的跨边界风险，否则 loop 必须留在该 scope 内。

## 循环步骤

重复以下步骤，直到满足停止条件：

1. **Define the reviewed scope（定义审查范围）** — 说明正在评估的 task、diff、files、scenarios、claim、artifact、review package 或 handoff package。
2. **List concrete doubts（列出具体疑点）** — 枚举该 scope 引出的 plausible defects、regressions、missing tests、edge cases、failure paths、user-feedback concerns、review-feedback concerns 和 evidence gaps。
3. **Investigate each doubt（调查每个疑点）** — 检查 code、tests、specs、logs、command output、surrounding behavior 和相关 prior decisions。
4. **Fix, report, or convert（修复、报告或转换）** — 修复已确认的 in-scope 问题；报告 out-of-scope 问题；或把缺失证据转换成 **Unresolved Confidence Gaps**，并写明确切所需证据。
5. **Rerun relevant verification（重跑相关验证）** — 重跑能证明修复或关闭疑点的最小检查，然后阅读输出。
6. **Ask the confidence gate again（再次询问信心门槛）** — 判断现有证据是否已经支持 reviewed scope 内的 100% confidence。

## 停止条件

只有当完整一轮没有产生新的 concrete blocking doubt、没有剩余 Critical 或 Important issue，并且 **Unresolved Confidence Gaps** 为 `None` 时，才能停止。

如果一轮中出现新疑点，在批准或完成前必须调查它。如果缺失证据阻止可靠判断，报告 gap，不要声明成功。

## 输出形状

报告 loop 时使用此结构：

```markdown
**Confidence Loop**
- Scope: [task, diff, claim, review package, artifact or handoff package]
- Concrete doubts checked: [summary]
- Fixed issues: [none | summary]
- Unresolved Confidence Gaps: [None | exact missing evidence]
- Result: [PASS | BLOCKED]
```

## Post-Implementation Confidence Loop（实现后信心循环）

为了便于 skill discovery，本 skill 是 post-implementation gate：在 ordinary code edits、code modifications 或 bug fix implementations 之后、最终回复之前立即使用，尤其是在声明 done、complete、fixed、passing、ready for review 或 safe to proceed 之前。

当 Agent 完成自己负责的代码实现时，必须在向用户报告结果前运行或应用此 loop。触发 scope 包含 `ordinary code edits`、`code modifications` 和 `bug fix implementations`，并且运行在 `before reporting complete, fixed, passing, ready for review, or safe to proceed` 之前。

实现后的 reviewed scope 必须覆盖本次实现的 task、diff、file set、相关 Spec scenarios、tests 和 known risks。对于 bug fix implementations，scope 还必须包含 `original failure`、`modified code paths`、`verification evidence` 和 `known risks`，避免 Agent 只凭代码变更就声称 fixed。

`post-implementation reports` 复用上面的 Output Shape，并且至少说明 checked doubts、fixed issues、**Unresolved Confidence Gaps** 和 `PASS | BLOCKED` 结果。如果仍有 unresolved confidence gap，Agent 必须报告实际状态和缺失证据，而不是声明 complete、fixed、passing、ready for review 或 safe to proceed。

这个 post-implementation trigger `extends ordinary implementation paths`；它 `does not replace spec-driven implementation, review, handoff, or completion gates`。既有 gates 保留自己的 scope、evidence package、review 和 blocking rules，包括在 Critical 或 Important findings 或 Unresolved Confidence Gaps 仍存在时不得继续的要求。

这是 `Agent-owned behavior gate`，不是 `file watcher`、`Git hook`、`daemon` 或 `runtime enforcement` 机制。它只在 Agent 评估自己已完成的 implementation scope、准备报告或继续时运行；`external file changes do not automatically run it`。

## Review Package Adequacy Gate（审查包充分性门槛）

在派发任何 subagent review 前应用此 gate。Reviewer 必须获得足够上下文，才能在不编造对话历史或用户意图的情况下评估请求的 scope。

主 Agent 的 review package 必须包含：

- scope；
- current artifact 或 diff；
- confirmed user decisions；
- in-scope 和 out-of-scope boundaries；
- open questions；
- relevant specs、design、tasks 和 tests；
- 可用时的 test evidence、commands 和 results；
- known risks；
- prior findings 或 gaps。

不要推断缺失上下文。如果缺失证据阻止公平审查，reviewer 必须返回 `NEEDS_CONTEXT`、`NEEDS_USER_DECISION`，或把缺失证据列入 **Unresolved Confidence Gaps**。缺失证据是阻塞状态，不是猜测、`PASS` 或 `APPROVED` 的许可。

## Workflow Handoff Confidence Loop（工作流移交信心循环）

此 loop 用于 artifact handoff gates，包括但不限于 `exploring → proposing`、`proposing → specifying`、`specifying → designing`、`designing → planning` 和 `planning → spec-driven-development`。

1. 构造 handoff review package，包含当前 artifact 或 conversation summary、prior confirmed context、intended next stage、known constraints、explicit exclusions、open questions，以及与 handoff 相关的 success criteria。
2. 在 review dispatch 前运行 Review Package Adequacy Gate。
3. 当 subagents 可用时，用 `workflow-handoff-reviewer-prompt.md` 请求只读 review。如果 subagents 不可用，内联执行同样检查并报告 fallback。
4. Reviewer 返回 `PASS`、`NEEDS_CHANGES` 或 `NEEDS_USER_DECISION`。
5. 对每个 finding，主 Agent 发送 **Resolution Package**，把 finding 标记为 `fixed`、`rejected`、`out_of_scope` 或 `needs_user_decision`，并提供证据。
6. 复审更新后的 artifact 和 Resolution Package；重复直到 `PASS` 或 `NEEDS_USER_DECISION`。

只要 Critical 或 Important findings 或 Unresolved Confidence Gaps 仍存在，就不得继续。`NEEDS_USER_DECISION` 会停止 handoff，直到用户回答一个聚焦问题。

## Review Confidence Loop（审查信心循环）

此 loop 用于 standalone code review、Stage 2 code-quality review 和 review feedback re-review。

1. 定义 review scope：branch、task、commit range、working tree diff 或 review package。
2. 在 review dispatch 前运行 Review Package Adequacy Gate。
3. Reviewer 返回 `APPROVED`、`NEEDS_CHANGES` 或 `NEEDS_CONTEXT`。
4. 对每个 finding，主 Agent 发送 **Resolution Package**，把 finding 标记为 `fixed`、`rejected`、`out_of_scope` 或 `needs_user_decision`，并提供证据。
5. 复审更新后的 diff、review package 和 Resolution Package；重复直到 `APPROVED`，或直到 `NEEDS_CONTEXT` 需要用户或外部证据。

只有当没有剩余 Critical 或 Important issue，并且 **Unresolved Confidence Gaps** 为 `None` 时，reviewers 才能返回 `APPROVED`。当缺失证据阻止可靠 review 时使用 `NEEDS_CONTEXT`；当需要 in-scope fix 时使用 `NEEDS_CHANGES`。

## 误用预防

- 不要把 speculative concerns 转换成 findings。Finding 需要 scope 内证据。
- 不要用乐观语言隐藏缺失证据。
- 不要把 scope 扩展成无关 redesign 或 broad cleanup。
- 不要把 passing tests 单独当作 requirements、edge cases 或 review concerns 已检查的证明。
- 当 Critical issues、Important issues 或 approval-blocking evidence gaps 仍存在时，不要声称 approval。

## 集成点（Integration Points）

- Workflow artifact handoffs 在阶段移动前使用 Workflow Handoff Confidence Loop 和 `workflow-handoff-reviewer-prompt.md`。
- Implementers 在返回 `DONE` 前运行此 loop。
- Controllers 在 task completion 之前以及更新 `tasks.md` 前运行或核验此 loop。
- Reviewers 在返回 `APPROVED` 前使用 Review Package Adequacy Gate 和 Review Confidence Loop。
- `verification-before-completion` 在任何 completion、fixed、passing、approved、commit-ready 或 PR-ready claim 前使用它。
