---
name: selective-install
description: Use when installing, updating, diagnosing, or removing SpecPowers modules — provides profile-based installation, per-module granularity, state tracking, and lifecycle commands (list, doctor, repair, uninstall) across all supported platforms
---

# Selective Install

## Overview

SpecPowers is modular. Not every project needs every skill. The selective install system lets you pick a profile (core, developer, security, full) and optionally add or exclude individual modules. It tracks what's installed so you can diagnose drift, repair broken installs, and cleanly uninstall.

**Core principle:** Install only what you need. Know exactly what's installed. Keep it healthy.

---

## Installation

```bash
# Install with a profile
node scripts/install.js --platform <platform> --profile <profile>

# Add a module on top of a profile
node scripts/install.js --platform claude-code --profile developer --add rules-typescript

# Exclude a module from a profile
node scripts/install.js --platform claude-code --profile full --exclude rules-rust
```

### Supported Platforms

| Platform | Target Directory | Adapter |
|----------|-----------------|---------|
| `claude-code` | `.claude/` | `scripts/adapters/claude-code.js` |
| `codex` | `.codex/` | `scripts/adapters/codex.js` |

### Profiles

| Profile | Description | Modules |
|---------|-------------|---------|
| `core` | Minimal baseline | core-workflow, foundation |
| `developer` | Standard development | core + rules-common, verification-loop, quality-gate, role-agents |
| `security` | Security-enhanced | developer + security review focus |
| `full` | Everything | All modules including all language rules |

---

## Lifecycle Commands

### `list` — Show installed modules

Read the install state file and display what's currently installed:

```
Installed Modules (profile: developer, platform: claude-code)
──────────────────────────────────────────────────────────
  core-workflow      skills    installed 2025-01-15
  foundation         skills    installed 2025-01-15
  rules-common       rules     installed 2025-01-15
  verification-loop  skills    installed 2025-01-15
  quality-gate       skills    installed 2025-01-15
  role-agents        agents    installed 2025-01-15

Extra modules: (none)
Excluded modules: (none)
```

### `doctor` — Detect state drift

Compare the install state against what's actually on disk. Detect:

- **Missing files**: Module listed in state but files not found on disk
- **Extra files**: SpecPowers files on disk not tracked in state
- **Version mismatch**: Installed version differs from current SpecPowers version
- **Corrupted state**: State file missing or unparseable

```
Doctor Report
─────────────
✓ State file found and valid
✓ 7 modules in state, 7 on disk
✗ rules-common: SKILL.md missing from disk
✗ Version mismatch: installed 0.5.0, current 0.6.0

Recommendation: run `repair` to fix 2 issues
```

### `repair` — Reinstall missing or corrupted modules

Re-copy module files from the SpecPowers source to the platform target directory. Only touches modules that are listed in the install state. Does not add or remove modules.

### `uninstall` — Remove SpecPowers-managed files

Remove only files that SpecPowers installed (tracked in install state). If a file has been modified by the user since installation, prompt for confirmation before deleting.

After uninstall, the state file is cleared but preserved (so `doctor` can report "no modules installed" rather than "state file missing").

---

## Red Flags

| Red Flag | Why It's Bad | What To Do Instead |
|----------|-------------|-------------------|
| Installing `full` profile on a single-language project | Bloats context with irrelevant language rules | Use `developer` + `--add rules-<language>` for your language |
| Manually copying skill files instead of using install script | State file won't track them; `doctor` will report drift | Always use `install.js` or `--add` flag |
| Deleting files from the platform directory by hand | State drift — `doctor` will flag missing files | Use `uninstall` command |
| Ignoring `doctor` warnings | Drift accumulates; repairs get harder | Run `doctor` periodically, fix issues early |
| Skipping `--platform` flag | Install script won't know where to put files | Always specify the target platform |

---

## Iron Laws

1. **State is truth** — The install state file is the single source of truth for what's installed. All lifecycle commands read from it.
2. **Dependencies are non-negotiable** — If module A depends on module B, installing A always installs B. No exceptions.
3. **Exclude does not break dependencies** — You can exclude a module from a profile, but if another installed module depends on it, the exclude is silently ignored.
4. **One platform per install** — Each install targets exactly one platform. To install for multiple platforms, run the script once per platform.
5. **Repair never adds** — The `repair` command only reinstalls modules already in the state. It never adds new modules.
6. **Uninstall is conservative** — Modified files require explicit confirmation. Untracked files are never touched.
