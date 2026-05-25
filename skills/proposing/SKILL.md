---
name: proposing
description: "当已经识别出具体变更，并且在写 specs 前需要对 intent、scope、constraints 或 success criteria 达成一致时使用。"
---

# 提出变更（Proposing Changes）

捕获一个变更的 intent、scope 和 high-level approach。这是 spec-driven workflow 中的**第一个 artifact**。

**开始时宣布：**“我正在使用 proposing skill 创建 change proposal。”

**角色：Product Manager。** 你捕获 WHAT 和 WHY，不捕获 HOW。

<HARD-GATE>
不要写代码、选择框架或讨论实现细节。这些属于 `designing`。
不要写 behavioral specs。这些属于 `specifying`。
没有用户确认 proposal 前，不要进入 specifying。
当仍有影响行为的 open questions 未解决时，不要进入 specifying；在这些问题被回答或明确排除出 scope 前，不要创建 behavioral specifications。
</HARD-GATE>

## 检查清单

1. **创建 change directory** — `specs/changes/<change-name>/`
2. **提出澄清问题**（如果尚未探索）— intent、scope、constraints
3. **写 `proposal.md`** — proposal boundary contract，包含 intent、scope、workflow、boundaries、definitions、open questions、approach 和 observable success criteria
4. **自审** — 检查完整性和清晰度
5. **用户确认** — 等待明确批准
6. **转入下一阶段** — 调用 `specifying` skill

## 变更目录（Change Directory）

创建如下 change 文件夹结构：

```
specs/changes/<change-name>/
├── proposal.md          ← 本 skill 创建
├── specs/               ← specifying skill 创建
├── design.md            ← designing skill 创建
└── tasks.md             ← planning skill 创建
```

## Proposal Boundary Contract（Proposal 边界契约）

每个 proposal 都是一份可审查的 boundary contract。它必须在写任何 behavioral specification 之前，让预期行为和排除行为可见。

影响行为的 open questions 是 blockers。如果某个 open question 会改变用户可见行为、scope boundaries、permissions、failure outcomes 或 success criteria，必须请用户先解决它，再进入 `specifying`。不要从未解决的假设创建 behavioral specifications。

## Workflow Handoff Confidence Loop（工作流移交信心循环）

当 subagents 可用时，在 `proposing → specifying` handoff 前使用 `../confidence-loop/SKILL.md` 中的 Workflow Handoff Confidence Loop，并使用 `../confidence-loop/workflow-handoff-reviewer-prompt.md`。

Review package 必须包含 `proposal.md`、已确认的 exploration context、in-scope behavior、out-of-scope behavior、User Workflow、Boundary Decisions、Definitions、Open Questions 和 Observable Success Criteria。

当仍有 Critical 或 Important findings、`NEEDS_USER_DECISION` 或 Unresolved Confidence Gaps 时，不要进入 `specifying`。

## Proposal 格式

```markdown
# Proposal: [Change Name]

## Intent
[为什么要做这个？它解决什么问题？]

## Scope

### In-scope behavior
- [具体交付项 1]
- [具体交付项 2]

### Out-of-scope behavior
- [明确排除项 1]
- [明确排除项 2]

## User Workflow
[谁在变更前、变更中和变更后做什么。]

## Boundary Decisions
- [定义第一版变更起止边界的决策。]

## Definitions
- [Domain term] — [本变更使用的含义。]

## Open Questions
- None blocking，或列出每个未解决问题以及它是否阻塞 specification。

## Approach
[用一个段落描述 high-level approach。不要包含 framework names、class names 或 implementation details。]

## Observable Success Criteria
- [可观察结果 1]
- [可观察结果 2]
```

## 铁律（Iron Laws）

- **每个 proposal 都必须有 "Out of scope" section。** Scope 无边界是 AI implementation 失败的头号原因。
- **每个 proposal 都必须暴露 User Workflow、Boundary Decisions、Definitions 和 Open Questions。** 隐藏边界会变成被发明出来的需求。
- **影响行为的 open questions 必须阻塞 specifying。** 如果答案会改变用户可见行为、边界、权限、失败结果或成功标准，先解决它，再写 specs。
- **Approach section 不得包含 implementation details。** "Use React Context" 太具体；"State management via framework-native context" 可以接受。
- **Success Criteria 必须可观察。** "Code is clean" 不可观察；"User can toggle between light and dark themes" 可观察。

## 自审

写完 proposal 后：

1. **Scope check：** "Out of scope" 是否足够具体？是否有人能用“它没被明确排除”为由加入 scope creep？
2. **Workflow check：** 读者是否能在不推断的情况下识别 user workflow、boundary decisions 和 definitions？
3. **Open question check：** 所有影响行为的 open questions 是否已解决或明确排除出 scope？
4. **Clarity check：** 读者是否能不提问就理解我们要构建什么？
5. **Size check：** 这是否是一个逻辑单元？如果覆盖多个独立功能，建议拆分。

## 红旗（Red Flags）

| Thought | Reality |
|---------|---------|
| "The approach section needs more detail" | 那是 `design.md` 的职责。Proposal 保持 high-level。 |
| "Let me also draft the specs" | 一次一个 artifact。先写 proposal，并获得确认。 |
| "The unresolved question is probably obvious." | 如果会改变行为，它就是 blocker。提问或缩小 scope。 |
| "This is obvious, skip the proposal" | 未写出的假设最容易造成返工。写下来。 |
| "Out of scope isn't needed for small changes" | 小变更会增长。边界在看似不需要时最重要。 |

## Proposal 之后

保存到 `specs/changes/<change-name>/proposal.md`。

> "Proposal saved to `specs/changes/<change-name>/proposal.md`. Please review and confirm, then I'll define the behavioral specifications."

等待用户确认。然后调用 `specifying` skill。
