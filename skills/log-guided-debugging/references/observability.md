# 观测参考

当现有证据无法确认或排除领先假设时使用本参考。

## 放置规则

在能区分假设的决策点添加诊断：

- 入口是否到达
- 输入校验是接受还是拒绝
- 选择了哪个 branch、状态迁移、fallback、retry、timeout、cancellation 或 circuit breaker
- 是否调用依赖，以及是否收到依赖结果
- 是否观察到 transaction、write、commit、rollback、publish、ack、cache hit 或 cache miss
- 不变量是被违反还是被保持
- 是否缺少能让未来 SLS 或已配置观测后端查询精确化的字段

每个新增诊断都要记录：

- 它验证哪个假设
- 放置位置
- 包含哪些关联字段
- 如何帮助确认或排除原因
- 噪声、成本、性能、隐私和敏感数据风险
- 如何遵循仓库已有观测框架
- 是否能在 SLS 或已配置观测后端中查询

## 结构化关联

优先使用结构化、可查询、可关联字段。常见类别包括 request、trace、correlation、session、tenant、account、entity、operation、route、action、component、service、environment、region、version、job、event、state before/after、retry count、idempotency、cache、topic、queue、partition、offset、message、duration、deadline、status、dependency 和归一化错误标识。

使用仓库里已经常见的字段名。仓库已有 logging、tracing、metrics 或 error-reporting API 时，不要发明新的 API。

## 安全

绝不记录 passwords、tokens、secrets、AccessKeys、authorization headers、cookies、session secrets、full phone numbers、government IDs、payment data、private payloads、raw sensitive request bodies 或 personal sensitive data。

不要添加 `"here"`、`"debug"`、`"error happened"` 这类模糊临时日志。不要倾倒没有上下文的 raw errors。有用的诊断必须结构化、可关联，并绑定到具体假设。

## 级别和成本

使用仓库既有日志级别约定。高流量路径需要 sampling、rate control 或 metrics，而不是嘈杂的逐事件日志。优先选择持久、低噪声、能帮助未来 incident 查询的诊断。

## 移除或保留

如果诊断只是为了收集缺失证据，说明它应该作为持久观测保留、由已有 debug 机制保护，还是在调查后移除。持久观测必须低噪声，并且对当前 incident 之外仍有价值。
