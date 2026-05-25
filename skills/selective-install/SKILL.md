---
name: selective-install
description: 安装、更新、诊断或移除 SpecPowers modules 时使用；提供跨所有支持平台的 profile-based installation、per-module granularity、state tracking 和 lifecycle commands（list、doctor、repair、uninstall）。
---

# 选择性安装（Selective Install）

## 概览

SpecPowers 是模块化的。不是每个项目都需要每个 skill。Selective install system 允许你选择一个 profile（core、developer、security、full），并按需添加或排除单个 modules。它跟踪本地生成的 plugin payload，帮助你诊断漂移、修复损坏安装，并干净 uninstall。

**核心原则：** 只安装你需要的内容。清楚知道已安装什么。保持安装健康。

---

## 安装

```bash
# Install with a profile
node scripts/install.js --platform <platform> --profile <profile>

# Add a module on top of a profile
node scripts/install.js --platform claude-code --profile developer --add rules-typescript

# Exclude a module from a profile
node scripts/install.js --platform claude-code --profile full --exclude rules-rust
```

### 支持的平台（Supported Platforms）

| Platform | Target Directory | Adapter |
|----------|-----------------|---------|
| `claude-code` | `.claude/` | `scripts/adapters/claude-code.js` |
| `codex` | `.codex/` | `scripts/adapters/codex.js` |

### 安装配置（Profiles）

| Profile | Description | Modules |
|---------|-------------|---------|
| `core` | Minimal baseline | core-workflow, foundation |
| `developer` | Standard development | core + rules-common, verification-loop, quality-gate, role-agents |
| `security` | Security-enhanced | developer + security review focus |
| `full` | Everything | All modules including all language rules |

---

## 生命周期命令（Lifecycle Commands）

### `list` — 显示已安装 modules

读取本地 install state file，并显示当前已安装内容：

```
Installed Modules (profile: developer, platform: claude-code)
──────────────────────────────────────────────────────────
  core-workflow      skills    installed 2025-01-15
  foundation         skills    installed 2025-01-15
  rules-common       rules     installed 2025-01-15
  verification-loop  skills    installed 2025-01-15
  quality-gate       skills    installed 2025-01-15
  role-agents        agents    installed 2025-01-15

Extra modules: (none)
Excluded modules: (none)
```

### `doctor` — 检测 state drift

对比本地 install state 和磁盘真实文件。检测：

- **Missing files**：State 中列出 module，但磁盘找不到文件
- **Extra files**：磁盘上存在未被 state 跟踪的 SpecPowers 文件
- **Version mismatch**：已安装版本和当前 SpecPowers version 不一致
- **Corrupted state**：State file 缺失或无法解析

```
Doctor Report
─────────────
✓ State file found and valid
✓ 7 modules in state, 7 on disk
✗ rules-common: SKILL.md missing from disk
✗ Version mismatch: installed 0.5.0, current 0.6.0

Recommendation: run `repair` to fix 2 issues
```

### `repair` — 重新安装缺失或损坏 modules

从 SpecPowers source 重新复制 module files 到 platform target directory。只触碰 install state 中列出的 modules。不添加或移除 modules。

### `uninstall` — 移除 SpecPowers 管理的文件

只移除 SpecPowers 安装过、且在 install state 中跟踪的文件。如果某个文件安装后被用户修改过，删除前必须请求确认。

Uninstall 后会清空但保留本地 state file，这样 `doctor` 可以报告 "no modules installed"，而不是 "state file missing"。

---

## 红旗（Red Flags）

| Red Flag | Why It's Bad | What To Do Instead |
|----------|-------------|-------------------|
| 在单语言项目安装 `full` profile | 会用无关语言规则膨胀上下文 | 使用 `developer` + `--add rules-<language>` 安装项目语言 |
| 手动复制 skill files 而不是使用 install script | Local state file 不会跟踪它们；`doctor` 会报告 drift | 始终使用 `install.js` 或 `--add` flag |
| 手动删除 platform directory 中的文件 | 造成 local state drift，`doctor` 会标记 missing files | 使用 `uninstall` command |
| 忽略 `doctor` warnings | Drift 会累积，后续 repair 更困难 | 定期运行 `doctor`，尽早修复 |
| 跳过 `--platform` flag | Install script 不知道文件应放到哪里 | 始终指定 target platform |

---

## 铁律（Iron Laws）

1. **State is truth** — Install state file 是已安装内容的单一事实来源。所有 lifecycle commands 都从它读取。
2. **Dependencies are non-negotiable** — 如果 module A 依赖 module B，安装 A 总是会安装 B。没有例外。
3. **Exclude does not break dependencies** — 你可以从 profile 中排除 module，但如果另一个已安装 module 依赖它，该 exclude 会被静默忽略。
4. **One platform per install** — 每次 install 只面向一个 platform。要安装多个 platforms，分别运行脚本。
5. **Repair never adds** — `repair` command 只重新安装 state 中已有 modules。它不会添加新 modules。
6. **Uninstall is conservative** — 修改过的文件需要明确确认。未跟踪文件永远不会被触碰。
