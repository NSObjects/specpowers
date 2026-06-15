# 验证产物

原因明确后使用本参考。防护必须匹配真实失败模式，而不是只覆盖被修改的代码行。

## 产物选择

选择能证明原始问题发生变化的最小产物：

- 隔离确定性逻辑用单元测试
- 协作模块或依赖 adapter 用集成测试
- 用户可见流程用端到端测试
- 捕获的 requests、messages、events 或 payloads 用 replay fixture
- 稳定渲染或转换输出用 snapshot/golden test
- 组件或服务边界预期用契约测试
- 宽状态或数据规则用 property/invariant test
- 持久化不一致用数据不变量查询或 reconciliation query
- 错误配置或 feature flag 状态用配置校验器
- schema 或数据迁移风险用 migration dry run
- 反复出现的生产信号用监控告警或 dashboard query
- 生产日志验证用 SLS/log-query，证明错误模式消失或预期 state/branch 字段出现
- 暂时无法自动化的场景用 runbook check 或手动复现清单
- 依赖客户端行为的失败用浏览器/客户端复现
- 集成路径导致的失败用录制的 request/response replay
- latency、throughput、saturation 或资源问题用负载/性能 smoke check

## 验证报告

说明：

- 该产物代表哪个原始症状
- 它覆盖哪个代码路径和因果链环节
- 什么证据表明问题不再发生
- 本地仍未验证什么
- 生产验证如何发现成功或需要回滚
- 需要生产日志验证时，发布后要运行哪些 SLS/log 查询

测试可以支撑结论，但除非测试等价于真实失败模式，否则测试通过本身不能证明真实问题已修复。
