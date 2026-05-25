---
name: dispatching-parallel-agents
description: 当请求可以拆成 2 个以上可并发运行的独立 workstreams，并且没有 shared mutable state、file ownership conflicts 或 sequential dependencies 时使用。
---

# 并行派发 Agents（Dispatching Parallel Agents）

## 目的（Purpose）

当一个任务包含彼此独立的问题域时，使用此 skill 协调多个隔离的 specialist agents。Orchestrator 仍然是 user-facing answer、task decomposition、integration、verification 和 final judgment 的唯一负责人。

Sub-agents 不会继承当前对话、隐藏假设或彼此的工作。每个派发任务都必须包含该 agent 独立完成所需的精确 context、scope、constraints 和 expected output。

**核心原则：** 每个 independent domain 派发一个 agent，然后通过单一 orchestration layer 整合 findings。

## 激活条件（Activation Criteria）

只有以下条件全部成立时，才使用此 skill：

- 存在 **2 个或更多可分离 workstreams**。
- 每个 workstream 都有清楚边界，例如 file、subsystem、feature slice、test group 或 review dimension。
- 没有 workstream 需要另一个 workstream 的结果才能开始。
- Agents 能避免编辑同一批文件或修改同一个 external state。
- Orchestrator 能检查、调和并验证返回结果。

优先在这些场景使用：

- 多个 failing test files 可能有不同原因。
- 独立 bugs 位于不同 modules 或 services。
- 大型 investigations 可以按 subsystem、API、package、platform 或 concern 拆分。
- 混合专家分析中，每个 specialist 都有有界角色，例如 planning、security review、test strategy 和 implementation review。

不要在这些场景使用：

- Failures 可能共享 root cause，应先一起诊断。
- 任务需要对整个系统保持单一连贯 mental model。
- Agents 会编辑相同 files、migrations、generated artifacts、dependency manifests 或 global configuration。
- 工作仍处于 exploratory，边界尚不清楚。
- 任务太小，orchestration overhead 超过收益。

如果 independence 不确定，先做短 triage pass。边界不清时，在 writer agents 前派发 read-only planning agents。

## 并行就绪清单（Parallel Readiness Checklist）

派发前回答这些问题：

| Check | Ready Signal | If Not Ready |
|------|--------------|--------------|
| Domain boundary | 每个 agent 拥有独立 file set、subsystem 或 concern | 先做 triage/planning pass |
| Dependency order | Agents 不需要彼此 outputs 就能开始 | 顺序执行或拆成 phases |
| Write conflicts | 可写 paths 不重叠 | 指派一个 writer，其他设为 read-only |
| Shared state | 没有 shared test database、service、branch state 或 generated artifact conflict | 串行化风险步骤 |
| Verification | 已知如何验证每个结果和集成结果 | 先定义 focused 和 full verification |

## 工作流（Workflow）

### 1. 拆分工作（Partition the Work）

按独立 problem domain 对请求分组：

- failing test file 或 test category
- module、package、service 或 API boundary
- platform 或 environment
- review concern，例如 security、correctness、performance 或 testability
- delivery phase，例如 planning、implementation、verification 或 review

对每个 domain，记录：

- owner agent role
- allowed scope
- forbidden scope
- expected deliverable
- verification method
- possible integration conflicts

### 2. 选择 Agent Type

使用能完成该 domain 的最小 specialist role：

| Role | Template | Use When |
|------|----------|----------|
| Planner | [`./planner-agent-prompt.md`](./planner-agent-prompt.md) | 需要在编辑前做 read-only codebase analysis、dependency mapping、implementation sequencing 或 risk assessment。 |
| Security Reviewer | [`./security-reviewer-prompt.md`](./security-reviewer-prompt.md) | 需要带 severity、evidence、confidence 和 coverage boundaries 的安全只读审查。通常通过 `requesting-code-review` 调用。 |
| TDD Guide | [`./tdd-guide-prompt.md`](./tdd-guide-prompt.md) | 需要 feature 的 test-first plan、behavior matrix 或 red-green-refactor coaching。 |
| Code Reviewer | [`../requesting-code-review/code-reviewer-prompt.md`](../requesting-code-review/code-reviewer-prompt.md) | 需要通用 code quality review。通过 `requesting-code-review` 调用，不要作为单独 user-facing flow。 |
| Debug/Fix Agent | Inline prompt | 需要针对一个 file、subsystem 或 failing test group 的有界 implementation 或 investigation。 |

### 3. 构造自包含 Dispatch Packet

每个 agent prompt 必须包含：

- **Objective:** 该 agent 的具体 outcome。
- **Scope:** 它负责的 files、directories、tests、modules 或 concerns。
- **Context:** 相关 errors、requirements、constraints、diffs、assumptions 和 prior findings。
- **Allowed actions:** read-only、write-limited、test-running permissions 或其他 tool constraints。
- **Forbidden actions:** 不可编辑的 files、不可改变的 behaviors、不可运行的 commands。
- **Success criteria:** agent 如何判断工作完成。
- **Return contract:** orchestrator 需要的确切 summary format。

Ad hoc agents 使用此模板：

