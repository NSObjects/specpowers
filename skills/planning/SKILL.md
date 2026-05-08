---
name: planning
description: "Use when approved requirements and design need a traceable, bite-sized, test-first implementation plan."
---

# Planning Skill

Use this skill when requirements/spec scenarios and the design direction are already agreed, and the next step is to create an implementation plan made of small, test-first tasks.

**Start announcement:** "I'm using the planning skill to create the implementation plan."

**Role:** Tech Lead. Break approved specs and design into executable, independently verifiable tasks. Each task must be specific enough for another engineer or agent to implement without guessing.

**Primary output:** `specs/changes/<change-name>/tasks.md`

## Hard Gates

- Do **not** write implementation code in this skill.
- Do **not** proceed to implementation without explicit user approval of the plan.
- Read the relevant specs, design, and existing code before writing tasks. If a required source cannot be found, ask one focused question instead of inventing details.
- Every task must include a `Covers specs:` field.
- Business-logic, validation, error-handling, integration, and UI tasks must map to at least one concrete Spec Scenario.
- Pure infrastructure tasks are allowed only when needed to enable later behavior. Mark them as `Covers specs: Infrastructure — enables <specific scenario/task>`.
- Every behavior task must start with a failing test step and include RED/GREEN verification.
- Every task must list concrete file paths, test command(s), and acceptance criteria.
- No placeholders: never write `TBD`, `TODO`, `implement later`, `similar to above`, or vague instructions such as "add validation" without exact acceptance criteria.

## Required Inputs

Before planning, identify or infer:

- **Change name:** used for `specs/changes/<change-name>/tasks.md`.
- **Spec files:** scenario definitions, requirements, acceptance criteria, or GIVEN/WHEN/THEN statements.
- **Design files:** architecture, API choices, data model, interfaces, constraints, or implementation approach.
- **Repository context:** source layout, naming conventions, test framework, existing commands.
- **Execution constraints:** user preferences, language rules, CI expectations, backwards-compatibility constraints.

If multiple interpretations are possible, prefer the one most directly supported by the provided specs/design. State any assumption in the plan under `Assumptions`.

## Planning Workflow

1. **Read specs and design**
    - Extract every Spec Scenario into a scenario inventory.
    - Capture each scenario's preconditions, action, expected result, and edge cases.

2. **Read existing code**
    - Identify existing modules, interfaces, test conventions, fixtures, mocks, and command patterns.
    - Reuse established naming and structure where possible.

3. **Map files**
    - Decide exactly which files will be created or modified.
    - Separate production files from test files.
    - Note dependencies between files and tasks.

4. **Decompose into tasks**
    - Each task should implement one coherent behavior or one enabling infrastructure unit.
    - Business behavior must trace back to Spec Scenarios.
    - Edge cases and error handling are first-class behavior, not afterthoughts.

5. **Order by dependency**
    - Foundation first: configuration, types, interfaces, fixtures.
    - Core behavior next: business rules and domain logic.
    - Integration/wiring next: API routes, adapters, handlers, UI wiring.
    - Edge cases, error paths, and regression coverage as soon as their dependencies exist.

6. **Write TDD steps**
    - RED: write a failing test with a specific name and expected failure reason.
    - GREEN: implement the smallest production change that satisfies the test.
    - VERIFY: run the concrete test command and expected result.

7. **Self-review and repair**
    - Check traceability, granularity, dependency order, file paths, commands, and placeholder language.
    - Fix issues in the plan before presenting it.

8. **Stop for approval**
    - Present or save the plan.
    - Ask the user to choose an execution mode.
    - Do not invoke implementation until the user approves.

Use the Workflow Handoff Confidence Loop from `../confidence-loop/SKILL.md` with `../confidence-loop/workflow-handoff-reviewer-prompt.md` before the `planning → spec-driven-development` handoff when subagents are available, after the user approves the plan and chooses an execution mode.

Review package must include `tasks.md`, the `Spec Coverage Summary`, relevant specs, relevant design constraints, exact test commands, execution mode decision, assumptions, repository constraints, and any `Open Planning Blockers`.

