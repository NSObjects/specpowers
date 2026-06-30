# Installing SpecPowers for Claude Code

Claude Code is supported through the SpecPowers plugin. Claude Code reads a
managed skill payload from `.claude/skills/`, generated from the authored
`skills/` tree.

## Prerequisites

- Git
- Node.js
- Claude Code with plugin support

## Plugin Install

### 1. Clone the repository

```bash
git clone https://github.com/NSObjects/specpowers ~/.claude/plugins/specpowers
```

### 2. Generate the managed skill payload

```bash
cd ~/.claude/plugins/specpowers
node scripts/install.js --platform claude-code --profile developer
```

This creates `.claude/skills/using-specpowers/SKILL.md` and the other selected
skills. Do not maintain `.claude/skills/` by hand.

### 3. Install the plugin

Use Claude Code's plugin marketplace flow to install this local plugin.

### 4. Verify

Start a new session. The session-start hook should inject the
`using-specpowers` router.

## Updating

```bash
cd ~/.claude/plugins/specpowers
git pull
node scripts/install.js --platform claude-code --profile developer
```

Restart Claude Code after regenerating the managed payload.

## Uninstalling

1. Disable or remove `specpowers` in Claude Code's Plugins UI.
2. Optionally delete the local clone:

```bash
rm -rf ~/.claude/plugins/specpowers
```