```markdown
You are a focused sub-agent working on one independent domain.

## Objective
[Concrete task]

## Scope
- Own: [files/directories/tests/concerns]
- Do not touch: [out-of-scope areas]

## Context
[Paste all relevant errors, requirements, design notes, and constraints. Do not assume access to the parent conversation.]

## Working Rules
- [Allowed tools/actions]
- [Forbidden tools/actions]
- [Behavior-preserving constraints]
- [Conflict-avoidance constraints]

## Success Criteria
- [Measurable completion condition]
- [Focused verification command or evidence, if applicable]

## Return Format
### Outcome
[Done / Partial / Blocked]

### Root Cause or Key Findings
[Concise evidence-based explanation]

### Changes Made or Recommendations
- `[file]`: [change or recommendation]

### Verification
[Commands run, results, or why verification was not possible]

### Risks and Follow-ups
[Remaining concerns, integration risks, or open questions]
```

### 4. 并发派发（Dispatch Concurrently）

只有 scopes 已分离后，才并行派发 agents。除非明确指派，否则以下 shared resources 由 orchestrator 拥有：

- dependency manifests 和 lockfiles
- global config files
- migrations
- generated files
- test snapshots
- build scripts
- shared fixtures
- 被多个 domains 使用的 public interfaces

如果两个 agents 可能需要同一个 shared file，把其中一个设为 read-only，或按顺序编辑。

### 5. 整合结果（Integrate the Results）

Agents 返回后：

1. 接受任何变更前，先阅读每份 summary。
2. 检查 files、assumptions 或 interfaces 是否重叠。
3. 检查 diffs 或 recommendations 是否造成 behavior regressions。
4. 明确解决矛盾。
5. 可行时为每个 domain 运行 focused verification。
6. 运行最广泛且实际可行的 integration verification。
7. 在呈现最终结果前，应用 AI-generated code review checklist。

不要盲目拼接 sub-agent outputs。Orchestrator 必须产出一个连贯 final conclusion。

### 6. 向用户报告

最终回复应包含：

- 拆分出了哪些 workstreams
- integrated result
- 重要 fixes 或 findings
- 已执行 verification
- unresolved risks 或 incomplete parts

除非用户要求详细 logs，否则避免暴露 raw sub-agent transcripts。

## Review Orchestration 边界

Review-oriented specialists 应位于 **unified review orchestration** layer 背后。使用 `requesting-code-review` 作为 user-facing review entrypoint。Security、general code quality 或其他 review specialists 只作为 unified review flow 的内部 helpers 派发。

用户应收到一个 review conclusion，而不是彼此不协调的多个 reviewer opinions。

## AI 生成代码审查清单（AI-Generated Code Review Checklist）

对 sub-agents 产出的 code 或 recommendations 应用这些检查：

- **Behavior regression:** 对比 affected call sites 的前后行为。
- **Security assumptions:** 确保 validations、authorization checks、trust boundaries 和 secret handling 没有被削弱。
- **Hidden coupling:** 查找对 globals、shared state、timing、ordering 或 environment 的新依赖。
- **Over-broad edits:** 拒绝 assigned scope 外的变更，除非有理由。
- **Unnecessary complexity:** 移除不值得存在的 abstractions、helpers 或 layers。
- **Verification gaps:** 区分 verified claims 和 unverified assumptions。

## 示例（Examples）

### 好的并行派发（Good Parallel Dispatch）

Scenario：一次 refactor 后，三个无关文件中出现六个 test failures。

Claude Code dispatch example: `Agent("Fix agent-tool-abort.test.ts failures")`

- Agent 1 负责 `agent-tool-abort.test.ts` timing failures。
- Agent 2 负责 `batch-completion-behavior.test.ts` event-shape failures。
- Agent 3 负责 `tool-approval-race-conditions.test.ts` async completion failures。

每个 agent 都收到 failing test names、error messages、relevant scope、constraints 和 return contract。Orchestrator 随后检查 changes、检查 file overlap，并运行 full suite。

### 坏的并行派发（Bad Parallel Dispatch）

Scenario：多个 failures 都涉及同一个 request lifecycle state machine。

不要按 failing test file 派发多个 writer agents。先把 shared state machine 作为一个 domain 调查。理解 root cause 后，只拆分独立 follow-up work。

## 常见错误（Common Mistakes）

| Mistake | Why It Fails | Better Approach |
|--------|--------------|-----------------|
| “Fix all tests” | 太宽；agent 会失去焦点 | 指派一个 failing file 或 root-cause domain |
| Missing error context | Agent 会重复 discovery work 或猜测 | 包含 test names、errors、logs 和相关 constraints |
| Overlapping write scope | Agents 会产生 conflicts 或 inconsistent behavior | 指派独占 writable ownership |
| No return contract | Orchestrator 无法可靠整合 results | 要求 outcome、findings、changes、verification、risks |
| Skipping verification | Parallel fixes 可能静默冲突 | 运行 focused checks 和 integration checks |

## 验证协议（Verification Protocol）

所有 agents 返回后，尽可能完成以下 protocol：

1. 确认每个 domain 的 success criteria。
2. 根据 original scope 检查 changed files 或 recommendations。
3. 检查 overlapping edits 和 shared-interface drift。
4. 为每个 changed domain 运行 targeted tests。
5. 可行时运行 full test suite 或 broad integration check。
6. 记录任何无法执行的 verification。
