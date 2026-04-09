---
name: proposing
description: "Use when a concrete change has been identified and its intent, scope, constraints, or success criteria need to be aligned before writing specs."
---

# Proposing Changes

Capture the intent, scope, and high-level approach for a change. This is the **first artifact** in the spec-driven workflow.

**Announce at start:** "I'm using the proposing skill to create a change proposal."

**Role: Product Manager.** You are capturing WHAT and WHY, not HOW.

<HARD-GATE>
Do NOT write code, choose frameworks, or discuss implementation details. Those belong in `designing`.
Do NOT write behavioral specs. Those belong in `specifying`.
Do NOT proceed to specifying without user confirmation of the proposal.
</HARD-GATE>

## Checklist

1. **Create change directory** — `specs/changes/<change-name>/`
2. **Ask clarifying questions** (if not already explored) — intent, scope, constraints
3. **Write proposal.md** — intent, scope, approach, success criteria
4. **Self-review** — check for completeness and clarity
5. **User confirms** — wait for explicit approval
6. **Transition** — invoke `specifying` skill (Kiro: readSteering → specifying.md)

## Change Directory

Create the change folder structure:

```
specs/changes/<change-name>/
├── proposal.md          ← this skill creates this
├── specs/               ← specifying skill creates these
├── design.md            ← designing skill creates this
└── tasks.md             ← planning skill creates this
```

## Proposal Format

```markdown
# Proposal: [Change Name]

## Intent
[Why are we doing this? What problem does it solve?]

## Scope

### In scope
- [Specific deliverable 1]
- [Specific deliverable 2]

### Out of scope
- [Explicitly excluded item 1]
- [Explicitly excluded item 2]

## Approach
[One paragraph describing the high-level approach. No framework names, no class names, no implementation details.]

## Success Criteria
- [Observable outcome 1]
- [Observable outcome 2]
```

## Iron Laws

- **Every proposal MUST have an "Out of scope" section.** Unbounded scope is the #1 cause of failed AI implementations.
- **Approach section MUST NOT contain implementation details.** "Use React Context" is too specific. "State management via framework-native context" is acceptable.
- **Success Criteria MUST be observable.** "Code is clean" is not observable. "User can toggle between light and dark themes" is observable.

## Self-Review

After writing the proposal:
1. **Scope check:** Is "Out of scope" specific enough? Could someone add scope creep by arguing "it wasn't explicitly excluded"?
2. **Clarity check:** Could someone read this proposal and understand what we're building without asking questions?
3. **Size check:** Is this one logical unit of work? If it covers multiple independent features, suggest splitting.

## Red Flags

| Thought | Reality |
|---------|---------|
| "The approach section needs more detail" | That's what design.md is for. Keep proposal high-level. |
| "Let me also draft the specs" | One artifact at a time. Proposal first, get confirmation. |
| "This is obvious, skip the proposal" | Unwritten assumptions cause the most rework. Write it down. |
| "Out of scope isn't needed for small changes" | Small changes grow. Boundaries matter most when they seem unnecessary. |

## After the Proposal

Save to `specs/changes/<change-name>/proposal.md`.

> "Proposal saved to `specs/changes/<change-name>/proposal.md`. Please review and confirm, then I'll define the behavioral specifications."

Wait for user confirmation. Then invoke `specifying` skill (Kiro: readSteering → specifying.md).
