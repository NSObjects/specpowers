---
name: confidence-loop
description: Use when an implementation, review, or completion gate needs evidence-bound confidence before claiming done, approved, fixed, passing, or ready.
---

# Evidence-Bound Confidence Loop

Use this support skill when an agent is about to claim `DONE`, `APPROVED`, complete, fixed, passing, PR-ready, or otherwise safe to proceed.

## Core Definition

`100% confidence` is an evidence-bound gate, not omniscience. It means every concrete doubt raised by the reviewed scope has been investigated, fixed, or reported with the missing evidence needed to decide.

The reviewed scope may be a task, diff, file set, Spec scenario set, review package, bug fix, or completion claim. The loop must stay inside that scope unless the investigation exposes a real cross-boundary risk.

## Loop Steps

Repeat these steps until the stopping condition is met:

1. **Define the reviewed scope** — name the task, diff, files, scenarios, claim, or review package being evaluated.
2. **List concrete doubts** — enumerate plausible defects, regressions, missing tests, edge cases, failure paths, user-feedback concerns, review-feedback concerns, and evidence gaps raised by the scope.
3. **Investigate each doubt** — inspect code, tests, specs, logs, command output, surrounding behavior, and relevant prior decisions.
4. **Fix, report, or convert** — fix confirmed in-scope problems, report out-of-scope problems, or convert missing evidence into **Unresolved Confidence Gaps** with the exact evidence needed.
5. **Rerun relevant verification** — rerun the smallest checks that prove the fix or close the doubt, then read the output.
6. **Ask the confidence gate again** — ask whether the evidence now supports 100% confidence within the reviewed scope.

## Stopping Condition

Stop only when one full pass produces no new concrete blocking doubt, no Critical or Important issue remains, and **Unresolved Confidence Gaps** is `None`.

If a new doubt appears during a pass, investigate it before approval or completion. If missing evidence prevents reliable judgment, report the gap and do not claim success.

## Output Shape

Use this structure when reporting the loop:

```markdown
**Confidence Loop**
- Scope: [task, diff, claim, or review package]
- Concrete doubts checked: [summary]
- Fixed issues: [none | summary]
- Unresolved Confidence Gaps: [None | exact missing evidence]
- Result: [PASS | BLOCKED]
```

## Misuse Prevention

- Do not convert speculative concerns into findings. A finding needs evidence from the scope.
- Do not hide missing evidence behind optimistic language.
- Do not expand the scope into unrelated redesign or broad cleanup.
- Do not use passing tests alone as proof that requirements, edge cases, or review concerns were checked.
- Do not claim approval while Critical issues, Important issues, or approval-blocking evidence gaps remain.

## Integration Points

- Implementers run this before returning `DONE`.
- Controllers run or verify it before task completion and before updating `tasks.md`.
- Reviewers use it before returning `APPROVED`.
- `verification-before-completion` uses it before any completion, fixed, passing, approved, commit-ready, or PR-ready claim.
