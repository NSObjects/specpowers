---
name: verification-loop
description: "当用户要求 readiness verification，或 active implementation workflow 到达 milestone/final verification checkpoint 时使用；不要只因为 code changed 就自动启动。"
---

# Verification Loop（验证循环）

## Purpose（目的）

在把 code 视为 ready to commit、merge 或 hand off 之前，运行可重复、基于 evidence 的 quality gate。此 loop 验证 project 能 build、type guarantees 成立、lint rules 通过、tests 通过、known security issues 已检查，并且 actual diff 匹配 intended change。

**核心原则：** 先验证 foundation。如果 build fails，立即停止并先修 build，再运行后续 checks。

此 skill 定义 *complete verification pass* 的含义：ordered stages、fail-stop behavior、explicit command selection 和 machine-readable final report。

---

## When to Use（使用时机）

以下任一条件成立时使用：

- Feature、bug fix、refactor、migration 或 major code change 已完成。
- Task group 或 milestone 即将标记 complete。
- 即将 commit、open pull request，或把 code 交给 reviewer。
- 修改了 build configuration、dependencies、generated code、CI configuration、schemas 或 tests。
- 需要在依赖 CI 前得到 defensible local verification result。

不要使用 stale results。Verification pass 只对 current working tree 有效。

A single feature-group change still requires a final `verification-loop` pass before completion is claimed.

---

## Pipeline（流水线）

严格按此顺序运行 stages：

```text
Build → Type Check → Lint → Test → Security Scan → Diff Review
```

每个 stage 都是 gate。任何 gate 失败都会停止 pipeline。后续 stages 标记为 `NOT_RUN`。

| Stage | Goal | Blocks readiness? |
|---|---|---|
| 1. Build | 确认 project compiles 或 bundles | Yes |
| 2. Type Check | 在适用时独立确认 static type guarantees | Yes |
| 3. Lint | 确认 configured code-quality rules pass | Yes |
| 4. Test | 确认 automated tests pass | Yes |
| 5. Security Scan | 检查 dependencies 和 code 的 known vulnerabilities | Yes, according to severity policy |
| 6. Diff Review | 确认 final change set intentional 且 clean | Yes |

---

## Command Selection Rules（命令选择规则）

优先使用 repository 已定义的 commands。当 project script、Make target、task runner 或 CI command 已存在时，不要发明 custom command。

Selection priority：

1. Project documentation 或 CI configuration，例如 `README`、`Makefile`、`.github/workflows/*`、`Taskfile.yml`、`justfile` 或类似文件。
2. Package-manager scripts，例如 `npm run build`、`pnpm test`、`cargo test` 或 Gradle/Maven tasks。
3. 此 skill 中列出的 standard language commands。
4. 如果没有合适 command 或 tool，将 stage 标为 `SKIP` 并说明 reason。

显式配置的 tool 缺失属于 failure。例如 `npm run lint` 存在但因 `eslint` 不可用而失败，lint stage 是 `FAIL`，不是 `SKIP`。

除非 project layout 明确要求 package/module directory，否则从 repository root 运行 commands。Monorepos 中，验证每个 affected workspace/package，或使用 repository aggregate verification command。

使用 non-interactive commands。避免 watch mode、prompts，或会 mutate source files 的 commands，除非用户明确要求 fixes。

---

## Toolchain Detection（工具链检测）

根据 marker files 检测 project type。Monorepos 中可能有多个 markers；逐个处理 affected component。

| Marker | Ecosystem | Common commands |
|---|---|---|
| `package.json` | JavaScript / TypeScript | package scripts、`tsc`、ESLint/Biome、Jest/Vitest、package audit |
| `pyproject.toml`, `requirements.txt`, `setup.py` | Python | mypy/pyright、ruff/flake8、pytest、pip-audit/safety |
| `go.mod` | Go | `go build ./...`、`go vet ./...`、`go test ./...`、`govulncheck ./...` |
| `Cargo.toml` | Rust | `cargo build`、`cargo clippy`、`cargo test`、`cargo audit` |
| `pom.xml` | Java / Maven | `mvn test`、`mvn verify`、Checkstyle/SpotBugs if configured |
| `build.gradle`, `build.gradle.kts` | Java/Kotlin / Gradle | `./gradlew build`、`./gradlew test`、ktlint/detekt if configured |
| `Makefile`, `Taskfile.yml`, `justfile` | Any | 优先 named verification targets，例如 `make test`、`task verify`、`just check` |

### Node.js package manager detection（Node.js 包管理器检测）

用 lockfile 选择 package manager：

| Lockfile | Package manager |
|---|---|
| `bun.lock`, `bun.lockb` | Bun |
| `pnpm-lock.yaml` | pnpm |
| `yarn.lock` | Yarn |
| `package-lock.json` | npm |

如果没有 lockfile，使用 scripts 或 project docs 中已使用的 package manager。否则 default to `npm`。

