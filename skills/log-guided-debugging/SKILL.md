---
name: log-guided-debugging
description: "用于调查和修复真实问题：先发现证据来源，再定位代码路径，用运行时证据支持补丁前判断；适用于生产问题、真实 bug、用户可见 bug、错误行为、crash、panic、exception、数据不一致、flaky 行为、集成失败、配置问题、发布问题、性能问题、回归、异步 job / queue / event / worker 问题，以及涉及日志、云日志、Alibaba Cloud SLS / Log Service、MCP 工具、traces、metrics、APM、错误上报、观测、运行时证据、缺失诊断，或普通测试套件不能直接复现的问题。不要用于纯功能开发、大范围重构、仅格式化修改、仅文档修改、没有报告 bug 的依赖升级、已有明显本地修复的简单 compile/type/lint 错误，或没有运行时歧义的确定性失败测试，除非运行时证据与该问题相关。"
---

# 日志引导调试

用这个 skill 调查真实问题：先发现证据来源，再映射代码路径；用运行时证据比较候选原因；只有当诊断能回答具体假设时才添加观测；最后只做证据支持的最小修复。

核心原则：

```text
没有代码路径，就没有根因。
没有运行时证据，就不要修复。
没有等价验证产物，就不要收尾。
```

不可协商规则：

```text
不要从测试开始。
不要从补丁开始。
先定位相关代码路径。
尽可能建立多个候选原因。
使用日志、traces、metrics、stack traces、数据状态、配置、部署历史、请求样本、UI/客户端证据和运行时行为来确认或排除候选原因。
证据不足时，先添加目标化结构化观测。
打补丁前先确认因果链。
只修复已确认或证据最充分的原因。
根因明确后再添加回归防护。
使用匹配真实失败模式的验证产物。
不要因为测试通过就声称真实问题已修复。
```

## 阶段 0：发现证据来源

调查前先发现可用证据来源。不要假设日志一定是本地文件，也不要假设所有证据都在仓库里。

检查这些来源：

- `AGENTS.md`、README、CONTRIBUTING、docs、runbooks、incident docs
- CI 配置、部署/配置文件、logging/tracing/metrics 调用点
- 已有 dashboards 或 dashboard 引用
- 已有告警名或 metric 名
- 相关时检查本地日志文件
- 已配置的 MCP servers 和可用 MCP tools
- 可用时检查 Alibaba Cloud SLS / Log Service MCP 工具
- 可用时检查 APM、metrics、错误上报或云观测工具

执行规则：

```text
不要假设日志一定是本地文件。
不要假设所有证据都在仓库里。
不要假设 SLS 可用，除非 MCP 工具、配置或文档证明它可用。
如果 SLS MCP 可用，优先查询 SLS 获取生产日志证据，而不是只靠读代码猜测。
如果没有外部证据工具，说明缺少什么证据，并继续做代码路径分析和目标化观测建议。
不要编造 MCP 工具名或查询语法。
使用真实可用 MCP 工具及其 schema。
不要请求或暴露 secrets、AccessKeys、tokens、cookies 或 credentials。
尽可能使用最小权限、只读证据查询。
```

证据来源清单见 `references/evidence-sources.md`。MCP/SLS 工具使用边界见 `references/mcp-observability.md`。

## 阶段 1：定位相关代码

选择命令或 API 前先适配当前仓库。检查 `AGENTS.md`、README、CONTRIBUTING、docs、CI 配置、构建文件、scripts、tests、logging/tracing/metrics usage、部署/配置文件和 runbooks。仓库适配清单见 `references/stack-adaptation.md`。

形成修复方向前，先产出代码路径图：

- 用户可见症状
- 入口点
- 调用方 / handler / consumer / job / command / component
- 核心逻辑
- 数据/状态层
- 外部依赖
- 状态迁移
- 配置 / feature flags
- 已有日志/trace/metric
- 外部证据来源
- 可用的 SLS/MCP 证据
- 缺失的观测
- 可能涉及的文件

如果没有找到相关代码路径，继续发现路径，不要进入修复。

## 阶段 2：建立候选原因

维护候选原因台账。除非证据已经隔离根因，否则优先保留多个候选假设。

每个候选必须包含：

- 假设
- 为什么这段代码可能导致症状
- 能确认它的证据
- 能排除它的证据
- 要检查的证据来源
- 已有证据
- 缺失证据
- 状态：open / rejected / confirmed

台账模式和因果链示例见 `references/root-cause-ledger.md`。

## 阶段 3：查询日志和运行时证据

对每个 open 假设，回答适合当前系统的证据问题。

如果 Alibaba Cloud SLS / Log Service MCP 可用，并且问题涉及生产行为、在线错误、用户可见问题、告警、回归或云日志，优先用它查询生产日志证据。不要只读代码就声称根因。

查询 SLS 或其他外部日志系统前，先形成聚焦 query plan：

- 时间窗口
- 环境
- 服务/应用名
- region/cluster/namespace
- request_id / trace_id / correlation_id
- 安全可用的 user/session/entity/business id
- route/API/action/job/topic/event
- error code / exception / status code
- 部署或版本窗口
- 用于确认或排除每个假设的字段

避免宽泛、昂贵、无边界查询。优先使用窄时间窗和具体 filters。

检查这些证据问题：

- request、action、job、event 或 command 是否到达预期入口？
- 走了哪个 branch 或 state transition？
- 关键 ID、输入、flag 和状态值是什么？
- 调用了哪些依赖？
- 依赖返回了什么？
- 是否发生 retry、timeout、cancellation、fallback、circuit breaker、cache hit 或 cache miss？
- 是否发生 transaction、write、commit、rollback、publish、ack 或副作用？
- 观察到的状态是否违反不变量？
- 问题是否开始于 deploy、配置变更、migration、依赖变更、流量切换或客户端版本变化之后？
- 日志是否和代码路径一致？
- 是否缺少能确认原因的字段？

