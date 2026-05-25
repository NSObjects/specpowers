---
name: designing
description: "当预期行为已经达成一致，但编码前仍需决定实现方式、取舍或文件边界时使用。"
---

# 设计架构（Designing Architecture）

定义指定行为将**如何**实现。这里处理技术决策、架构和文件级规划。

**开始时宣布：**“我正在使用 designing skill 创建技术设计。”

**角色：System Architect。** 你基于 specs 做技术决策。你不写代码。

<HARD-GATE>
不要写实际代码（用于说明的 code snippets 可以）。
不要跳过 specs；设计前读取所有 specs。
Specs 中的每个 Requirement 都必须在 design 中有对应 technical approach。
当 specs 不充分时，不要继续 designing；如果行为仍不清楚，回到 `specifying` 或更早阶段。
没有用户确认前，不要进入 planning。
</HARD-GATE>

## 检查清单

1. **读取 specs** — 理解所有 Requirements 和 Scenarios
2. **探索代码库** — 理解既有 patterns、dependencies、architecture
3. **识别既有 patterns** — naming、file structure、state management、error handling
4. **做 architecture decisions** — 选择方案并记录 trade-offs
5. **按隔离性设计** — 每个单元有一个目的、清楚接口，并可独立测试
6. **映射 file changes** — 哪些文件会 create、modify、delete（使用精确 paths）
7. **自审** — 验证所有 Requirements 都被覆盖，并遵循既有 patterns
8. **用户确认** — 等待明确批准
9. **转入下一阶段** — 调用 `planning` skill

## Spec Adequacy Gate（Spec 充分性门槛）

做技术决策前，检查已批准 specifications 是否充分。

充分的 specifications 必须提供足够行为细节，使 design 能把每个 Requirement 追溯到 technical approach：

- 每个 in-scope behavior 都有具体 Requirement；
- 每个 active Requirement 都有 happy-path 和 edge 或 error 覆盖；
- 关键 terms、actors、boundaries 和 observable outcomes 已定义；
- 没有剩余 behavior-affecting open question。

如果 specs 包含以下任一 blocker，停止 designing，并回到 `specifying` 或更早阶段：

- unresolved behavioral questions；
- undefined terms；
- missing edge or error scenarios；
- unclear boundaries；
- abstract expected outcomes。

当此 gate 失败时，报告被阻塞的具体 Requirement 或 Scenario，以及缺失的行为细节。不要用技术假设填补空白。

## Workflow Handoff Confidence Loop（工作流移交信心循环）

当 subagents 可用时，在 `designing → planning` handoff 前使用 `../confidence-loop/SKILL.md` 中的 Workflow Handoff Confidence Loop，并使用 `../confidence-loop/workflow-handoff-reviewer-prompt.md`。

Review package 必须包含 approved specs、design draft、Requirement mapping、Architecture Decisions、Data Flow、File Changes、test strategy 和 explicit trade-offs。

当仍有 Critical 或 Important findings、`NEEDS_USER_DECISION` 或 Unresolved Confidence Gaps 时，不要进入 `planning`。

## 隔离性和清晰度设计（Design for Isolation and Clarity）

把系统拆成更小的单元，每个单元都要：

- 有**一个清楚目的**
- 通过**定义明确的接口**沟通
- 能够**独立理解和测试**

对每个单元，你都应该能回答：

- 它做什么？
- 如何使用它？
- 它依赖什么？

**测试你的设计：**

- 别人是否能不读内部实现就理解这个单元做什么？
- 是否能改变内部实现而不破坏消费者？
- 如果不能，边界需要调整。

**文件大小信号：** 文件变大通常说明它承担太多职责。如果你的设计会让某个文件新增 200+ 行，考虑拆分。

## 既有模式识别（Existing Pattern Detection）

**做 architecture decisions 前，先研究现有代码库：**

```
FOR each relevant directory:
  1. What naming convention is used? (camelCase, kebab-case, PascalCase)
  2. What file structure pattern? (feature-based, type-based, layer-based)
  3. What state management approach?
  4. What error handling pattern?
  5. What testing pattern? (co-located, separate /tests, __tests__)

YOUR DESIGN MUST follow these patterns unless you document why you're deviating.
```

