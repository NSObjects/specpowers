---
name: spec-driven-development
summary: Execute an approved specification plan task-by-task with TDD, spec traceability, staged review, and user-controlled commits.
description: "Use when an approved task plan exists and the user wants implementation to begin or resume."
---

# Spec-Driven Development

Execute an approved implementation plan with test-first discipline, explicit traceability to the Spec, and strict review gates.

**User-facing start announcement:**
> I'm using the spec-driven-development skill to implement the approved plan.

**Role:** Engineering controller. You coordinate implementation, verification, and reporting. You may write code directly or dispatch subagents, but you remain responsible for the final result.

## Non-Negotiable Gates

<HARD-GATE>
- Do **not** change the Spec, Design, Proposal, or acceptance criteria during implementation. If they appear wrong or incomplete, stop and explain the conflict to the user.
- Do **not** skip TDD for behavior-changing work. Each implementation task starts by creating or extending a failing automated test that maps to the linked Spec scenario.
- Do **not** run mutating git commands: no `git add`, `git commit`, `git push`, `git reset`, `git checkout`, `git rebase`, `git merge`, or stash operations. Read-only inspection commands such as `git status` or `git diff` are allowed when useful.
- Do **not** proceed to the next task in Step-by-Step mode without the user's explicit continuation instruction.
</HARD-GATE>

The only permitted edit to `tasks.md` during this skill is changing a completed task checkbox from `- [ ]` to `- [x]` after that task has passed all required gates.

## Definitions

- **Change:** The active spec change being implemented, usually under `specs/changes/<change-name>/`.
- **Task:** One unchecked item in `tasks.md`. A task is the smallest unit of uninterrupted execution.
- **Feature group:** A group of tasks that share the same top-level number, for example `1.1`, `1.2`, and `1.3` belong to feature group `1`. If tasks are organized by headings instead of numbers, treat each heading section as a feature group.
- **Subtask:** A task inside a feature group for verification-boundary purposes.
- **Linked Spec Scenarios:** The GIVEN/WHEN/THEN scenarios explicitly referenced by the task. If a task does not list scenario references, infer the closest scenarios from the Spec and state the inference in the task report.
- **Controller:** The main agent running this skill.
- **Worker:** A subagent or the controller acting directly to implement a task.

## Execution Modes

### Step-by-Step Mode — Default

Execute exactly one task, complete all gates, mark the task checkbox, report results, then pause. The user reviews the changes and commits manually. Continue only after the user explicitly says to continue.

### Fast Mode

Execute all unchecked tasks continuously. Each task still gets TDD, Stage 1 spec compliance review, Stage 2 code quality review, task checkbox update, and milestone verification. Report once at the end.

Use Fast Mode only when the user explicitly asks for it. Otherwise use Step-by-Step Mode.

## Startup Procedure

1. Announce the skill.
2. Identify the active change and task file. Prefer the change or task file named by the user; otherwise inspect `specs/changes/` and choose the single active change if unambiguous.
3. Read, at minimum:
   - `tasks.md`
   - the linked Spec scenarios
   - relevant Design sections
   - relevant existing code and tests
4. Determine execution mode:
   - explicit user request for Fast Mode → Fast Mode
   - otherwise → Step-by-Step Mode
5. Determine execution mechanism:
   - if the platform supports subagents, dispatch workers/reviewers using the prompt templates in this skill directory
   - otherwise execute and review inline using the self-checks below, and report that fallback explicitly
6. Find the first unchecked task. If no unchecked tasks remain, run the final completion checks and report that implementation is complete.

## Subagent Dispatch

Use subagents when the platform supports them. Dispatch a fresh worker per task to reduce context contamination.

- Implementer worker: `./implementer-prompt.md`
- Stage 1 reviewer: `./spec-reviewer-prompt.md`
- Stage 2 reviewer: `./code-quality-reviewer-prompt.md`

Resolve concrete language rules before dispatch:

- Use `scripts/lib/language-detect.js` against the task files, known implementation files, and reviewer changed files to identify concrete language rule skills.
- Fill each worker or reviewer prompt's `Resolved Language Rules` section with concrete `specpowers:rules-*` skill names, such as `specpowers:rules-typescript`, `specpowers:rules-python`, `specpowers:rules-golang`, `specpowers:rules-rust`, or `specpowers:rules-java`.
- If no installed language rule matches the task or review scope, write `none` in that section and continue with `rules-common`.
- Do not dispatch a worker or reviewer prompt while `specpowers:rules-{language}` remains unresolved. The placeholder is a template marker, not a loadable skill.

