---
name: verification-loop
description: Use when a feature, task, or major code change is complete and needs systematic multi-stage verification before committing or opening a PR — runs Build → Type Check → Lint → Test → Security Scan → Diff Review as a fail-stop pipeline
---

# Verification Loop

## Overview

A 6-stage quality verification pipeline that runs after completing a feature or significant code change. Each stage acts as a gate — failure at any stage halts the pipeline immediately. No stage is skipped, no failure is ignored.

**Core principle:** Build failure stops everything. Fix the foundation before checking the walls.

This skill complements `verification-before-completion` (which ensures you run verification at all) by defining *what* verification means: a structured, ordered, fail-stop pipeline with a machine-readable report.

---

## The Pipeline

```
Build → Type Check → Lint → Test → Security Scan → Diff Review
  ↓         ↓         ↓       ↓         ↓              ↓
 FAIL?     FAIL?     FAIL?   FAIL?     FAIL?         REPORT
  ↓         ↓         ↓       ↓         ↓              ↓
 STOP      STOP      STOP    STOP      STOP          READY?
```

### Stage 1: Build

Compile or bundle the project. If the code doesn't build, nothing else matters.

- **Node.js/TypeScript:** `npm run build` / `pnpm build` / `yarn build`
- **Go:** `go build ./...`
- **Rust:** `cargo build`
- **Python:** `python -m py_compile` or build step if defined
- **Pass:** Exit code 0, no compilation errors
- **Fail:** Any compilation error → STOP

### Stage 2: Type Check

Run the static type checker independently of the build step.

- **TypeScript:** `tsc --noEmit`
- **Python:** `pyright` / `mypy`
- **Go:** (covered by build — skip with note)
- **Rust:** (covered by build — skip with note)
- **Pass:** Zero type errors
- **Fail:** Any type error → STOP, report error count

### Stage 3: Lint

Run the project's configured linter.

