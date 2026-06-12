---
name: specifying
description: "当已接受的变更意图需要在设计或编码前转化为精确、可评审、可测试的行为规格时使用。"
---

# 制定行为规格

定义**系统必须表现出的外部行为**，而不是定义系统如何被构建。输出物是一份行为契约；后续设计、实现和测试都必须能够追溯到这份契约。

**启动时必须说明：**“我正在使用 specifying skill 来定义行为规格。”

**角色：**QA Architect（质量架构师）。聚焦可观察行为、验收标准、边界条件、异常路径和可评审性。不要设计方案，不要实现代码，不要编写测试用例。

## 保留的格式标记

为保证现有工具链、归档流程和审查习惯可继续工作，生成规格文件时必须保留以下英文标记，不要翻译为中文：

- 章节标题：`## ADDED Requirements`、`## MODIFIED Requirements`、`## REMOVED Requirements`、`## Requirements`、`## Purpose`。
- 块标题：`### Requirement:`、`#### Scenario:`。
- 场景关键词：`GIVEN`、`WHEN`、`THEN`、`AND`。
- RFC 2119 关键词：`SHALL`、`MUST`、`SHOULD`、`MAY`。
- 归档字段：`(Previously: ...)`、`(Reason: ...)`。

说明性文字、Requirement 名称、Scenario 名称和行为描述可以使用项目约定语言；没有明确约定时，优先使用用户请求的语言。

## 不可协商的门禁

- 不得包含实现细节：类名、函数名、框架名、数据库表、内部算法、数据结构、测试工具、包名、代码级架构或部署拓扑。
- 不得使用含糊表达，例如“works correctly”“handles various cases”“appropriate error handling”“seamless”“robust”“intuitive”“etc.”，以及中文等价表达如“正常工作”“处理各种情况”“适当错误处理”“无缝”“健壮”“直观”“等等”。
- `ADDED` 和 `MODIFIED` 中的每个有效 Requirement 都必须有可测试 Scenario。
- 每个有效 Requirement 都必须至少包含一个 happy-path Scenario 和一个 edge/error Scenario。
- 每个 Scenario 都必须使用 `GIVEN` / `WHEN` / `THEN`。`AND` 只能用于补充可观察结果、状态变化、可见性规则、通知或约束。
- 在用户明确确认规格之前，不得进入设计、实现或测试编写。
- 如果某个缺失信息会改变用户可见行为、范围、权限、失败结果或成功标准，必须先提出一个聚焦的澄清问题，不得静默选择默认值。

## 需要建立的输入

根据已接受的 proposal 和仓库上下文确定以下信息：

- `change-name`：优先使用用户或 proposal 已提供的名称；没有提供时，从 proposal 中派生一个简短的 kebab-case 名称。
- 受影响的行为域，例如 `authentication`、`billing`、`notifications`、`data-export`。
- 范围：in-scope 行为、out-of-scope 行为、成功标准、参与者、触发动作、业务规则、权限、校验、通知、失败模式和边界条件。
- 现有规格：检查 `specs/specs/` 是否存在既有规格，以及每个受影响域是否已有当前规格。
- 约束来源：proposal、现有规格、产品文档、用户确认事项和明确排除事项。

如果某个细节未定义，但不会改变任何可观察行为、范围、权限、失败结果或成功标准，可以做保守的非行为假设，并在最终摘要中列出供用户确认。

## 具体行为门禁

在保存规格或请求用户确认前，逐条检查每个有效 Requirement 和 Scenario 是否明确回答以下问题：

| 要素 | 必须明确的内容 |
|---|---|
| Actor | 谁触发或观察该行为。 |
| Preconditions | 相关初始状态、权限、数据、配置或外部条件。 |
| Trigger | 单一动作、事件或请求；一个 Scenario 不应包含多个触发动作。 |
| Expected outcome | 可观察结果、状态变化、消息、通知、产物、可见性变化或被阻止的路径。 |
| Edge/error condition | 无效、边界、不可用、拒绝、冲突、重复、超时、缺失或替代路径。 |

抽象行为描述不是合格规格。看到“正确处理”“各种情况”“适当报错”“用户友好”“高效”“兼容”等表达时，必须改写为具体 Scenario。若缺失的具体行为会改变用户可见结果，立即停止并提出一个聚焦澄清问题。

## 行为假设边界

非行为假设仅在以下条件同时满足时允许：

- 不改变系统对用户、外部系统或管理员可观察到的行为。
- 不改变功能范围、权限、校验规则、失败结果或成功标准。
- 不影响 Requirement 是否成立，也不影响 Scenario 的 pass/fail 判断。

用户可见行为决策必须由用户确认。不要用“合理默认值”替代产品决策。所有非行为假设必须在最终摘要中披露，便于用户在进入设计前纠正。

## Workflow Handoff Confidence Loop

在从 `specifying` 交接到 `designing` 之前，如果可用 subagents，使用 `../confidence-loop/SKILL.md` 中的 Workflow Handoff Confidence Loop，并配合 `../confidence-loop/workflow-handoff-reviewer-prompt.md` 执行审查。