Do not proceed to `spec-driven-development` while Critical or Important findings, `NEEDS_USER_DECISION`, or Unresolved Confidence Gaps remain.

If the handoff loop changes `tasks.md`, assumptions, scope, test commands, or execution-relevant content, present the updated plan and obtain user approval and execution mode confirmation again before proceeding to `spec-driven-development`.

## Scenario Inventory Format

Before the task list, include a concise inventory so coverage can be audited:

```markdown
## Spec Coverage Summary

| Spec Scenario | Requirement | Covered by Task(s) | Notes |
| --- | --- | --- | --- |
| `specs/<domain>/spec.md` → Scenario "<name>" | "<requirement name>" | Task 1.1 | <important constraint or edge case> |
```

Every scenario must appear in this table. If a scenario cannot be planned because the spec is missing or contradictory, list it under `Open Planning Blockers` instead of silently omitting it.

## Task Granularity Rules

A good task is:

- Completable in one short implementation pass.
- Testable with 1-3 focused tests.
- Describable in one sentence.
- Suitable for one meaningful commit.
- Independently compilable and testable after completion.

A task is **too large** if any of these are true:

- It touches more than 3 production files.
- It has more than 5 steps.
- It covers more than 2 Spec Scenarios.
- It mixes unrelated concerns, such as schema changes, business rules, and API wiring.
- It cannot be summarized in one sentence.

A task is **too small** if any of these are true:

- It only renames a variable or adds an import.
- It has no observable behavior, compile, or test impact.
- It would produce a meaningless commit.

When a task is too large, split it by behavior, dependency, or boundary. When tasks are too small, merge them with the nearest related behavior task.

## Dependency Rules

Tasks must be ordered so that each completed task leaves the project in a working state.

- If Task B imports or calls something created in Task A, Task A comes first.
- If Task B modifies a file created by Task A, mention that dependency explicitly.
- If a task needs a fixture, mock, schema, or interface, create it in an earlier infrastructure task or within the same small task.
- Never write a task that intentionally leaves compilation or tests broken until a later task.

## Task Format

Use `## N. [Module or Feature Boundary]` for a feature group. `## 1. [Module Name]` is the canonical feature group heading shape. Use `### Task N.M: [Specific behavior]` for each task; `Task N.M` entries are subtasks within that feature group.

````markdown
# Tasks

## Assumptions

- [Only include assumptions that are necessary and grounded in the specs/design.]

## Spec Coverage Summary

| Spec Scenario | Requirement | Covered by Task(s) | Notes |
| --- | --- | --- | --- |
| `specs/<domain>/spec.md` → Scenario "<name>" | "<requirement name>" | Task 1.1 | <constraint> |

## 1. [Module or Feature Boundary]

### Task 1.1: [Specific Behavior]
**Type:** behavior | infrastructure | integration | error-path | regression
**Covers specs:** `specs/<domain>/spec.md` → Requirement "<name>" → Scenario "<name>"
**Depends on:** none | Task N.M
**Files:**
- `path/to/test_file.ext` — add/modify focused tests
- `path/to/source_file.ext` — implement the required behavior
**Test command:** `<exact command>`

**Acceptance criteria:**
- GIVEN <specific precondition> WHEN <specific action> THEN <specific expected result>
- GIVEN <specific edge case> WHEN <specific action> THEN <specific expected result>

- [ ] **Step 1: Write failing test**
  File: `path/to/test_file.ext`
  Test name: `<descriptive test name>`
  Expected RED result: FAIL because `<specific missing behavior or assertion failure>`

- [ ] **Step 2: Verify RED**
  Run: `<exact command>`
  Expected: FAIL for `<specific reason>`, not because of compile/setup errors.

- [ ] **Step 3: Implement minimal code**
  File: `path/to/source_file.ext`
  Responsibility: `<what behavior this code must provide>`

- [ ] **Step 4: Verify GREEN**
  Run: `<exact command>`
  Expected: PASS
````

### Infrastructure Task Variant