- **TypeScript/JavaScript:** `eslint .` / `biome check`
- **Python:** `ruff check .` / `flake8`
- **Go:** `golangci-lint run`
- **Rust:** `cargo clippy`
- **Pass:** Zero errors (warnings are reported but don't block)
- **Fail:** Any lint error → STOP, report error and warning counts

### Stage 4: Test

Run the full test suite.

- **Node.js:** `npm test` / `vitest --run` / `jest`
- **Python:** `pytest`
- **Go:** `go test ./...`
- **Rust:** `cargo test`
- **Pass:** All tests pass
- **Fail:** Any test failure → STOP, report passed/failed/total counts and coverage if available

### Stage 5: Security Scan

Run security-focused checks on dependencies and code.

- **Node.js:** `npm audit` / `pnpm audit`
- **Python:** `pip-audit` / `safety check`
- **Go:** `govulncheck ./...`
- **Rust:** `cargo audit`
- **Pass:** No known vulnerabilities (or only low-severity with documented acceptance)
- **Fail:** High/critical vulnerabilities → STOP, report issue count and severity

### Stage 6: Diff Review

Review the actual changes being committed. This is the human-judgment stage.

- Run `git diff --stat` to see scope of changes
- Verify no unintended files are modified
- Check for debug code, TODO comments, console.log statements left behind
- Confirm changes align with the task/spec being implemented
- **Output:** File count and summary — no pass/fail, but informs the overall judgment

---

## Fail-Stop Behavior

**The pipeline is strictly sequential.** Each stage depends on the previous stage passing.

```
IF Stage N fails:
  1. Record failure details (error count, messages)
  2. Mark all subsequent stages as "NOT RUN"
  3. Set overall status to "NOT READY"
  4. Report which stage failed and why
  5. STOP — do not proceed
```

**Why fail-stop?** Running lint on code that doesn't compile wastes time and produces misleading errors. Running tests on code with type errors produces failures that mask the real problem. Each stage assumes the previous stage's guarantees.

---

## Verification Report Format

After running the pipeline, produce this structured report:

```
VERIFICATION REPORT
==================
Build:     [PASS/FAIL]
Types:     [PASS/FAIL] (X errors)
Lint:      [PASS/FAIL] (X warnings)
Tests:     [PASS/FAIL] (X/Y passed, Z% coverage)
Security:  [PASS/FAIL] (X issues)
Diff:      [X files changed]

Overall:   [READY/NOT READY]
```

**Overall determination:**
- **READY** — All 5 gate stages passed (Build, Types, Lint, Tests, Security). Diff reviewed.
- **NOT READY** — Any gate stage failed. Report identifies the blocking stage.

**Skipped stages** (tool not installed) are reported as:

```
Types:     SKIP (pyright not installed)
```

A skipped stage does NOT block the pipeline but is flagged in the report for awareness.

---

## Toolchain Auto-Detection

The pipeline auto-detects the project's language and toolchain by checking for marker files:

| Marker File | Language | Package Manager | Toolchain |
|-------------|----------|-----------------|-----------|
| `package.json` | JavaScript/TypeScript | npm/pnpm/yarn/bun | tsc, eslint, vitest/jest |
| `pyproject.toml` | Python | pip/poetry/uv | pyright/mypy, ruff/flake8, pytest |
| `go.mod` | Go | go | go build, golangci-lint, go test |
| `Cargo.toml` | Rust | cargo | cargo build, cargo clippy, cargo test |
| `pom.xml` | Java | maven | javac, checkstyle, junit |
| `build.gradle` | Java/Kotlin | gradle | javac/kotlinc, ktlint, junit |

**Package manager detection (Node.js):**
- `bun.lockb` → bun
- `pnpm-lock.yaml` → pnpm
- `yarn.lock` → yarn
- `package-lock.json` → npm

If a tool is not installed, the corresponding stage is skipped with a note — never fail because a tool is absent.

---

## When to Run

- **After completing the last subtask in a feature group** in `spec-driven-development` — run before treating that feature group as complete
- **After a major refactoring** — verify nothing broke
- **Before committing** — the final gate before `git commit`
- **Before opening a PR** — the last check before requesting review
- **After all feature groups are complete** — run a final `verification-loop` pass before the final completion report

---

## Red Flags

These thoughts mean you're about to skip verification — stop and reconsider:

| Thought | Reality |
|---------|---------|
| "It's a small change, no need to verify" | Small changes cause big regressions. Run the pipeline. |
| "Tests passed earlier, they'll still pass" | Code changed since then. Run them again. |
| "I'll verify after I finish the next task too" | Compound changes make failures harder to diagnose. Verify now. |
| "The build is slow, I'll skip it this time" | A slow build is still faster than debugging a broken deploy. |
| "Lint warnings aren't real errors" | Warnings become errors. Fix them while context is fresh. |
| "Security scan takes too long" | Shipping a vulnerability takes longer to fix. Run it. |
| "I already reviewed the diff mentally" | Run `git diff --stat`. Your mental model drifts. |
| "The type checker is too strict" | The type checker is exactly as strict as your types declare. Fix the types. |
| "I'll just push and fix CI failures" | CI failures block the team. Verify locally first. |
| "Only one test failed, probably flaky" | Flaky tests are broken tests. Investigate before dismissing. |

---

## Iron Laws

Non-negotiable rules for the verification loop:

1. **Build failure stops everything.** No type checking, no linting, no testing on code that doesn't compile. Fix the build first.
2. **No skipping stages.** Every stage runs in order. If a tool isn't installed, it's reported as SKIP — but you don't silently omit it.
3. **Failures are not warnings.** A failed stage means NOT READY. No "it's probably fine" — fix it or document why it's acceptable.
4. **Fresh runs only.** Cached or previous results don't count. Run the full pipeline from scratch each time.
5. **The report is the truth.** If the report says NOT READY, the code is not ready. No overriding the report with optimism.
6. **Diff review is mandatory.** Even if all automated stages pass, review what actually changed. Automation catches categories of bugs; humans catch intent mismatches.

---

## Behavioral Shaping

### Starting a Verification Run

1. Detect the project's language and toolchain (check marker files)
2. Identify the correct commands for each stage
3. Run stages in strict order: Build → Types → Lint → Tests → Security → Diff
4. Stop at the first failure
5. Generate the verification report

### When a Stage Fails

1. Report the failure clearly: which stage, what error, how many issues
2. Do NOT attempt to fix and re-run in the same pass — report and stop
3. The developer fixes the issue, then re-runs the full pipeline from Stage 1
4. Partial re-runs (starting from the failed stage) are not valid — always start from Build

### When a Tool Is Missing

1. Report the stage as SKIP with the missing tool name
2. Continue to the next stage — missing tools don't block
3. Include the SKIP in the final report so the developer is aware
4. Suggest installing the tool if it's standard for the detected language

### Integrating with spec-driven-development

After completing work in the spec-driven-development workflow:
1. Run the verification loop when the current Task is the last subtask in a feature group
2. If NOT READY, fix issues before treating that feature group as complete
3. Do not start the next feature group until the current feature group has a ready `verification-loop` result
4. After all feature groups are complete, run a final `verification-loop` pass before the final completion report
5. A single feature-group change still requires a final `verification-loop` pass before completion
