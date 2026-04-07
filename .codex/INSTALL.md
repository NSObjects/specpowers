# Installing SpecPowers for Codex

SpecPowers supports two installation modes in Codex:

1. Recommended: install it as a local plugin through a personal marketplace.
2. Legacy: install only the skills through native skill discovery.

The plugin flow is the better default because SpecPowers shows up in Codex's plugin directory and uses the metadata from `.codex-plugin/plugin.json`.

## Recommended: install as a local plugin

This follows Codex's local plugin flow: copy the plugin into `~/.codex/plugins/`, register it in `~/.agents/plugins/marketplace.json`, then install it from the plugin directory.

### Prerequisites

- Git
- Codex CLI or Codex app, signed in with ChatGPT

### 1. Clone the repository into the local plugin directory

```bash
mkdir -p ~/.codex/plugins
git clone https://github.com/NSObjects/specpowers ~/.codex/plugins/specpowers
```

### 2. Create or update your personal marketplace

If `~/.agents/plugins/marketplace.json` does not exist yet, create it with:

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

If the file already exists, append this plugin entry to the existing `plugins` array instead of replacing the whole file:

```json
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
```

### 3. Restart Codex

Quit and relaunch Codex so it reloads the marketplace.

### 4. Install the plugin from the plugin directory

- In Codex CLI, start Codex and run `/plugins`.
- In the Codex app, open the Plugins page.
- Find `SpecPowers` in your local marketplace and choose `Install plugin`.

### 5. Verify

Start a new thread and say:

```text
I want to build X
```

SpecPowers should be available as an installed plugin, and the workflow should begin with `exploring`.

## Legacy: skills-only install

Use this if you only want native skill discovery and do not want to manage plugins or marketplaces.

### 1. Clone the specpowers repository

```bash
git clone https://github.com/NSObjects/specpowers ~/.codex/specpowers
```

### 2. Create the skills symlink

```bash
mkdir -p ~/.agents/skills
ln -s ~/.codex/specpowers/skills ~/.agents/skills/specpowers
```

**Windows (PowerShell):**

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.agents\skills"
cmd /c mklink /J "$env:USERPROFILE\.agents\skills\specpowers" "$env:USERPROFILE\.codex\specpowers\skills"
```

### 3. Restart Codex

Quit and relaunch the CLI or app so Codex discovers the skills.

### 4. Verify

```bash
ls -la ~/.agents/skills/specpowers
```

You should see a symlink (or junction on Windows) pointing to the SpecPowers `skills/` directory.

## Updating

Plugin install:

```bash
cd ~/.codex/plugins/specpowers && git pull
```

Then restart Codex so the local marketplace install picks up the latest files.

Skills-only install:

```bash
cd ~/.codex/specpowers && git pull
```

Skills update instantly through the symlink, but restarting Codex is still the safest way to force a fresh discovery pass.

## Uninstalling

Plugin install:

1. Disable or remove `specpowers` from Codex's Plugins UI.
2. Remove the `specpowers` entry from `~/.agents/plugins/marketplace.json`.
3. Optionally delete the local clone:

```bash
rm -rf ~/.codex/plugins/specpowers
```

Skills-only install:

```bash
rm ~/.agents/skills/specpowers
```

Optionally delete the clone:

```bash
rm -rf ~/.codex/specpowers
```
