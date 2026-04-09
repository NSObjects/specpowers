---
name: designing
description: "Use when the expected behavior is agreed and the implementation approach, tradeoffs, or file boundaries still need to be decided before coding."
---

# Designing Architecture

Define **how** to implement the specified behavior. Technical decisions, architecture, and file-level planning.

**Announce at start:** "I'm using the designing skill to create the technical design."

**Role: System Architect.** You make technical decisions based on the specs. You do NOT write code.

<HARD-GATE>
Do NOT write actual code (code snippets for illustration are fine).
Do NOT skip specs — read ALL specs before designing.
Every Requirement in the specs MUST have a corresponding technical approach in the design.
Do NOT proceed to planning without user confirmation.
</HARD-GATE>

## Checklist

1. **Read specs** — understand all Requirements and Scenarios
2. **Explore codebase** — understand existing patterns, dependencies, architecture
3. **Detect existing patterns** — naming, file structure, state management, error handling
4. **Make architecture decisions** — choose approaches with documented trade-offs
5. **Design for isolation** — each unit has one purpose, clear interface, testable independently
6. **Map file changes** — which files to create, modify, delete (exact paths)
7. **Self-review** — verify all Requirements are covered, patterns are followed
8. **User confirms** — wait for explicit approval
9. **Transition** — invoke `planning` skill (Kiro: readSteering → planning.md)

## Design for Isolation and Clarity

Break the system into smaller units that each:
- Have **one clear purpose**
- Communicate through **well-defined interfaces**
- Can be **understood and tested independently**

For each unit, you should be able to answer:
- What does it do?
- How do you use it?
- What does it depend on?

**Test your design:**
- Can someone understand what a unit does without reading its internals?
- Can you change the internals without breaking consumers?
- If not, the boundaries need work.

**File size signal:** When a file grows large, that's often a signal it's doing too much. If your design puts 200+ lines in one file, consider splitting.

## Existing Pattern Detection

**BEFORE making architecture decisions, study the existing codebase:**

```
FOR each relevant directory:
  1. What naming convention is used? (camelCase, kebab-case, PascalCase)
  2. What file structure pattern? (feature-based, type-based, layer-based)
  3. What state management approach?
  4. What error handling pattern?
  5. What testing pattern? (co-located, separate /tests, __tests__)

YOUR DESIGN MUST follow these patterns unless you document why you're deviating.
```

**Deviation requires justification:** If you introduce a new pattern (e.g., a new state management approach in a project that already has one), you MUST add an Architecture Decision explaining why the existing pattern doesn't work for this case.

## Design Format

```markdown
# Design: [Change Name]

## Technical Approach
[2-3 sentences describing the overall approach]

## Architecture Decisions

### Decision: [Decision Name]
When making technology choices, invoke `search-first` (Kiro: readSteering → search-first.md) to evaluate existing solutions. Include the search decision (Adopt/Extend/Compose/Build) in the Architecture Decision.

Chose [A] over [B] because:
- [Reason 1]
- [Reason 2]

Trade-offs:
- [What we gain]
- [What we give up]

## Data Flow
[Text description or ASCII diagram showing how data moves through the system]

## File Changes
- Create: `exact/path/to/new-file.ts` — [what it does, ~estimated lines]
- Modify: `exact/path/to/existing.ts` — [what changes]
- Test: `tests/exact/path/to/test.ts` — [what it tests]
```

## Iron Laws

- **Every Requirement in specs MUST map to something in the design.** If a Requirement has no technical approach, the design is incomplete.
- **Architecture Decisions MUST have trade-offs.** "We chose X" without explaining alternatives is not a decision — it's an assertion.
- **File paths MUST be exact.** "Add a new component" is not acceptable. `src/components/ThemeToggle.tsx` is.
- **Follow existing patterns.** In existing codebases, match the established architecture unless there's a documented reason to deviate.
- **No god files.** If your design creates or modifies a file with 300+ lines of new logic, split it. Each file should have one clear responsibility.
- **Interfaces before internals.** Define how components talk to each other before designing their internals.

## Self-Review

After writing the design:
1. **Spec coverage:** Can you point to a section of the design for every Requirement in the specs?
2. **File completeness:** Are all files that will be touched listed in File Changes?
3. **Pattern consistency:** Do new files follow the project's existing naming and structure conventions?
4. **Isolation check:** Does each new file/module have one clear purpose? Could you explain what it does in one sentence?
5. **Size check:** Are any files estimated at 200+ lines? If so, can they be split?

## Red Flags

| Thought | Reality |
|---------|---------|
| "I'll put everything in one file for now, refactor later" | "Later" never comes. Design for isolation from the start. |
| "This framework/library would be perfect" | Does the project already use something for this? Use what exists. |
| "I know the best way to do this" | Check the existing codebase first. Your "best way" might conflict with established patterns. |
| "The design is obvious, I'll keep it brief" | Brief designs = vague designs = AI making stuff up during implementation. Be specific. |
| "I'll figure out the file structure during planning" | File structure IS design. If you haven't decided where code goes, you haven't designed. |
| "This is a small change, no Architecture Decisions needed" | Every design choice is a decision. Even "follow existing pattern" is a decision worth documenting. |

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "I can't know the exact file paths without starting to code" | Explore the codebase. The paths are there. If new, decide them now. |
| "Trade-offs are obvious, no need to write them down" | If they're obvious, writing them takes 30 seconds. Do it. |
| "The existing code doesn't follow any pattern" | Every codebase has patterns. You haven't looked hard enough. |

## After Designing

Save to `specs/changes/<change-name>/design.md`.

> "Technical design saved. Please review and confirm, then I'll create the implementation plan."

Wait for user confirmation. Then invoke `planning` skill (Kiro: readSteering → planning.md).
