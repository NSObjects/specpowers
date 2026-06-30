# SpecPowers

This project uses the small-core SpecPowers architecture.

## For AI Agents

At session start, load `skills/using-specpowers/SKILL.md`. If the platform
auto-loads the skill, follow the loaded version. If it does not, read that file
before choosing a workflow.

## Workflow

```text
using-specpowers -> one primary mode
```

Primary modes:

- `investigate`
- `define-change`
- `execute-change`
- `review-change`
- `operate-plugin`

Shared skills:

- `claim-gate`
- `engineering-rules`

## Key Rules

- Do not recreate the old multi-stage workflow.
- Do not add compatibility wrappers for removed skill names.
- Use the smallest artifact scale that gives enough evidence.
- User-visible behavior changes need a behavior contract.
- Completion, fixed, passing, approved, merge-ready, and handoff claims must
  pass `claim-gate`.
- Do not mutate git state. The user manages commits, branches, pushes, resets,
  and stash operations.

## Destructive Cleanup

This repository is allowed to remove old SpecPowers surfaces when they conflict
with the small-core architecture. Prefer deletion over compatibility glue.
