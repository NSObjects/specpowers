---
name: specifying
description: "当已接受的 change intent 在 design 或 coding 前需要精确、可审查、可测试的 behavioral requirements 时使用。"
---

# Specifying Behavior（行为规格定义）

定义 **系统必须做什么**，而不是如何构建。输出是一份 behavioral contract，后续 design、implementation 和 tests 都必须能追溯回来。

**开始时宣布：**“我正在使用 specifying skill 定义 behavioral specifications。”

**角色：** QA Architect。聚焦 observable behavior、acceptance criteria、edge cases 和 reviewability。不要 design 或 implement solution。

## Non-Negotiable Gates（不可协商关卡）

- 不要包含 implementation details：class names、function names、framework names、database tables、internal algorithms、data structures、test tools、package names 或 code-level architecture。
- 不要使用 vague language，例如 “works correctly”、“handles various cases”、“appropriate error handling”、“seamless”、“robust”、“intuitive” 或 “etc.”。
- `ADDED` 或 `MODIFIED` sections 中的每个 active Requirement 都必须有 testable scenarios。
- 每个 active Requirement 都必须至少包含一个 happy-path scenario 和一个 edge/error scenario。
- 每个 Scenario 都必须使用 `GIVEN` / `WHEN` / `THEN`。`AND` 只用于追加 observable outcomes。
- 用户明确确认 specifications 前，不要进入 design、implementation 或 test writing。

## Inputs to Establish（需要确定的输入）

基于 accepted proposal 和 repository context 确定：

- `change-name`：使用已提供的 change name；否则从 proposal 派生简短 kebab-case name。
- Affected behavioral domains。
- In-scope behavior、out-of-scope behavior、success criteria、actors、triggers、business rules、permissions、validations、notifications 和 failure modes。
- `specs/specs/` 下已有 specs（如果存在）。

如果某个细节 underspecified 但不改变 observable behavior，做 conservative non-behavioral assumption，并在 final summary 中列出供用户确认。当缺失信息会导致无法写出 testable spec，且会改变 user-visible behavior 时，提出一个澄清问题。

## Concrete Behavior Gate（具体行为门槛）

保存或请求用户确认 specifications 前，确认每个 active Requirement 和 Scenario 都识别出：

- **actor:** 谁触发或观察该 behavior；
- **precondition:** 相关 starting state 和 data；
- **trigger action:** 被评估的单个 action、event 或 request；
- **expected outcome:** observable result、state change、message、artifact 或 blocked path；
- **edge or error condition:** 必须覆盖的 invalid、boundary、unavailable、denied 或 alternate path。

Abstract behavior descriptions 不能作为 specifications。“works correctly”、“handles various cases”、“appropriate error handling”、“seamless”、“robust”、“intuitive” 或 “etc.” 都是需要重写成 concrete scenarios 的信号。如果缺失的 concrete behavior 会改变 user-visible behavior、scope、permissions、failure outcomes 或 success criteria，把它视为 blocking issue，并在继续前提出一个聚焦澄清问题。

## Behavior Assumption Boundary（行为假设边界）

只有缺失细节不改变 observable behavior、scope、permissions、failure outcomes 或 success criteria 时，才允许 non-behavioral assumption。每个 non-behavioral assumption 都要在 final summary 中披露，让用户能在 design 前纠正。

User-visible behavior decision 必须在 specification 保存或批准前由用户确认。如果缺失决定会改变 observable behavior、scope、permissions、failure outcomes 或 success criteria，停止并提出聚焦澄清问题，不要静默选择 default。

## Workflow Handoff Confidence Loop（工作流交接信心循环）

Use the Workflow Handoff Confidence Loop from `../confidence-loop/SKILL.md` with `../confidence-loop/workflow-handoff-reviewer-prompt.md` before the `specifying → designing` handoff when subagents are available.

Review package 必须包含 accepted proposal、saved specifications、Requirement and Scenario counts、assumptions、excluded behavior 和任何 open questions。

当仍有 Critical 或 Important findings、`NEEDS_USER_DECISION` 或 Unresolved Confidence Gaps 时，不要进入 `designing`。

