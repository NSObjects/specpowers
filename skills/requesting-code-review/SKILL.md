---
name: requesting-code-review
description: 当用户要求进行独立代码审查、合并前审查、重大功能完成后审查、风险较高的修复后审查，或在需要一次新的审查来降低实现风险时使用。
---

# 请求代码审查

使用此 skill 通过单一的对外入口发起独立代码审查。主代理负责整体编排：向审查者发送范围明确的审查包，整合任何专项审查者的发现，并向用户返回一个统一的最终决策。

审查者只会收到打包后的审查上下文，而不是完整会话历史。这样可以让审查聚焦于实现、规格说明和变更代码，而不是主代理的推理过程。

## 适用范围

此 skill 适用于 `spec-driven-development` 内置审查检查点之外的手动审查或独立审查。

在以下情况使用：

- 用户明确要求进行代码审查。
- 刚完成了一个重大功能或风险较高的修复。
- 变更已准备好进入合并或发布门禁。
- 主代理卡住了，需要一个边界清晰的第二意见。
- 某项重构在实施前或实施后需要一次基线检查。

不要把此 skill 当作正常实现、测试，或 `spec-driven-development` 已执行的按任务审查流程的替代品。

## 统一审查模型

1. 在完整的请求范围上运行通用的 `specpowers:code-reviewer` 审查。
2. 只有在存在具体风险假设时，才升级给专项审查者。
3. 由主代理对所有发现进行去重和协调。
4. 向用户返回一个最终结论：`APPROVED`、`NEEDS_CHANGES` 或 `NEEDS_CONTEXT`。

专项审查者用于深入检查某个限定的风险区域。它们不会成为独立的面向用户工作流。

## 平台分发

使用所在平台最接近的等价审查机制：

Claude Code：使用带有 `specpowers:code-reviewer` 的 `Agent` 工具；旧版 `Task` 引用可视为兼容别名。

| 平台 | 分发方法 |
|---|---|
| Claude Code | 使用带有 `specpowers:code-reviewer` 的 `Agent` 工具。将旧版 `Task` 引用视为兼容别名。 |
| Codex | 使用填充后的 `./code-reviewer-prompt.md` 调用 `spawn_agent(agent_type="worker", message=...)`。 |

## 审查包要求

在分发之前，先构建一个紧凑的审查包，并应用 `specpowers:confidence-loop` 的“审查包充分性门禁”。审查者应获得足够上下文，以便无需阅读完整对话也能评估变更。

必填字段：

- `{WHAT_WAS_IMPLEMENTED}` —— 对已完成变更的事实性摘要
- `{SPEC_SCENARIOS}` —— GIVEN / WHEN / THEN 场景，或 `None provided`
- `{BASE_SHA}` —— 起始提交、合并基线，或明确的审查基准
- `{HEAD_SHA}` —— 结束提交或明确的审查头
- `{DESCRIPTION}` —— 目的、约束、已知风险、相关测试结果，以及任何明确不在范围内的事项

如果审查包无法包含一次公正审查所需的 diff、范围、相关规格/设计/任务、测试证据、已知风险或既有发现/缺口，不要要求审查者猜测。应先补充缺失证据；否则应预期结果为 `NEEDS_CONTEXT` / **Unresolved Confidence Gaps**，而不是批准。

有用的预检查命令：

```bash
git status --short
BASE_SHA=$(git merge-base HEAD origin/main)
HEAD_SHA=$(git rev-parse HEAD)
git diff --stat "$BASE_SHA..$HEAD_SHA"
```

对于窄范围任务审查，应将 `BASE_SHA` 设置为该任务之前的那个提交。当用户只要求审查一个修复或后续变更时，不要默认使用分支合并基线。

如果变更包含未提交内容，要么在审查前提交它们，要么在 `{DESCRIPTION}` 中明确包含工作区 diff/上下文，并将 `{HEAD_SHA}` 标记为 `WORKTREE`。除非审查者收到这些内容，否则不要声称审查覆盖了未提交变更。

## 如何请求审查

1. **确定范围。** 确认审查对象是整个分支、一个任务、一个提交范围，还是当前工作区。
2. **收集规格上下文。** 包含相关 Spec Scenarios。如果不存在，写 `None provided`，并指示审查者根据描述和测试进行评估。
3. **收集实现上下文。** 总结改了什么、为什么改，以及任何已知限制。
4. **收集测试上下文。** 包含已经运行的相关测试命令及其结果。如果没有运行测试，要如实说明。
5. **填充 `./code-reviewer-prompt.md`。** 用具体值替换所有占位符。
6. **分发或内联审查。** 使用上方平台分发表。
7. **综合发现。** 向用户返回一个统一的结果和单一的最终结论。

## 专项升级

默认使用通用审查者。只有在存在明确风险区域时，才添加专项审查者。

当 diff 涉及以下内容时，应升级为安全审查：

