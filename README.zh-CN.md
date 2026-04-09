# SpecPowers

[English](README.md) | [中文](README.zh-CN.md)

> 给 AI 编程助手用的规格驱动开发工作流。让你的 AI 先想清楚再动手写代码。

## 为什么需要

AI 编程助手写代码很快，但容易跑偏——跳过需求分析、忽略边界情况、还没理解问题就开始写代码。SpecPowers 通过强制结构化工作流来解决这个问题：

```
探索 → 提案 → 规范 → 设计 → 规划 → spec-driven-development → 归档
```

每一行代码都能追溯到一份规范。没有规范，就不写代码。

## 怎么用

```text
你: "给 App 加上暗黑模式"

AI:  [exploring]  "自动跟随系统、手动切换，还是都要？"
你: "都要"

AI:  [proposing]  → proposal.md    ✓ 意图、范围、非目标
AI:  [specifying] → spec.md        ✓ 2 个需求，4 个场景 (GIVEN/WHEN/THEN)
AI:  [designing]  → design.md      ✓ CSS Variables 方案，3 个文件
AI:  [planning]   → tasks.md       ✓ 3 个 TDD 任务映射到规范

你: "逐任务"

AI:  ✅ 任务 1 — RED → GREEN → 代码审查: APPROVED → ⏸️ 你来 commit
AI:  ✅ 任务 2 — 完成 → ⏸️ 你来 commit
AI:  ✅ 任务 3 — 完成
     🎉 全部完成。说 "Archive" 合并规范。
```

AI 永远不会执行 git 命令。每个任务完成后由你 review 和 commit。

对于复杂需求，`exploring` 可以按需研究现有实现，或委派受限研究子任务，但这仍然属于 `exploring` 内部能力，不会变成额外流程阶段。

```mermaid
flowchart TD
    Start([用户请求]) --> Exploring[exploring<br/>苏格拉底式对话]
    Exploring --> Proposing[proposing<br/>proposal.md]
    Proposing --> Specifying[specifying<br/>spec.md · GIVEN/WHEN/THEN]
    Specifying --> Designing[designing<br/>design.md]
    Designing --> Planning[planning<br/>tasks.md · TDD 任务]
    Planning --> Execution[spec-driven-development<br/>执行模式]
    Execution --> Choice{执行模式}
    Choice -->|逐任务| Step[1 个任务 → 审查 → 暂停]
    Choice -->|快速| Fast[全部执行 → 统一审查]
    Step -.->|commit 后继续| Step
    Step --> Done
    Fast --> Done
    Done{完成} --> Archiving[archiving<br/>合并增量规范]
```

## 安装

> 语言规则自动安装和选择性安装功能需要 Node.js 环境。

| 平台 | 状态 | 安装方式 |
|------|------|---------|
| **Claude Code** | ✅ | `/plugin marketplace add NSObjects/specpowers` 然后 `/plugin install specpowers` |
| **Codex** | ✅ | Fetch and follow instructions from `https://raw.githubusercontent.com/NSObjects/specpowers/refs/heads/main/.codex/INSTALL.md` |
| **Kiro IDE** | ✅ | Powers 面板 → Add power from GitHub → `NSObjects/specpowers` |
| **Cursor** | ❌ | `/add-plugin https://github.com/NSObjects/specpowers` |
| **Gemini CLI** | ❌ | `gemini extensions install https://github.com/NSObjects/specpowers` |
| **OpenCode** | ❌ | Fetch and follow instructions from `https://raw.githubusercontent.com/NSObjects/specpowers/refs/heads/main/.opencode/INSTALL.md` |

对于 Codex 本地插件安装，需要在首次使用前进入克隆目录执行一次受管安装引导：

```bash
node scripts/install.js --platform codex --profile developer
```

### 语言规则

Agent 在会话启动时激活 `using-skills` 技能后，会扫描项目文件并自动安装对应的语言规则——比如 `.ts` 文件触发 `rules-typescript`，`.py` 触发 `rules-python`。语言规则无需手动配置。

