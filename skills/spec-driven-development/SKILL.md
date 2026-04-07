---
name: spec-driven-development
description: "Use when tasks.md is ready. Executes tasks with TDD discipline, Spec compliance checks, and user-controlled pacing."
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

### 逐任务模式 (Step-by-Step, Default)

Each Task completes → pause → user reviews + commits → user says "继续"/"continue" → next Task.

### 快速模式 (Fast Mode)

All Tasks execute continuously → unified report → user reviews all changes at once.

## Execution Flow — 逐任务模式

For each unchecked Task in tasks.md:

1. **Announce:** "Starting Task N.M: [name]" with its `Covers specs:` reference
2. **Build context:** Read the Task text + referenced Spec Scenarios + relevant Design sections
3. **Execute TDD steps:**
   - Write failing test (from Spec's GIVEN/WHEN/THEN)
   - Run test, verify RED
   - Implement minimal code
   - Run test, verify GREEN
   - Follow TDD skill discipline throughout
4. **Spec compliance self-check:** Verify each Scenario's GIVEN/WHEN/THEN is covered
5. **Auto code review:** Dispatch `specpowers:code-reviewer` subagent with:
   - What was implemented (Task description)
   - Spec Scenarios as acceptance criteria
   - Changed files
6. **Report and pause:**

```markdown
✅ Task N.M 完成: [Task Name]

**产出：**
- 新建: path/to/new-file.ts
- 修改: path/to/modified-file.ts
- 测试: X/X 通过

**Spec 覆盖：**
- ✅ Scenario "[name]" — GIVEN/WHEN/THEN 全部覆盖

**Code Review：**
- [APPROVED / NEEDS_CHANGES]
- [Issues found, if any]

**等待你的操作：**
1. Review 以上代码变更和 Code Review 结果
2. 满意后手动 git commit
3. 告诉我 "继续" 执行下一个 Task，或提出修改意见
```

7. **If review returns NEEDS_CHANGES:** Fix issues before reporting to user.
8. **Wait for user instruction.** Do NOT proceed until user explicitly says to continue.
9. **Mark Task as complete** (check the checkbox in tasks.md) when user confirms.

## Execution Flow — 快速模式

Execute all unchecked Tasks continuously:

1. For each Task: build context → TDD → Spec self-check → mark complete
2. After ALL Tasks: dispatch `specpowers:code-reviewer` subagent for the full changeset
3. Produce unified report:

```markdown
🎉 所有 Task 执行完成！

| Task | 状态 | 产出文件 | Spec 覆盖 |
|------|------|----------|-----------|
| 1.1 [Name] | ✅ | file1.ts, test1.ts | Scenario "X" ✅ |
| 1.2 [Name] | ✅ | file2.ts, test2.ts | Scenario "Y" ✅ |

**测试：** N/N 通过
**Spec 覆盖率：** M/M 场景, 100%

**Code Review：**
- [APPROVED / NEEDS_CHANGES]
- [Issues found, if any]

请 review 全部代码变更和 Code Review 结果，满意后手动 commit。
完成后可以说 '归档' 来将 Delta Specs 合并进主规范。
```

4. **If review returns NEEDS_CHANGES:** Fix issues before presenting report to user.

## Resuming Progress

If the user returns to a conversation or starts a new session:
1. Read `specs/changes/<change-name>/tasks.md`
2. Find the first unchecked `- [ ]` Task
3. Announce: "Resuming from Task N.M: [name]"
4. Continue from there

## Spec Compliance Self-Check

After completing each Task, verify against the linked Spec Scenarios:

```
For each linked Scenario:
  ✅ GIVEN [condition] — Is the precondition correctly set up in the test?
  ✅ WHEN [action] — Does the test trigger the correct action?
  ✅ THEN [expected] — Does the assertion match the expected outcome?
  ❌ MISSING — Scenario X has no corresponding test
```

If any check fails, fix before reporting the Task as complete.

## Iron Laws

- **NEVER start the next Task without user's explicit "继续"/"continue" in 逐任务模式**
- **NEVER execute git commands.** No `git add`, `git commit`, `git push`. Git is the user's domain.
- **NEVER ignore user feedback.** If user says "this is wrong", stop and fix before continuing.
- **NEVER skip TDD.** Every Task starts with a failing test. Use `specpowers:test-driven-development` discipline.
- **NEVER modify specs/design/proposal during implementation.** If you discover the spec is wrong, stop and discuss.

## Red Flags

| Thought | Reality |
|---------|---------|
| "This Task is simple, do the next one too" | In 逐任务模式, one Task at a time. Period. |
| "Let me commit for the user" | Git is the user's domain. You never touch git. |
| "User forgot to say continue, I'll proceed" | No explicit instruction = no action. |
| "This Task failed, let me skip to the next" | Fix the current Task first. No skipping. |
| "The spec is wrong, let me adjust it" | Stop implementation. Discuss the spec issue with the user. |
| "I'll write the test after since I know what to build" | Test-first. Always. Use the TDD skill. |

## Integration

**Required skills:**
- **specpowers:test-driven-development** — Follow TDD for every Task
- **specpowers:planning** — Creates the task plan this skill executes
- **specpowers:requesting-code-review** — Auto-dispatched after task completion

**After all Tasks complete:**
> "All Tasks complete. You can say '归档' to merge Delta Specs into the main specifications."

Then invoke `archiving` skill when user requests it.
