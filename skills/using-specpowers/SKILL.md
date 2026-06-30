---
name: using-specpowers
description: Use at session start or before deciding how SpecPowers should shape a task. Routes work into the small core workflow set.
---

# Using SpecPowers

SpecPowers is a lightweight operating model for coding agents. Its job is to
choose the right work mode, keep the interface small, and prevent unsupported
claims. It is not a ceremony generator.

## Core Rule

Route the task first. Do not load multiple workflow skills unless the selected
mode reaches a point that needs them.

## Modes

Choose exactly one primary mode:

| Mode | Use When | Skill |
| --- | --- | --- |
| Direct answer | The user asks for explanation, judgment, or advice and no repository action is needed. | none |
| Read-only investigation | The user reports a bug, asks what is wrong, or scope is unclear. | `investigate` |
| Define a change | User-visible behavior, public contract, or architecture must be decided before edits. | `define-change` |
| Execute a change | Scope and expected behavior are clear enough to edit. | `execute-change` |
| Review a change | The user asks for review, merge readiness, or a second opinion on a diff. | `review-change` |
| Operate plugin | The user asks to install, repair, package, or verify the SpecPowers plugin itself. | `operate-plugin` |

`claim-gate` is not a primary mode. Use it before claiming work is complete,
fixed, passing, approved, merge-ready, or safely handed off.

`engineering-rules` is not a primary mode. Use it while writing or reviewing
code when the repository does not provide stronger local rules.

## Routing Rules

- Prefer the smallest mode that can honestly handle the request.
- Do not create proposal, spec, design, or task artifacts just because a task
  exists.
- Any user-visible behavior change needs a behavior contract. The contract may
  be inline for small work or file-backed for larger work.
- Bug reports start read-only unless the user has clearly authorized a fix.
- Review tasks stay review tasks; do not rewrite code during review unless the
  user asks for fixes.
- Platform details belong in plugin operation, not in every workflow.

## Artifact Scale

Use artifact scale only inside `define-change` or `execute-change`:

| Scale | When | Required Artifact |
| --- | --- | --- |
| S | Small, local, low-risk work. | Inline contract and verification notes. |
| M | Normal feature or bug fix with visible behavior. | Short change note with scenarios and affected files. |
| L | Cross-module, high-risk, or ambiguous work. | File-backed change brief with scenarios, design choices, and tasks. |

## Completion

Before any completion claim:

1. State the selected mode.
2. State the scope actually covered.
3. Apply `claim-gate`.
4. Report remaining gaps plainly.

