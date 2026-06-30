---
name: define-change
description: Define behavior and architecture before edits when a change is user-visible, risky, or not yet bounded.
---

# Define Change

Use this mode to turn intent into a behavior contract. Do not split the work
into separate ceremony phases. Choose the smallest artifact scale that makes
the next edit safe.

## Behavior Contract

Every behavior-changing task needs these facts:

- Problem: the concrete problem being solved.
- Users: who observes or depends on the behavior.
- In scope: behavior that will change.
- Out of scope: behavior that must not change.
- Scenarios: happy path plus meaningful edge or failure cases.
- Design choices: only the choices needed to explain the implementation path.
- Verification: commands, checks, logs, or manual evidence that will prove it.

## Scale

### Scale S

Use for small local work. Keep the contract inline in the conversation.

### Scale M

Use for ordinary features or fixes. Create one concise change note if the
repository already keeps change artifacts; otherwise keep it inline.

### Scale L

Use for cross-module, high-risk, or still-unclear work. Create a file-backed
brief with the behavior contract, design choices, task slices, and open risks.

## Gates

- If user-visible behavior is still ambiguous, ask one blocking question.
- If only implementation details are ambiguous, state the assumption and keep
  going.
- Do not add speculative extension points.
- Do not preserve old behavior unless the contract says it remains supported.

## Handoff

When the contract is sufficient, hand off to `execute-change` with:

- Artifact scale.
- Behavior contract.
- Files likely to change.
- Verification plan.
- Known risks.
