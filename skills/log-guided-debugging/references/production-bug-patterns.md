# 生产问题模式

使用本参考为常见真实问题选择证据，不要假设语言、框架、服务类型或客户端类型。

## 请求或动作没有到达预期路径

要寻找的证据：

- 路由或分发记录
- 客户端请求样本或 UI 事件
- 入口日志、traces 或 breadcrumbs
- 配置、feature flag、部署或版本门禁

候选原因常包括 route/action 名不匹配、flag 关闭、客户端过旧、输入格式错误、认证/权限拦截，或流量被路由到不同版本。

## 分支或状态迁移错误

要寻找的证据：

- state before 和 state after
- branch 条件和 flag 值
- 不变量检查
- audit 或事件历史

候选原因常包括状态过期、重复事件、意外 enum/status 值、缺少幂等、顺序问题，或 migration/config 漂移。

## 依赖返回意外数据

要寻找的证据：

- 依赖名、status、latency、归一化错误和响应类别
- timeout、retry、fallback、circuit breaker 或 cancellation 记录
- contract 示例或录制的 request/response 样本

候选原因常包括依赖行为变化、局部故障、schema 漂移、限流、认证失败、缓存过期，或 fallback 路径隐藏真实失败。

## 异步 job、queue、event 或 worker 问题

要寻找的证据：

- message ID、topic、queue、partition、offset、event name、job name、retry count、ack/nack 和 dead-letter 状态
- producer publish 结果和 consumer processing 结果
- idempotency key 和 side-effect 记录

候选原因常包括重复投递、缺少 ack、毒消息、乱序处理、consumer lag、correlation ID 丢失，或 worker 配置不一致。

## 数据不一致

要寻找的证据：

- source-of-truth 记录
- 写入路径、transaction、commit、rollback、reconciliation 和 audit 历史
- 不变量或一致性查询

候选原因常包括部分写入、跳过事务边界、竞态、migration 缺口、backfill 错误、缓存过期，或外部 reconciliation 失败。

## 性能或资源回归

要寻找的证据：

- latency distribution、queue time、throughput、saturation、allocation、resource lifetime 和依赖耗时
- 部署或配置变更时间线
- workload 或流量变化

候选原因常包括算法回归、fan-out、依赖调用过碎、缓存变化、资源泄漏、锁竞争、慢依赖路径，或输入规模超过代码路径预期。
