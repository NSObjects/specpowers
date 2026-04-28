---
name: quality-gate
description: Use when the user explicitly asks for automated quality checks or an active implementation workflow reaches its quality-check checkpoint; do not trigger as a separate workflow phase
---

# Quality Gate

## Overview

A lightweight, automated quality check pipeline that runs after code edits. Unlike `verification-loop` (which is a full 6-stage pipeline for milestones), quality-gate is a fast, focused check for the three most common quality issues: formatting, linting, and type errors.

**Core principle:** Catch problems at the edit, not at the commit. Small checks after every change beat big checks at the end.

This skill integrates with `verification-before-completion` as the automated "evidence-first" implementation — it provides the concrete commands and checks that back up completion claims.

---

## Auto-Detection Flow

```
Detect Language → Detect Toolchain → Map Commands → Run Checks
      ↓                  ↓                 ↓              ↓
  File extensions    Marker files     Format/Lint/Type   Report
  in changed files   in project root  commands per lang  results
```

### Step 1: Detect Language

Examine the changed files to determine which languages are involved:

| Extension(s) | Language |
|--------------|----------|
| `.ts`, `.tsx` | TypeScript |
| `.js`, `.jsx`, `.mjs`, `.cjs` | JavaScript |
| `.py`, `.pyi` | Python |
| `.go` | Go |
| `.rs` | Rust |
| `.java` | Java |
| `.kt`, `.kts` | Kotlin |
| `.cs` | C# |
| `.swift` | Swift |
| `.php` | PHP |
| `.dart` | Dart |
| `.cpp`, `.cc`, `.cxx`, `.h`, `.hpp` | C++ |

### Step 2: Detect Toolchain

Check for marker files to determine the project's toolchain and package manager:

| Marker File | Toolchain | Package Manager |
|-------------|-----------|-----------------|
| `package.json` | Node.js | npm (default) |
| `pnpm-lock.yaml` | Node.js | pnpm |
| `yarn.lock` | Node.js | yarn |
| `bun.lockb` | Node.js | bun |
| `pyproject.toml` | Python | pip/poetry/uv |
| `go.mod` | Go | go |
| `Cargo.toml` | Rust | cargo |
| `pom.xml` | Java | maven |
| `build.gradle` | Java/Kotlin | gradle |

### Step 3: Map Commands

For each detected language, map to the corresponding quality commands:

#### Formatting

| Language | Tool | Command |
|----------|------|---------|
| TypeScript/JavaScript | prettier | `npx prettier --check .` |
| TypeScript/JavaScript | biome | `npx biome format .` |
| Python | black | `black --check .` |
| Python | ruff | `ruff format --check .` |
| Go | gofmt | `gofmt -l .` |
| Rust | rustfmt | `cargo fmt --check` |
| Java | google-java-format | `google-java-format --dry-run` |
| Kotlin | ktlint | `ktlint --check` |
| Dart | dart format | `dart format --set-exit-if-changed .` |
| C++ | clang-format | `clang-format --dry-run` |

#### Lint

| Language | Tool | Command |
|----------|------|---------|
| TypeScript/JavaScript | eslint | `npx eslint .` |
| TypeScript/JavaScript | biome | `npx biome lint .` |
| Python | ruff | `ruff check .` |
| Python | flake8 | `flake8 .` |
| Go | golangci-lint | `golangci-lint run` |
| Rust | clippy | `cargo clippy` |
| Java | checkstyle | `checkstyle` |
| Kotlin | ktlint | `ktlint` |
| Dart | dart analyze | `dart analyze` |
| C++ | clang-tidy | `clang-tidy` |

#### Type Check

| Language | Tool | Command |
|----------|------|---------|
| TypeScript | tsc | `npx tsc --noEmit` |
| Python | pyright | `pyright` |
| Python | mypy | `mypy .` |
| Dart | dart analyze | (covered by lint) |

---

## Options

### `--fix` Mode

When the user specifies `--fix` or requests automatic fixing:

1. Run formatting tools in fix mode (e.g., `prettier --write`, `black .`, `gofmt -w`)
2. Run lint tools with auto-fix where supported (e.g., `eslint --fix`, `ruff check --fix`)
3. Report what was fixed and what requires manual attention
4. Type errors always require manual fixing — report them clearly

