# SpecPowers

[English](README.md) | [中文](README.zh-CN.md)

SpecPowers 是给 coding agent 用的小核心工作流插件。它只做三件事：
选择正确工作模式、按风险定义变更契约、在声称完成前要求证据。

这一版故意不兼容旧的多阶段 workflow。不会为已删除的 skill 名称保留兼容
wrapper。

## 核心模型

```text
using-specpowers
  -> investigate
  -> define-change
  -> execute-change
  -> review-change
  -> operate-plugin

shared:
  -> claim-gate
  -> engineering-rules
```

## Skills

| Skill | 作用 |
| --- | --- |
| `using-specpowers` | 唯一路由入口，选择最小且诚实的工作模式 |
| `investigate` | 只读调查、问题诊断、项目健康检查和架构判断 |
| `define-change` | 高风险或用户可见改动前定义行为契约和设计选择 |
| `execute-change` | 按清晰范围实现改动并做直接验证 |
| `review-change` | 独立审查，输出单一最终决策 |
| `claim-gate` | 完成、修复、通过、批准、可合并等声明前的统一门禁 |
| `engineering-rules` | 实现和审查时使用的紧凑工程默认规则 |
| `operate-plugin` | 插件安装、修复、打包和运行态验证 |

## 设计原则

- 用一个深的 workflow interface 代替许多浅流程阶段。
- 小改用 inline contract；只有风险足够高才写文件化 brief。
- 不做兼容胶水；旧路径不再成立时直接删除。
- 平台细节归 `operate-plugin` 管，不散落在每个 workflow skill 里。
- 完成声明只走 `claim-gate`，不再叠加多套门禁。
- 测试是证据，不是仪式。文档、manifest、安装流可以用直接验证。

## 安装

| 平台 | 状态 | 安装说明 |
| --- | --- | --- |
| Claude Code | 支持 | [.claude-plugin/INSTALL.md](.claude-plugin/INSTALL.md) |
| Codex | 支持 | [.codex/INSTALL.md](.codex/INSTALL.md) |

Claude Code 本地插件安装需要生成 managed payload：

```bash
node scripts/install.js --platform claude-code --profile developer
```

Codex 插件安装通过 `.codex-plugin/plugin.json` 直接读取 `skills/` 下的
authoring 版本。

## 验证

仓库源文件检查：

```bash
node -e "JSON.parse(require('fs').readFileSync('manifests/install-modules.json', 'utf8')); JSON.parse(require('fs').readFileSync('manifests/install-profiles.json', 'utf8'))"
```

Claude Code payload 验证：在干净 checkout 或明确的临时副本中运行 installer，
然后确认 `.claude/skills/using-specpowers/SKILL.md` 存在。

## License

MIT
