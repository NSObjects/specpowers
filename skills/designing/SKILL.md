---
name: designing
description: "Use after specs are confirmed. Creates design.md with technical approach, architecture decisions, and file change plan."
---

# Designing Architecture

Define **how** to implement the specified behavior. Technical decisions, architecture, and file-level planning.

**Announce at start:** "I'm using the designing skill to create the technical design."

**Role: System Architect.** You make technical decisions based on the specs. You do NOT write code.

<HARD-GATE>
Do NOT write actual code (code snippets for illustration are fine).
Do NOT skip specs — read the specs before designing.
Every Requirement in the specs MUST have a corresponding technical approach in the design.
Do NOT proceed to planning without user confirmation.
</HARD-GATE>

## Checklist

1. **Read specs** — understand all Requirements and Scenarios
2. **Explore codebase** — understand existing patterns, dependencies, architecture
3. **Make architecture decisions** — choose approaches with documented trade-offs
4. **Map file changes** — which files to create, modify, delete
5. **Self-review** — verify all Requirements are covered
6. **User confirms** — wait for explicit approval
7. **Transition** — invoke `planning` skill

## Design Format

```markdown
# Design: [Change Name]

## Technical Approach
[2-3 sentences describing the overall approach]

## Architecture Decisions

### Decision: [Decision Name]
Chose [A] over [B] because:
- [Reason 1]
- [Reason 2]

Trade-offs:
- [What we gain]
- [What we give up]

## Data Flow
[Text description or ASCII diagram showing how data moves through the system]

## File Changes
- Create: `exact/path/to/new-file.ts` — [what it does]
- Modify: `exact/path/to/existing.ts` — [what changes]
- Test: `tests/exact/path/to/test.ts` — [what it tests]
```

## Iron Laws

- **Every Requirement in specs MUST map to something in the design.** If a Requirement has no technical approach, the design is incomplete.
- **Architecture Decisions MUST have trade-offs.** "We chose X" without explaining alternatives is not a decision — it's an assertion.
- **File paths MUST be exact.** "Add a new component" is not acceptable. `src/components/ThemeToggle.tsx` is.
- **Follow existing patterns.** In existing codebases, match the established architecture unless there's a documented reason to deviate.

## Self-Review

After writing the design:
1. **Spec coverage:** Can you point to a section of the design for every Requirement in the specs?
2. **File completeness:** Are all files that will be touched listed in File Changes?
3. **Pattern consistency:** Do new files follow the project's existing naming and structure conventions?

## After Designing

Save to `specs/changes/<change-name>/design.md`.

> "Technical design saved. Please review and confirm, then I'll create the implementation plan."

Wait for user confirmation. Then invoke `planning` skill.
