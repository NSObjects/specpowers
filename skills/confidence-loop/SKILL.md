---
name: confidence-loop
description: Use immediately after ordinary code edits, code modifications, or bug fix implementations before the final response, and before artifact handoffs, reviews, or claiming done, complete, fixed, passing, ready for review, or safe to proceed.
---

# Evidence-Bound Confidence Loop

Use this support skill when an agent is about to move between artifact stages, dispatch a subagent review, claim `DONE`, `APPROVED`, complete, fixed, passing, PR-ready, or otherwise safe to proceed.

## Core Definition

`100% confidence` is an evidence-bound gate, not omniscience. It means every concrete doubt raised by the reviewed scope has been investigated, fixed, or reported with the missing evidence needed to decide.

The reviewed scope may be a task, diff, file set, Spec scenario set, review package, bug fix, completion claim, artifact or handoff package. The loop must stay inside that scope unless the investigation exposes a real cross-boundary risk.

## Loop Steps

Repeat these steps until the stopping condition is met:

1. **Define the reviewed scope** — name the task, diff, files, scenarios, claim, artifact, review package, or handoff package being evaluated.
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
- Scope: [task, diff, claim, review package, artifact or handoff package]
- Concrete doubts checked: [summary]
- Fixed issues: [none | summary]
- Unresolved Confidence Gaps: [None | exact missing evidence]
- Result: [PASS | BLOCKED]
```

## Post-Implementation Confidence Loop

For skill discovery, this skill is the post-implementation gate: Use immediately after ordinary code edits, code modifications, or bug fix implementations before the final response, especially before claiming done, complete, fixed, passing, ready for review, or safe to proceed.

When an Agent completes code implementation it owns, it must run or apply this loop before reporting the result to the user. The trigger scope includes `ordinary code edits`, `code modifications`, and `bug fix implementations`, and it runs `before reporting complete, fixed, passing, ready for review, or safe to proceed`.

The reviewed scope after implementation must cover the task, diff, file set, relevant Spec scenarios, tests, and known risks for this implementation. For bug fix implementations, the scope must also include `original failure`, `modified code paths`, `verification evidence`, and `known risks` so the Agent does not claim fixed based only on code changes.

`post-implementation reports` reuse the Output Shape above and must at least describe checked doubts, fixed issues, **Unresolved Confidence Gaps**, and the `PASS | BLOCKED` result. If an unresolved confidence gap remains, the Agent must report the actual status and missing evidence instead of claiming complete, fixed, passing, ready for review, or safe to proceed.

This post-implementation trigger `extends ordinary implementation paths`; it `does not replace spec-driven implementation, review, handoff, or completion gates`. Existing gates keep their own scope, evidence package, review, and blocking rules, including the requirement not to proceed while Critical or Important findings or Unresolved Confidence Gaps remain.

This is an `Agent-owned behavior gate`, not a `file watcher`, `Git hook`, `daemon`, or `runtime enforcement` mechanism. It runs when the Agent is evaluating its own completed implementation scope before reporting or proceeding; `external file changes do not automatically run it`.

## Review Package Adequacy Gate

Apply this gate before dispatching any subagent review. A reviewer must receive enough context to evaluate the requested scope without inventing conversation history or user intent.

The main agent's review package must include:

- scope;
- current artifact or diff;
- confirmed user decisions;
- in-scope and out-of-scope boundaries;
- open questions;
- relevant specs, design, tasks, and tests;
- test evidence, commands, and results when available;
- known risks;
- prior findings or gaps.

Do not infer missing context. If missing evidence prevents a fair review, the reviewer must return `NEEDS_CONTEXT`, `NEEDS_USER_DECISION`, or list the missing evidence under **Unresolved Confidence Gaps**. Missing evidence is a blocking state, not permission to guess, `PASS`, or `APPROVED`.

## Workflow Handoff Confidence Loop

Use this loop for artifact handoff gates, including but not limited to `exploring → proposing`, `proposing → specifying`, `specifying → designing`, `designing → planning`, and `planning → spec-driven-development`.

1. Build a handoff review package with the current artifact or conversation summary, prior confirmed context, intended next stage, known constraints, explicit exclusions, open questions, and success criteria relevant to the handoff.
2. Run the Review Package Adequacy Gate before review dispatch.
3. When subagents are available, request a read-only review using `workflow-handoff-reviewer-prompt.md`. If subagents are unavailable, perform the same check inline and report that fallback.
4. The reviewer returns `PASS`, `NEEDS_CHANGES`, or `NEEDS_USER_DECISION`.
5. For each finding, the main agent sends a **Resolution Package** that marks the finding as `fixed`, `rejected`, `out_of_scope`, or `needs_user_decision`, with evidence.
6. Re-review the updated artifact and Resolution Package; repeat until `PASS` or `NEEDS_USER_DECISION`.

Do not proceed while Critical or Important findings or Unresolved Confidence Gaps remain. `NEEDS_USER_DECISION` stops the handoff until the user answers one focused question.

## Review Confidence Loop

Use this loop for standalone code review, Stage 2 code-quality review, and review feedback re-review.

1. Define the review scope: branch, task, commit range, working tree diff, or review package.
2. Run the Review Package Adequacy Gate before review dispatch.
3. The reviewer returns `APPROVED`, `NEEDS_CHANGES`, or `NEEDS_CONTEXT`.
4. For each finding, the main agent sends a **Resolution Package** that marks the finding as `fixed`, `rejected`, `out_of_scope`, or `needs_user_decision`, with evidence.
5. Re-review the updated diff, review package, and Resolution Package; repeat until `APPROVED` or `NEEDS_CONTEXT` requires user or external evidence.

Reviewers may return `APPROVED` only when no Critical or Important issue remains and **Unresolved Confidence Gaps** is `None`. Use `NEEDS_CONTEXT` when missing evidence prevents a reliable review, and use `NEEDS_CHANGES` when an in-scope fix is required.

## Misuse Prevention

- Do not convert speculative concerns into findings. A finding needs evidence from the scope.
- Do not hide missing evidence behind optimistic language.
- Do not expand the scope into unrelated redesign or broad cleanup.
- Do not use passing tests alone as proof that requirements, edge cases, or review concerns were checked.
- Do not claim approval while Critical issues, Important issues, or approval-blocking evidence gaps remain.

## Integration Points

- Workflow artifact handoffs use the Workflow Handoff Confidence Loop and `workflow-handoff-reviewer-prompt.md` before moving between artifact stages.
- Implementers run this before returning `DONE`.
- Controllers run or verify it before task completion and before updating `tasks.md`.
- Reviewers use the Review Package Adequacy Gate and Review Confidence Loop before returning `APPROVED`.
- `verification-before-completion` uses it before any completion, fixed, passing, approved, commit-ready, or PR-ready claim.