---

## Stage Definitions（阶段定义）

### Stage 1: Build（构建）

确认 project 能成功 compile、bundle 或 package。

Preferred examples：

- Node.js / TypeScript：project build script，例如 `npm run build`、`pnpm build`、`yarn build` 或 `bun run build`。
- Go：`go build ./...`。
- Rust：`cargo build`。
- Python：configured project build command；否则在适用时用 `python -m compileall .` 做 compile check。
- Java / Kotlin：`mvn verify`、`mvn test`、`./gradlew build` 或 configured CI build command。

Pass criteria：exit code `0`，且没有 build/compile errors。

Fail criteria：任何 compile、bundling、packaging、code-generation 或 dependency-resolution error。

---

### Stage 2: Type Check（类型检查）

在 ecosystem 支持时，将 static type check 与 build 分开运行。

Preferred examples：

- TypeScript：`tsc --noEmit` 或 configured type-check script。
- Python：`pyright`、`mypy` 或 configured type-check command。
- Go：`go build ./...` 成功后，将其标为 `PASS` 且 `covered_by=build`。
- Rust：`cargo build` 成功后，将其标为 `PASS` 且 `covered_by=build`。
- Java / Kotlin：如果 build compiler 已检查 types，将其标为 `PASS` 且 `covered_by=build`。

Pass criteria：zero type errors。

Fail criteria：任何 type error。

Skip criteria：project 没有 type system，或没有 configured/static type checker。包含 reason。

---

### Stage 3: Lint（Lint 检查）

运行 repository configured lint/static-analysis command。

Preferred examples：

- JavaScript / TypeScript：`eslint .`、`biome check` 或 configured lint script。
- Python：`ruff check .`、`flake8` 或 configured lint script。
- Go：configured 或 installed 时用 `golangci-lint run ./...`；否则用 `go vet ./...`。
- Rust：project 使用 warning-as-error 时用 `cargo clippy -- -D warnings`；否则用 `cargo clippy`。
- Java / Kotlin：Checkstyle、SpotBugs、ktlint、detekt 或 configured Gradle/Maven task。

Pass criteria：没有 blocking lint errors。

Fail criteria：任何 lint error，或 project/CI 将 warnings 视为 errors 时的任何 warning。

Non-blocking warnings 单独报告。

---

### Stage 4: Test（测试）

运行所有 affected code 的 automated test suite。

Preferred examples：

- Node.js：`npm test`、`pnpm test`、`yarn test`、`bun test`、`vitest --run`，或 configured 时 `jest --runInBand`。
- Python：`pytest`。
- Go：`go test ./...`。
- Rust：`cargo test`。
- Java / Kotlin：`mvn test`、`mvn verify`、`./gradlew test` 或 configured test task。

使用 non-watch mode。只有 repository normal verification flow 包含，或用户 task 明确要求时，才包含 integration/end-to-end tests。

Pass criteria：all required tests pass。

Fail criteria：任何 test failure、crash、timeout 或 required fixture/setup failure。

Tool 输出 counts 和 coverage 时，在报告中包含。

---

### Stage 5: Security Scan（安全扫描）

运行 ecosystem 适用的 dependency 和 vulnerability checks。

Preferred examples：

- Node.js：`npm audit`、`pnpm audit`、`yarn npm audit`、`bun audit` 或 project audit script。
- Python：`pip-audit`、`safety check` 或 project audit script。
- Go：`govulncheck ./...`。
- Rust：`cargo audit`。
- Java / Kotlin：OWASP Dependency-Check、Gradle/Maven dependency audit plugins 或 project audit task。

Severity policy：

- `critical` 或 `high`：`FAIL`，除非有 documented project-approved exception。
- `medium` 或 `low`：报告；只有 project policy 阻塞时才 block。
- Unknown severity：保守报告并解释 uncertainty。

如果没有 configured 或 installed security scanner，将 stage 标为 `SKIP` 并说明 reason，同时推荐 ecosystem-standard scanner。

---

### Stage 6: Diff Review（Diff 审查）

审查实际变更。若 diff 包含 unintended、risky 或 policy-violating changes，此 stage 可以 fail。

运行或检查：

```bash
git status --short
git diff --stat
git diff --check
git diff --name-only
```

Review 内容：

- Unintended files、generated artifacts、local config、build outputs 或 dependency lockfile changes。
- Debug statements、temporary code、stray TODO/FIXME comments 或 noisy logging。
- Secrets、credentials、tokens、private keys 或不应提交的 internal URLs。
- 与 task scope 不匹配的 broad changes。
- Formatting-only churn 与 logic changes 混杂，导致 review 被遮蔽。
- Behavior-changing work 缺少 tests 或 documentation。

Pass criteria：changed files 和 content 匹配 intended task，且 `git diff --check` 无 whitespace/errors。

Fail criteria：unexpected files、suspicious secrets、unresolved debug code、明显 scope drift 或 diff hygiene errors。

