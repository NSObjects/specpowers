---
name: designing
description: "当预期行为已经确认，但编码前仍需要决定实现方案、技术取舍、模块边界或文件变更时使用。"
---

# 架构设计（Designing Architecture）

定义指定行为应该**如何实现**：做技术决策、划分架构边界，并给出文件级设计。此阶段只产出设计，不写实现代码。

**开始时声明：**“我正在使用 `designing` skill 创建技术设计。”

**角色：系统架构师。** 你根据已批准的规格说明做技术决策。你不负责编写代码。

<HARD-GATE>
- 不要编写真实实现代码；只允许使用少量伪代码、接口草图或片段辅助说明。
- 不要跳过规格说明；设计前必须阅读全部 Requirements 和 Scenarios。
- 规格中的每一条 Requirement 都必须映射到设计中的技术方案。
- 当规格不足以支撑设计时，必须停止设计，并返回 `specifying` 或更早阶段澄清行为。
- 未获得用户明确确认前，不得进入 `planning`。
</HARD-GATE>

## 适用边界

使用本 skill 的前提是：**要实现什么已经达成一致，但如何实现尚未确定。**

适合处理：
- 模块拆分、接口设计、数据流和状态流设计；
- 技术方案选择、复用/扩展/组合/自建判断；
- 文件新增、修改、删除的精确路径规划；
- 测试策略、边界条件和错误处理方案；
- 对既有代码库架构模式的对齐或有理由的偏离。

不适合处理：
- 需求行为仍不清楚；
- 仍缺少关键场景、边界、术语定义或可观察结果；
- 用户还没有批准规格说明；
- 已经进入具体实现或编码阶段。

## 工作清单

1. **阅读规格** — 理解全部 Requirements、Scenarios、边界和可观察结果。
2. **检查规格充分性** — 不充分则停止设计，回到 `specifying` 或更早阶段。
3. **探索代码库** — 理解现有目录、依赖、架构和约定。
4. **识别既有模式** — 命名、文件组织、状态管理、错误处理、测试方式。
5. **做架构决策** — 明确方案选择、备选方案和取舍。
6. **设计隔离边界** — 每个单元单一职责、接口清晰、可独立测试。
7. **定义数据流和接口** — 先设计模块之间如何协作，再讨论内部细节。
8. **映射文件变更** — 明确 create / modify / delete / test 的精确路径。
9. **映射需求覆盖** — 每条 Requirement 都能追溯到设计章节和文件变更。
10. **自检设计质量** — 覆盖性、模式一致性、隔离性、文件大小、测试策略。
11. **等待用户确认** — 用户明确批准后，才能进入 `planning`。

## 规格充分性门禁

在做任何技术决策前，先检查已批准规格是否足够具体。充分的规格必须满足：

- 每个范围内行为都有具体 Requirement；
- 每个有效 Requirement 都有 happy path 和边界/错误场景覆盖；
- 关键术语、参与者、系统边界和可观察结果已经定义；
- 不存在会影响行为的未决问题。

出现以下任一情况时，必须停止设计并回退：

| 阻塞项 | 处理方式 |
|---|---|
| 行为问题未解决 | 指出受阻的 Requirement / Scenario，并说明缺少什么行为细节 |
| 关键术语未定义 | 要求回到规格阶段补充定义 |
| 缺少边界或错误场景 | 不要用技术假设补洞，必须补齐行为规格 |
| 系统边界不清楚 | 明确哪些系统、用户、外部服务在范围内 |
| 预期结果过于抽象 | 要求补充可观察、可验证的输出或状态变化 |

门禁失败时，只报告阻塞点和缺失信息。不要继续设计，也不要自行假设业务行为。

## 既有模式探测

**做架构决策前，必须先研究相关代码区域。** 对每个相关目录检查：

