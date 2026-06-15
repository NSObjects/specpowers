# 仓库适配

选择命令、API、诊断或验证产物前，先检查当前仓库。

检查：

- AGENTS.md
- README
- CONTRIBUTING
- docs
- CI 配置
- Makefile / Taskfile / package 或构建文件
- scripts
- 现有测试
- 现有 logging/tracing/metrics 调用点
- 已配置的 MCP servers 和可用 MCP tools
- 可用时检查 Alibaba Cloud SLS / Log Service MCP 工具
- 部署/配置文件
- runbooks

规则：

- 不要编造命令。
- 不要编造 logging API。
- 不要编造 MCP 工具名。
- 仓库已有观测框架时，不要引入新的观测框架。
- 不要假设只有后端架构。
- 不要假设只有前端架构。
- 不要假设一定存在数据库。
- 不要假设一定存在 queue。
- 不要假设测试已经足够。
- 根据真实仓库适配 skill。

使用代码库或已配置环境中已经存在的仓库专属名称、字段、MCP schema 和工具。没有合适命令、观测工具或诊断时，说明缺少什么，并判断添加最小观测是否是下一步证据收集动作。
