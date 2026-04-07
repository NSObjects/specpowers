---
name: specifying
description: "Use after proposal is confirmed. Creates structured behavioral specifications with GIVEN/WHEN/THEN scenarios. The spine of the entire workflow — cannot be skipped."
---

# Specifying Behavior

Define **what** the system should do using structured requirements and testable scenarios. This is the most critical artifact — every downstream task maps back to these specs.

**Announce at start:** "I'm using the specifying skill to define behavioral specifications."

**Role: QA Architect.** You define observable behavior contracts. You do NOT think about implementation.

<HARD-GATE>
Do NOT include class names, function names, framework names, or any implementation details.
Do NOT use vague language: "should work correctly", "handles various cases", "appropriate error handling".
Every Requirement MUST have at least one Scenario.
Every Scenario MUST use GIVEN/WHEN/THEN format.
Do NOT proceed to designing without user confirmation of specs.
</HARD-GATE>

## Checklist

1. **Detect project type** — check if `specs/specs/` has existing specs (brownfield → Delta format)
2. **Read the proposal** — understand intent, scope, success criteria
3. **Identify domains** — which behavioral domains does this change touch?
4. **Write specs** — one spec file per domain, in `specs/changes/<change-name>/specs/<domain>/spec.md`
5. **Self-review** — testability, coverage, ambiguity, implementation leakage
6. **User confirms** — wait for explicit approval
7. **Transition** — invoke `designing` skill

## Greenfield Format (新项目，无已有 specs)

```markdown
# [Domain] Specification

## Purpose
[What this domain is responsible for]

## Requirements

### Requirement: [Behavior Name]
The system SHALL [observable behavior description].

#### Scenario: [Scenario Name]
- GIVEN [precondition]
- WHEN [trigger action]
- THEN [expected outcome]
- AND [additional expectation]

#### Scenario: [Edge Case Name]
- GIVEN [edge case precondition]
- WHEN [trigger action]
- THEN [expected outcome]
```

## Brownfield Format (已有项目，Delta 增量)

When `specs/specs/` already contains spec files, use Delta format:

```markdown
# Delta for [Domain]

## ADDED Requirements

### Requirement: [New Behavior]
The system SHALL [behavior].

#### Scenario: [Scenario Name]
- GIVEN [precondition]
- WHEN [trigger]
- THEN [outcome]

## MODIFIED Requirements

### Requirement: [Changed Behavior]
The system SHALL [new behavior].
(Previously: [old behavior])

#### Scenario: [Updated Scenario]
- GIVEN [precondition]
- WHEN [trigger]
- THEN [new expected outcome]

## REMOVED Requirements

### Requirement: [Deprecated Behavior]
(Reason: [why this is being removed])
```

### Delta Sections

| Section | Meaning | What Happens on Archive |
|---------|---------|------------------------|
| `## ADDED Requirements` | New behavior | Appended to main spec |
| `## MODIFIED Requirements` | Changed behavior | Replaces existing requirement |
| `## REMOVED Requirements` | Deprecated behavior | Deleted from main spec |

## RFC 2119 Keywords

Use these keywords to communicate requirement strength:

| Keyword | Meaning |
|---------|---------|
| **MUST / SHALL** | Absolute requirement |
| **SHOULD** | Recommended, but exceptions exist |
| **MAY** | Optional |

## Iron Laws

- **No implementation details in specs.** If you can change the implementation without changing the spec, the spec is correct. If you can't, the spec contains implementation details — remove them.
- **Every Requirement is testable.** If you can't write a test for it, it's too vague.
- **Every Scenario has GIVEN/WHEN/THEN.** No exceptions. No "the system works correctly" hand-waving.
- **Edge cases are mandatory.** Every Requirement MUST have at least one happy path AND one edge case / error scenario.

## Self-Review

After writing specs:

1. **Testability scan:** For each Scenario, could you write an automated test? If not, make it more concrete.
2. **Coverage check:** Does every item in the proposal's "In scope" have a corresponding Requirement?
3. **Ambiguity check:** Could any Requirement be interpreted two different ways? If so, pick one and make it explicit.
4. **Implementation leakage:** Are there class names, function names, or framework references? Remove them.
5. **Edge case check:** Does every Requirement have at least one non-happy-path Scenario?

Fix issues inline. No need to re-review — just fix and move on.

## Red Flags

| Thought | Reality |
|---------|---------|
| "This requirement is obvious, no need for scenarios" | If it's obvious, the scenario takes 30 seconds to write. Write it. |
| "I'll add the edge cases later" | You won't. Edge cases discovered during specifying save hours during implementation. |
| "The system should handle errors appropriately" | WHAT errors? WHAT handling? Be specific or delete it. |
| "I need to know the framework to write good specs" | No. Specs describe behavior, not implementation. Framework is irrelevant. |
| "This is just a small change, full specs are overkill" | Small changes with unspecified behavior cause the most bugs. Write the spec. |

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Tests will define the behavior" | Tests without specs test what you built, not what you should have built. |
| "The proposal is clear enough" | Proposals describe intent. Specs describe verifiable behavior. Different things. |
| "Delta format is too verbose for this change" | Delta format prevents you from accidentally redefining existing behavior. Use it. |

## After Specifying

Save specs to `specs/changes/<change-name>/specs/<domain>/spec.md`.

> "Behavioral specifications saved. [N] Requirements with [M] Scenarios defined. Please review and confirm, then I'll create the technical design."

Wait for user confirmation. Then invoke `designing` skill.
