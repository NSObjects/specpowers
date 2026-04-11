# Installing SpecPowers for OpenCode

## Prerequisites

- [OpenCode](https://opencode.ai) installed

## Installation

Add specpowers to the `plugin` array in your `opencode.json` (global or project-level):

```json
{
  "plugin": ["specpowers@git+https://github.com/NSObjects/specpowers"]
}
```

Restart OpenCode. The plugin auto-installs and registers all skills.

### Verify

Start a new session and ask:

```text
I want to build X
```

The workflow should begin with `exploring` — asking questions, not writing code.

## Usage

Use OpenCode's native `skill` tool:

```
use skill tool to list skills
use skill tool to load specpowers/proposing
```

## Updating

SpecPowers updates automatically when you restart OpenCode.

To pin a specific version:

```json
{
  "plugin": ["specpowers@git+https://github.com/NSObjects/specpowers#v0.6.0"]
}
```

## Troubleshooting

### Plugin not loading

1. Check logs: `opencode run --print-logs "hello" 2>&1 | grep -i specpowers`
2. Verify the plugin line in your `opencode.json`
3. Make sure you're running a recent version of OpenCode

### Skills not found

1. Use `skill` tool to list what's discovered
2. Check that the plugin is loading (see above)

### Tool mapping

When skills reference Claude Code tools:

| SpecPowers Reference | OpenCode Equivalent |
|---------------------|---------------------|
| `TodoWrite` | `todowrite` |
| `Task` with subagents | `@mention` syntax |
| `Skill` tool | OpenCode's native `skill` tool |
| File operations | Your native tools |
