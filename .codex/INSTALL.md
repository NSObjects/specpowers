# Installing SpecPowers for Codex

Codex is supported through the SpecPowers plugin only. The plugin manifest at
`.codex-plugin/plugin.json` points Codex at the plugin checkout's `skills/`
directory.

This is a Codex plugin install: register the repository as a marketplace with
the Codex CLI, then install it from Codex's Plugins UI. The repository
marketplace lives at `.agents/plugins/marketplace.json`. Do not copy or symlink
skills into `~/.codex/skills`.

Older marketplace metadata used a root `source` entry, which recent Codex
versions skip as an empty local plugin path. Use the marketplace command below
so Codex reads the current `.agents/plugins/marketplace.json` catalog and the
plugin's `.codex-plugin/plugin.json` manifest.

## Prerequisites

- Git
- Codex CLI with `codex plugin marketplace` support
- Codex CLI or Codex app, signed in with ChatGPT

---

## Plugin Install

Registers SpecPowers as a Codex marketplace. The marketplace catalog lives at
`.agents/plugins/marketplace.json`, and the plugin manifest lives at
`.codex-plugin/plugin.json`.

### 1. Add the marketplace

```bash
codex plugin marketplace add https://github.com/NSObjects/specpowers.git
```

The marketplace name is `specpowers`.

### 2. Restart Codex and install

Restart Codex, then:

- **Codex CLI**: Run `/plugins`
- **Codex App**: Open the Plugins page

Find `SpecPowers` in your marketplace and choose `Install plugin`.

### 3. Verify

Start a new thread and say "I want to build X". The workflow should begin with `exploring`.

### Updating

```bash
codex plugin marketplace upgrade specpowers
```

Restart Codex to pick up the latest plugin files.

### Migrating from older instructions

Older instructions installed SpecPowers under `~/.codex/`, generated a second
`.codex/skills/` tree, or pointed Codex at a full source checkout that included
`steering/`. Remove those stale copies before reinstalling the plugin, otherwise
Codex can discover the same skills more than once.

1. Disable or remove `specpowers` from Codex's Plugins UI.
2. Remove old `specpowers` entries from `~/.agents/plugins/marketplace.json`,
   especially entries whose `source.path` is `./.codex/plugins/specpowers`.
3. Delete stale local copies and plugin cache:

```bash
rm -rf ~/.codex/specpowers
rm -rf ~/.codex/plugins/specpowers
rm -rf ~/.codex/plugins/cache/local-plugins/specpowers
rm -rf ~/plugins/specpowers/.codex/skills
rm -rf ~/plugins/specpowers/steering
```

4. Follow the install steps above, then restart Codex.

### Uninstalling

1. Disable or remove `specpowers` from Codex's Plugins UI.
2. Remove the `specpowers` entry from your marketplace file.
3. Optionally delete the clone:

```bash
rm -rf ~/plugins/specpowers
```
