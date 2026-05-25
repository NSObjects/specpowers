---
name: exploring
description: "当请求含糊、不完整、有战略歧义，或在决定构建什么之前需要项目上下文时使用。"
---

# 探索想法（Exploring Ideas）

通过简短协作对话，把不清楚的想法变成共享、可行动的理解。使用最少必要探索：足以避免错误假设，但不要多到变成 design 阶段。

**开始时只宣布一次：**“我正在使用 exploring skill 理解我们要构建什么。”

## 硬门槛（Hard Gate）

在 `exploring` 期间，agent MUST NOT：

- 创建或编辑 project artifacts，例如 `proposal.md`、specs、design docs、task lists、tickets 或 implementation files；
- 调用 implementation、design、task-planning 或 coding skills；
- 在需求仍在发现阶段时开始构建；
- 把 implementation research 当成单独可见 workflow stage。

唯一可见输出是对话：问题、摘要、trade-offs、recommendations 和 alignment checks。

只有在用户确认已探索方向后，终止转换才是 `proposing`。

## 使用时机（When To Use）

当以下任一情况成立时，使用 `exploring`：

- 用户描述了目标，但没有描述具体 outcome。
- Requirements、constraints、users、success criteria 或 scope 缺失。
- 请求可能包含多个独立 features 或 subsystems。
- 正确 approach 取决于既有 codebase patterns、dependencies、integrations 或 prior art。
- 用户请求 solution，但存在多个有效 solution shapes。

不要对已经具体且有边界的 implementation requests 过度使用此 skill。如果请求的变更具体且有界，转交给合适的下一个 skill。

## 操作循环（Operating Loop）

1. **检查可用上下文**
   - 检查现有 files、docs、recent commits、project structure 和已有 specs。
   - 识别这是 greenfield 还是 brownfield work。
   - 检查现有 behavior specifications，尤其是 `specs/` 或 `specs/specs/` 等已知 spec directories。

2. **先评估 scope，再问细节**
   - 判断请求是一个 feature、一个 workflow，还是多个独立 subsystems。
   - 如果请求太宽，先拆解，再问产品细节。

3. **一次澄清一件事**
   - 每条消息只问一个问题。
   - 当 multiple-choice questions 能降低用户负担时优先使用。
   - 聚焦 purpose、users、constraints、exclusions、success criteria 和可接受 trade-offs。
   - 不要询问可用上下文已经回答的问题。

4. **只有当研究会改变决策时才研究**
   - 先搜索当前代码库。
   - 只有当 codebase context 不足，且外部证据会实质影响 recommendation 时，才查相关外部来源。
   - 保持研究有界，并把它综合进 exploration conversation。

5. **呈现选项**
   - 上下文足够后，提出 2-3 个可行 approaches。
   - 以推荐 approach 开头。
   - 对每个 option，总结 trade-offs、risk、complexity，以及它和既有 patterns 的契合度。

6. **确认对齐**
   - 重述已达成一致的问题、scope、non-goals、constraints 和推荐方向。
   - 在请求继续前，呈现下面的 Alignment Checkpoint。
   - 询问是否进入 `proposing`。

7. **转换**
   - 只有用户确认后，才调用 `proposing`。
   - 不要从 `exploring` 调用 implementation skills。

## Alignment Checkpoint（对齐检查点）

离开 `exploring` 前，呈现一份用户可审查的 alignment checkpoint，包含：

- **problem statement:** 正在追求的具体问题或结果；
- **target users:** 谁使用或受益于该变更；
- **primary workflow:** 变更前、变更中、变更后发生什么；
- **inputs and outputs:** 相关的重要信息、动作、artifacts 或可见结果；
- **in-scope behavior:** 第一版变更覆盖什么；
- **out-of-scope behavior:** 明确不覆盖什么；
- **constraints:** 技术、产品、安全、兼容性、日程或运营限制；
- **failure modes:** 预期 invalid states、errors、blocked paths 或 unavailable dependencies；
- **open questions:** 剩余 decisions，分为 blocking 和 non-blocking。

影响行为的 open questions 会阻塞转换。如果任何 open question 会改变用户可见行为、scope boundaries、permissions、failure outcomes 或 success criteria，提出一个聚焦澄清问题或说明 blocker。在 blocker 解决前，或用户明确缩小 scope 排除它前，不要创建 `proposal.md`。

## Workflow Handoff Confidence Loop（工作流移交信心循环）

当 subagents 可用时，在 `exploring → proposing` handoff 前使用 `../confidence-loop/SKILL.md` 中的 Workflow Handoff Confidence Loop，并使用 `../confidence-loop/workflow-handoff-reviewer-prompt.md`。

Review package 必须包含 alignment checkpoint、已确认用户回答、open questions、scope boundaries、constraints 和 intended proposal direction。

当仍有 Critical 或 Important findings、`NEEDS_USER_DECISION` 或 Unresolved Confidence Gaps 时，不要进入 `proposing`。

## Scope 评估（Scope Assessment）

详细澄清前，对请求分类：

