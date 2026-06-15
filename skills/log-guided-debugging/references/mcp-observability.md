# MCP 观测

当观测数据可能通过 MCP 工具获得时使用本参考，包括 Alibaba Cloud SLS / Log Service MCP。

## 发现

- 发现可用 MCP 工具
- 检查工具名和 schema
- 不要编造工具名
- 检查是否配置了 SLS、云日志、traces、metrics、APM、错误上报、dashboards 或部署历史工具
- 如果 SLS MCP 可用，使用它获取云日志证据，尤其是生产行为或在线错误

## 查询纪律

使用只读、窄范围、有时间边界的查询。优先使用安全的关联 ID 和安全的业务 ID，例如 request IDs、trace IDs、entity IDs、route/action/job/topic/event 名称、归一化错误、status codes 和部署窗口。

不要在聚焦查询足以确认或排除假设时运行宽泛、昂贵或无边界搜索。每个查询都要绑定一个或多个假设，并记录每个查询确认或排除哪个假设。

## 安全

始终保护密钥和个人数据。不要请求、暴露或打印 secrets、AccessKeys、tokens、cookies、credentials、raw sensitive payloads 或 personal sensitive data。

总结证据，不要倾倒敏感日志。保留足够支撑结论的上下文：时间窗口、来源/工具、filter 形状、命中的信号，以及它如何影响候选原因台账。
