# SpecPowers

[English](README.md) | [中文](README.zh-CN.md)

SpecPowers is a small-core workflow plugin for coding agents. It routes work
into a few clear modes, keeps change contracts proportional to risk, and gates
completion claims on evidence.

This version intentionally breaks the older multi-stage workflow. It does not
keep compatibility wrappers for removed skill names.

## Core Model

```text
using-specpowers
  -> investigate
  -> define-change
  -> execute-change
  -> review-change
  -> operate-plugin

shared:
  -> claim-gate
  -> engineering-rules
```

## Skills

| Skill | Purpose |
| --- | --- |
| `using-specpowers` | Single router for selecting the smallest honest work mode |
| `investigate` | Read-only diagnosis, project health checks, and architecture questions |
| `define-change` | Behavior contract and design choices before risky or visible edits |
| `execute-change` | Focused implementation with direct validation |
| `review-change` | Standalone review with one final decision |
| `claim-gate` | Unified gate before completion, fixed, passing, approved, or ready claims |
| `engineering-rules` | Compact engineering defaults for implementation and review |
| `operate-plugin` | Plugin install, repair, packaging, and runtime verification |

## Design Principles

- Prefer one deep workflow interface over many shallow workflow phases.
- Use inline contracts for small work and file-backed briefs only when risk
  justifies them.
- Replace obsolete paths instead of adding compatibility glue.
- Keep platform details in plugin operation, not in every workflow skill.
- Use the `claim-gate` before claims, not several overlapping gates.
- Treat tests as evidence, not ritual. For docs, manifests, and install flows,
  direct validation can be the right evidence.

## Install

| Platform | Status | Install guide |
| --- | --- | --- |
| Claude Code | Supported | [.claude-plugin/INSTALL.md](.claude-plugin/INSTALL.md) |
| Codex | Supported | [.codex/INSTALL.md](.codex/INSTALL.md) |

Claude Code local-plugin installs generate a managed payload:

```bash
node scripts/install.js --platform claude-code --profile developer
```

Codex plugin installs read authored skills from `skills/` through
`.codex-plugin/plugin.json`.

## Verify

For repository source checks:

```bash
node -e "JSON.parse(require('fs').readFileSync('manifests/install-modules.json', 'utf8')); JSON.parse(require('fs').readFileSync('manifests/install-profiles.json', 'utf8'))"
```

For Claude Code payload generation, run the installer in a clean checkout or
explicit temporary copy and inspect `.claude/skills/using-specpowers/SKILL.md`.

## License

MIT