---

## Fail-Stop Behavior（失败即停行为）

Pipeline 严格 sequential。

```text
If a stage fails:
  1. Record the exact command, exit code, and concise failure details.
  2. Mark all later stages as NOT_RUN.
  3. Set overall status to NOT_READY.
  4. Report the first blocking stage and the recommended next action.
  5. Stop the verification pass.
```

不要为了收集更多 failures 继续运行。当前置 guarantees 不成立时，later-stage output 常常 misleading。

如果用户只要求 verification，不修改 code。如果用户要求 development plus verification，先报告 failed pass，再修 issue，然后从 Stage 1 重启 fresh verification loop。

---

## Status Semantics（状态语义）

Stage statuses：

| Status | Meaning |
|---|---|
| `PASS` | Stage 成功运行，或由 earlier equivalent command 覆盖 |
| `FAIL` | Stage 已运行并发现 blocking issue |
| `SKIP` | 无 applicable/configured tool；reason 已记录 |
| `NOT_RUN` | 早期 stage 失败，因此未执行 |

Overall statuses：

| Overall status | Meaning |
|---|---|
| `READY` | 所有 applicable gates 通过，且 Diff Review 通过 |
| `READY_WITH_SKIPS` | 没有 gate failed，但一个或多个 stages 因无 applicable tool 被 skipped |
| `NOT_READY` | 至少一个 gate failed |

`READY_WITH_SKIPS` 不等于 fully verified result。必须明确 call out skipped coverage。

---

## Verification Report Format（验证报告格式）

每次 pass 后，生成以下格式报告：

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

Details 保持简洁。包含足够 evidence，让另一位 developer 能 reproduce：command、exit code、counts 和最相关 error summary。

有用时，在 human report 后附 machine-readable block：

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

## Handling Common Edge Cases（处理常见边界情况）

### No build command exists（不存在 build command）

如果 project 没有 meaningful build step，将 Build 标为 `SKIP` 并说明原因。不要 fabricate build command。

### Tests require unavailable services（测试需要不可用服务）

如果 tests 因 required services、credentials、fixtures 或 containers 不可用而失败，将 Tests 标为 `FAIL`，不是 `SKIP`，除非 project 明确记录这些 tests optional。

### Flaky tests（不稳定测试）

Flaky failure 仍是 failure。报告为 `FAIL`。如果适合 rerun，说明 first pass failed，并单独包含 rerun result；不要抹掉 initial failure。

### Monorepos（单仓多包）

验证所有 affected workspaces/modules。优先 aggregate commands，例如 `pnpm -r test`、`turbo run test`、`nx affected`、`go test ./...`，或 repository documented verification target。

### Generated files（生成文件）

Generated changes 只有在它们符合 task 预期并由 documented generator 产出时可接受。否则 Diff Review fails。

### Tool missing（工具缺失）

如果 standard optional tool 缺失，且没有 project command 需要它，标为 `SKIP`。如果 project command 需要它并失败，标为 `FAIL`。

---

## Red Flags（风险信号）

这些想法表示 verification 正在被削弱：

| Thought | Correct response |
|---|---|
| "It's a small change." | Small changes 仍需要 pipeline。 |
| "Tests passed earlier." | 为 current tree 重新运行。 |
| "I'll verify after the next task." | 现在 verify，方便 isolate failures。 |
| "The build is slow." | Slow build 仍比 broken release 便宜。 |
| "Lint warnings are harmless." | 报告它们；project policy 阻塞时就 block。 |
| "Security scan is optional." | 可用就运行；否则记录 skip。 |
| "I reviewed the diff mentally." | 使用 `git status` 和 `git diff`；memory drifts。 |
| "One test is probably flaky." | Flaky 表示 unreliable；调查或记录。 |
| "CI will catch it." | Local verification 能减少阻塞团队的 CI failures。 |

---

## Non-Negotiable Rules（不可协商规则）

1. **Build first.** 不能 build 的 code 不运行后续 gates。
2. **One ordered pipeline.** 按定义顺序运行 stages。
3. **No silent omissions.** 每个 stage 必须是 `PASS`、`FAIL`、`SKIP` 或 `NOT_RUN`。
4. **Fresh results only.** Previous 或 cached results 不能证明 current tree ready。
5. **Configured commands win.** Repository-defined verification commands 优先于 generic guesses。
6. **Failures block readiness.** Failed gate 意味着 `NOT_READY`。
7. **Diff Review is mandatory.** Automated checks 不能确认 intent。
8. **Exact evidence matters.** 报告 commands、exit codes 和 concise failure summaries。
9. **No destructive side effects.** Pure verification pass 中不要 delete files、reset branches、install dependencies 或 rewrite code，除非明确被要求。
10. **Restart after fixes.** 任何 fix 后都从 Stage 1 重跑；partial reruns 不是 valid full verification pass。
