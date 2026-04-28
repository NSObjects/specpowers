<!-- generated from skills/ by sync-steering.js -->
---
name: specifying
description: "Use after a change intent or proposal has been accepted, before design or coding, when expected system behavior must be defined as precise, reviewable, testable requirements with GIVEN/WHEN/THEN scenarios. Produces specs under specs/changes/<change-name>/specs/."
---

# Specifying Behavior

Define **what the system must do**, not how it will be built. The output is a behavioral contract that downstream design, implementation, and tests must trace back to.

**Announce at start:** "I'm using the specifying skill to define behavioral specifications."

**Role:** QA Architect. Focus on observable behavior, acceptance criteria, edge cases, and reviewability. Do **not** design or implement the solution.

## Non-Negotiable Gates

- Do **not** include implementation details: class names, function names, framework names, database tables, internal algorithms, data structures, test tools, package names, or code-level architecture.
- Do **not** use vague language such as "works correctly", "handles various cases", "appropriate error handling", "seamless", "robust", "intuitive", or "etc.".
- Every active Requirement in `ADDED` or `MODIFIED` sections MUST have testable scenarios.
- Every active Requirement MUST include at least one happy-path scenario and one edge/error scenario.
- Every Scenario MUST use `GIVEN` / `WHEN` / `THEN`. Use `AND` only for additional observable outcomes.
- Do **not** proceed to design, implementation, or test writing until the user explicitly confirms the specifications.

## Inputs to Establish

Use the accepted proposal and repository context to determine:

- `change-name`: use the provided change name; otherwise derive a short kebab-case name from the proposal.
- Affected behavioral domains.
- In-scope behavior, out-of-scope behavior, success criteria, actors, triggers, business rules, permissions, validations, notifications, and failure modes.
- Existing specs under `specs/specs/`, if any.

If a behavior is underspecified but not blocking, make a conservative assumption and list it in the final summary for user confirmation. Ask a clarification question only when a testable spec cannot be written without it.

## Workflow

1. **Read the accepted proposal**
   - Extract user-visible outcomes, rules, boundaries, and exclusions.
   - Convert intent into observable behavior.

2. **Detect project/spec mode**
   - If `specs/specs/` has no existing specs: use **Greenfield Format**.
   - If `specs/specs/` has existing specs: use **Delta Format** for every affected domain.
   - Before writing a Delta spec, read the current spec for the affected domain when it exists.
   - For a new domain in an existing project, still use Delta Format with `ADDED Requirements`.

3. **Identify domains**
   - Create one spec file per behavioral domain.
   - Prefer existing domain names when modifying existing specs.
   - Use concise, stable, behavior-oriented domain names such as `authentication`, `billing`, `notifications`, or `data-export`.

4. **Write requirements**
   - Each Requirement describes one externally observable behavior contract.
   - Start requirement statements with `The system SHALL ...` unless a weaker RFC 2119 keyword is intentionally justified.
   - Keep Requirement titles behavior-oriented, not implementation-oriented.

5. **Write scenarios**
   - Each Scenario must be independently testable.
   - `GIVEN` states preconditions and relevant data.
   - `WHEN` states a single trigger, action, or event.
   - `THEN` states the primary observable result.
   - `AND` states additional observable outcomes, state changes, visibility rules, notifications, or constraints.

6. **Self-review and fix inline**
   - Remove ambiguity, implementation leakage, duplication, and untestable claims.
   - Confirm every in-scope proposal item maps to at least one Requirement.
   - Confirm every active Requirement has both happy-path and edge/error coverage.

7. **Save and request confirmation**
   - Save files to `specs/changes/<change-name>/specs/<domain>/spec.md`.
   - Summarize changed files, Requirement count, Scenario count, assumptions, and any intentionally excluded behavior.
   - Ask the user to review and explicitly confirm.

8. **Transition only after approval**
   - After explicit user confirmation, invoke the `designing` skill.
   - For Kiro workflows: read steering context, then use `designing.md`.

## Greenfield Format

Use this format only when the project has no existing behavioral specs.

```markdown
# [Domain] Specification

## Purpose
[One sentence describing what this domain is responsible for.]

## Requirements

### Requirement: [Behavior Name]
The system SHALL [specific observable behavior].

#### Scenario: [Happy Path Name]
- GIVEN [precondition, actor, and relevant data]
- WHEN [single trigger/action/event]
- THEN [observable expected outcome]
- AND [additional observable outcome, if needed]

#### Scenario: [Edge or Error Case Name]
- GIVEN [edge/error precondition]
- WHEN [single trigger/action/event]
- THEN [observable expected outcome]
```

