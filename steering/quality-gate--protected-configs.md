<!-- generated from skills/ by sync-steering.js -->
# Protected Configuration Files

## Overview

Quality tool configuration files are protected from accidental modification. These files control formatting, linting, and type checking behavior for the entire project. Changing them without team consensus can silently degrade code quality.

## Protected Files

### JavaScript / TypeScript

| File | Tool | Purpose |
|------|------|---------|
| `.eslintrc` | ESLint | Lint rules (legacy format) |
| `.eslintrc.js` | ESLint | Lint rules (JS format) |
| `.eslintrc.cjs` | ESLint | Lint rules (CJS format) |
| `.eslintrc.json` | ESLint | Lint rules (JSON format) |
| `.eslintrc.yml` | ESLint | Lint rules (YAML format) |
| `eslint.config.js` | ESLint | Lint rules (flat config) |
| `eslint.config.mjs` | ESLint | Lint rules (flat config ESM) |
| `eslint.config.cjs` | ESLint | Lint rules (flat config CJS) |
| `tsconfig.json` | TypeScript | Type checking configuration |
| `tsconfig.*.json` | TypeScript | Extended type configs |
| `.prettierrc` | Prettier | Formatting rules |
| `.prettierrc.js` | Prettier | Formatting rules (JS) |
| `.prettierrc.cjs` | Prettier | Formatting rules (CJS) |
| `.prettierrc.json` | Prettier | Formatting rules (JSON) |
| `.prettierrc.yml` | Prettier | Formatting rules (YAML) |
| `.prettierrc.toml` | Prettier | Formatting rules (TOML) |
| `prettier.config.js` | Prettier | Formatting rules (config) |
| `prettier.config.cjs` | Prettier | Formatting rules (config CJS) |
| `biome.json` | Biome | Format + lint rules |
| `biome.jsonc` | Biome | Format + lint rules |

### Python

| File | Tool | Purpose |
|------|------|---------|
| `pyproject.toml` (lint/format sections) | ruff, black, mypy, pyright | Lint, format, and type config |
| `.flake8` | Flake8 | Lint rules |
| `setup.cfg` (flake8/mypy sections) | Flake8, mypy | Lint and type config |
| `.pylintrc` | Pylint | Lint rules |
| `.mypy.ini` | mypy | Type checking config |
| `mypy.ini` | mypy | Type checking config |
| `pyrightconfig.json` | Pyright | Type checking config |
| `.ruff.toml` | Ruff | Lint and format config |
| `ruff.toml` | Ruff | Lint and format config |

### Go

| File | Tool | Purpose |
|------|------|---------|
| `.golangci.yml` | golangci-lint | Lint rules |
| `.golangci.yaml` | golangci-lint | Lint rules |
| `.golangci.json` | golangci-lint | Lint rules |
| `.golangci.toml` | golangci-lint | Lint rules |

### Rust

| File | Tool | Purpose |
|------|------|---------|
| `rustfmt.toml` | rustfmt | Formatting rules |
| `.rustfmt.toml` | rustfmt | Formatting rules |
| `clippy.toml` | Clippy | Lint rules |
| `.clippy.toml` | Clippy | Lint rules |

### Multi-language / Editor

| File | Tool | Purpose |
|------|------|---------|
| `.editorconfig` | EditorConfig | Cross-editor formatting |
| `.clang-format` | clang-format | C/C++ formatting |
| `.clang-tidy` | clang-tidy | C/C++ lint |
| `.swiftlint.yml` | SwiftLint | Swift lint rules |
| `analysis_options.yaml` | Dart analyzer | Dart lint and analysis |
| `checkstyle.xml` | Checkstyle | Java lint rules |
| `.scalafmt.conf` | Scalafmt | Scala formatting |
| `ktlint-baseline.xml` | ktlint | Kotlin lint baseline |

## Protection Rules

1. **Do not modify** any protected configuration file without explicit user approval
2. **Do not delete** any protected configuration file
3. **Do not create** new configuration files that override or conflict with existing ones
4. **Do not add inline disable comments** (e.g., `// eslint-disable`, `# noqa`, `#[allow(...)]`) to bypass lint rules without documenting the reason

## Override Mechanism

When a configuration change is genuinely needed:

1. **Explain the need** — state what change is required and why
2. **Show the impact** — describe what the change affects (which rules, which files)
3. **Get explicit approval** — the user must confirm the change before it's made
4. **Document the change** — add a comment in the config file explaining why the change was made

```
BEFORE modifying a protected config:
  1. IDENTIFY: Which config file and which setting?
  2. EXPLAIN: Why is this change needed?
  3. IMPACT: What does this change affect?
  4. ASK: Get explicit user approval
  5. DOCUMENT: Add a comment explaining the change
  SKIP any step = violation of config protection
```