### `--strict` Mode

When the user specifies `--strict` or requests strict checking:

1. Treat all warnings as errors — any warning fails the check
2. Enable stricter lint rules if available (e.g., `eslint --max-warnings 0`)
3. Report warning count alongside error count
4. Useful before commits or PRs where clean output is required

---

## Configuration Protection

Quality gate configuration files are protected from accidental modification. See `protected-configs.md` for the full list.

**Rule:** Before modifying any quality tool configuration file, check if it's protected. If protected, explain why the change is needed and get explicit approval.

**Why?** Configuration drift is a silent quality killer. One "quick fix" to silence a lint rule today becomes a team-wide quality regression tomorrow.

---

## Check Report Format

After running checks, produce a concise report:

```
QUALITY GATE REPORT
===================
Format:    [PASS/FAIL] (tool: prettier)
Lint:      [PASS/FAIL] (X errors, Y warnings) (tool: eslint)
Types:     [PASS/FAIL] (X errors) (tool: tsc)

Overall:   [CLEAN/ISSUES FOUND]
```

- **CLEAN** — All checks passed. No formatting issues, no lint errors, no type errors.
- **ISSUES FOUND** — One or more checks failed. Report identifies which check and the issue count.
- **SKIP** — Tool not installed. Reported but does not block.

---

## Red Flags

These thoughts mean you're about to skip quality checks — stop and run them:

| Thought | Reality |
|---------|---------|
| "It's just a formatting change" | Formatting tools catch more than whitespace. Run the check. |
| "The linter is too noisy" | Fix the noise or adjust the config properly — don't skip the linter. |
| "Type errors are just warnings" | Type errors are bugs waiting to happen. Fix them now. |
| "I'll fix lint issues in a separate PR" | Separate PRs for lint fixes rarely happen. Fix them with the code that caused them. |
| "The formatter changed too many files" | That means formatting was already drifting. Let the formatter do its job. |
| "I need to disable this lint rule for my code" | Maybe. But check `protected-configs.md` first and get approval. |
| "Quality checks slow me down" | Quality checks save you from debugging production issues. They speed you up overall. |
| "I already checked manually" | Manual checks miss things. Run the automated tools. |

---

## Iron Laws

Non-negotiable rules for the quality gate:

1. **Auto-detect, don't assume.** Always check marker files to determine the correct tools. Don't assume the project uses prettier just because it's JavaScript.
2. **Run all applicable checks.** Format, lint, and type check are independent concerns. Run all three, not just the one you think matters.
3. **Configuration files are protected.** Never modify `.eslintrc`, `tsconfig.json`, `.prettierrc`, or similar files without explicit approval. See `protected-configs.md`.
4. **`--fix` doesn't mean `--ignore`.** Auto-fix handles formatting and simple lint issues. It doesn't fix type errors or complex lint violations. Report what remains.
5. **Missing tools are reported, not hidden.** If a tool isn't installed, report it as SKIP. Don't silently omit the check.
6. **Warnings matter in `--strict` mode.** When strict is requested, warnings are errors. No "it's just a warning" exceptions.

---

## Behavioral Shaping

### After Code Editing

1. Detect the language(s) of changed files
2. Detect the project toolchain (marker files)
3. Map to the correct format/lint/type commands
4. Run checks in order: Format → Lint → Type Check
5. Generate the quality gate report
6. If issues found, provide prioritized fix suggestions

### With `--fix` Option

1. Run formatting in fix mode first (auto-fix whitespace, imports, etc.)
2. Run lint with auto-fix (auto-fix simple violations)
3. Run type check (report only — no auto-fix for types)
4. Report: what was auto-fixed, what remains, what needs manual attention

### With `--strict` Option

1. Run all checks with strict flags enabled
2. Count warnings as errors in the report
3. Overall status is CLEAN only if zero errors AND zero warnings
4. Useful as a pre-commit or pre-PR gate

### Integrating with verification-before-completion

When `verification-before-completion` requires evidence of code quality:
1. Run the quality gate as the first evidence-gathering step
2. Include the quality gate report as verification evidence
3. If quality gate reports ISSUES FOUND, the completion claim is blocked until issues are resolved
