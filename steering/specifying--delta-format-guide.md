<!-- generated from skills/ by sync-steering.js -->
# Delta Spec Format Reference

Delta specs describe how an accepted change alters existing behavioral specifications. They prevent accidental rewrites by separating new behavior, changed behavior, and removed behavior.

## When to Use Delta Format

Use Delta Format when `specs/specs/` contains existing specs.

- Existing domain with changed behavior: write a Delta spec for that domain.
- Existing domain with new behavior: use `ADDED Requirements`.
- Existing domain with changed or removed scenarios: use `MODIFIED Requirements` and include the complete updated Requirement.
- New domain in an existing project: write a Delta spec for the new domain with `ADDED Requirements`.
- No existing specs anywhere: use Greenfield Format instead.

## Required File Location

```text
specs/changes/<change-name>/specs/<domain>/spec.md
```

Use the same `<domain>` name as the existing spec whenever the domain already exists. For example, if the current spec is:

```text
specs/specs/authentication/spec.md
```

then the Delta spec goes to:

```text
specs/changes/<change-name>/specs/authentication/spec.md
```

## Section Order

Use this order and omit empty sections:

1. `## ADDED Requirements`
2. `## MODIFIED Requirements`
3. `## REMOVED Requirements`

## Structure

```markdown
# Delta for [Domain Name]

## ADDED Requirements

### Requirement: [New Behavior]
The system SHALL [specific observable behavior].

#### Scenario: [Happy Path Name]
- GIVEN [precondition]
- WHEN [single trigger/action/event]
- THEN [observable outcome]

#### Scenario: [Edge or Error Case Name]
- GIVEN [edge/error precondition]
- WHEN [single trigger/action/event]
- THEN [observable outcome]

## MODIFIED Requirements

### Requirement: [Existing Requirement Name]
The system SHALL [complete updated behavior].
(Previously: [previous behavior from the current spec])

#### Scenario: [Happy Path Name]
- GIVEN [precondition]
- WHEN [single trigger/action/event]
- THEN [updated observable outcome]

#### Scenario: [Edge or Error Case Name]
- GIVEN [edge/error precondition]
- WHEN [single trigger/action/event]
- THEN [updated observable outcome]

## REMOVED Requirements

### Requirement: [Deprecated Behavior]
(Reason: [specific reason this behavior is removed])
```

## Rules by Section

### ADDED Requirements

Use for behavior that does not exist in the current spec.

Rules:

- Include the complete Requirement statement.
- Include at least one happy-path scenario and one edge/error scenario.
- Do not duplicate existing Requirements under a new name.

### MODIFIED Requirements

Use for any change to an existing Requirement, including changed behavior, changed constraints, added scenarios, removed scenarios, or changed expected outcomes.

Rules:

- Use the existing Requirement title unless renaming is part of the change.
- Include the complete updated Requirement, not only the changed lines.
- Include all scenarios that should remain after archive.
- Include `(Previously: ...)` immediately after the updated Requirement statement.
- Base `(Previously: ...)` on the current spec whenever available.
- Include at least one happy-path scenario and one edge/error scenario.

Why complete replacement matters: during archive, the modified Requirement replaces the old Requirement. Any omitted retained scenario may be lost.

### REMOVED Requirements

Use for behavior that should no longer exist.

Rules:

- Include the existing Requirement title.
- Include a specific `(Reason: ...)`.
- Do not include scenarios unless they clarify what is being removed.
- Do not use `REMOVED` for behavior that is merely changing; use `MODIFIED` instead.

## Archive Behavior

When a change is archived:

| Delta Section | Archive Action |
|---|---|
| `ADDED Requirements` | Append these Requirements to the target domain spec. |
| `MODIFIED Requirements` | Replace the matching existing Requirements in the target domain spec. |
| `REMOVED Requirements` | Delete the matching existing Requirements from the target domain spec. |

## Common Decisions

| Situation | Use |
|---|---|
| A brand-new behavior in an existing domain | `ADDED Requirements` |
| A new scenario is added to an existing Requirement | `MODIFIED Requirements` |
| An expected outcome changes | `MODIFIED Requirements` |
| A validation rule becomes stricter or looser | `MODIFIED Requirements` |
| A behavior is deprecated with no replacement | `REMOVED Requirements` |
| A behavior is replaced by a different behavior | `MODIFIED Requirements`, and optionally `ADDED Requirements` if the replacement is a separate behavior |
| The project has no existing specs | Greenfield Format, not Delta Format |

## Delta Review Checklist

Before saving a Delta spec, verify:

- Empty sections are omitted.
- Unchanged Requirements are omitted.
- Every `ADDED` Requirement is complete and testable.
- Every `MODIFIED` Requirement is complete, not a partial diff.
- Every `MODIFIED` Requirement includes `(Previously: ...)`.
- Every `REMOVED` Requirement includes `(Reason: ...)`.
- Active Requirements include both happy-path and edge/error scenarios.
- No implementation details appear in Requirement statements or Scenarios.