| Scope | Signal | Action |
|---|---|---|
| Single feature | 一个用户目标、一个主 workflow、边界清楚 | 继续正常 exploration |
| Compound feature | 一个目标包含多个依赖部分 | 澄清依赖和最小 first slice |
| Multiple subsystems | auth、billing、analytics、chat、storage、admin、integrations 等独立 domains | 停止细节追问，先拆解 |
| Platform/product | 宽泛产品愿景或多个 user roles/workflows | 定义 phases，并选择第一个 sub-project |

如果需要拆解，直接说明：

> "This looks like several independent features. Let's break it into sub-projects before refining details."

然后帮助识别：

- 独立部分；
- 它们如何彼此依赖；
- 最小有价值 first slice；
- 哪个 sub-project 应先进入 spec cycle。

当 workflow 支持该结构时，每个 sub-project 都应有自己的 `specs/changes/<name>/` cycle。

## 提问指南（Questioning Guidelines）

好的 exploration questions 要具体且面向决策。

优先：

> "Should this be optimized for speed of delivery, long-term extensibility, or lowest operational risk?"

避免：

> "Tell me more about what you want."

用问题发现：

- **Outcome:** 工作完成后应当成为什么状态；
- **User:** 谁使用或受益；
- **Workflow:** feature 之前、期间、之后发生什么；
- **Constraints:** technology、security、performance、budget、schedule、compliance；
- **Success criteria:** 可观察验收条件；
- **Non-goals:** 明确保持在 scope 外的内容。

## Exploring 中的实现研究（Implementation Research Inside Exploring）

Implementation research 只允许用于提升 exploration 质量。它不会改变可见阶段。

### 何时研究

- 在 adopting existing solution 与 building custom code 之间选择；
- 比较 dependencies、integrations 或 architectural patterns；
- 检查当前代码库是否已有相似 behavior；
- 评估 risk、compatibility、migration cost 或 maintenance burden；
- 验证会实质影响推荐 approach 的假设。

### 何时跳过研究

- 请求可以通过正常提问澄清；
- 既有项目 patterns 已经清楚决定方向；
- 结果不会改变 recommendation；
- 问题属于 design 或 implementation，而不是 exploration。

### 研究顺序

1. 先搜索当前代码库。
2. 再检查内部 docs/specs。
3. 仅在需要时使用外部来源。
4. 返回简洁证据，并将其转化为 trade-offs。

### 平台派发（Platform dispatch）

委派研究时使用填好的 `./implementation-researcher-prompt.md` template。这是有界 research 的可选 subagent delegation。

- Claude Code：使用 `Agent` tool 和 general-purpose agent。旧环境中 `Task` 可能作为 backward-compatible alias 存在。
- **Codex：** 使用 `spawn_agent(message=...)`。

主 Agent 仍负责 synthesis、recommendation 和 user alignment。

## 完成标准（Completion Criteria）

只有全部条件满足时，exploration 才完成：

- Problem statement 清楚。
- User 和 primary workflow 足够清楚，可以据此 proposing。
- Inputs、outputs、in-scope behavior、out-of-scope behavior、constraints 和 failure modes 已说明。
- Scope 和 non-goals 明确。
- Major constraints 和 risks 已知，或被有意延后。
- 影响行为的 open questions 已解决，或用户已明确把它们排除在 first change 之外。
- 已呈现带 alternatives 的 recommended approach。
- 用户已同意进入 `proposing`。

## 红旗（Red Flags）

如果出现以下想法，停止并回到 exploration：

| Thought | Corrective action |
|---|---|
| "I already know what they want." | 询问或验证缺失假设。 |
| "I'll explore while implementing." | 不要实现；先澄清。 |
| "The scope is probably fine." | 先分类 scope，再问细节。 |
| "This is too simple to explore." | 使用更短 exploration，而不是零 exploration。 |
| "The user will correct me later." | 现在就让假设可见。 |
| "One more question would be annoying." | 只问最高价值的下一个问题。 |
| "Research would be interesting." | 只有研究会改变决策时才研究。 |

## 常见合理化（Common Rationalizations）

| Excuse | Reality |
|---|---|
| "The user said just build it." | 这只说明紧迫性，不说明 requirements。 |
| "I'll figure out details as I go." | 细节就是 requirements；猜测会造成返工。 |
| "Asking questions wastes time." | 构建错误东西更浪费时间。 |
| "This resembles another project." | 相似性有用，但差异定义工作。 |

## 移交到 Proposing（Handoff To Proposing）

准备好后，在对话中总结：

- agreed problem；
- target users/workflow；
- scope 和 non-goals；
- constraints 和 risks；
- recommended approach；
- 可以在 proposing 中安全解决的 open questions。

然后询问：

> "I have a clear understanding of what we're building. Ready to create a proposal. Shall I proceed?"

确认后，调用 `proposing`，不要调用 implementation skills。

## 关键原则（Key Principles）

- Scope before details。
- 一次一个问题。
- 有帮助时使用 multiple choice。
- 优先最小有价值 first slice。
- 让假设明确可见。
- 承诺前先探索 alternatives。
- 只有证据会改变决策时才研究。
- `exploring` 期间不创建 artifacts。
