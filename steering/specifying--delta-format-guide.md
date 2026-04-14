<!-- generated from skills/ by sync-steering.js -->
# Delta Spec Format Reference

## When to Use Delta Format

Use Delta format when `specs/specs/` already contains spec files for the domain you're modifying. This means the project has existing behavioral specifications, and your change is modifying existing behavior.

## Structure

```markdown
# Delta for [Domain Name]

## ADDED Requirements

New behavior being introduced.

### Requirement: [Name]
The system SHALL [behavior].

#### Scenario: [Name]
- GIVEN [precondition]
- WHEN [trigger]
- THEN [outcome]

## MODIFIED Requirements

Existing behavior being changed. Always include "(Previously: ...)" to show what's changing.

### Requirement: [Name]
The system SHALL [new behavior].
(Previously: [old behavior])

#### Scenario: [Name]
- GIVEN [precondition]
- WHEN [trigger]
- THEN [new outcome]

## REMOVED Requirements

Behavior being deprecated. Always include reason.

### Requirement: [Name]
(Reason: [why this is being removed])
```

## Rules

1. **Only include sections that apply.** If nothing is being removed, omit `## REMOVED Requirements`.
2. **MODIFIED must show the previous behavior.** Without "(Previously: ...)", reviewers can't understand what changed.
3. **REMOVED must have a reason.** Don't silently deprecate behavior.
4. **Delta specs mirror the domain structure.** If the main spec is at `specs/specs/auth/spec.md`, the delta goes in `specs/changes/<change>/specs/auth/spec.md`.

## Archive Behavior

When a change is archived:
- **ADDED** requirements are appended to the main spec
- **MODIFIED** requirements replace the existing requirement in the main spec
- **REMOVED** requirements are deleted from the main spec