## Workflow（工作流）

1. **读取 accepted proposal**
   - 提取 user-visible outcomes、rules、boundaries 和 exclusions。
   - 将 intent 转成 observable behavior。

2. **检测 project/spec mode**
   - 如果 `specs/specs/` 没有 existing specs，使用 **Greenfield Format**。
   - 如果 `specs/specs/` 有 existing specs，对每个 affected domain 使用 **Delta Format**。
   - 写 Delta spec 前，读取 affected domain 当前 spec（如果存在）。
   - Existing project 中的新 domain 仍使用 Delta Format，并写入 `ADDED Requirements`。

3. **识别 domains**
   - 每个 behavioral domain 创建一个 spec file。
   - 修改 existing specs 时优先使用 existing domain names。
   - 使用简洁、稳定、面向 behavior 的 domain names，例如 `authentication`、`billing`、`notifications` 或 `data-export`。

4. **编写 requirements**
   - 每个 Requirement 描述一个 externally observable behavior contract。
   - Requirement statement 默认以 `The system SHALL ...` 开头，除非有意使用并说明较弱 RFC 2119 keyword。
   - Requirement titles 保持 behavior-oriented，不写 implementation-oriented。

5. **编写 scenarios**
   - 每个 Scenario 必须 independently testable。
   - `GIVEN` 表示 preconditions 和 relevant data。
   - `WHEN` 表示单个 trigger、action 或 event。
   - `THEN` 表示 primary observable result。
   - `AND` 表示 additional observable outcomes、state changes、visibility rules、notifications 或 constraints。
   - 接受 scenario 前应用 Concrete Behavior Gate。

6. **Self-review and fix inline（自审并就地修复）**
   - 移除 ambiguity、implementation leakage、duplication 和 untestable claims。
   - 确认每个 in-scope proposal item 都映射到至少一个 Requirement。
   - 确认每个 active Requirement 都有 happy-path 和 edge/error coverage。
   - 确认没有 abstract behavior descriptions 仍 unresolved。
   - 确认每个 user-visible behavior decision 都明确，或已由用户确认。

7. **保存并请求确认**
   - 保存到 `specs/changes/<change-name>/specs/<domain>/spec.md`。
   - 总结 changed files、Requirement count、Scenario count、assumptions 和任何 intentionally excluded behavior。
   - 请用户 review 并明确 confirm。

8. **仅在批准后转入下一阶段**
   - 用户明确确认后，调用 `designing` skill。
   - Behavior contract 被接受后，继续 `designing` skill。

## Greenfield Format（绿地格式）

仅当项目没有 existing behavioral specs 时使用此格式。

```markdown
# [Domain] Specification

## Purpose
[One sentence describing what this domain is responsible for.]

## Requirements

### Requirement: [Behavior Name]
The system SHALL [specific observable behavior].

#### Scenario: [Happy Path Name]
- GIVEN [precondition, actor, and relevant data]
- WHEN [single trigger/action/event]
- THEN [observable expected outcome]
- AND [additional observable outcome, if needed]

#### Scenario: [Edge or Error Case Name]
- GIVEN [edge/error precondition]
- WHEN [single trigger/action/event]
- THEN [observable expected outcome]
```

## Delta Format（增量格式）

当 `specs/specs/` 包含 existing specs 时使用此格式。Delta specs 只描述 accepted change 添加、改变或移除的 behavior。

编写 Delta specs 时读取 `delta-format-guide.md`。

```markdown
# Delta for [Domain]

## ADDED Requirements

### Requirement: [New Behavior]
The system SHALL [specific observable behavior].

#### Scenario: [Happy Path Name]
- GIVEN [precondition]
- WHEN [trigger]
- THEN [outcome]

#### Scenario: [Edge or Error Case Name]
- GIVEN [edge/error precondition]
- WHEN [trigger]
- THEN [outcome]

## MODIFIED Requirements

### Requirement: [Existing Behavior Name]
The system SHALL [complete updated behavior].
(Previously: [behavior from the current spec that is being replaced])

#### Scenario: [Happy Path Name]
- GIVEN [precondition]
- WHEN [trigger]
- THEN [updated outcome]

#### Scenario: [Edge or Error Case Name]
- GIVEN [edge/error precondition]
- WHEN [trigger]
- THEN [updated outcome]

## REMOVED Requirements

### Requirement: [Deprecated Behavior]
(Reason: [specific reason this behavior is removed])
```

