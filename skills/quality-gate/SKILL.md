---
name: quality-gate
description: 当用户明确要求自动化质量检查，或 active implementation workflow 到达 quality-check checkpoint 时使用；不要把它作为单独 workflow phase 触发。
---

# 质量门禁（Quality Gate）

## 概览

这是代码编辑后的轻量自动化质量检查 pipeline。与 `verification-loop` 不同，后者是面向 milestones 的完整 6-stage pipeline；quality-gate 是快速、聚焦的检查，用来捕捉三类最常见质量问题：formatting、linting 和 type errors。

**核心原则：** 在 edit 阶段捕捉问题，而不是等到 commit。每次小改后的短检查，胜过结尾一次大检查。

此 skill 会与 `verification-before-completion` 集成，作为自动化的 “evidence-first” 实现：它提供支撑 completion claims 的具体 commands 和 checks。

---

## 自动检测流程（Auto-Detection Flow）

```
Detect Language → Detect Toolchain → Map Commands → Run Checks
      ↓                  ↓                 ↓              ↓
  File extensions    Marker files     Format/Lint/Type   Report
  in changed files   in project root  commands per lang  results
```

### Step 1：检测语言

检查 changed files，判断涉及哪些 languages：

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

### Step 2：检测 Toolchain

检查 marker files，判断项目 toolchain 和 package manager：

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

### Step 3：映射 Commands

对每种 detected language，映射到对应 quality commands：

#### 格式化（Formatting）

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

#### Lint 检查（Lint）

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

#### 类型检查（Type Check）

| Language | Tool | Command |
|----------|------|---------|
| TypeScript | tsc | `npx tsc --noEmit` |
| Python | pyright | `pyright` |
| Python | mypy | `mypy .` |
| Dart | dart analyze | (covered by lint) |

---

## 选项（Options）

### `--fix` 模式（Mode）

当用户指定 `--fix` 或要求自动修复时：

1. 以 fix mode 运行 formatting tools（例如 `prettier --write`、`black .`、`gofmt -w`）
2. 对支持 auto-fix 的 lint tools 运行 auto-fix（例如 `eslint --fix`、`ruff check --fix`）
3. 报告已修复内容，以及仍需手工处理的内容
4. Type errors 始终需要手工修复；必须清楚报告

### `--strict` 模式（Mode）

当用户指定 `--strict` 或要求 strict checking 时：

1. 把所有 warnings 当作 errors；任何 warning 都让检查失败
2. 可用时启用更严格 lint rules（例如 `eslint --max-warnings 0`）
3. 报告 warning count 和 error count
4. 适合 commits 或 PRs 前要求 clean output 的场景

---

## 配置保护（Configuration Protection）

Quality gate configuration files 受保护，避免意外修改。完整列表见 `protected-configs.md`。

**规则：** 修改任何 quality tool configuration file 前，先检查它是否受保护。如果受保护，解释为什么需要修改并获得明确批准。

**为什么？** Configuration drift 是沉默的质量杀手。今天为了消除 lint rule 的 “quick fix”，明天会变成团队级质量回归。

---

## 检查报告格式（Check Report Format）

运行 checks 后，生成简洁报告：

```
QUALITY GATE REPORT
===================
Format:    [PASS/FAIL] (tool: prettier)
Lint:      [PASS/FAIL] (X errors, Y warnings) (tool: eslint)
Types:     [PASS/FAIL] (X errors) (tool: tsc)

Overall:   [CLEAN/ISSUES FOUND]
```

- **CLEAN** — 所有 checks 通过。没有 formatting issues、lint errors 或 type errors。
- **ISSUES FOUND** — 一个或多个 checks 失败。Report 标明失败的 check 和 issue count。
- **SKIP** — Tool 未安装。会报告，但不阻塞。

---

## 红旗（Red Flags）

这些想法说明你正要跳过 quality checks；停止并运行它们：

| Thought | Reality |
|---------|---------|
| "It's just a formatting change" | Formatting tools 捕捉的不只是 whitespace。运行检查。 |
| "The linter is too noisy" | 修复噪音或正确调整 config；不要跳过 linter。 |
| "Type errors are just warnings" | Type errors 是等待发生的 bugs。现在修复。 |
| "I'll fix lint issues in a separate PR" | 单独 lint fixes PR 很少真的发生。和造成它们的代码一起修。 |
| "The formatter changed too many files" | 说明 formatting 已经漂移。让 formatter 做它的工作。 |
| "I need to disable this lint rule for my code" | 也许可以。但先检查 `protected-configs.md` 并获得批准。 |
| "Quality checks slow me down" | Quality checks 让你少调 production issues，整体更快。 |
| "I already checked manually" | Manual checks 会漏东西。运行自动化工具。 |

---

## 铁律（Iron Laws）

Quality gate 的不可协商规则：

1. **Auto-detect，不要假设。** 始终检查 marker files 来确定正确 tools。不要因为是 JavaScript 就假设项目使用 prettier。
2. **运行所有适用 checks。** Format、lint 和 type check 是独立 concerns。三个都跑，不要只跑你觉得重要的那个。
3. **Configuration files 受保护。** 没有明确批准，绝不修改 `.eslintrc`、`tsconfig.json`、`.prettierrc` 或类似文件。见 `protected-configs.md`。
4. **`--fix` 不等于 `--ignore`。** Auto-fix 处理 formatting 和简单 lint issues。它不修 type errors 或复杂 lint violations。报告剩余问题。
5. **Missing tools 要报告，不要隐藏。** 如果 tool 未安装，报告为 SKIP。不要静默省略检查。
6. **`--strict` mode 下 warnings 也重要。** 请求 strict 时，warnings 就是 errors。没有“只是 warning”的例外。

---

## 行为塑形（Behavioral Shaping）

### 代码编辑后

1. 检测 changed files 的 language(s)
2. 检测 project toolchain（marker files）
3. 映射到正确的 format/lint/type commands
4. 按顺序运行 checks：Format → Lint → Type Check
5. 生成 quality gate report
6. 如果发现 issues，提供按优先级排序的修复建议

### 使用 `--fix` Option

1. 先以 fix mode 运行 formatting（auto-fix whitespace、imports 等）
2. 运行 lint auto-fix（auto-fix simple violations）
3. 运行 type check（只报告；types 没有 auto-fix）
4. 报告：自动修了什么、剩下什么、什么需要手工处理

### 使用 `--strict` Option

1. 启用 strict flags 运行所有 checks
2. 在 report 中把 warnings 计为 errors
3. 只有 zero errors 且 zero warnings 时，overall status 才是 CLEAN
4. 适合作为 pre-commit 或 pre-PR gate

### 与 verification-before-completion 集成

当 `verification-before-completion` 需要 code quality evidence 时：

1. 把 quality gate 作为第一个 evidence-gathering step 运行
2. 把 quality gate report 作为 verification evidence
3. 如果 quality gate 报告 ISSUES FOUND，completion claim 会被阻塞，直到 issues 解决
