# Installing SpecPowers for Claude Code

Claude Code is supported through the SpecPowers plugin only. The plugin reads
managed skill payloads from `.claude/skills/`; before installing the plugin,
generate that directory from the authored `skills/` source tree.

## Prerequisites

- Git
- Claude Code with plugin support
- Node.js

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

This generates `.claude/skills/` from `skills/`. Do not maintain
`.claude/skills/` by hand.

The install command also writes local state under `manifests/install-state/`.
That state records the generated plugin payload only; it is a local install
artifact, not authored source.

### 3. Install the plugin

Use Claude Code's plugin marketplace flow to install this local plugin. The
plugin metadata points to the generated `.claude/skills/` payload and
`hooks/hooks.json`.

### 4. Verify

Start a new session and say "I want to build X". The workflow should begin with
`exploring`.

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