```text
FOR each relevant directory:
  1. 使用什么命名约定？例如 camelCase、kebab-case、PascalCase。
  2. 使用什么文件组织方式？例如 feature-based、type-based、layer-based。
  3. 数据和状态如何流动？例如 hooks、store、service、repository、DI。
  4. 错误如何处理？例如 Result 类型、异常、统一 error boundary、日志封装。
  5. 测试如何组织？例如 co-located tests、/tests、__tests__。
  6. 配置、依赖注入、外部服务调用是否已有约定？

DESIGN MUST follow existing patterns unless a documented Architecture Decision justifies deviation.
```

如果引入新模式，必须新增 Architecture Decision，说明：
- 现有模式为什么不适用；
- 新模式解决什么问题；
- 新模式带来什么代价；
- 如何限制影响范围，避免架构漂移。

## 设计隔离与清晰度

把系统拆成小单元，每个单元都应满足：

- **单一职责**：只解决一个清晰问题；
- **接口明确**：输入、输出、错误和副作用可描述；
- **依赖可见**：依赖哪些模块、服务或配置一目了然；
- **可独立测试**：无需理解大量上下文即可验证行为。

每个单元都必须能回答：

- 它负责什么？
- 外部如何使用它？
- 它依赖什么？
- 它失败时如何表现？
- 它的测试边界在哪里？

**设计自测：**

- 读者不看内部实现，能否理解这个单元的职责？
- 替换内部实现，是否不会破坏调用方？
- 测试是否能覆盖该单元而无需启动整套系统？
- 如果答案是否定的，说明边界还需要重新划分。

**文件大小信号：** 单文件新增逻辑预计超过 200 行时，应优先拆分；超过 300 行通常表示职责过大，必须给出拆分方案或明确理由。

## 工作流交接信心循环

在 `designing → planning` 交接前，如果子代理可用，使用 `../confidence-loop/SKILL.md` 中的 Workflow Handoff Confidence Loop，并配合 `../confidence-loop/workflow-handoff-reviewer-prompt.md` 审查。

审查包必须包含：
- 已批准规格；
- 设计草案；
- Requirement 映射表；
- Architecture Decisions；
- Data Flow；
- File Changes；
- 测试策略；
- 明确的技术取舍。

只要仍存在 Critical / Important 发现、`NEEDS_USER_DECISION` 或未解决的 Confidence Gaps，就不得进入 `planning`。

## 推荐设计文档格式

```markdown
# Design: [Change Name]

## Technical Approach
[用 2-3 句话说明总体实现思路：复用什么、扩展什么、核心边界在哪里。]

## Requirements Mapping
| Requirement | Technical Approach | Files / Modules |
|---|---|---|
| REQ-001 | [对应技术方案] | `exact/path/file.ts` |

## Existing Patterns Observed
- Naming: [观察到的命名模式]
- File structure: [观察到的目录/分层模式]
- State/data flow: [观察到的状态或数据流模式]
- Error handling: [观察到的错误处理模式]
- Testing: [观察到的测试模式]

## Architecture Decisions

### Decision: [Decision Name]
根据 `rules-common` 的 research-first 原则：先检查代码库和现有方案，再决定 Adopt / Extend / Compose / Build。

Decision type: [Adopt / Extend / Compose / Build]

Chose [A] over [B] because:
- [原因 1]
- [原因 2]

Alternatives considered:
- [备选方案 1] — [为什么不选]
- [备选方案 2] — [为什么不选]

Trade-offs:
- Gain: [获得什么]
- Cost: [牺牲什么]
- Risk: [引入什么风险，如何缓解]

## Module and Interface Design
| Unit | Responsibility | Public Interface | Dependencies | Failure Behavior |
|---|---|---|---|---|
| [unit] | [单一职责] | [输入/输出/错误] | [依赖] | [失败表现] |

## Data Flow
[用文字或 ASCII 图说明数据如何在用户、UI、服务、存储、外部系统之间流动。]

## File Changes
- Create: `exact/path/to/new-file.ts` — [职责，预计行数]
- Modify: `exact/path/to/existing.ts` — [修改内容]
- Delete: `exact/path/to/old-file.ts` — [删除原因，迁移方式]
- Test: `tests/exact/path/to/test.ts` — [覆盖哪些 Requirement / Scenario]

## Test Strategy
- Unit tests: [测试哪些纯逻辑、边界和错误]
- Integration tests: [测试哪些模块协作]
- Regression tests: [防止哪些既有行为被破坏]
- Manual verification: [必要时列出手工验证步骤]

## Risks and Mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| [风险] | [影响] | [缓解方案] |

## Self-Review
- [ ] 每个 Requirement 都已映射到设计方案。
- [ ] 所有会变更的文件都列在 File Changes 中，且路径精确。
- [ ] 新文件遵循既有命名和目录结构。
- [ ] 每个模块职责单一、接口清晰、依赖可见。
- [ ] 没有 300+ 行的 god file；200+ 行文件已有拆分判断。
- [ ] 每个 Architecture Decision 都包含备选方案和取舍。
- [ ] 测试策略覆盖 happy path、边界和错误场景。
```

