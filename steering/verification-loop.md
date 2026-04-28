<!-- generated from skills/ by sync-steering.js -->
---
name: verification-loop
description: "Use after completing a feature, refactor, bug fix, or major code change to verify readiness with a strict fail-stop pipeline: Build → Type Check → Lint → Test → Security Scan → Diff Review. Prefer project-defined commands, stop on the first failing gate, and produce a structured readiness report."
---

# Verification Loop

## Purpose

Run a repeatable, evidence-based quality gate before treating code as ready to commit, merge, or hand off. The loop verifies that the project builds, type guarantees hold, lint rules pass, tests pass, known security issues are checked, and the actual diff matches the intended change.

**Core principle:** verify the foundation first. If the build fails, stop immediately and fix the build before running later checks.

This skill defines *what a complete verification pass means*: ordered stages, fail-stop behavior, explicit command selection, and a machine-readable final report.

---

## When to Use

Use this skill when any of the following is true:

- A feature, bug fix, refactor, migration, or major code change is complete.
- A task group or milestone is about to be marked complete.
- You are about to commit, open a pull request, or deliver code to a reviewer.
- You changed build configuration, dependencies, generated code, CI configuration, schemas, or tests.
- You need a defensible local verification result before relying on CI.

Do **not** use stale results. A verification pass is valid only for the current working tree.

---

## Pipeline

Run stages in this exact order:

```text
Build → Type Check → Lint → Test → Security Scan → Diff Review
```

Each stage is a gate. A failing gate stops the pipeline. Later stages are marked `NOT_RUN`.

| Stage | Goal | Blocks readiness? |
|---|---|---|
| 1. Build | Confirm the project compiles or bundles | Yes |
| 2. Type Check | Confirm static type guarantees independently where applicable | Yes |
| 3. Lint | Confirm configured code-quality rules pass | Yes |
| 4. Test | Confirm automated tests pass | Yes |
| 5. Security Scan | Check dependencies and code for known vulnerabilities | Yes, according to severity policy |
| 6. Diff Review | Confirm the final change set is intentional and clean | Yes |

---

## Command Selection Rules

Prefer commands that the repository already defines. Do not invent a custom command when a project script, Make target, task runner, or CI command exists.

Selection priority:

1. Project documentation or CI configuration, such as `README`, `Makefile`, `.github/workflows/*`, `Taskfile.yml`, `justfile`, or similar.
2. Package-manager scripts, such as `npm run build`, `pnpm test`, `cargo test`, or Gradle/Maven tasks.
3. Standard language commands listed in this skill.
4. If no suitable command or tool exists, mark the stage `SKIP` with the reason.

A missing explicitly configured tool is a failure. For example, if `npm run lint` exists but fails because `eslint` is unavailable, the lint stage is `FAIL`, not `SKIP`.

Run commands from the repository root unless the project layout clearly requires a package/module directory. In monorepos, verify every affected workspace/package or use the repository's aggregate verification command.

Use non-interactive commands. Avoid watch mode, prompts, or commands that mutate source files unless the user explicitly asked for fixes.

---

## Toolchain Detection

Detect the project type from marker files. Multiple markers may exist in monorepos; handle each affected component.

| Marker | Ecosystem | Common commands |
|---|---|---|
| `package.json` | JavaScript / TypeScript | package scripts, `tsc`, ESLint/Biome, Jest/Vitest, package audit |
| `pyproject.toml`, `requirements.txt`, `setup.py` | Python | mypy/pyright, ruff/flake8, pytest, pip-audit/safety |
| `go.mod` | Go | `go build ./...`, `go vet ./...`, `go test ./...`, `govulncheck ./...` |
| `Cargo.toml` | Rust | `cargo build`, `cargo clippy`, `cargo test`, `cargo audit` |
| `pom.xml` | Java / Maven | `mvn test`, `mvn verify`, Checkstyle/SpotBugs if configured |
| `build.gradle`, `build.gradle.kts` | Java/Kotlin / Gradle | `./gradlew build`, `./gradlew test`, ktlint/detekt if configured |
| `Makefile`, `Taskfile.yml`, `justfile` | Any | Prefer named verification targets such as `make test`, `task verify`, `just check` |

### Node.js package manager detection

Use the lockfile to select the package manager:

| Lockfile | Package manager |
|---|---|
| `bun.lock`, `bun.lockb` | Bun |
| `pnpm-lock.yaml` | pnpm |
| `yarn.lock` | Yarn |
| `package-lock.json` | npm |

If no lockfile exists, use the package manager already used in scripts or documented by the project. Otherwise default to `npm`.

---

## Stage Definitions

### Stage 1: Build

Confirm the project compiles, bundles, or packages successfully.

Preferred examples:

- Node.js / TypeScript: project build script, such as `npm run build`, `pnpm build`, `yarn build`, or `bun run build`
- Go: `go build ./...`
- Rust: `cargo build`
- Python: project build command if configured; otherwise compile check such as `python -m compileall .` when appropriate
- Java / Kotlin: `mvn verify`, `mvn test`, `./gradlew build`, or the configured CI build command

