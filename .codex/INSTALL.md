# Installing SpecPowers for Codex

Codex is supported through the SpecPowers plugin. The plugin manifest at
`.codex-plugin/plugin.json` points Codex at the authored `skills/` directory.

## Prerequisites

- Git
- Codex CLI with `codex plugin marketplace` support
- Codex CLI or Codex app, signed in with ChatGPT

## Plugin Install

### 1. Add the marketplace

```bash
codex plugin marketplace add https://github.com/NSObjects/specpowers.git
```

The marketplace name is `specpowers`.

### 2. Restart Codex and install

Restart Codex, then:

- Codex CLI: run `/plugins`
- Codex App: open the Plugins page

Find `SpecPowers` and install it.

### 3. Verify

Start a new thread and ask SpecPowers to route a task. The loaded entry skill
should be `using-specpowers`.

## Updating

```bash
codex plugin marketplace upgrade specpowers
```

Restart Codex to pick up the latest plugin files.

## Uninstalling

1. Disable or remove `specpowers` from Codex's Plugins UI.
2. Remove the `specpowers` marketplace entry if you no longer want it.
3. Optionally delete the local checkout or cache created by Codex.
