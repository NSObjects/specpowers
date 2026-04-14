<!-- generated from skills/ by sync-steering.js -->
---
name: spec-driven-development
description: "Use when there is an approved implementation plan with concrete tasks and the work should now be executed in the current session."
---

# Spec-Driven Development

Execute implementation tasks with TDD discipline, Spec traceability, and user-controlled pacing.

**Announce at start:** "I'm using the spec-driven-development skill to implement the plan."

**Role: Engineer.** You write code, tests, and verify against specs.

<HARD-GATE>
Do NOT modify specs, design, or proposal during implementation. If something is wrong, stop and discuss with the user.
Do NOT skip TDD — every Task starts with a failing test.
Do NOT auto-commit. Git is managed by the user.
</HARD-GATE>

## Two Execution Modes

### Step-by-Step Mode (Default)

Each Task completes → two-stage review → pause → user reviews + commits → user says "Continue" → next Task.

### Fast Mode

All Tasks execute continuously with two-stage review per Task → unified report → user reviews all changes at once.

## Subagent Dispatch

**If the platform supports subagents** (Claude Code, Codex, Kiro Autopilot): dispatch a fresh subagent per Task using the implementer prompt template (`./implementer-prompt.md`). This keeps context clean and prevents pollution between Tasks.

**If the platform does NOT support subagents** (Cursor, Gemini CLI, OpenCode): the main agent executes Tasks directly. The two-stage review still applies — just run the checks inline instead of dispatching reviewer subagents.

## Two-Stage Review

After each Task completes (both modes), run two review stages in order:

### Stage 1: Spec Compliance Review

Verify the implementation matches the spec — nothing more, nothing less.

**With subagents:** Dispatch spec reviewer subagent using `./spec-reviewer-prompt.md`.
**Without subagents:** Self-check against the linked Spec Scenarios (see Spec Compliance Self-Check below).

If issues found → fix → re-review. Do NOT proceed to Stage 2 until Stage 1 passes.

### Stage 2: Code Quality Review

Verify the implementation is well-built (clean, tested, maintainable).

**With subagents:** Dispatch code quality reviewer subagent using `./code-quality-reviewer-prompt.md` (which delegates to `../requesting-code-review/code-reviewer-prompt.md`).
**Without subagents:** Self-review for naming, complexity, duplication, error handling, test quality.

If issues found → fix → re-review. Do NOT report Task as complete until Stage 2 passes.

## Handling Implementer Status (Subagent Mode)

When using subagents, implementers report one of four statuses:

**DONE:** Proceed to Stage 1 review.

**DONE_WITH_CONCERNS:** Read concerns first. If about correctness/scope, address before review. If observations, note and proceed.

**NEEDS_CONTEXT:** Provide missing context and re-dispatch.

**BLOCKED:** Assess the blocker:
1. Context problem → provide more context, re-dispatch
2. Task too complex → re-dispatch with more capable model
3. Task too large → break into smaller pieces
4. Plan is wrong → escalate to user

**Never** ignore an escalation. If the implementer is stuck, something needs to change.

## Execution Flow — Step-by-Step Mode

<CRITICAL>
**One Task = one uninterrupted execution unit.** Execute ALL steps within a Task continuously without pausing. Only pause AFTER the entire Task is complete (all TDD steps done, two-stage review passed). Do NOT stop between steps within a Task.
</CRITICAL>

For each unchecked Task in tasks.md:

