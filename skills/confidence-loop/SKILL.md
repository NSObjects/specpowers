---
name: confidence-loop
description: "在普通代码编辑、代码修改或 bug 修复实现后立即使用，并且必须在最终回复、产物阶段交接、评审发起，或声称 DONE、APPROVED、complete、fixed、passing、ready for review、safe to proceed 之前使用。"
---

# 证据约束的信心闭环

当 Agent 即将进入下一个产物阶段、发起子 Agent 评审、声明 `DONE`、`APPROVED`、完成、已修复、测试通过、PR-ready，或以任何方式表示“可以继续 / 安全推进”时，必须使用本支持 skill。

## 核心定义

`100% confidence` 不是全知全能，也不是主观感觉；它是一个**证据约束的门禁**。含义是：在当前被评审范围内，所有具体疑点都已经被调查、修复，或被如实报告为仍缺少决策证据的阻塞项。

被评审范围可以是任务、diff、文件集、Spec 场景集、评审包、bug 修复、完成声明、产物包或 handoff 包。除非调查暴露真实的跨边界风险，否则信心闭环必须严格停留在既定范围内。

## 适用触发

在以下任一时刻立即使用：

- 完成普通代码编辑、代码修改或 bug 修复实现后，且在最终回复前。
- 声称 `DONE`、`APPROVED`、complete、fixed、passing、ready for review、safe to proceed、PR-ready、commit-ready 前。
- 从一个工作流产物阶段进入下一个阶段前。
- 发起子 Agent 评审、接收评审结论、处理评审反馈或准备再次提交评审前。
- 更新 `tasks.md`、关闭任务、交付产物或确认任务完成前。

## 术语与状态

- **Critical**：可能导致用户可见行为错误、数据丢失、安全/隐私风险、构建或核心测试失败、需求核心目标落空，或让后续阶段基于错误前提推进的问题。
- **Important**：可能造成需求偏差、明显回归、重要边界遗漏、失败路径缺失、评审依据不足，或需要修复后才能可靠推进的问题。
- **Unresolved Confidence Gap**：当前范围内仍缺少的具体证据、命令输出、用户决策、测试结果、设计依据或上下文。它是阻塞状态，不是继续推进的许可。
- **PASS / APPROVED**：只能在没有 Critical/Important 问题，并且 `Unresolved Confidence Gaps` 为 `None` 时返回。
- **BLOCKED / NEEDS_CHANGES / NEEDS_CONTEXT / NEEDS_USER_DECISION**：只要仍存在阻塞问题或缺证据，就必须使用对应阻塞状态。

## 证据标准

可接受的证据包括：

- 已检查的代码、diff、配置、Spec、设计、任务、日志、命令输出或测试结果。
- 已读取并理解的验证输出，而不是只运行命令。
- 能直接覆盖疑点的最小验证，例如单测、集成测试、类型检查、lint、构建、手动复现场景或审阅证据。
- 对无法验证事项的明确说明，以及继续判断所需的确切缺失证据。

不可接受的证据包括：

- “看起来没问题”“应该可以”“测试可能会过”这类主观判断。
- 只说“测试通过”，但没有说明运行了什么、覆盖什么、输出是什么。
- 用通过测试单独替代需求、边界、失败路径或评审反馈检查。
- 将范围外问题伪装成范围内完成，或将缺失证据包装成乐观结论。

## 闭环步骤

重复执行以下步骤，直到满足停止条件：

1. **定义被评审范围**  
   明确正在评估的任务、diff、文件、场景、完成声明、产物、评审包或 handoff 包。

2. **列出具体疑点**  
   枚举该范围自然引出的可能缺陷、回归、缺失测试、边界情况、失败路径、用户反馈风险、评审反馈风险和证据缺口。

3. **逐项调查疑点**  
   检查代码、测试、Spec、日志、命令输出、周边行为和相关既有决策。不得跳过仍会影响结论的疑点。

4. **修复、报告或转化**  
   - 确认为范围内的问题：修复。  
   - 确认为范围外的问题：报告范围边界和风险。  
   - 无法判断的问题：转化为 **Unresolved Confidence Gaps**，并写明所需的确切证据或用户决策。

5. **重新运行相关验证**  
   运行能证明修复有效或能关闭疑点的最小检查，并读取验证输出。