Review dispatch is mandatory after implementation reaches GREEN and before `tasks.md` is updated.

- On subagent-capable platforms, dispatch both reviewer stages as separate review steps and wait for their results.
- Do not replace reviewer dispatch with inline self-check merely because the task seems simple or the controller already inspected the code.
- If reviewer dispatch is unavailable or fails for platform/tooling reasons, the controller may use the inline self-checks below, but must report the fallback reason and the exact self-check result.
- Each reviewer package must include the task, linked scenarios, changed files or diff summary, relevant test results, and the implementer report.
- Before dispatching a reviewer, apply the `specpowers:confidence-loop` Review Package Adequacy Gate. If the task, linked scenarios, design constraints, diff context, test evidence, known risks, or prior findings/gaps are missing, provide them before review or treat the reviewer result as `NEEDS_CONTEXT`.

If subagents are unavailable, the controller performs the same work inline. Do not skip either review stage merely because subagents are unavailable.

## Worker Status Handling

Workers must report one of these statuses:

| Status | Meaning | Controller action |
|---|---|---|
| `DONE` | Task implemented and self-reviewed | Start Stage 1 review |
| `DONE_WITH_CONCERNS` | Task implemented, but worker has doubts | Read concerns before review; resolve correctness/scope concerns before Stage 1 |
| `NEEDS_CONTEXT` | Worker cannot safely continue without missing information | Provide missing context and retry, or ask the user if only the user can decide |
| `BLOCKED` | Worker attempted the task but cannot complete it | Diagnose blocker; retry with narrower scope, stronger context, or escalate to the user |

Never ignore `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`. Treat them as control signals, not narrative details.

## Task Execution Protocol

<CRITICAL>
One task is one uninterrupted execution unit. Do not pause between RED, GREEN, refactor, and review. The only valid pause points are:
- before starting a task, if required context is missing;
- after a task has passed all gates and has been reported;
- when a blocker or spec conflict prevents safe progress.
</CRITICAL>

For each task:

1. **Announce task start**

   ```markdown
   Starting Task N.M: [Task Name]
   Covers specs: [Scenario IDs or names]
   Mode: [Step-by-Step | Fast]
   ```

2. **Build task context**

   Read the task text, linked scenarios, relevant Design sections, and relevant existing code/tests. Keep the task boundary explicit: implement only what this task requests.

   Maintain traceable changes: every changed file and key edit must trace to the current request, accepted specification, task, failing test, review feedback, or current-change orphan cleanup. Remove drive-by refactors, comment rewrites, naming churn, formatting noise, and unrelated file changes unless the user explicitly expands the scope.

3. **Run TDD implementation**

   - Write or extend a test that fails for the linked scenario.
   - Run the targeted test and confirm **RED** for the expected reason.
   - Implement the smallest change that can satisfy the test.
   - Run the targeted test and confirm **GREEN**.
   - Refactor only after GREEN, then rerun relevant tests.
   - Avoid unrelated cleanup, broad rewrites, and speculative features.

   For tasks that are genuinely not behavior-changing, create the closest meaningful verification first, such as a compile check, configuration validation, migration test, or fixture-based assertion. Do not pretend TDD occurred; state the verification strategy clearly.

4. **Evidence-bound confidence loop**

   Run or verify `specpowers:confidence-loop` over the task scope after GREEN/refactor and before Stage 1 review. The loop must list concrete doubts raised by the diff, linked scenarios, tests, touched code paths, user feedback, review feedback, and stated risks.

   If an in-scope doubt is confirmed and fixable, fix it, rerun relevant verification, and repeat the loop. If the loop finds an unresolved confidence gap that prevents reliable judgment, stop and get the missing evidence or context before continuing.

5. **Stage 1: Spec Compliance Review**

   Purpose: verify the implementation matches the requested Spec exactly — complete, no missing requirements, no extra behavior.

   - With subagents: dispatch `./spec-reviewer-prompt.md` and wait for `PASS`.
   - Without subagents: run the Spec Compliance Self-Check below and record the fallback reason.

   If Stage 1 finds issues, fix them, rerun relevant tests, and repeat Stage 1. Do not start Stage 2 until Stage 1 passes.

6. **Stage 2: Code Quality Review**

   Purpose: verify the implementation is maintainable, idiomatic, tested, and safe.

   - With subagents: dispatch `./code-quality-reviewer-prompt.md` and wait for `APPROVED`.
   - Without subagents: run the Code Quality Self-Check below and record the fallback reason.

   If Stage 2 finds blocking issues, fix them, rerun relevant tests, and repeat Stage 2. If a Stage 2 fix changes behavior or public interfaces, rerun Stage 1 as well.

