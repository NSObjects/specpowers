---
name: planning
description: "Use after design is confirmed. Creates tasks.md with fine-grained TDD tasks, each mapped to specific Spec scenarios."
---

# Planning Tasks

Break the design into bite-sized, TDD-driven tasks. Each task maps back to a specific Spec scenario.

**Announce at start:** "I'm using the planning skill to create the implementation plan."

**Role: Tech Lead.** You decompose work into executable steps. Every step is complete, tested, specific.

<HARD-GATE>
Every Task MUST include a `Covers specs:` field mapping to a Spec Scenario.
Every code step MUST include actual code — no placeholders.
Do NOT proceed to execution without user confirmation.
</HARD-GATE>

## Checklist

1. **Read specs AND design** — understand requirements and technical approach
2. **Map file structure** — which files to create/modify per the design
3. **Decompose into Tasks** — each Task covers one or more Spec Scenarios
4. **Write TDD steps** — failing test → verify red → implement → verify green → commit
5. **Self-review** — spec coverage, placeholder scan, consistency check
6. **User confirms** — wait for explicit approval
7. **Transition** — invoke `spec-driven-development` skill

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**
- "Write the failing test" — step
- "Run it to make sure it fails" — step
- "Implement the minimal code to make the test pass" — step
- "Run the tests and make sure they pass" — step
- "Commit" — step

## Task Format

````markdown
# Tasks

## 1. [Module Name]

### Task 1.1: [Specific Behavior]
**Covers specs:** `specs/[domain]/spec.md` → Requirement "[Name]" → Scenario "[Name]"

- [ ] **Step 1: Write failing test**
  Acceptance from spec: GIVEN [precondition] WHEN [action] THEN [expected]
  ```typescript
  test('[test name from Spec scenario]', () => {
      // GIVEN
      const context = setupTestContext();
      // WHEN
      const result = context.doAction();
      // THEN
      expect(result).toBe(expected);
  });
  ```

- [ ] **Step 2: Run test, verify RED**
  Run: `npm test path/to/test.ts`
  Expected: FAIL — "[specific failure reason]"

- [ ] **Step 3: Implement minimal code**
  ```typescript
  // Complete code, no placeholders
  export function doAction(): Result {
      return expected;
  }
  ```

- [ ] **Step 4: Run test, verify GREEN**
  Run: `npm test path/to/test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add path/to/files
  git commit -m "feat: [description]"
  ```
````

## No Placeholders

Every step must contain the actual content. These are **plan failures** — never write them:
- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above" (without actual test code)
- "Similar to Task N" (repeat the code — tasks may be read independently)
- Steps that describe what to do without showing how (code blocks required for code steps)

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
3. **Type consistency:** Do the types, method signatures, and names used in later tasks match earlier tasks?
4. **Test-first check:** Does every Task start with writing a failing test?

Fix issues inline. If you find a Spec Scenario with no Task, add the Task.

## After Planning

Save to `specs/changes/<change-name>/tasks.md`.

> "Implementation plan saved. [N] Tasks covering [M] Spec Scenarios.
>
> Two execution modes available:
> 1. **逐任务模式** (默认) — I execute one Task at a time, you review + commit after each
> 2. **快速模式** — I execute all Tasks continuously, you review everything at the end
>
> Which mode?"

Wait for user choice. Then invoke `spec-driven-development` skill.