6. **再次通过信心门禁**  
   询问：现有证据是否已经支持在当前范围内达到 `100% confidence`？若没有，继续下一轮。

## 停止条件

只有在一次完整循环中没有产生新的具体阻塞疑点、没有 Critical 或 Important 问题遗留，并且 **Unresolved Confidence Gaps** 为 `None` 时，才能停止并返回 PASS/APPROVED。

如果循环中出现新疑点，必须先调查该疑点，再批准或完成。如果缺失证据阻止可靠判断，必须报告缺口，不得声明成功、完成、已修复、通过或可安全推进。

## 输出格式

报告闭环结果时使用以下结构：

```markdown
**Confidence Loop**
- Scope: [task, diff, claim, review package, artifact or handoff package]
- Concrete doubts checked: [summary]
- Fixed issues: [none | summary]
- Verification evidence: [commands, outputs, files inspected, tests, or review evidence]
- Unresolved Confidence Gaps: [None | exact missing evidence]
- Result: [PASS | BLOCKED]
```

要求：

- `Verification evidence` 必须具体到命令、输出摘要、文件、测试名称、审阅证据或无法运行的原因。
- `Unresolved Confidence Gaps` 不能写成模糊短语；必须写出缺什么证据，以及谁/什么系统能提供它。
- 结果为 `BLOCKED` 时，不得同时使用完成、已修复、已通过、ready 或 safe 等表达。

## 实现后信心闭环

为了便于 skill 发现，本 skill 也是实现后的默认门禁：在普通代码编辑、代码修改或 bug 修复实现后立即使用，尤其是在最终回复前，以及声称完成、已修复、通过、ready for review 或 safe to proceed 前。

当 Agent 完成自己负责的代码实现后，必须在向用户报告结果前运行或应用此闭环。触发范围包括 `ordinary code edits`、`code modifications` 和 `bug fix implementations`，触发时间点是 `before reporting complete, fixed, passing, ready for review, or safe to proceed`。

实现后的被评审范围必须覆盖：任务目标、diff、文件集、相关 Spec 场景、测试和该实现的已知风险。对于 bug 修复，实现后范围还必须包含 `original failure`、`modified code paths`、`verification evidence` 和 `known risks`，避免 Agent 只凭代码改动就声称已修复。

`post-implementation reports` 复用上方输出格式，并且至少描述已检查疑点、已修复问题、验证证据、**Unresolved Confidence Gaps** 和 `PASS | BLOCKED` 结果。只要仍有未解决信心缺口，Agent 就必须报告真实状态和缺失证据，而不能声称完成、已修复、通过、ready for review 或 safe to proceed。

此实现后触发会扩展普通实现路径；它不替代 spec-driven implementation、review、handoff 或 completion gates。已有门禁仍保留各自的范围、证据包、评审和阻塞规则，包括在 Critical/Important 问题或 Unresolved Confidence Gaps 存在时不得推进。

这是 `Agent-owned behavior gate`，不是 `file watcher`、`Git hook`、`daemon` 或 `runtime enforcement` 机制。它只在 Agent 评估自己刚完成的实现范围、准备报告或推进时运行；外部文件变化不会自动触发它。

## 评审包充分性门禁

在发起任何子 Agent 评审前，必须先应用此门禁。评审者必须获得足够上下文，才能在不虚构对话历史或用户意图的情况下评估请求范围。

主 Agent 的评审包必须包含：

- 范围；
- 当前产物或 diff；
- 已确认的用户决策；
- 范围内与范围外边界；
- 开放问题；
- 相关 Spec、设计、任务和测试；
- 可用的测试证据、命令和结果；
- 已知风险；
- 既有发现或缺口。

不得推断缺失上下文。如果缺失证据会阻止公平评审，评审者必须返回 `NEEDS_CONTEXT`、`NEEDS_USER_DECISION`，或在 **Unresolved Confidence Gaps** 下列出缺失证据。缺失证据是阻塞状态，不是猜测、`PASS` 或 `APPROVED` 的许可。

## 工作流 Handoff 信心闭环

此闭环适用于产物阶段交接门禁，包括但不限于：`exploring → proposing`、`proposing → specifying`、`specifying → designing`、`designing → planning` 和 `planning → spec-driven-development`。