7. **Milestone verification**

   If this task is the last subtask in a feature group, run `verification-loop` for that feature group. Intermediate subtasks do not trigger `verification-loop` by count alone. Do not start the next feature group until the verification result exists and passes.

8. **Mark task complete**

   After TDD, Stage 1, Stage 2, and any required feature-group verification pass, update `tasks.md` for this task from `- [ ]` to `- [x]`.

   Do not mark `tasks.md` complete while any unresolved confidence gap remains.

9. **Report**

   Use the Step-by-Step or Fast Mode report format below.

## Step-by-Step Mode Flow

For the first unchecked task only:

1. Execute the full Task Execution Protocol.
2. Mark the task checkbox complete.
3. Report the completed task.
4. Stop. Do not begin the next task.
5. Wait for user instruction.

When the user says to continue, resume from the first unchecked task. Do not re-run or re-mark the previous task unless the user requests changes.

### Step-by-Step Report Format

```markdown
✅ Task N.M Complete: [Task Name]

**Output**
- Created: path/to/new-file.ext
- Modified: path/to/modified-file.ext
- Task tracking: `tasks.md` updated (`- [ ]` → `- [x]`)

**Tests**
- RED: `[command]` failed for the expected reason before implementation
- GREEN: `[command]` passed after implementation
- Additional checks: `[command]` passed

**Spec Coverage**
- ✅ Scenario "[name]" — GIVEN/WHEN/THEN covered by `[test name or file]`

**Reviews**
- Stage 1 — Spec Compliance: ✅ Passed (`spec-reviewer`, scope: [task/diff/files] | inline fallback: [reason])
- Stage 2 — Code Quality: ✅ Passed (`code-quality-reviewer`, scope: [task/diff/files] | inline fallback: [reason])
- Review evidence: [reviewer result summary, rerun count, or self-check evidence]
- Fixed review issues: [none | summary]
- Confidence Loop: [checked doubts | fixed issues | unresolved gaps: None]

**Verification**
- Feature-group verification: [not due | ✅ passed | details]

**Waiting for your action**
1. Review the code changes and results above.
2. Manually commit if satisfied.
3. Say "Continue" to execute the next task, or provide feedback.
```

## Fast Mode Flow

Execute every unchecked task using the full Task Execution Protocol.

Before starting the next feature group, confirm the current feature group has a passing `verification-loop` result. If the result is missing or failed, do not proceed to the next feature group.

After all feature groups are complete, run a final `verification-loop` before the final completion report.

### Fast Mode Final Report Format

```markdown
🎉 All Tasks Complete

| Task | Status | Output Files | Spec Coverage | Verification |
|---|---:|---|---|---|
| 1.1 [Name] | ✅ | file1.ext, test1.ext | Scenario "X" ✅ | not due |
| 1.2 [Name] | ✅ | file2.ext, test2.ext | Scenario "Y" ✅ | group 1 ✅ |

**Tests**
- Passing: [summary]
- Commands run: [commands]

**Reviews**
- Stage 1 Spec Compliance: ✅ all tasks passed
- Stage 2 Code Quality: ✅ all tasks passed
- Review evidence: [per-task reviewer summaries or inline fallback reasons]
- Confidence Loop: ✅ all task scopes had no unresolved confidence gaps

**Verification**
- Feature groups: ✅ all passed
- Final global verification-loop: ✅ passed

All task checkboxes in `tasks.md` have been updated. Please review all code changes, then manually commit if satisfied.
When finished, you can say "Archive" to merge Delta Specs into the main specifications.
```

## Resuming Progress

When resuming a change:

1. Read the active `tasks.md`.
2. Find the first unchecked task.
3. Use the previously established mode if known; otherwise default to Step-by-Step Mode unless the user explicitly requests Fast Mode.
4. Announce:

   ```markdown
   Resuming from Task N.M: [Task Name]
   Covers specs: [Scenario IDs or names]
   ```

5. Continue with the Task Execution Protocol.

If the previous task appears implemented but its checkbox is unchecked, inspect the code and review artifacts before deciding. Do not blindly mark it complete.

## Spec Compliance Self-Check

Use this inline when a spec reviewer subagent is unavailable.

For each linked scenario:

```text
Scenario: [name]
GIVEN [precondition]
  - Test setup matches? yes/no
WHEN [action]
  - Test triggers the actual behavior? yes/no
THEN [expected result]
  - Assertion verifies the expected observable result? yes/no
Negative constraints
  - No unrequested behavior added? yes/no
Implementation evidence
  - Files/lines inspected: [file:line]
Result
  - PASS / NEEDS_CHANGES
```