**偏离需要理由：** 如果引入新 pattern（例如项目已有 state management 方案时又引入新方案），必须添加 Architecture Decision，解释为什么既有 pattern 不适合这个场景。

## Design 格式

```markdown
# Design: [Change Name]

## Technical Approach
[用 2-3 句话描述整体 approach]

## Architecture Decisions

### Decision: [Decision Name]
做 technology choices 时，应用 `rules-common` 中的 research-first 指导：先检查代码库和其他相关既有方案，再推荐 custom building。在 Architecture Decision 中包含最终 Adopt / Extend / Compose / Build decision。

Chose [A] over [B] because:
- [Reason 1]
- [Reason 2]

Trade-offs:
- [What we gain]
- [What we give up]

## Data Flow
[用文字描述或 ASCII diagram 说明数据如何流经系统]

## File Changes
- Create: `exact/path/to/new-file.ts` — [它做什么，约多少行]
- Modify: `exact/path/to/existing.ts` — [改什么]
- Test: `tests/exact/path/to/test.ts` — [测试什么]
```

## 铁律（Iron Laws）

- **Specs 中每个 Requirement 都必须映射到 design 中的某个内容。** 如果某个 Requirement 没有 technical approach，design 就不完整。
- **Architecture Decisions 必须有 trade-offs。** “We chose X” 但不解释替代方案，不是 decision，只是 assertion。
- **File paths 必须精确。** “Add a new component” 不可接受；`src/components/ThemeToggle.tsx` 才是精确路径。
- **遵循既有 patterns。** 在现有代码库中，除非有记录在案的偏离理由，否则匹配既有 architecture。
- **不要 god files。** 如果 design 会创建或修改一个包含 300+ 行新逻辑的文件，拆分它。每个文件应有一个清楚职责。
- **先定义接口，再设计内部。** 先定义 components 如何彼此沟通，再设计内部。

## 自审

写完 design 后：

1. **Spec coverage：** 是否能为每个 Requirement 指向 design 中的某个 section？
2. **File completeness：** 所有会被触碰的文件是否都列在 File Changes 中？
3. **Pattern consistency：** 新文件是否遵循项目既有 naming 和 structure conventions？
4. **Isolation check：** 每个新 file/module 是否有一个清楚目的？是否能用一句话解释？
5. **Size check：** 是否有文件预计 200+ 行？如果有，能否拆分？

## 红旗（Red Flags）

| Thought | Reality |
|---------|---------|
| "I'll put everything in one file for now, refactor later" | “Later” 通常不会来。从一开始就按隔离性设计。 |
| "This framework/library would be perfect" | 项目是否已经有处理这个问题的方案？优先使用既有方案。 |
| "I know the best way to do this" | 先检查现有代码库。你的“最佳方式”可能和既有模式冲突。 |
| "The design is obvious, I'll keep it brief" | 过短 design 往往等于含糊 design，之后 AI 会在 implementation 中发明细节。保持具体。 |
| "I'll figure out the file structure during planning" | File structure 本身就是 design。还没决定代码放哪，就还没完成设计。 |
| "This is a small change, no Architecture Decisions needed" | 每个 design choice 都是 decision。即使“follow existing pattern”也值得记录。 |

## 常见合理化（Common Rationalizations）

| Excuse | Reality |
|--------|---------|
| "I can't know the exact file paths without starting to code" | 探索代码库。路径已经在那里；如果是新路径，现在就决定。 |
| "Trade-offs are obvious, no need to write them down" | 如果它们显而易见，写下来只要 30 秒。写。 |
| "The existing code doesn't follow any pattern" | 每个代码库都有 patterns。你还没看够。 |

## Designing 之后

保存到 `specs/changes/<change-name>/design.md`。

> "Technical design saved. Please review and confirm, then I'll create the implementation plan."

等待用户确认。然后调用 `planning` skill。
