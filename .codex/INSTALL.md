# Installing SpecPowers for Codex

Enable specpowers skills in Codex via native skill discovery. Just clone and symlink.

## Prerequisites

- Git

## Installation

1. **Clone the specpowers repository:**
   ```bash
   git clone <specpowers-repo-url> ~/.codex/specpowers
   ```

2. **Create the skills symlink:**
   ```bash
   mkdir -p ~/.agents/skills
   ln -s ~/.codex/specpowers/skills ~/.agents/skills/specpowers
   ```

   **Windows (PowerShell):**
   ```powershell
   New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.agents\skills"
   cmd /c mklink /J "$env:USERPROFILE\.agents\skills\specpowers" "$env:USERPROFILE\.codex\specpowers\skills"
   ```

3. **Restart Codex** (quit and relaunch the CLI) to discover the skills.

## Verify

```bash
ls -la ~/.agents/skills/specpowers
```

You should see a symlink (or junction on Windows) pointing to your specpowers skills directory.

## Updating

```bash
cd ~/.codex/specpowers && git pull
```

Skills update instantly through the symlink.

## Uninstalling

```bash
rm ~/.agents/skills/specpowers
```

Optionally delete the clone: `rm -rf ~/.codex/specpowers`.