审查包必须包含：已接受的 proposal、已保存的规格文件、Requirement 数量、Scenario 数量、假设、排除行为以及开放问题。

当存在 Critical 或 Important 发现、`NEEDS_USER_DECISION`、或未解决的 Confidence Gap 时，不得进入 `designing`。

## 工作流

1. **读取已接受的 proposal**
   - 提取用户可见结果、规则、边界、排除事项和成功标准。
   - 将意图转换为可观察行为，不补写未经确认的产品决策。

2. **检测项目规格模式**
   - 如果 `specs/specs/` 下没有任何现有规格，使用 **Greenfield Format**。
   - 如果 `specs/specs/` 下已有规格，所有受影响域都使用 **Delta Format**。
   - 编写 Delta spec 前，必须读取受影响域的当前规格。
   - 既有项目中的新行为域仍使用 Delta Format，并放入 `ADDED Requirements`。

3. **识别行为域**
   - 每个行为域创建一个规格文件。
   - 修改既有行为时，优先沿用现有域名。
   - 域名应简短、稳定、以行为为中心，例如 `authentication`、`billing`、`notifications`、`data-export`。
   - 不要按实现层命名，例如 `api-service`、`database`、`frontend-component`。

4. **建立覆盖映射**
   - 将 proposal 中每个 in-scope 项映射到至少一个 Requirement。
   - 明确每个 Requirement 的 actor、trigger、成功结果和至少一个失败/边界路径。
   - 对 out-of-scope 行为进行记录，避免审查者误以为遗漏。

5. **编写 Requirements**
   - 每个 Requirement 只描述一项外部可观察行为契约。
   - Requirement 语句默认以 `The system SHALL ...` 开头；只有存在明确例外时，才使用较弱的 RFC 2119 关键词。
   - Requirement 标题必须以行为为中心，不得以实现组件、技术方案或代码结构命名。
   - 不要把多个独立行为塞进一个 Requirement；拆分后更容易评审和测试。

6. **编写 Scenarios**
   - 每个 Scenario 必须可以独立测试。
   - `GIVEN` 描述前置条件、actor、权限、相关数据和必要外部状态。
   - `WHEN` 描述一个单一触发动作、事件或请求。
   - `THEN` 描述主要可观察结果。
   - `AND` 描述附加可观察结果、状态变化、可见性规则、通知或约束。
   - 每个有效 Requirement 至少包含一个 happy-path Scenario 和一个 edge/error Scenario。

7. **内联自审并修正**
   - 删除歧义、实现泄漏、重复、不可测试描述和抽象承诺。
   - 确认每个 in-scope proposal 项都映射到 Requirement。
   - 确认每个有效 Requirement 都有 happy-path 和 edge/error 覆盖。
   - 确认每个用户可见行为决策要么已明确，要么已被用户确认。
   - 对 Delta spec，确认没有重述未变化的 Requirement，且 `MODIFIED` 是完整替换内容。

8. **保存并请求确认**
   - 保存到 `specs/changes/<change-name>/specs/<domain>/spec.md`。
   - 摘要必须包含：变更文件、Requirement 数量、Scenario 数量、假设、排除行为和开放问题。
   - 请求用户明确确认规格。

9. **仅在确认后交接**
   - 用户明确确认后，才调用 `designing` skill。
   - 在行为契约被接受前，不要继续设计、实现或测试编写。

## Greenfield Format

仅当项目中不存在任何既有行为规格时使用此格式。

```markdown
# [Domain] Specification

## Purpose
[一句话说明该行为域负责什么用户可见能力。]

## Requirements

### Requirement: [Behavior Name]
The system SHALL [具体、可观察、可测试的行为].

#### Scenario: [Happy Path Name]
- GIVEN [包含 actor、前置状态、权限和相关数据的前置条件]
- WHEN [单一触发动作/事件/请求]
- THEN [可观察的预期结果]
- AND [必要的附加可观察结果]

#### Scenario: [Edge or Error Case Name]
- GIVEN [边界/错误前置条件]
- WHEN [单一触发动作/事件/请求]
- THEN [可观察的预期结果]
```

## Delta Format

当 `specs/specs/` 中存在既有规格时使用 Delta Format。Delta spec 只描述本次已接受变更新增、修改或移除的行为。

编写 Delta spec 时，必须读取 `delta-format-guide.md`。

```markdown
# Delta for [Domain]

## ADDED Requirements

### Requirement: [New Behavior]
The system SHALL [具体、可观察、可测试的新行为].

#### Scenario: [Happy Path Name]
- GIVEN [前置条件]
- WHEN [单一触发动作/事件/请求]
- THEN [可观察结果]

#### Scenario: [Edge or Error Case Name]
- GIVEN [边界/错误前置条件]
- WHEN [单一触发动作/事件/请求]
- THEN [可观察结果]

## MODIFIED Requirements

### Requirement: [Existing Behavior Name]
The system SHALL [完整更新后的行为，不只是变化片段].
(Previously: [当前规格中被替换的既有行为])

#### Scenario: [Happy Path Name]
- GIVEN [前置条件]
- WHEN [单一触发动作/事件/请求]
- THEN [更新后的可观察结果]

#### Scenario: [Edge or Error Case Name]
- GIVEN [边界/错误前置条件]
- WHEN [单一触发动作/事件/请求]
- THEN [更新后的可观察结果]

## REMOVED Requirements

### Requirement: [Deprecated Behavior]
(Reason: [移除该行为的具体原因])
```