Use this only for setup that enables later behavior tasks.

````markdown
### Task 1.0: [Specific infrastructure setup]
**Type:** infrastructure
**Covers specs:** Infrastructure — enables Task 1.1 for `specs/<domain>/spec.md` → Scenario "<name>"
**Depends on:** none | Task N.M
**Files:**
- `path/to/file.ext` — create shared type/interface/config/fixture
**Test command:** `<compile, lint, or smoke-test command>`

**Acceptance criteria:**
- GIVEN the project is checked out WHEN `<command>` runs THEN it completes successfully.
- GIVEN Task 1.1 starts WHEN it imports this artifact THEN the referenced file/type/function exists.

- [ ] **Step 1: Create infrastructure artifact**
  File: `path/to/file.ext`
  Responsibility: `<specific enabling responsibility>`

- [ ] **Step 2: Verify infrastructure**
  Run: `<exact command>`
  Expected: PASS
````

## No-Placeholder Rules

These are plan failures and must be rewritten before presenting the plan:

- `TBD`, `TODO`, `later`, `future work`, `fill in details`.
- `Add proper error handling` without a named error condition and expected behavior.
- `Add validation` without exact invalid inputs and expected outputs.
- `Write tests` without test file, test name, GIVEN/WHEN/THEN, and expected RED reason.
- `Implement the logic` without source file and responsibility.
- `Same as previous task`, `similar to Task N`, or references that force the reader to infer missing details.
- A file path that is approximate instead of exact.
- A command that is approximate instead of exact.

## Self-Review Checklist

After drafting the complete plan, perform this review and include the result at the end.

```markdown
## Self-Review

- [ ] **Spec coverage:** Every Spec Scenario appears in `Spec Coverage Summary` and maps to at least one Task.
- [ ] **No unmapped behavior:** Every non-infrastructure task has a concrete Spec Scenario mapping.
- [ ] **Infrastructure justified:** Every infrastructure task names the behavior task or scenario it enables.
- [ ] **No placeholders:** The plan contains no `TBD`, `TODO`, vague validation/error handling, or inferred steps.
- [ ] **Test-first:** Every behavior, integration, error-path, and regression task starts with a failing test.
- [ ] **Concrete commands:** Every task has an exact test, compile, lint, or smoke-test command.
- [ ] **Concrete files:** Every task lists exact file paths and responsibilities.
- [ ] **Granularity:** No task has more than 5 steps, more than 3 production files, or more than 2 Spec Scenarios.
- [ ] **Dependency order:** Tasks are ordered so the project compiles and relevant tests pass after each task.
- [ ] **Consistency:** Later tasks reference files, types, and responsibilities created by earlier tasks accurately.
```

If any item fails, revise the plan before presenting it.

## Red Flags and Corrections

| Red Flag | Correction |
| --- | --- |
| "This is one big task, but it is all related." | Split by behavior, file boundary, or scenario. |
| "The implementation details can be decided later." | Planning defines what behavior changes and where. Do not specify internal algorithms unless the design requires them. |
| "Tests are obvious." | Write the GIVEN/WHEN/THEN and expected RED reason. |
| "Dependency order does not matter." | Reorder tasks until each task can pass independently. |
| "Error handling can be a later task." | Error handling is behavior. Map it to the relevant scenario or create a scenario-backed error-path task. |
| "This infrastructure task has no spec mapping." | Mark it as infrastructure and name the scenario or task it enables. |

## Final Response After Planning

After saving or presenting the plan, respond with:

```markdown
Implementation plan saved to `specs/changes/<change-name>/tasks.md`.

Summary:
- [N] tasks
- [M] Spec Scenarios covered
- [K] infrastructure tasks
- [0 or list] open planning blockers

Two execution modes are available:
1. **Step-by-Step Mode** — implement one task at a time; review and commit after each task.
2. **Fast Mode** — implement tasks continuously; review all completed work at the end.

Which mode should be used?
```

After the user chooses a mode, transition to the implementation skill, such as `spec-driven-development` or the repository's configured execution skill.