Stage 1 fails if any linked scenario lacks implementation evidence, lacks test coverage, is only partially implemented, or includes behavior outside the Spec.

## Code Quality Self-Check

Use this inline when a code quality reviewer subagent is unavailable.

Check at minimum:

- **Correctness risks:** edge cases, invalid inputs, concurrency/resource handling, error paths.
- **Maintainability:** clear names, small units, low coupling, no unnecessary abstractions.
- **Architecture fit:** follows existing project patterns and the file structure from the plan.
- **Test quality:** tests assert behavior, cover meaningful edge cases, and are not over-mocked.
- **Scope control:** no unrelated refactors, no speculative features, no broad cleanup outside the task.
- **Surgical changes:** every changed file and key edit is traceable to the current request, accepted specification, task, failing test, review feedback, or current-change orphan cleanup; no drive-by refactors, comment rewrites, or formatting noise.
- **Operational safety:** no secret leakage, unsafe defaults, surprising side effects, or avoidable performance regressions.
- **Evidence-backed confidence:** before passing Stage 2, confirm that every concrete doubt raised by the diff, tests, task context, touched code paths, and stated risks has been investigated or reported.

Stage 2 fails on any Critical or Important issue or approval-blocking confidence gap. Minor issues may be reported but should not block completion unless they accumulate into a maintainability risk. If missing evidence prevents a reliable self-check, treat it as a blocker and get the missing context or verification before marking the task complete.

## Existing Failures and Blockers

If tests fail before the task's RED test is introduced:

1. Identify whether the failure is pre-existing and unrelated.
2. Do not hide or rewrite unrelated failures.
3. Continue only if the task can be verified independently and the unrelated failure is clearly documented.
4. Stop and ask the user when the failure prevents reliable verification.

If implementation reveals a Spec/Design conflict:

1. Stop implementation.
2. State the exact conflict with file/section references.
3. Propose options, but do not edit the Spec/Design/Proposal until the user authorizes a planning/spec update workflow.

## Iron Laws

- Never pause halfway through a task for routine progress updates. Finish the task unit or stop only for a real blocker.
- Never start the next task in Step-by-Step Mode without explicit user continuation.
- Never run mutating git commands. The user owns commits and branch management.
- Never skip TDD for behavior-changing work.
- Never modify Spec, Design, or Proposal during implementation.
- Never skip Stage 1 before Stage 2.
- Never replace reviewer dispatch with inline self-check on a subagent-capable platform unless dispatch is unavailable or failed, and the fallback is reported.
- Never report a task complete while Stage 1, Stage 2, required tests, or due milestone verification are failing.
- Never report or mark a task complete while an unresolved confidence gap remains.
- Never treat a worker report as proof. Verify code and tests directly.
- Never ignore user feedback. If the user says the result is wrong, stop the normal flow and address it.

## Red Flags

| Temptation | Correct response |
|---|---|
| "This task is simple; do the next one too." | In Step-by-Step Mode, stop after one completed task. |
| "The task passed tests, so skip spec review." | Stage 1 is mandatory. Tests can encode the wrong behavior. |
| "The code looks fine, so skip code review." | Stage 2 is mandatory. Spec-compliant code can still be fragile. |
| "The reviewer found a small blocking issue; mention it and move on." | Fix blocking issues and rerun the relevant review. |
| "The Spec is slightly wrong; patch it while implementing." | Stop and discuss the Spec conflict with the user. |
| "Mark the task after the user commits." | Mark it after gates pass, before reporting, so the user's manual commit captures the completed state. |
| "Use git commit to checkpoint." | Do not commit. Report clearly and let the user commit. |
| "Subagents are unavailable, so skip reviews." | Run self-checks inline. |

## Integration

**Required skills**
- `specpowers:test-driven-development` — mandatory for behavior-changing tasks.
- `specpowers:planning` — produces the task plan this skill executes.

**Supporting skills**
- `specpowers:rules-common` — universal engineering rules for implementation and review.
- `specpowers:rules-{language}` — language-specific rules, for example `rules-golang`, `rules-typescript`, or `rules-python`.
- `specpowers:verification-loop` — milestone and final verification pipeline.
- `specpowers:requesting-code-review` — optional standalone review workflow outside this per-task flow.
- `specpowers:confidence-loop` — evidence-bound loop for concrete doubts and unresolved confidence gaps before task completion.
- `specpowers:archiving` — used only after all tasks are complete and the user asks to archive.

After all tasks complete, tell the user:

> All tasks are complete. You can say "Archive" to merge Delta Specs into the main specifications.
