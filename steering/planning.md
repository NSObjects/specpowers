<!-- generated from skills/ by sync-steering.js -->
---
name: planning
description: "Use when the behavior and design are agreed and the work needs to be broken into small test-first tasks for implementation."
---

# Planning Tasks

Break the design into bite-sized, TDD-driven tasks. Each task maps back to a specific Spec scenario.

**Announce at start:** "I'm using the planning skill to create the implementation plan."

**Role: Tech Lead.** You decompose work into executable steps. Every step is complete, tested, specific.

<HARD-GATE>
Every Task MUST include a `Covers specs:` field mapping to a Spec Scenario.
Every step MUST include concrete acceptance criteria, file paths, or spec references — no vague placeholders.
Do NOT proceed to execution without user confirmation.
</HARD-GATE>

## Checklist

1. **Read specs AND design** — understand requirements and technical approach
2. **Read existing code** — understand types, interfaces, naming conventions
3. **Map file structure** — which files to create/modify per the design
4. **Decompose into Tasks** — each Task covers one or more Spec Scenarios
5. **Check Task granularity** — apply size heuristics (see below)
6. **Order Tasks by dependency** — independent first, dependent later
7. **Write TDD steps** — failing test → verify red → implement → verify green
8. **Self-review** — spec coverage, placeholder scan, consistency check, size check
9. **User confirms** — wait for explicit approval
10. **Transition** — invoke `spec-driven-development` skill (Kiro: readSteering → spec-driven-development.md)

## Task Granularity Heuristics

**Each Task should be:**
- Completable in **5-15 minutes**
- Testable with **1-3 test cases**
- Describable in **one sentence**
- Producible with **one commit**

**A Task is TOO LARGE if:**
- It touches more than 3 files (excluding test files)
- It has more than 5 steps
- You can't describe what it does in one sentence
- It covers more than 2 Spec Scenarios
- It mixes infrastructure setup with business logic

**Split large Tasks:** Break into sub-tasks, each with their own `Covers specs:` mapping. Infrastructure tasks (project config, type definitions) come first.

**A Task is TOO SMALL if:**
- It only renames a variable or adds an import
- It has no testable behavior change
- It would produce a meaningless commit

**Merge small Tasks:** Combine related micro-changes into one meaningful Task.

## Task Ordering and Dependencies

Tasks MUST be ordered so each builds on the previous:

```
1. Infrastructure/types/interfaces (foundation)
2. Core logic with tests (business rules)
3. Integration/wiring (connecting pieces)
4. Edge cases and error handling
```

**Dependency rules:**
- If Task B imports from Task A's output, Task A comes first
- If Task B modifies a file created by Task A, document this
- Each Task should produce code that compiles and passes tests independently — no "this won't work until Task 4" steps

## Bite-Sized Step Granularity

**Each step within a Task is one action (2-5 minutes):**
- "Write the failing test" — step
- "Run it to make sure it fails" — step
- "Implement the minimal code to make the test pass" — step
- "Run the tests and make sure they pass" — step

## Task Format

Use `## 1. [Module Name]` to define one feature group boundary. Each nested `Task N.M` entry is a subtask within that feature group.

````markdown
# Tasks

## 1. [Module Name]

### Task 1.1: [Specific Behavior]
**Covers specs:** `specs/[domain]/spec.md` → Requirement "[Name]" → Scenario "[Name]"
**Depends on:** [none / Task N.M]
**Files:** [list of files touched]

- [ ] **Step 1: Write failing test**
  Acceptance from spec: GIVEN [precondition] WHEN [action] THEN [expected]
  Test name: `[descriptive test name from Spec scenario]`

- [ ] **Step 2: Run test, verify RED**
  Run: `[test command]`
  Expected: FAIL — "[specific failure reason]"

- [ ] **Step 3: Implement minimal code**
  File: `[exact file path]`
  Responsibility: [what this code does, not how]

- [ ] **Step 4: Run test, verify GREEN**
  Run: `[test command]`
  Expected: PASS
````

## No Placeholders

Every step must contain concrete, actionable content. These are **plan failures** — never write them:
- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above" (without specifying GIVEN/WHEN/THEN)
- "Similar to Task N" (repeat the spec references — tasks may be read independently)
- Steps that lack acceptance criteria or file paths

**Plans describe WHAT to build and WHERE, not HOW.** Actual test code and implementation code are written by the implementer during the TDD cycle, following `test-driven-development` and `rules-{language}` disciplines.

## Spec-Task Mapping Contract

**This is the core innovation of SpecPowers.**

Every Task MUST declare which Spec Scenario(s) it covers via `Covers specs:`. This creates a traceable chain:

```
Spec Scenario → Task → Test → Implementation
```

After writing all tasks, verify:
- **Every Spec Scenario has at least one Task covering it**
- **No Task exists without a Spec Scenario mapping** (except pure infrastructure tasks like "create project config")

## Self-Review

After writing the complete plan:

1. **Spec coverage:** For each Scenario in the specs, can you point to a Task? List any gaps.
2. **Placeholder scan:** Search for red flags — any patterns from "No Placeholders" above. Fix them.
3. **Interface consistency:** Do the file paths, responsibilities, and spec references in later tasks align with earlier tasks?
4. **Test-first check:** Does every Task start with writing a failing test?
5. **Size check:** Does any Task have more than 5 steps or touch more than 3 files? Split it.
6. **Dependency check:** Are Tasks ordered so each one compiles independently?
7. **Dependency coherence:** Do later Tasks reference files and responsibilities defined in earlier Tasks correctly?

Fix issues inline. If you find a Spec Scenario with no Task, add the Task.

## Red Flags

| Thought | Reality |
|---------|---------|
| "This Task is big but it's all related" | If you can't describe what it does in one sentence, split it. |
| "I'll figure out the details during implementation" | The plan defines WHAT and WHERE. If you write "implement the logic" without spec references and file paths, you haven't planned. |
| "Tests for this are obvious, no need to specify acceptance criteria" | If they're obvious, the GIVEN/WHEN/THEN takes 30 seconds to write. No excuses. |
| "The dependency order doesn't matter, I'll sort it out" | Wrong order = compile errors = wasted time = bad experience for the user. |
| "This infrastructure task doesn't need a Spec mapping" | Correct — mark it as infrastructure. But don't use this as an excuse for unmapped business logic. |
| "I'll add error handling as a separate Task later" | Error handling IS the behavior. Spec scenarios include edge cases. Plan them now. |

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "The plan is too detailed, it slows things down" | Detailed plans execute faster than vague ones. Every minute of planning saves 10 of debugging. |
| "I can't know the exact acceptance criteria without running it" | The spec defines the criteria. Translate GIVEN/WHEN/THEN into the plan. |
| "6 steps per Task is too many, I'll condense" | Each step is 2-5 minutes. 6 steps = 15 minutes. That's the right granularity. |

## After Planning

Save to `specs/changes/<change-name>/tasks.md`.

> "Implementation plan saved. [N] Tasks covering [M] Spec Scenarios.
>
> Two execution modes available:
> 1. **Step-by-Step Mode** (default) — one Task at a time, two-stage review, you review + commit after each
> 2. **Fast Mode** — all Tasks continuously, two-stage review per Task, you review everything at the end
>
> Which mode?"

Wait for user choice. Then invoke `spec-driven-development` skill (Kiro: readSteering → spec-driven-development.md).
