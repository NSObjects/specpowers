---
name: requesting-code-review
description: 当用户要求独立代码审查、合并前审查、重大功能后审查、风险修复后审查，或需要一次新审查来降低实现风险时使用。
---

# 请求代码审查（Requesting Code Review）

使用此 skill 通过单一对外入口运行独立 code review。主 agent 负责调度，向 reviewer 发送有边界的 review package，整合 specialist reviewer 的发现，并向用户返回一个合并后的结论。

Reviewer 只接收打包后的 review context，而不是完整会话历史。这样 review 会聚焦在实现、specification 和 changed code 上，而不是主 agent 的推理过程。

## 适用范围（Scope）

此 skill 用于 `spec-driven-development` 内置 review checkpoints 之外的手动或独立 review。

适用场景：

- 用户明确要求 code review。
- 重大 feature 或高风险 fix 刚完成。
- 变更已准备进入 merge 或 release gate。
- 主 agent 卡住，需要一个有边界的 second opinion。
- Refactor 需要在实现前或实现后做 baseline check。

不要把此 skill 当作常规实现、测试，或 `spec-driven-development` 已执行的 per-task review flow 的替代品。

## 统一审查模型（Unified Review Model）

1. 在完整请求范围上运行通用 `specpowers:code-reviewer` review。
2. 只有存在具体 risk hypothesis 时，才升级给 specialist reviewer。
3. 由主 agent 去重并调和所有 findings。
4. 只返回一个最终 user-facing conclusion：`APPROVED`、`NEEDS_CHANGES` 或 `NEEDS_CONTEXT`。

Specialist reviewers 只深化一个有边界的 risk area。它们不是单独的 user-facing workflows。

## 平台派发（Platform Dispatch）

使用当前平台最接近的 review mechanism：

Claude Code: use `Agent` tool with `specpowers:code-reviewer`；旧的 `Task` 引用视为兼容 alias。

| Platform | Dispatch method |
|---|---|
| Claude Code | 使用 `Agent` tool 调用 `specpowers:code-reviewer`。旧的 `Task` 引用视为兼容 alias。 |
| Codex | 使用填好的 `./code-reviewer-prompt.md` 调用 `spawn_agent(agent_type="worker", message=...)`。 |

## 审查包要求（Review Package Requirements）

派发前，先构造紧凑的 review package，并应用 `specpowers:confidence-loop` 的 Review Package Adequacy Gate。Reviewer 应接收到足够 context，可以在不读取完整对话的情况下评估变更。

必需字段：

- `{WHAT_WAS_IMPLEMENTED}` — 已完成变更的事实性摘要。
- `{SPEC_SCENARIOS}` — GIVEN / WHEN / THEN scenarios，或 `None provided`。
- `{BASE_SHA}` — 起始 commit、merge base，或明确的 review base。
- `{HEAD_SHA}` — 结束 commit 或明确的 review head。
- `{DESCRIPTION}` — 目的、约束、已知风险、相关 test results，以及明确排除在 scope 外的内容。

如果 package 无法包含公平 review 所需的 diff、scope、相关 specs/design/tasks、test evidence、known risks 或 prior findings/gaps，先补齐缺失证据。不要让 reviewer 猜；否则应预期 `NEEDS_CONTEXT` / **Unresolved Confidence Gaps**，而不是 approval。

有用的 preflight commands：

```bash
git status --short
BASE_SHA=$(git merge-base HEAD origin/main)
HEAD_SHA=$(git rev-parse HEAD)
git diff --stat "$BASE_SHA..$HEAD_SHA"
```

窄范围 task review 中，将 `BASE_SHA` 设为该 task 之前的 commit。用户只要求审查一个 fix 或 follow-up change 时，不要默认使用 branch merge base。

如果变更包含 uncommitted work，要么先提交再 review，要么在 `{DESCRIPTION}` 中明确包含 working-tree diff/context，并将 `{HEAD_SHA}` 标记为 `WORKTREE`。Reviewer 未收到这些内容时，不要声称 review 覆盖了 uncommitted changes。

## 请求审查流程（How to Request Review）

1. **确定 scope。** 确认 review 覆盖整条 branch、一个 task、一个 commit range，还是当前 working tree。
2. **收集 specification context。** 包含相关 Spec Scenarios。若不存在，写 `None provided`，并要求 reviewer 基于 description 和 tests 评估。
3. **收集 implementation context。** 摘要说明改了什么、为什么改，以及已知限制。
4. **收集 test context。** 包含已经运行的相关 test commands 和结果。未运行 tests 时，明确说明。
5. **填写 `./code-reviewer-prompt.md`。** 用具体值替换所有 placeholders。
6. **派发或 inline review。** 使用上方 platform dispatch table。
7. **综合 findings。** 向用户返回一个合并结果和单一最终结论。

## 专项升级（Specialist Escalation）

默认使用 general reviewer。只有存在明确 risk area 时，才增加 specialist reviewer。

当 diff 触及以下内容时，security escalation 是合理的：

