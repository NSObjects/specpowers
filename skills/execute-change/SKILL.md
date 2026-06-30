---
name: execute-change
description: Implement an accepted or clear change with minimal diff, direct verification, and no compatibility wrappers unless required by the contract.
---

# Execute Change

Use this mode when the expected behavior is clear enough to edit. Work through
the smallest safe slice, then apply `claim-gate` before reporting completion.

## Inputs

- User request or behavior contract.
- Relevant files and local project rules.
- Verification plan, if one exists.

## Rules

- Read the nearby implementation before editing.
- Keep the diff focused on the requested behavior.
- Remove obsolete old paths instead of adding compatibility wrappers.
- Add abstractions only when current evidence needs them.
- Use tests when they are the best evidence for behavior. For docs, plugin
  metadata, install instructions, or generated payload changes, use direct
  validation instead of pretending there is classic TDD.
- Do not mutate git state. The user owns commits, branches, pushes, resets, and
  stash operations.

## Execution Loop

1. State the target behavior and files.
2. Edit the smallest coherent slice.
3. Run the most direct validation available.
4. Inspect the diff for unrelated churn.
5. Apply `claim-gate`.
6. Report completion, gaps, and any destructive changes.

## Destructive Changes

Destructive cleanup is allowed when the user asks to remove old design or when
the behavior contract rejects compatibility. Report exactly what was removed.