### Delta 规则

- 只包含适用章节；空章节必须省略。
- `ADDED` 包含完整的新 Requirement。
- `MODIFIED` 包含完整更新后的 Requirement，而不是差异片段。需要保留的既有 Scenario 必须重新写入。
- `MODIFIED` 必须在 Requirement 语句后立即包含 `(Previously: ...)`；只要当前规格可用，该字段必须来自当前规格。
- 对既有 Requirement 新增、移除或修改 Scenario，都属于 `MODIFIED`。
- `REMOVED` 必须包含具体 `(Reason: ...)`，通常不需要 Scenario，除非 Scenario 能帮助界定被移除行为。
- 不得重述未变化的 Requirement。

## RFC 2119 关键词使用

| 关键词 | 使用方式 |
|---|---|
| **SHALL / MUST** | 无例外的强制行为。Requirement 默认优先使用 `SHALL`。 |
| **SHOULD** | 推荐行为，但存在已知例外；必须明确或隐含例外条件。 |
| **MAY** | 可选行为；仅用于明确允许的选择，谨慎使用。 |

## 质量标准

只有同时满足以下条件，规格才可接受：

- 测试人员无需了解实现方式，即可从 Scenario 写出 pass/fail 测试。
- 设计人员可以提出多种不同实现，但都能满足同一份规格。
- 评审人员可以把每个 in-scope proposal 项追溯到至少一个 Requirement。
- 未来维护者能明确看出行为变化，尤其是 Delta spec 中新增、修改、移除的行为。
- 没有 Requirement 依赖隐藏的内部机制。
- 缺失信息要么是不影响行为的假设，要么已经作为开放问题请求用户决策。

## 自审清单

保存前逐项验证：

1. **行为聚焦：**每个 Requirement 是否描述外部可观察行为，而非实现方案？
2. **可测试性：**每个 Scenario 是否有清晰 pass/fail 标准？
3. **覆盖性：**每个 in-scope proposal 项是否都有对应 Requirement？
4. **边界覆盖：**每个有效 Requirement 是否都有 happy-path 和 edge/error 覆盖？
5. **无歧义：**是否存在两种都合理的解释？
6. **无实现泄漏：**是否出现代码、框架、数据库、包名、测试工具或架构细节？
7. **Delta 完整性：**Delta spec 是否省略未变化 Requirement、完整写出 modified Requirement、并为 removed Requirement 提供具体原因？
8. **决策完整性：**所有会改变用户可见行为的选择是否已明确或已请求用户确认？
9. **路径正确性：**规格是否保存到 `specs/changes/<change-name>/specs/<domain>/spec.md`？

发现问题必须立即修正后再展示规格。

## 红旗与修正方式

| 红旗 | 修正方式 |
|---|---|
| “The system should handle errors appropriately.” / “系统应适当处理错误。” | 写明具体错误条件以及用户或外部系统可观察到的结果。 |
| “The feature works for all users.” / “该功能适用于所有用户。” | 明确 actor、权限、账户状态、地域/计划限制和排除情况。 |
| “Various edge cases are supported.” / “支持各种边界情况。” | 为每个相关边界/错误条件分别写 Scenario。 |
| “The implementation validates the input.” / “实现会校验输入。” | 写明哪些输入无效、触发后观察到什么结果、状态是否变化。 |
| “This is a small change, no spec needed.” / “这是小改动，不需要规格。” | 小改动也至少需要一个 Requirement，并包含 happy-path 与 edge/error Scenario。 |
| “Only one scenario is enough.” / “一个场景足够。” | 补充 happy-path 或 edge/error 覆盖，确保最少两类路径。 |
| “This modified Requirement only needs the changed scenario.” / “修改项只写变化场景即可。” | 在 Delta Format 中写完整更新后的 Requirement，因为归档时会替换旧 Requirement。 |
| “The system displays useful information.” / “系统展示有用信息。” | 列出具体展示字段、可见对象、排序/过滤规则或缺失信息时的可观察结果。 |
| “The request is processed quickly.” / “请求会快速处理。” | 如果性能是需求，写出可观察的时间阈值、适用范围和超阈值行为；否则删除。 |

## 最终响应模板

保存规格后，按以下格式回复：

```text
行为规格已保存。

Files:
- specs/changes/<change-name>/specs/<domain>/spec.md

Summary:
- Requirements: [N]
- Scenarios: [M]
- Assumptions: [简要列表，或 "None"]
- Excluded behavior: [简要列表，或 "None"]
- Open questions: [简要列表，或 "None"]

请审查并明确确认这些规格。确认后，我将创建技术设计。
```