Pass criteria: exit code `0` and no build/compile errors.

Fail criteria: any compile, bundling, packaging, code-generation, or dependency-resolution error.

---

### Stage 2: Type Check

Run a static type check separately from build where the ecosystem supports it.

Preferred examples:

- TypeScript: `tsc --noEmit` or the configured type-check script
- Python: `pyright`, `mypy`, or the configured type-check command
- Go: mark `PASS` as `covered_by=build` after `go build ./...` succeeds
- Rust: mark `PASS` as `covered_by=build` after `cargo build` succeeds
- Java / Kotlin: mark `PASS` as `covered_by=build` if the build compiler already checked types

Pass criteria: zero type errors.

Fail criteria: any type error.

Skip criteria: no type system or no configured/static type checker for the project. Include the reason.

---

### Stage 3: Lint

Run the repository's configured lint/static-analysis command.

Preferred examples:

- JavaScript / TypeScript: `eslint .`, `biome check`, or configured lint script
- Python: `ruff check .`, `flake8`, or configured lint script
- Go: `golangci-lint run ./...` if configured or installed; otherwise `go vet ./...`
- Rust: `cargo clippy -- -D warnings` if the project uses warning-as-error; otherwise `cargo clippy`
- Java / Kotlin: Checkstyle, SpotBugs, ktlint, detekt, or configured Gradle/Maven task

Pass criteria: no blocking lint errors.

Fail criteria: any lint error, or any warning when the project/CI treats warnings as errors.

Report non-blocking warnings separately.

---

### Stage 4: Test

Run the automated test suite for all affected code.

Preferred examples:

- Node.js: `npm test`, `pnpm test`, `yarn test`, `bun test`, `vitest --run`, or `jest --runInBand` if configured
- Python: `pytest`
- Go: `go test ./...`
- Rust: `cargo test`
- Java / Kotlin: `mvn test`, `mvn verify`, `./gradlew test`, or configured test task

Use non-watch mode. Include integration or end-to-end tests only when the repository's normal verification flow includes them or the user's task specifically requires them.

Pass criteria: all required tests pass.

Fail criteria: any test failure, crash, timeout, or required fixture/setup failure.

Report test counts and coverage when the tool outputs them.

---

### Stage 5: Security Scan

Run dependency and vulnerability checks appropriate for the ecosystem.

Preferred examples:

- Node.js: `npm audit`, `pnpm audit`, `yarn npm audit`, `bun audit`, or project audit script
- Python: `pip-audit`, `safety check`, or project audit script
- Go: `govulncheck ./...`
- Rust: `cargo audit`
- Java / Kotlin: OWASP Dependency-Check, Gradle/Maven dependency audit plugins, or project audit task

Severity policy:

- `critical` or `high`: `FAIL` unless there is a documented project-approved exception.
- `medium` or `low`: report; block only if project policy blocks them.
- Unknown severity: report conservatively and explain uncertainty.

If no security scanner is configured or installed, mark `SKIP` with the reason and recommend the ecosystem-standard scanner.

---

### Stage 6: Diff Review

Review what actually changed. This stage can fail if the diff contains unintended, risky, or policy-violating changes.

Run or inspect:

```bash
git status --short
git diff --stat
git diff --check
git diff --name-only
```

Review for:

- Unintended files, generated artifacts, local config, build outputs, or dependency lockfile changes
- Debug statements, temporary code, stray TODO/FIXME comments, or noisy logging
- Secrets, credentials, tokens, private keys, or internal URLs that should not be committed
- Broad changes that do not match the task scope
- Formatting-only churn mixed with logic changes when it obscures review
- Missing tests or missing documentation for behavior-changing work

Pass criteria: the changed files and content match the intended task, and `git diff --check` reports no whitespace/errors.

Fail criteria: unexpected files, suspicious secrets, unresolved debug code, obvious scope drift, or diff hygiene errors.

---

## Fail-Stop Behavior

The pipeline is strictly sequential.

```text
If a stage fails:
  1. Record the exact command, exit code, and concise failure details.
  2. Mark all later stages as NOT_RUN.
  3. Set overall status to NOT_READY.
  4. Report the first blocking stage and the recommended next action.
  5. Stop the verification pass.
```

Do not continue just to collect more failures. Later-stage output is often misleading when earlier guarantees do not hold.

If the user asked only for verification, do not modify code. If the user asked for development plus verification, fix the issue only after reporting the failed pass, then restart a fresh verification loop from Stage 1.

---

## Status Semantics

Use these stage statuses:

| Status | Meaning |
|---|---|
| `PASS` | Stage ran successfully or is covered by an earlier equivalent command |
| `FAIL` | Stage ran and found a blocking issue |
| `SKIP` | No applicable/configured tool was available; reason is documented |
| `NOT_RUN` | Stage was not executed because an earlier stage failed |