- 身份认证或授权
- 密钥、令牌、凭据或关键材料
- 权限、角色、访问检查或租户边界
- 不可信输入、解析、反序列化、上传或外部回调
- 敏感数据流、日志记录、遥测或隐私边界
- 对外暴露的 API 行为或攻击面

专项模板：

- 安全深度审查：`../dispatching-parallel-agents/security-reviewer-prompt.md`

升级时，应将专项提示词限定在确切的关注点上。除非整个 diff 都与安全敏感内容相关，否则不要要求专项审查者重新审查整个 diff。

需要专项升级时，仍应通过同一个对外审查入口完成，并返回一个统一结论。

## 综合规则

主代理必须先整合审查输出，再回复用户。

- 去除重复问题。
- 协调通用审查者和专项审查者之间的分歧。
- 只有在有清晰理由时，才提升或降低严重级别。
- 将阻塞性发现放在最前面。
- 在可用时包含文件路径、行号、场景名称和证据。
- 不要把原始审查者输出直接粘贴为最终答案。
- 不要展示来自不同审查者的多个最终决策。

最终面向用户的结果应包含：

```markdown
## 审查结果
**决策：** APPROVED / NEEDS_CHANGES / NEEDS_CONTEXT
**原因：** [简短综合说明]

## 阻塞问题
- [Critical 或 Important 问题、阻止批准的信心缺口，或 “None”]

## 非阻塞说明
- [Minor 问题或后续事项，或 “None”]

## 专项审查
- `none` —— 不需要专项审查
- `security-reviewer` —— [摘要，仅在已执行或建议执行时填写]

## 下一步
[修复、重新审查、合并或继续]
```

## 重新审查循环

每次重新审查都要使用 `specpowers:confidence-loop` 的“审查信心循环”。

完成修复后：

1. 如果只审查修复内容，则使用上一次审查头作为新的基准。
2. 在 `{DESCRIPTION}` 中包含之前的阻塞性发现和未解决的信心缺口。
3. 包含一个 Resolution Package，将每个先前事项分类为 `fixed`、`rejected`、`out_of_scope` 或 `needs_user_decision`，并附上证据。
4. 要求审查者验证这些修复是否解决了相关发现、关闭了信心缺口，并且没有引入回归。
5. 重复此流程，直到不再存在 Critical 或 Important 问题，也不存在阻止批准的未解决信心缺口。

## 决策策略

- 任何 Critical 问题 => `NEEDS_CHANGES`。
- 任何 Important 问题 => `NEEDS_CHANGES`。
- 缺少上下文或存在阻止批准的证据缺口 => `NEEDS_CONTEXT`。
- 任何带有必需范围内修复的、阻止批准的未解决信心缺口 => `NEEDS_CHANGES`。
- 只有 Minor 问题 => 通常为 `APPROVED`，并附带说明。
- 缺失或不完整的 Spec Scenarios 不会自动阻止审查，但如果已提供的必需场景缺少测试，则属于 Critical。
- 如果审查者错了，应使用代码、测试或规格证据进行反驳。

## 示例

```text
上下文：合并前完成了一次分支级审查。

BASE_SHA=$(git merge-base HEAD origin/main)
HEAD_SHA=$(git rev-parse HEAD)

使用以下内容分发给 specpowers:code-reviewer：

WHAT_WAS_IMPLEMENTED:
  为 conversation index 维护添加了 verifyIndex() 和 repairIndex()。

SPEC_SCENARIOS:
  场景：检测孤立条目
    GIVEN 一个索引中存在对已删除文件的引用
    WHEN verifyIndex() 运行
    THEN 它会报告带有文件路径的孤立条目

  场景：修复孤立条目
    GIVEN verifyIndex() 找到了孤立条目
    WHEN repairIndex() 运行
    THEN 孤立条目会从索引中被移除

BASE_SHA:
  a7981ec

HEAD_SHA:
  3df7661

DESCRIPTION:
  为四类问题添加了验证和修复支持。
  已运行测试：npm test -- index-maintenance.test.ts — passed。
  已知风险：repairIndex() 会修改持久化索引状态。

审查者结果：
  决策：NEEDS_CHANGES
  阻塞问题：Important — repairIndex() 移除了孤立条目，但没有报告修复数量。

主代理响应：
  综合该问题，完成修复，并针对修复范围重新请求审查。
```

## 红旗事项

绝不要：

- 声称审查覆盖了未包含在 diff 或审查包中的代码。
- 因为变更看起来简单就跳过用户请求的审查。
- 将一次审查请求拆成多个面向用户的审查工作流。
- 在没有具体风险假设的情况下启动专项审查者。
- 忽略 Critical 问题。
- 在存在未解决的 Important 问题时继续推进，除非用户明确接受该风险。
- 不经主代理综合就把审查者输出当作最终结果。

另请参见：

- 审查者模板：`./code-reviewer-prompt.md`
- 专项深度审查模板：`../dispatching-parallel-agents/security-reviewer-prompt.md`
- 处理反馈：`receiving-code-review` skill
