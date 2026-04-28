# Installing SpecPowers for Codex

Codex is supported through the SpecPowers plugin only. The plugin reads managed
skills from `.codex/skills/`, which must be generated from the authored `skills/`
tree before installing the plugin.

## Prerequisites

- Git
- Codex CLI or Codex app, signed in with ChatGPT
- Node.js

---

## Plugin Install

Registers SpecPowers in Codex's plugin directory via a marketplace.

### 1. Clone the repository

```bash
mkdir -p ~/.codex/plugins
git clone https://github.com/NSObjects/specpowers ~/.codex/plugins/specpowers
```

### 2. Generate the managed skills

```bash
cd ~/.codex/plugins/specpowers
node scripts/install.js --platform codex --profile developer
```

This creates `.codex/skills/` from `skills/`. Do not maintain `.codex/skills/`
by hand.

The install command also writes local state under `manifests/install-state/`.
That state records your generated plugin payload and is not source content.

### 3. Register in a marketplace

Codex supports two marketplace scopes. Choose one based on your needs:

| Scope | Marketplace file | `source.path` | Use case |
|-------|-----------------|---------------|----------|
| Personal | `~/.agents/plugins/marketplace.json` | `./.codex/plugins/specpowers` | Available across all your repos |
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
        "path": "./.codex/plugins/specpowers"
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

### 4. Restart Codex and install

Restart Codex, then:

- **Codex CLI**: Run `/plugins`
- **Codex App**: Open the Plugins page

Find `SpecPowers` in your marketplace and choose `Install plugin`.

### 5. Verify

Start a new thread and say "I want to build X". The workflow should begin with `exploring`.

### Updating

```bash
cd ~/.codex/plugins/specpowers && git pull
```

Restart Codex to pick up the latest files.

### Uninstalling

1. Disable or remove `specpowers` from Codex's Plugins UI.
2. Remove the `specpowers` entry from your marketplace file.
3. Optionally delete the clone:

```bash
rm -rf ~/.codex/plugins/specpowers
```
