# 为 Claude Code 安装 SpecPowers

Claude Code 只支持通过 SpecPowers plugin 使用。本插件从 `.claude/skills/`
读取受管技能产物；安装插件前，必须先从源码 `skills/` 生成该目录。

## 前置条件

- Git
- 支持 plugin 的 Claude Code
- Node.js

## 插件安装

### 1. 克隆仓库

```bash
git clone https://github.com/NSObjects/specpowers ~/.claude/plugins/specpowers
```

### 2. 生成受管技能产物

```bash
cd ~/.claude/plugins/specpowers
node scripts/install.js --platform claude-code --profile developer
```

这会从 `skills/` 生成 `.claude/skills/`。不要手工维护 `.claude/skills/`。

安装命令还会在 `manifests/install-state/` 下写入本地状态。该状态只记录当前生成的插件产物，不是源码。

### 3. 安装插件

使用 Claude Code 的 plugin marketplace 流程安装这个本地插件。插件元数据会指向已生成的 `.claude/skills/` 产物和 `hooks/hooks.json`。

### 4. 验证

开启新会话并说“我想做 X”。工作流应该从 `exploring` 开始。

## 更新

```bash
cd ~/.claude/plugins/specpowers
git pull
node scripts/install.js --platform claude-code --profile developer
```

重新生成受管产物后，重启 Claude Code。

## 卸载

1. 在 Claude Code 的 Plugins UI 中禁用或移除 `specpowers`。
2. 如有需要，删除本地克隆：

```bash
rm -rf ~/.claude/plugins/specpowers
```