- authentication 或 authorization。
- secrets、tokens、credentials 或 key material。
- permissions、roles、access checks 或 tenant boundaries。
- untrusted input、parsing、deserialization、uploads 或 external callbacks。
- sensitive data flows、logging、telemetry 或 privacy boundaries。
- externally exposed API behavior 或 attack surface。

Specialist template：

- Security deep review: `../dispatching-parallel-agents/security-reviewer-prompt.md`

升级时，specialist prompt 必须限定在确切 concern 上。除非整个 diff 都是 security-sensitive，否则不要要求 specialist 重新审查完整 diff。

需要 specialist escalation 时，也必须保持在同一个对外 review entrypoint 后面，并返回一个合并结论。

## 综合规则（Synthesis Rules）

主 agent 必须先整合 review output，再回复用户。

- 去重 overlapping issues。
- 调和 general reviewer 与 specialist reviewer 之间的 disagreements。
- 只有理由清楚时才提升或降低 severity。
- Blocking findings 放在最前。
- 可用时包含 file paths、line numbers、scenario names 和 evidence。
- 不要把 raw reviewer output 直接粘贴为最终答案。
- 不要展示来自不同 reviewers 的分裂式最终决策。

最终 user-facing result 应包含：

```markdown
## Review Result
**Decision:** APPROVED / NEEDS_CHANGES / NEEDS_CONTEXT
**Why:** [short synthesis]

## Blocking Issues
- [Critical or Important issues, approval-blocking confidence gaps, or "None"]

## Non-Blocking Notes
- [Minor issues or follow-ups, or "None"]

## Specialist Review
- `none` — no specialist review was needed
- `security-reviewer` — [summary, only if performed or recommended]

## Next Step
[fix, re-review, merge, or continue]
```

## 重新审查循环（Re-Review Loop）

每次 re-review 都使用 `specpowers:confidence-loop` 的 Review Confidence Loop。

修复后：

1. 只审查 fix 时，使用前一次 review head 作为新的 base。
2. 在 `{DESCRIPTION}` 中包含 prior blocking findings 和 unresolved confidence gaps。
3. 包含 Resolution Package，将每个 prior item 分类为 `fixed`、`rejected`、`out_of_scope` 或 `needs_user_decision`，并附 evidence。
4. 请 reviewer 验证 fixes 已处理这些 findings、关闭 confidence gaps，且未引入 regressions。
5. 重复直到没有 Critical 或 Important issues，也没有 approval-blocking unresolved confidence gaps。

## 决策策略（Decision Policy）

- 任何 Critical issue => `NEEDS_CHANGES`。
- 任何 Important issue => `NEEDS_CHANGES`。
- 缺少 context 或存在 approval-blocking evidence gap => `NEEDS_CONTEXT`。
- 任何 approval-blocking unresolved confidence gap 且需要 in-scope fix => `NEEDS_CHANGES`。
- 只有 Minor issues 时，通常 `APPROVED` 并附 notes。
- 缺失或不完整的 Spec Scenarios 不会自动阻塞 review，但已提供 required scenarios 却缺少 tests 属于 Critical。
- 如果 reviewer 判断错误，用 code、tests 或 specification evidence push back。

## 示例（Example）

```text
Context: completed a branch-level review before merge.

BASE_SHA=$(git merge-base HEAD origin/main)
HEAD_SHA=$(git rev-parse HEAD)

Dispatch specpowers:code-reviewer with:

WHAT_WAS_IMPLEMENTED:
  Added verifyIndex() and repairIndex() for conversation index maintenance.

SPEC_SCENARIOS:
  Scenario: Detect orphaned entries
    GIVEN an index with references to deleted files
    WHEN verifyIndex() runs
    THEN it reports orphaned entries with file paths

  Scenario: Repair orphaned entries
    GIVEN verifyIndex() found orphaned entries
    WHEN repairIndex() runs
    THEN orphaned entries are removed from the index

BASE_SHA:
  a7981ec

HEAD_SHA:
  3df7661

DESCRIPTION:
  Added verification and repair support for four issue types.
  Tests run: npm test -- index-maintenance.test.ts — passed.
  Known risk: repair mutates persistent index state.

Reviewer result:
  Decision: NEEDS_CHANGES
  Blocking issue: Important — repairIndex() removes orphaned entries but does not report repair count.

Main agent response:
  Consolidate the issue, fix it, and re-request review for the fix range.
```

## 风险信号（Red Flags）

严禁：

- 声称 review 覆盖了未包含在 diff 或 package 中的 code。
- 因为变更看起来简单就跳过用户要求的 review。
- 把一个 review request 拆成多个 user-facing review workflows。
- 没有具体 risk hypothesis 就启动 specialist reviewers。
- 忽略 Critical issues。
- 在用户未明确接受风险时，继续推进 unresolved Important issues。
- 不经主 agent 综合，就把 reviewer output 当作最终结论。

参见：

- Reviewer template: `./code-reviewer-prompt.md`
- Specialist deep-dive template: `../dispatching-parallel-agents/security-reviewer-prompt.md`
- Handling feedback: `receiving-code-review` skill