## 铁律

- **规格中的每条 Requirement 都必须映射到设计。** 找不到对应方案，设计就是不完整的。
- **架构决策必须写清取舍。** 只写“选择 X”不是决策，而是断言。
- **文件路径必须精确。** “新增一个组件”不可接受；必须写成 `src/components/ThemeToggle.tsx`。
- **优先遵循既有模式。** 只有在现有模式不适用且已记录理由时，才能偏离。
- **禁止 god file。** 一个文件承担多种职责时，必须拆分。
- **接口先于内部。** 先定义模块如何交互，再设计内部细节。
- **不以技术假设补业务空白。** 行为不清楚时，回到规格阶段。
- **未确认不交接。** 用户未明确批准设计前，不进入 `planning`。

## 自检问题

完成设计后，逐项检查：

1. **规格覆盖：** 每条 Requirement 是否能指向设计中的具体方案？
2. **场景覆盖：** happy path、边界场景、错误场景是否都有实现思路？
3. **文件完整性：** 所有新增、修改、删除、测试文件是否都列明精确路径？
4. **模式一致性：** 新设计是否遵循项目现有命名、目录、状态、错误和测试模式？
5. **隔离性：** 每个模块是否能用一句话说明职责？是否可独立测试？
6. **规模控制：** 是否存在预计 200+ 行的新文件？是否需要拆分？
7. **决策质量：** 每个 Architecture Decision 是否包含备选方案、选择理由和取舍？
8. **交接质量：** planning 阶段是否能直接基于本设计拆任务，而无需重新做架构判断？

## 危险信号

| 想法 | 实际问题 |
|---|---|
| “先都放一个文件里，后面再重构。” | “后面”通常不会来。应从一开始设计隔离。 |
| “这个框架/库很适合。” | 项目里是否已有解决同类问题的方案？优先使用既有方案。 |
| “我知道最佳做法。” | 最佳做法必须服从当前代码库上下文。先检查现有模式。 |
| “设计很明显，简单写一下就行。” | 过短设计容易导致实现阶段自行脑补。必须具体。 |
| “文件结构到 planning 再说。” | 文件结构就是设计的一部分。没决定放哪里，就还没完成设计。 |
| “这是小改动，不需要架构决策。” | 小改动也有选择。至少说明“沿用既有模式”的决策和取舍。 |
| “需求差不多清楚了，可以先设计。” | 差不多不够。行为不清楚时必须回到规格阶段。 |

## 常见借口

| 借口 | 现实 |
|---|---|
| “不开始编码就不知道精确路径。” | 先探索代码库。已有路径可以找到；新路径现在就应决定。 |
| “取舍很明显，不用写。” | 如果明显，写下来只需要很短时间。必须记录。 |
| “现有代码没有模式。” | 每个代码库都有模式。看不出来通常是探索不够。 |
| “测试后面再补。” | 测试边界影响模块设计，必须在设计阶段定义。 |

## 设计完成后

将设计保存到：

```text
specs/changes/<change-name>/design.md
```

然后回复用户：

> Technical design saved. Please review and confirm, then I'll create the implementation plan.

等待用户明确确认。确认后，再调用 `planning` skill。