1. **Announce:** "Starting Task N.M: [name]" with its `Covers specs:` reference
2. **Build context:** Read the Task text + referenced Spec Scenarios + relevant Design sections
3. **Execute Task** (subagent or main agent):
   - Write failing test (from Spec's GIVEN/WHEN/THEN)
   - Run test, verify RED
   - Implement minimal code
   - Run test, verify GREEN
   - Follow TDD skill discipline throughout
   - **Do NOT pause between these steps — complete them all in one go**
4. **Two-stage review:** Stage 1 (spec compliance) → Stage 2 (code quality)
   > **Feature-group milestone verification:** Run `verification-loop` when the current Task is the last subtask in a feature group. Intermediate subtasks do not trigger `verification-loop` by count alone.
5. **Feature-group handoff gate:** Before starting the next feature group, confirm the current feature group has a `verification-loop` result. If that result is missing or failed, do not proceed to the next feature group.
6. **If either review returns issues:** Fix before reporting to user.
7. **ONLY NOW report and pause:**

```markdown
✅ Task N.M Complete: [Task Name]

**Output:**
- Created: path/to/new-file.ts
- Modified: path/to/modified-file.ts
- Tests: X/X passing

**Spec Coverage:**
- ✅ Scenario "[name]" — GIVEN/WHEN/THEN fully covered

**Code Review:**
- Stage 1 (Spec Compliance): ✅
- Stage 2 (Code Quality): [APPROVED / NEEDS_CHANGES]
- [Issues found, if any]

**Waiting for your action:**
1. Review the code changes and review results above
2. If satisfied, manually git commit
3. Say "Continue" to execute the next Task, or provide feedback
```

8. **Wait for user instruction.** Do NOT proceed until user explicitly says to continue.
9. **Mark Task as complete** (check the checkbox in tasks.md `- [ ]` → `- [x]`) when user says "Continue" or confirms.

## Execution Flow — Fast Mode

Execute all unchecked Tasks continuously:

1. For each Task: build context → execute (subagent or main agent) → two-stage review → fix if needed → mark complete
2. When the current Task is the last subtask in a feature group: run `verification-loop` before treating that feature group as complete
3. Before starting the next feature group: confirm the current feature group's `verification-loop` result exists and is ready; if it is missing or failed, do not proceed to the next feature group
4. After all feature groups are complete: run a final `verification-loop` before the final completion report.
5. After ALL Tasks: produce unified report:

```markdown
🎉 All Tasks Complete!

| Task | Status | Output Files | Spec Coverage |
|------|--------|--------------|---------------|
| 1.1 [Name] | ✅ | file1.ts, test1.ts | Scenario "X" ✅ |
| 1.2 [Name] | ✅ | file2.ts, test2.ts | Scenario "Y" ✅ |

**Tests:** N/N passing
**Spec Coverage:** M/M scenarios, 100%

**Reviews:** All Tasks passed two-stage review (spec compliance + code quality)
**Verification:** Each feature group passed its `verification-loop`, and the final global `verification-loop` passed

Please review all code changes, then manually commit if satisfied.
When finished, you can say 'Archive' to merge Delta Specs into the main specifications.
```

## Resuming Progress

If the user returns to a conversation or starts a new session:
1. Read `specs/changes/<change-name>/tasks.md`
2. Find the first unchecked `- [ ]` Task
3. If no execution mode has been established for the current change, ask the user to choose `Step-by-Step` or `Fast` before resuming
4. Announce: "Resuming from Task N.M: [name]"
5. Continue from there

## Spec Compliance Self-Check

When subagents are unavailable, verify against linked Spec Scenarios after each Task:

```
For each linked Scenario:
  ✅ GIVEN [condition] — Is the precondition correctly set up in the test?
  ✅ WHEN [action] — Does the test trigger the correct action?
  ✅ THEN [expected] — Does the assertion match the expected outcome?
  ❌ MISSING — Scenario X has no corresponding test
```

If any check fails, fix before reporting the Task as complete.

## Prompt Templates

When using subagents, use these templates:
- `./implementer-prompt.md` — Dispatch implementer subagent per Task
- `./spec-reviewer-prompt.md` — Dispatch spec compliance reviewer (Stage 1)
- `./code-quality-reviewer-prompt.md` — Dispatch code quality reviewer (Stage 2)

## Iron Laws

- **NEVER pause in the middle of a Task.** Execute all TDD steps within a Task continuously. The pause point is AFTER the Task is complete, not between steps.
- **NEVER start the next Task without user's explicit "Continue" in Step-by-Step mode.**
- **NEVER execute git commands.** No `git add`, `git commit`, `git push`. Git is the user's domain.
- **NEVER ignore user feedback.** If user says "this is wrong", stop and fix before continuing.
- **NEVER skip TDD.** Every Task starts with a failing test. Use `specpowers:test-driven-development` discipline (Kiro: readSteering → test-driven-development.md).
- **NEVER modify specs/design/proposal during implementation.** If you discover the spec is wrong, stop and discuss.
- **NEVER skip Stage 1 (spec compliance) before Stage 2 (code quality).** Wrong order = reviewing code that doesn't meet spec.
- **NEVER proceed with unfixed review issues.** Both stages must pass before Task is complete.

## Red Flags

| Thought | Reality |
|---------|---------|
| "This Task is simple, do the next one too" | In Step-by-Step mode, one Task at a time. Period. |
| "Let me pause between TDD steps to ask the user" | Execute all steps within a Task continuously. Only pause after the entire Task is done. |
| "Let me commit for the user" | Git is the user's domain. You never touch git. |
| "User forgot to say continue, I'll proceed" | No explicit instruction = no action. |
| "This Task failed, let me skip to the next" | Fix the current Task first. No skipping. |
| "The spec is wrong, let me adjust it" | Stop implementation. Discuss the spec issue with the user. |
| "I'll write the test after since I know what to build" | Test-first. Always. Use the TDD skill. |
| "Skip spec review, code quality review is enough" | Spec compliance first. Always. Wrong order = reviewing wrong code. |
| "Close enough on spec compliance" | Reviewer found issues = not done. Fix and re-review. |

## Integration

**Required skills:**
- **specpowers:test-driven-development** — Follow TDD for every Task (Kiro: readSteering → test-driven-development.md)
- **specpowers:planning** — Creates the task plan this skill executes (Kiro: readSteering → planning.md)

**Related skills (ad-hoc use, NOT part of the two-stage review):**
- **specpowers:requesting-code-review** — For manual reviews outside spec-driven-development (e.g., before merge, when stuck). The two-stage review above is the per-task automated flow; requesting-code-review is for standalone review requests.
- **specpowers:verification-loop** — Run the 6-stage verification pipeline after completing tasks or at milestones (Kiro: readSteering → verification-loop.md)

**After all Tasks complete:**
> "All Tasks complete. You can say 'Archive' to merge Delta Specs into the main specifications."

Then invoke `archiving` skill (Kiro: readSteering → archiving.md) when user requests it.
