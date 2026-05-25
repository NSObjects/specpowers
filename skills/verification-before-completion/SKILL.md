---
name: verification-before-completion
description: Code implementation、ordinary code edits、code modifications 或 bug fix implementations 后，在任何 final answer 或 status claim 前使用；也在 completion、fixed、passing、commit 或 PR-ready claim 前使用。
---

# Verification Before Completion（完成前验证）

## Overview（概览）

没有 verification 就声称工作完成，是不诚实，不是高效。

Code implementation 后，在任何 final answer 或 status claim 前使用。范围包括 ordinary code edits、code modifications 和 bug fix implementations。

**核心原则：** 先有 evidence，再有 claims，始终如此。

**违反此规则的字面要求，就是违反此规则的精神。**

## The Iron Law（铁律）

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

如果本轮没有运行 verification command，就不能声称它 passes。

## The Gate Function（门槛函数）

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

## Evidence-Bound Confidence Loop（证据绑定信心循环）

声称 complete、fixed、passing、ready for review、PR-ready、approved 或 safe to proceed 前，针对 exact claim scope 运行或应用 `specpowers:confidence-loop`。

Loop 必须识别由 change、diff、tests、specification、touched code paths、user feedback、review feedback 和 known risks 引出的 concrete doubts。每个 doubt 都必须被 investigated、fixed、reported，或转成带 exact missing evidence 的 **Unresolved Confidence Gaps**。

如果 **Unresolved Confidence Gaps** 不是 `None`，agent 不得 claim complete、fixed、passing、PR-ready 或 approved。同一阻塞也适用于 ready for review 和 safe to proceed。改为说明 actual status 和 missing evidence。

## Automated Evidence: Quality Gate（自动化证据：质量门）

`quality-gate` skill 为 code quality claims 提供 automated evidence gathering。声称 code clean、formatted 或 type-safe 前，运行 quality gate 产出 concrete report。

```
EVIDENCE-FIRST WORKFLOW:
1. Run quality-gate (format → lint → type check)
2. Read the quality gate report
3. If CLEAN: use the report as evidence for your claim
4. If ISSUES FOUND: fix issues, re-run, then claim with fresh evidence
```

完整 auto-detection flow 和 check types 见 `skills/quality-gate/SKILL.md`。

## Common Failures（常见失败）

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | Test command output: 0 failures | Previous run, "should pass" |
| Linter clean | Linter output: 0 errors | Partial check, extrapolation |
| Build succeeds | Build command: exit 0 | Linter passing, logs look good |
| Bug fixed | Test original symptom: passes | Code changed, assumed fixed |
| Regression test works | Red-green cycle verified | Test passes once |
| Agent completed | VCS diff shows changes | Agent reports "success" |
| Requirements met | Line-by-line checklist | Tests passing |

## Red Flags - STOP（风险信号：停止）

- 使用 “should”、“probably”、“seems to”。
- Verification 前表达满意，例如 “Great!”、“Perfect!”、“Done!” 等。
- 未 verification 就准备 commit/push/PR。
- 信任 agent success reports。
- 依赖 partial verification。
- 想着 “just this once”。
- 疲惫并想结束工作。
- **任何暗示 success 且没有运行 verification 的措辞。**

## Rationalization Prevention（防合理化）

| Excuse | Reality |
|--------|---------|
| "Should work now" | 运行 verification。 |
| "I'm confident" | Confidence 不等于 evidence。 |
| "Just this once" | 没有例外。 |
| "Linter passed" | Linter 不等于 compiler。 |
| "Agent said success" | 独立 verify。 |
| "I'm tired" | 疲惫不是借口。 |
| "Partial check is enough" | Partial 什么也证明不了。 |
| "Different words so rule doesn't apply" | Spirit over letter。 |

## Key Patterns（关键模式）

**Tests:**

```text
✅ [Run test command] [See: 34/34 pass] "All tests pass"
❌ "Should pass now" / "Looks correct"
```

**Regression tests (TDD Red-Green):**

```text
✅ Write → Run (pass) → Revert fix → Run (MUST FAIL) → Restore → Run (pass)
❌ "I've written a regression test" (without red-green verification)
```

**Build:**

```text
✅ [Run build] [See: exit 0] "Build passes"
❌ "Linter passed" (linter doesn't check compilation)
```

**Requirements:**

```text
✅ Re-read plan → Create checklist → Verify each → Report gaps or completion
❌ "Tests pass, phase complete"
```

**Agent delegation:**

```text
✅ Agent reports success → Check VCS diff → Verify changes → Report actual state
❌ Trust agent report
```

## Why This Matters（为什么重要）

没有 verification：

- Trust is broken，也就是没有 evidence 却 claim success。
- Undefined functions 可能 ship，并在 production crash。
- Missing requirements 可能 ship，造成 incomplete features。
- False completion 会浪费时间，引发 redirect 和 rework。
- 违反诚实原则：没有证据，不要声称成功。

## When To Apply（何时应用）

**以下情况前始终应用：**

- 任何 success/completion claims 的变体。
- 任何 expression of satisfaction。
- 任何关于 work state 的 positive statement。
- Committing、PR creation、task completion。
- Moving to next task。
- Delegating to agents。

**规则覆盖：**

- Exact phrases。
- Paraphrases and synonyms。
- Success implications。
- 任何暗示 completion/correctness 的 communication。

## The Bottom Line（底线）

**Verification 没有捷径。**

运行 command。阅读 output。然后再 claim result。

这是不可协商的。