### Delta Rules（增量规则）

- 只包含适用 sections；省略 empty sections。
- `ADDED` 包含完整 new Requirements。
- `MODIFIED` 包含 complete updated Requirement，不只写 changed fragments。如果 updated Requirement 仍应保留 existing scenarios，也要 restate them。
- 只要 current spec 可用，`MODIFIED` 必须包含 `(Previously: ...)`，并以 current spec 为 source。
- 对 existing Requirement 添加、移除或改变 scenarios，都属于 `MODIFIED` Requirement。
- `REMOVED` entries 需要 specific reason，且不需要 scenarios。
- 不要 restate unchanged Requirements。

## RFC 2119 Keyword Use（RFC 2119 关键词使用）

| Keyword | Use |
|---|---|
| **SHALL / MUST** | 没有允许例外的 mandatory behavior。Requirements 优先使用 `SHALL`。 |
| **SHOULD** | 有已知例外的 recommended behavior。清楚说明或隐含 exception。 |
| **MAY** | Optional behavior。只在明确允许选择时谨慎使用。 |

## Quality Bar（质量门槛）

Specification 只有在满足以下条件时才可接受：

- Tester 可直接从 scenarios 写 pass/fail tests，不需要询问系统如何实现。
- Designer 可以提出多种仍满足同一 specs 的 implementations。
- Reviewer 可以将每个 in-scope proposal item 追溯到 Requirement。
- Future maintainer 能准确看出 behavior 发生了什么变化，尤其在 Delta specs 中。
- 没有 Requirement 依赖 hidden internal mechanics。

## Self-Review Checklist（自审清单）

保存前确认：

1. **Behavioral focus:** 每个 Requirement 是否描述 externally observable behavior？
2. **Testability:** 每个 Scenario 是否能用 clear pass/fail criteria 测试？
3. **Coverage:** 每个 in-scope proposal item 是否都有对应 Requirement？
4. **Edge cases:** 每个 active Requirement 是否包含 happy-path 和 edge/error coverage？
5. **Ambiguity:** 是否有 Requirement 或 Scenario 可被两种有效方式解释？
6. **Implementation leakage:** 是否出现 code、framework、database、package 或 architecture references？
7. **Delta integrity:** 对 Delta specs，unchanged Requirements 是否已省略，modified Requirements 是否完整，removed Requirements 是否有 justification？

呈现 specs 前立即修复问题。

## Red Flags and Corrections（风险信号和修正）

| Red Flag | Correction |
|---|---|
| "The system should handle errors appropriately." | 命名 exact error condition 和 expected observable result。 |
| "The feature works for all users." | 定义适用 actors、permissions、states 和 exclusions。 |
| "Various edge cases are supported." | 为每个 relevant edge/error condition 写单独 scenario。 |
| "The implementation validates the input." | 指定 invalid input，以及 user/system 会观察到什么。 |
| "This is a small change, no spec needed." | 小变更仍需要至少一个带 scenarios 的 Requirement。 |
| "Only one scenario is enough." | 添加 happy-path 和 edge/error coverage。 |
| "This modified Requirement only needs the changed scenario." | Delta Format 中，包含 complete updated Requirement，因为 archive 时它会替换旧版本。 |

## Final Response Template（最终回复模板）

保存 specs 后回复：

```text
Behavioral specifications saved.

Files:
- specs/changes/<change-name>/specs/<domain>/spec.md

Summary:
- Requirements: [N]
- Scenarios: [M]
- Assumptions: [brief list or "None"]
- Excluded behavior: [brief list or "None"]

Please review and confirm the specifications. After confirmation, I will create the technical design.
```