Use these overall statuses:

| Overall status | Meaning |
|---|---|
| `READY` | All applicable gates passed and Diff Review passed |
| `READY_WITH_SKIPS` | No gate failed, but one or more stages were skipped because no applicable tool was available |
| `NOT_READY` | At least one gate failed |

`READY_WITH_SKIPS` is not the same as a fully verified result. Call out skipped coverage explicitly.

---

## Verification Report Format

After every pass, produce a report in this format:

```text
VERIFICATION REPORT
===================
Repository: <name-or-path>
Scope:      <whole repo | affected packages/modules>
Timestamp:  <local ISO-8601 timestamp>

Build:      <PASS|FAIL|SKIP|NOT_RUN>  command="..."  details="..."
Types:      <PASS|FAIL|SKIP|NOT_RUN>  command="..."  details="..."
Lint:       <PASS|FAIL|SKIP|NOT_RUN>  command="..."  details="..."
Tests:      <PASS|FAIL|SKIP|NOT_RUN>  command="..."  details="..."
Security:   <PASS|FAIL|SKIP|NOT_RUN>  command="..."  details="..."
Diff:       <PASS|FAIL|SKIP|NOT_RUN>  command="..."  details="..."

Overall:    <READY|READY_WITH_SKIPS|NOT_READY>
Blocking:   <none | first failing stage>
Next step:  <specific action>
```

Keep details concise. Include enough evidence for another developer to reproduce the result: command, exit code, counts, and the most relevant error summary.

When useful, include a machine-readable block after the human report:

```json
{
  "overall": "READY",
  "blocking_stage": null,
  "stages": {
    "build": { "status": "PASS", "command": "go build ./...", "exit_code": 0 },
    "types": { "status": "PASS", "command": "go build ./...", "covered_by": "build" },
    "lint": { "status": "PASS", "command": "golangci-lint run ./...", "exit_code": 0 },
    "tests": { "status": "PASS", "command": "go test ./...", "exit_code": 0 },
    "security": { "status": "PASS", "command": "govulncheck ./...", "exit_code": 0 },
    "diff": { "status": "PASS", "files_changed": 3 }
  }
}
```

---

## Handling Common Edge Cases

### No build command exists

If the project has no meaningful build step, mark Build as `SKIP` and explain why. Do not fabricate a build command.

### Tests require unavailable services

If tests fail because required services, credentials, fixtures, or containers are unavailable, mark Tests as `FAIL`, not `SKIP`, unless the project explicitly documents those tests as optional.

### Flaky tests

A flaky failure is still a failure. Report it as `FAIL`. If rerunning is appropriate, state that the first pass failed and include the rerun result separately; do not erase the initial failure.

### Monorepos

Verify all affected workspaces/modules. Prefer aggregate commands such as `pnpm -r test`, `turbo run test`, `nx affected`, `go test ./...`, or the repository's documented verification target.

### Generated files

Generated changes are acceptable only when they are expected for the task and produced by the documented generator. Otherwise Diff Review fails.

### Tool missing

If a standard optional tool is missing and no project command requires it, mark `SKIP`. If the project command requires it and the command fails, mark `FAIL`.

---

## Red Flags

These thoughts indicate verification is being weakened:

| Thought | Correct response |
|---|---|
| "It's a small change." | Small changes still need the pipeline. |
| "Tests passed earlier." | Run them again for the current tree. |
| "I'll verify after the next task." | Verify now to isolate failures. |
| "The build is slow." | A slow build is cheaper than a broken release. |
| "Lint warnings are harmless." | Report them; block if project policy blocks them. |
| "Security scan is optional." | Run it if available; otherwise document the skip. |
| "I reviewed the diff mentally." | Use `git status` and `git diff`; memory drifts. |
| "One test is probably flaky." | Flaky means unreliable; investigate or document. |
| "CI will catch it." | Local verification reduces team-blocking CI failures. |

---

## Non-Negotiable Rules

1. **Build first.** Do not run later gates on code that cannot build.
2. **One ordered pipeline.** Run stages in the defined order.
3. **No silent omissions.** Every stage must be `PASS`, `FAIL`, `SKIP`, or `NOT_RUN`.
4. **Fresh results only.** Previous or cached results do not prove the current tree is ready.
5. **Configured commands win.** Prefer repository-defined verification commands over generic guesses.
6. **Failures block readiness.** A failed gate means `NOT_READY`.
7. **Diff Review is mandatory.** Automated checks cannot confirm intent.
8. **Exact evidence matters.** Report commands, exit codes, and concise failure summaries.
9. **No destructive side effects.** Do not delete files, reset branches, install dependencies, or rewrite code during a pure verification pass unless explicitly instructed.
10. **Restart after fixes.** After any fix, rerun from Stage 1; partial reruns are not a valid full verification pass.