## Delta Format

Use this format when `specs/specs/` contains existing specs. Delta specs describe only the behavior added, changed, or removed by the accepted change.

Read `delta-format-guide.md` when writing Delta specs.

```markdown
# Delta for [Domain]

## ADDED Requirements

### Requirement: [New Behavior]
The system SHALL [specific observable behavior].

#### Scenario: [Happy Path Name]
- GIVEN [precondition]
- WHEN [trigger]
- THEN [outcome]

#### Scenario: [Edge or Error Case Name]
- GIVEN [edge/error precondition]
- WHEN [trigger]
- THEN [outcome]

## MODIFIED Requirements

### Requirement: [Existing Behavior Name]
The system SHALL [complete updated behavior].
(Previously: [behavior from the current spec that is being replaced])

#### Scenario: [Happy Path Name]
- GIVEN [precondition]
- WHEN [trigger]
- THEN [updated outcome]

#### Scenario: [Edge or Error Case Name]
- GIVEN [edge/error precondition]
- WHEN [trigger]
- THEN [updated outcome]

## REMOVED Requirements

### Requirement: [Deprecated Behavior]
(Reason: [specific reason this behavior is removed])
```

### Delta Rules

- Include only sections that apply; omit empty sections.
- `ADDED` contains complete new Requirements.
- `MODIFIED` contains the complete updated Requirement, not only changed fragments. If the updated Requirement should retain existing scenarios, restate them.
- `MODIFIED` MUST include `(Previously: ...)` using the current spec as the source whenever available.
- A change that adds, removes, or changes scenarios for an existing Requirement is a `MODIFIED` Requirement.
- `REMOVED` entries require a specific reason and do not need scenarios.
- Do not restate unchanged Requirements.

## RFC 2119 Keyword Use

| Keyword | Use |
|---|---|
| **SHALL / MUST** | Mandatory behavior with no allowed exception. Prefer `SHALL` for requirements. |
| **SHOULD** | Recommended behavior with known exceptions. State or imply the exception clearly. |
| **MAY** | Optional behavior. Use sparingly for explicitly allowed choices. |

## Quality Bar

A specification is acceptable only when:

- A tester can write pass/fail tests from the scenarios without asking how the system is implemented.
- A designer can propose multiple implementations that still satisfy the same specs.
- A reviewer can trace each in-scope proposal item to a Requirement.
- A future maintainer can tell exactly which behavior changed, especially in Delta specs.
- No Requirement depends on hidden internal mechanics.

## Self-Review Checklist

Before saving, verify:

1. **Behavioral focus:** Does every Requirement describe externally observable behavior?
2. **Testability:** Can each Scenario be tested with clear pass/fail criteria?
3. **Coverage:** Does every in-scope proposal item have a corresponding Requirement?
4. **Edge cases:** Does every active Requirement include happy-path and edge/error coverage?
5. **Ambiguity:** Could any Requirement or Scenario be interpreted in two valid ways?
6. **Implementation leakage:** Are there code, framework, database, package, or architecture references?
7. **Delta integrity:** For Delta specs, are unchanged Requirements omitted, modified Requirements complete, and removed Requirements justified?

Fix issues immediately before presenting the specs.

## Red Flags and Corrections

| Red Flag | Correction |
|---|---|
| "The system should handle errors appropriately." | Name the exact error condition and expected observable result. |
| "The feature works for all users." | Define which actors, permissions, states, and exclusions apply. |
| "Various edge cases are supported." | Write a separate scenario for each relevant edge/error condition. |
| "The implementation validates the input." | Specify the invalid input and what the user/system observes. |
| "This is a small change, no spec needed." | Small changes still need at least one Requirement with scenarios. |
| "Only one scenario is enough." | Add happy-path and edge/error coverage. |
| "This modified Requirement only needs the changed scenario." | In Delta Format, include the complete updated Requirement because it replaces the old one on archive. |

## Final Response Template

After saving specs, respond with:

```text
Behavioral specifications saved.

Files:
- specs/changes/<change-name>/specs/<domain>/spec.md

Summary:
- Requirements: [N]
- Scenarios: [M]
- Assumptions: [brief list or "None"]
- Excluded behavior: [brief list or "None"]

Please review and confirm the specifications. After confirmation, I will create the technical design.
```
