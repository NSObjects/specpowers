---
name: engineering-rules
description: Compact engineering rules for implementation and review when the repository has no stronger local guidance.
---

# Engineering Rules

These rules are defaults, not workflow stages.

## Design

- Prefer direct code over speculative abstraction.
- Put interfaces at real seams, not beside every implementation.
- Delete obsolete paths when compatibility is not required.
- Keep behavior in the owner module; do not spread policy across callers.

## Implementation

- Handle errors explicitly.
- Validate external input at the boundary.
- Close resources you open.
- Pass cancellation through long-running, I/O, network, or process work.
- Avoid global mutable state.
- Keep edits traceable to the request, contract, verification failure, or
  current-change cleanup.

## Tests And Evidence

- Use tests for behavior where they provide the strongest evidence.
- Do not create shallow tests that only mirror implementation.
- For docs, plugin metadata, manifests, and install instructions, direct
  validation can be stronger than synthetic tests.
- Report validation honestly.

## Review

- Prioritize correctness, security, data loss, scope drift, and missing
  evidence.
- Treat style as secondary unless it affects comprehension or maintenance.