如果是安装后的首次会话（没有历史安装状态），Agent 还会自动执行 `developer` 配置文件的初始安装。

### 验证

开一个新会话，说"我想做个 X 功能"。AI 应该从 `exploring` 开始问你问题，而不是直接写代码。

## 包含什么

### 工作流（规格驱动管道）

| 技能 | 做什么 |
|------|--------|
| `exploring` | 苏格拉底式对话，理解意图；必要时研究现有实现 |
| `proposing` | 范围、非目标、成功标准 → proposal.md |
| `specifying` | GIVEN/WHEN/THEN 行为规范 → spec.md |
| `designing` | 架构决策与取舍 → design.md |
| `planning` | TDD 任务分解 → tasks.md |
| `spec-driven-development` | 逐任务或快速执行引擎 |
| `archiving` | 增量规范合并到主规范 |

### 质量

| 技能 | 做什么 |
|------|--------|
| `test-driven-development` | RED → GREEN → REFACTOR，没有例外 |
| `verification-loop` | 6 阶段管道：构建 → 类型 → Lint → 测试 → 安全 → Diff |
| `quality-gate` | 编辑后快速 lint/类型检查 |
| `systematic-debugging` | 四阶段根因分析 |

### 语言规则

根据项目文件自动检测。`rules-common` 先加载，语言特定规则叠加在上面。

TypeScript · Python · Go · Rust · Java · Kotlin · C++ · Swift · PHP · Perl · C# · Dart

### 协作

| 技能 | 做什么 |
|------|--------|
| `requesting-code-review` | 统一审查入口，按需下钻专项深审 |
| `receiving-code-review` | 处理审查反馈 |
| `dispatching-parallel-agents` | 独立任务并行分发 |

### 角色代理

预置代理模板：`planner`（只读分析）、`security-reviewer`（由统一审查按需调用的专项深审角色）、`tdd-guide`（TDD 教练）。

### 能力分层

- **规则层** — `rules-common` 和 `rules-*` 是写代码、改代码、review 代码时要遵守的标准与约束。它们塑造决策和审查标准，但不是新的流程入口。
- **流程层** — 面向用户的入口能力，例如 `requesting-code-review`、`receiving-code-review`、`dispatching-parallel-agents`。在审查场景里，`requesting-code-review` 是唯一对外的审查入口。
- **角色层** — `security-reviewer`、`planner`、`tdd-guide` 这类内部协作角色。它们通过流程层被按需调用，而不是与流程层并列的用户入口。

## 设计理念

- **先规范后代码** — 先定义行为再实现
- **TDD 是强制的** — 每个任务从失败的测试开始
- **证据优于声明** — 证明能用再往下走
- **研究内嵌而非独立阶段** — 在关键决策阶段研究已有方案，而不是额外分叉一条流程
- **你掌控 git** — AI 永远不 commit，你 review 一切
- **角色隔离** — AI 在每个阶段扮演受限角色（采访者、架构师、开发者……）
- **存量优先** — 为已有代码库而生，新项目同样好用

## 高级：选择性安装

需要精细控制时使用（大多数用户不需要）：

```bash
node scripts/install.js --platform claude-code --profile developer
node scripts/install.js --platform kiro-ide --add rules-typescript
node scripts/install.js --platform cursor --profile full --exclude rules-rust
```

配置文件：`core`（最小）· `developer`（推荐）· `security` · `full`（全部）。

模块生命周期命令（`list`、`doctor`、`repair`、`uninstall`）在 `selective-install` 技能中。

## 参与贡献

欢迎提 Issue 和 PR。如果要添加新技能，请使用 `writing-skills` 元技能——它会强制执行技能模板结构。

## 致谢

设计借鉴了 [OpenSpec](https://github.com/Fission-AI/OpenSpec)（结构化产物体系）和 [Superpowers](https://github.com/obra/superpowers)（行为塑造引擎）。

## 开源协议

MIT