1. 构建 handoff 评审包，包含当前产物或对话摘要、既有确认上下文、目标下一阶段、已知约束、明确排除项、开放问题，以及与该交接相关的成功标准。
2. 在发起评审前运行评审包充分性门禁。
3. 当子 Agent 可用时，使用 `workflow-handoff-reviewer-prompt.md` 请求只读评审。若子 Agent 不可用，则内联执行同等检查，并报告已采用内联 fallback。
4. 评审者返回 `PASS`、`NEEDS_CHANGES` 或 `NEEDS_USER_DECISION`。
5. 对每条发现，主 Agent 发送 **Resolution Package**，用证据将其标记为 `fixed`、`rejected`、`out_of_scope` 或 `needs_user_decision`。
6. 重新评审更新后的产物和 Resolution Package；重复直到返回 `PASS` 或 `NEEDS_USER_DECISION`。

只要 Critical/Important 发现或 Unresolved Confidence Gaps 仍存在，就不得推进。`NEEDS_USER_DECISION` 会停止 handoff，直到用户回答一个聚焦问题。

## 评审信心闭环

此闭环适用于独立代码评审、Stage 2 code-quality review，以及评审反馈的再次评审。

1. 定义评审范围：branch、任务、commit range、working tree diff 或 review package。
2. 在发起评审前运行评审包充分性门禁。
3. 评审者返回 `APPROVED`、`NEEDS_CHANGES` 或 `NEEDS_CONTEXT`。
4. 对每条发现，主 Agent 发送 **Resolution Package**，用证据将其标记为 `fixed`、`rejected`、`out_of_scope` 或 `needs_user_decision`。
5. 重新评审更新后的 diff、评审包和 Resolution Package；重复直到 `APPROVED`，或直到 `NEEDS_CONTEXT` 要求用户或外部证据。

评审者只有在没有 Critical/Important 问题且 **Unresolved Confidence Gaps** 为 `None` 时，才可以返回 `APPROVED`。当缺失证据阻止可靠评审时使用 `NEEDS_CONTEXT`；当范围内必须修复时使用 `NEEDS_CHANGES`。

## Resolution Package 要求

处理评审发现时，主 Agent 必须为每条发现提供一个明确状态：

- `fixed`：说明修改内容、影响文件、验证证据和为何关闭该发现。
- `rejected`：引用用户确认、Spec、设计、仓库上下文或代码证据，说明为什么该发现不成立。
- `out_of_scope`：说明明确的范围边界，并在必要时报告范围外风险。
- `needs_user_decision`：提出一个聚焦问题，并说明不同答案会改变的行为、边界、权限、失败结果或成功标准。

不得用笼统回复批量关闭发现；每条阻塞发现都需要可核查证据。

## 防误用规则

- 不要把纯猜测转换成发现；发现必须有当前范围内的证据。
- 不要用乐观措辞掩盖缺失证据。
- 不要把范围扩大到无关重构、泛化清理或额外设计。
- 不要用测试通过单独证明需求、边界、失败路径或评审关注点已经检查。
- 不要在 Critical 问题、Important 问题或审批阻塞证据缺口仍存在时声称批准。
- 不要因为时间、复杂度或缺工具而静默降低门禁；应报告真实缺口。

## 集成点

- 工作流产物交接在阶段转换前使用 Workflow Handoff Confidence Loop 和 `workflow-handoff-reviewer-prompt.md`。
- 实现者在返回 `DONE` 前运行此闭环。
- Controller 在任务完成前、更新 `tasks.md` 前运行或确认此闭环。
- 评审者在返回 `APPROVED` 前使用 Review Package Adequacy Gate 和 Review Confidence Loop。
- `verification-before-completion` 在任何 completion、fixed、passing、approved、commit-ready 或 PR-ready 声明前使用此闭环。

## 最小合规清单

在任何完成或批准声明前，确认以下答案均为“是”：

1. 当前范围是否明确？
2. 范围内的具体疑点是否已列出并调查？
3. 已确认问题是否已修复、报告为范围外，或转化为明确缺口？
4. 相关验证是否已运行或已说明无法运行的原因？
5. 验证输出是否已读取并纳入判断？
6. Critical/Important 问题是否为 0？
7. `Unresolved Confidence Gaps` 是否为 `None`？

只有全部为“是”，才能返回 `PASS`、`APPROVED` 或表达安全推进。