选择证据模式时不要假设技术栈；参考 `references/production-bug-patterns.md`。

## 阶段 4：证据不足时添加目标化观测

当现有 logs、SLS queries、traces、metrics、APM data、error reporting、config diffs 或 data evidence 不足以确认或排除领先假设时，只添加最小且有用的结构化观测。正确输出可能是 observability patch，而不是业务逻辑修复。

优先使用仓库已有 logging、tracing、metrics、error-reporting 和 diagnostic tools。除非明确必要且符合仓库约定，不要发明新的观测框架或新增依赖。

每个新增 log、metric、trace、span、breadcrumb、diagnostic event 或 debug output 都必须说明：

- 它验证哪个假设
- 放置位置
- 包含哪些关联字段
- 如何帮助确认或排除原因
- 是否产生噪声、成本、性能、隐私或敏感数据风险
- 如何遵循仓库已有观测框架
- 是否能在 SLS 或已配置观测后端中查询

优先使用结构化、可查询、可关联字段，例如：

- request_id
- trace_id
- correlation_id
- session_id
- tenant_id
- account_id
- 安全时使用 user_id
- entity_id
- operation
- route
- action
- component
- service
- environment
- region
- version
- job_name
- event_name
- state_before
- state_after
- retry_count
- idempotency_key
- cache_key
- topic
- queue
- partition
- offset
- message_id
- duration_ms
- deadline
- status_code
- dependency
- error_type
- error_code
- error

不得记录敏感数据：passwords、tokens、secrets、AccessKeys、authorization headers、cookies、session secrets、full phone numbers、government IDs、payment data、private payloads、raw sensitive request bodies 或 personal sensitive data。

拒绝无用临时日志，例如 `"here"`、`"debug"`、`"error happened"`、没有上下文的 raw error dumps，以及无法查询或关联的非结构化日志。

详细观测位置和安全规则见 `references/observability.md`。

## 阶段 5：确认因果链

打补丁前必须具备这条因果链：

```text
观察到的症状
-> 触发输入/动作/状态/事件
-> 相关代码路径
-> 来自日志/SLS/traces/metrics/data/config 的运行时证据
-> 被违反的假设或不变量
-> 根因或证据最充分的原因
-> 拟采取的干预
-> 预期可观测变化
```

如果链条有缺口，继续调查或添加目标化观测，而不是直接修业务逻辑。

## 阶段 6：只修复已确认原因

只针对 confirmed 或 best-supported cause 做最小安全修复。

如果证据显示问题更可能来自 data、config、deployment、dependency 或 operation state，输出对应 repair/verification plan，不要强行修改业务代码。

禁止事项：

```text
- 做无关重构
- 改变无关 public behavior
- 吞掉错误
- 放宽校验来隐藏症状
- 盲目增加 retry
- 盲目增加 timeout
- 盲目加锁
- 盲目加 cache
- 修改测试以匹配错误行为
- 用日志代替真正修复
```

## 阶段 7：根因明确后添加回归防护

Regression guard 可以比测试更宽。选择能编码已确认真实失败模式的 guard，而不是只覆盖被修改的代码行。

示例：

- 单元测试
- 集成测试
- 端到端测试
- replay fixture
- snapshot/golden test
- 契约测试
- property/invariant test
- 数据不变量查询
- reconciliation query
- 配置校验器
- migration dry run
- 监控告警
- 保存为诊断检查的 SLS query
- dashboard query
- runbook check
- 手动复现清单
- 浏览器/客户端复现
- 录制的 request/response replay
- 负载/性能 smoke check

选择等价于原始失败的 verification artifact 时，参考 `references/verification-artifacts.md`。

## 阶段 8：用真实失败模式验证

优先使用等价于真实失败模式的验证产物。生产问题的验证可以包括：SLS query 证明错误模式消失、SLS query 证明预期 branch/state/log 字段出现、trace comparison、metric comparison、dashboard validation、error-reporting validation、replay result、data invariant result、canary validation、rollout validation，或能建模失败模式的 local/CI test result。

普通测试可能有用，但对真实生产问题而言，单独通过普通测试并不充分。

说明什么证据证明原始问题已经被处理。如果只添加了观测，不要声称 bug 已修复；说明将收集什么新证据，以及如何查询它。

## 参考资料

- `references/evidence-sources.md` - 运行时证据可能来自哪里。
- `references/mcp-observability.md` - 发现和使用 MCP 提供的观测工具，包括可用时的 SLS。
- `references/observability.md` - 结构化诊断、关联字段和敏感数据规则。
- `references/production-bug-patterns.md` - 常见运行时失败模式和匹配证据。
- `references/root-cause-ledger.md` - 假设台账和因果链规则。
- `references/verification-artifacts.md` - 选择匹配真实失败的验证产物。
- `references/stack-adaptation.md` - 根据当前仓库适配命令、API 和证据来源。

## 最终回复格式

汇报调查或修复时使用以下形状：

```text
- 问题分类：
- 已发现的证据来源：
- 已使用的 SLS/MCP 证据：
- 已定位的代码路径：
- 已考虑的候选原因：
- 已使用的证据：
- 缺失证据：
- 已添加的观测：
- 根因 / 证据最充分的因果链：
- 修复摘要：
- 回归防护：
- 已执行验证：
- 生产验证计划：
- 发布后要运行的 SLS/log 查询：
- 发布 / 回滚说明：
- 剩余未知项：
- 变更文件：
```
