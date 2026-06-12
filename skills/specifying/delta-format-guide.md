# Delta 规格格式参考

Delta spec 描述一个已接受变更如何改变既有行为规格。它通过明确区分新增行为、修改行为和移除行为，避免在归档时意外重写或丢失既有规格。

## 保留的格式标记

为保证归档工具和评审流程可识别，Delta spec 中必须保留以下英文标题和字段：

- `## ADDED Requirements`
- `## MODIFIED Requirements`
- `## REMOVED Requirements`
- `### Requirement:`
- `#### Scenario:`
- `GIVEN` / `WHEN` / `THEN` / `AND`
- `(Previously: ...)`
- `(Reason: ...)`

解释性内容可以使用项目约定语言；没有明确约定时，优先使用用户请求的语言。

## 何时使用 Delta Format

当 `specs/specs/` 中存在任何既有规格时，使用 Delta Format。

- 既有 domain 的行为发生变化：为该 domain 编写 Delta spec。
- 既有 domain 中新增行为：使用 `ADDED Requirements`。
- 既有 domain 中修改或移除 Scenario：使用 `MODIFIED Requirements`，并包含完整更新后的 Requirement。
- 既有项目中新增 domain：为新 domain 编写 Delta spec，并使用 `ADDED Requirements`。
- 项目中完全没有既有规格：不要使用 Delta Format，改用 Greenfield Format。

## 必需文件位置

```text
specs/changes/<change-name>/specs/<domain>/spec.md
```

当 domain 已存在时，必须使用与当前规格相同的 `<domain>` 名称。例如，当前规格为：

```text
specs/specs/authentication/spec.md
```

则 Delta spec 必须保存到：

```text
specs/changes/<change-name>/specs/authentication/spec.md
```

## 章节顺序

按以下顺序编写，并省略空章节：

1. `## ADDED Requirements`
2. `## MODIFIED Requirements`
3. `## REMOVED Requirements`

## 标准结构

```markdown
# Delta for [Domain Name]

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

### Requirement: [Existing Requirement Name]
The system SHALL [完整更新后的行为].
(Previously: [当前规格中的既有行为])

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

## 各章节规则

### ADDED Requirements

用于当前规格中不存在的新行为。

规则：

- 必须包含完整 Requirement 语句。
- 必须至少包含一个 happy-path Scenario 和一个 edge/error Scenario。
- 不得把既有 Requirement 换个名字后重复写入。
- 如果新行为依赖既有行为变化，必要时同时添加对应的 `MODIFIED Requirements`。

### MODIFIED Requirements

用于既有 Requirement 的任何变化，包括行为变化、约束变化、新增 Scenario、移除 Scenario、预期结果变化、权限变化、校验变化或失败结果变化。

规则：

- 默认使用既有 Requirement 标题；只有重命名本身属于变更时才改名。
- 必须包含完整更新后的 Requirement，不得只写差异片段。
- 必须包含归档后仍应保留的全部 Scenario。
- 必须在更新后的 Requirement 语句下一行立即包含 `(Previously: ...)`。
- 只要当前规格可用，`(Previously: ...)` 必须来自当前规格，不得凭记忆或重新概括。
- 必须至少包含一个 happy-path Scenario 和一个 edge/error Scenario。

为什么必须完整替换：归档时，`MODIFIED Requirements` 会替换目标规格中的旧 Requirement。任何被省略但本应保留的 Scenario 都可能在归档后丢失。

### REMOVED Requirements

用于归档后不应继续存在的行为。

规则：

- 必须使用既有 Requirement 标题。
- 必须包含具体的 `(Reason: ...)`。
- 通常不要包含 Scenario，除非 Scenario 有助于界定被移除的行为边界。
- 不要把“行为变化”写成 `REMOVED`；行为变化应写入 `MODIFIED`。
- 如果行为被替换，通常需要 `MODIFIED Requirements`；若替代行为是独立新行为，可同时使用 `ADDED Requirements`。

## 归档行为

变更被归档时，各章节对应的动作如下：

| Delta Section | Archive Action |
|---|---|
| `ADDED Requirements` | 将这些 Requirements 追加到目标 domain spec。 |
| `MODIFIED Requirements` | 用这些 Requirements 替换目标 domain spec 中匹配的既有 Requirements。 |
| `REMOVED Requirements` | 从目标 domain spec 删除匹配的既有 Requirements。 |

## 常见决策表

| 情况 | 使用 |
|---|---|
| 既有 domain 中新增全新行为 | `ADDED Requirements` |
| 给既有 Requirement 新增 Scenario | `MODIFIED Requirements` |
| 既有 Scenario 的预期结果变化 | `MODIFIED Requirements` |
| 校验规则变严格或变宽松 | `MODIFIED Requirements` |
| 权限、可见性、通知或失败结果变化 | `MODIFIED Requirements` |
| 行为被废弃且无替代 | `REMOVED Requirements` |
| 行为被另一个行为替代 | `MODIFIED Requirements`；如果替代行为是独立行为，可同时使用 `ADDED Requirements` |
| 项目中没有任何既有规格 | Greenfield Format，不使用 Delta Format |

## Delta 审查清单

保存 Delta spec 前，逐项验证：

- 空章节已省略。
- 未变化的 Requirements 未被重述。
- 每个 `ADDED` Requirement 都完整且可测试。
- 每个 `MODIFIED` Requirement 都是完整替换内容，不是局部 diff。
- 每个 `MODIFIED` Requirement 都立即包含 `(Previously: ...)`。
- 每个 `MODIFIED` Requirement 都保留了归档后仍应存在的 Scenario。
- 每个 `REMOVED` Requirement 都包含具体 `(Reason: ...)`。
- 每个有效 Requirement 都包含 happy-path 和 edge/error Scenario。
- Requirement 语句和 Scenario 中没有实现细节。
- 每个 Scenario 都有明确 actor、前置条件、单一触发动作和可观察结果。
- 所有会影响用户可见行为的开放问题都已确认，或已作为阻塞问题提出。
