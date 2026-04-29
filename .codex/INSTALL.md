# Installing SpecPowers for Codex

Codex is supported through the SpecPowers plugin only. The plugin reads skills
from the plugin checkout's `skills/` directory through Codex's default plugin
skill discovery.

This is a Codex plugin install: register the repository as a local plugin through
a marketplace, then install it from Codex's Plugins UI. Do not copy or symlink
skills into `~/.codex/skills`.

Do not point Codex at a full SpecPowers source checkout. The full repository
also contains generated `steering/` files with skill frontmatter, which Codex can
discover as duplicate skills. Use the sparse checkout below so the plugin root
contains only `.codex-plugin/` and one `skills/` tree.

## Prerequisites

- Git
- Codex CLI or Codex app, signed in with ChatGPT

---

## Plugin Install

Registers SpecPowers as a home-local or workspace-local Codex plugin via a
marketplace. The plugin manifest lives at `.codex-plugin/plugin.json`.

### 1. Clone the repository

```bash
mkdir -p ~/plugins
git clone --filter=blob:none --sparse https://github.com/NSObjects/specpowers ~/plugins/specpowers
cd ~/plugins/specpowers
git sparse-checkout set .codex-plugin skills README.md LICENSE
```

### 2. Register in a marketplace

Codex supports two marketplace scopes. Choose one based on your needs:

| Scope | Marketplace file | `source.path` | Use case |
|-------|-----------------|---------------|----------|
| Personal | `~/.agents/plugins/marketplace.json` | `./plugins/specpowers` | Available across all your repos |
| Workspace | `$REPO_ROOT/.agents/plugins/marketplace.json` | `./plugins/specpowers` | Shared with team via version control |

> Codex resolves `source.path` relative to the marketplace root (home directory for personal, repo root for workspace). Paths must start with `./`.

Add the following entry. If the marketplace file does not exist, create it with the full structure below. If it already exists, append the entry to the `plugins` array.

**Personal** (`~/.agents/plugins/marketplace.json`):

```json
{
  "name": "local-plugins",
  "interface": {
    "displayName": "Local Plugins"
  },
  "plugins": [
    {
      "name": "specpowers",
      "source": {
        "source": "local",
        "path": "./plugins/specpowers"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Coding"
    }
  ]
}
```

**Workspace** (`$REPO_ROOT/.agents/plugins/marketplace.json`):

Same structure, but change `source.path` to point to the plugin location relative to your repo root (e.g. `./plugins/specpowers`).

### 3. Restart Codex and install

Restart Codex, then:

- **Codex CLI**: Run `/plugins`
- **Codex App**: Open the Plugins page

Find `SpecPowers` in your marketplace and choose `Install plugin`.

### 4. Verify

Start a new thread and say "I want to build X". The workflow should begin with `exploring`.

### Updating

```bash
cd ~/plugins/specpowers
git pull
git sparse-checkout set .codex-plugin skills README.md LICENSE
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
