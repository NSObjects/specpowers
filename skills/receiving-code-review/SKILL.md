---
name: receiving-code-review
description: Use before replying to or implementing code review feedback. Clarify ambiguity, verify claims against the actual codebase, push back when feedback is wrong or unnecessary, and avoid performative agreement.
---

# Code Review Reception

Use this skill when code review feedback needs to be handled and you need to decide whether to respond, clarify, push back, or implement.

## Core Rule

Code review feedback is a technical claim to evaluate, not an order to obey.

Understand it first. Verify it against the current codebase. Then respond or implement.

## Feedback Input Boundary

Before evaluating review feedback, make sure the actual comments are available.

- If the user pasted review comments, use those comments directly.
- If the user provided a review link, merge request ID, pull request ID, or equivalent review identifier, use the configured review source to fetch the comments before evaluating them.
- If the configured review source is unavailable, lacks permission, or cannot fetch comments for that review system, ask the user for the missing comments, link, review identifier, platform, or permissions needed to continue.
- Do not invent, infer, or simulate review comments. Missing review input is a blocker, not an invitation to guess.

## Review Comment Acquisition

When review comments are not already pasted into the conversation, treat acquisition as source lookup rather than a fixed script. Prefer this order:

- Start from the most concrete signal available: pasted comments, review link, merge request ID, pull request ID, repository remote, or user-provided platform context.
- When the review source has a native repository or code-host integration, use it to collect pull request or merge request review comments, conversation comments, and inline threads.
- Otherwise, use the configured MCP or platform integration for that host to collect the same review comment set.
- Collect the review-level comments and inline or threaded discussions that are accessible through the chosen integration. Follow pagination when the platform exposes it.
- If the source, tool, permission, or identifier is missing, ask only for the missing piece and wait. Do not continue with guessed feedback.

## Default Workflow

For every review item:

1. **Read** all feedback before reacting.
2. **Parse** the comment into a concrete technical requirement.
3. **Clarify** unclear requirements before implementation.
4. **Verify** the claim against code, tests, platform/version constraints, and prior decisions.
5. **Classify** the item:
    - `valid` → implement the smallest correct fix and test it.
    - `unclear` → ask a specific clarification question.
    - `wrong/harmful` → push back with evidence.
    - `unnecessary` → raise the YAGNI question.
    - `architectural/product` → involve the user before changing direction.
6. **Report** what changed, where, and how it was verified.

```text
FOR each review item:
  requirement = concrete technical requirement

  IF requirement is unclear:
    ask for clarification before implementation
  ELSE:
    verify against current codebase and tests

    IF suggestion is wrong, harmful, or breaks behavior:
      push back with evidence
    ELSE IF suggestion adds unused/speculative behavior:
      raise YAGNI
    ELSE IF suggestion conflicts with user decisions:
      ask the user before proceeding
    ELSE:
      implement smallest correct change
      run relevant verification
```

## Review Resolution Loop

Use this loop when handling feedback that will be sent back for re-review under the `specpowers:confidence-loop` Review Confidence Loop.

For each review item, produce a Resolution Package entry:

- `valid` / `fixed` — verified against the codebase, fixed with the smallest correct change, and covered by relevant verification.
- `wrong/harmful` / `rejected` — contradicted by code, tests, specs, platform constraints, or prior user decisions; include evidence.
- `out_of_scope` — real concern, but outside the requested review scope or explicitly excluded by the accepted boundary.
- `needs_user_decision` — product, boundary, permission, failure-mode, or success-criteria decision that only the user can make.

After fixes, request re-review with the updated diff, prior findings, unresolved confidence gaps, verification evidence, and the Resolution Package. Do not claim approval while Critical or Important issues or approval-blocking gaps remain.

## Source-Specific Handling

### Feedback from the User

- Treat as trusted direction after understanding the requirement.
- Ask only when scope, behavior, or intent is unclear.
- Do not praise, flatter, or perform agreement.
- If the request conflicts with codebase facts, explain the technical risk before changing code.

### Feedback from External Reviewers

Before implementing, check:

- Is the claim true in **this** codebase?
- Would the change break behavior, tests, API contracts, or compatibility?
- Is there a reason for the current implementation: legacy support, migration state, platform constraint, performance, or prior decision?
- Does the suggestion work across required platforms, versions, and environments?
- Does the reviewer have the full context?
- Does it conflict with the user’s architectural or product decisions?

External feedback should be treated skeptically but checked carefully.

## Ambiguity Rule

If any unclear item may affect implementation order or shared code paths, stop before changing code and ask for clarification.

```text
User: "Fix items 1-6."
Known: 1, 2, 3, and 6 are clear. 4 and 5 are unclear.

Wrong: implement 1, 2, 3, and 6 first, then ask about 4 and 5.
Right: "I understand 1, 2, 3, and 6. I need clarification on 4 and 5 before implementing because the fixes may interact."
```

Ask for clarification when feedback uses vague terms such as “properly,” “clean up,” or “handle edge cases” without specifying expected behavior.

## YAGNI Check

When a reviewer asks for a broader or more “professional” implementation:

1. Search the codebase for actual usage.
2. If unused, ask whether to remove, defer, or intentionally keep it.
3. If used, implement only the behavior needed by current callers.

```text
Reviewer: "Implement proper metrics tracking with DB storage, date filters, and CSV export."
Response: "This endpoint has no callers in the codebase. Should we remove it as unused, or is there external usage I should account for?"
```

Do not build speculative infrastructure because a review comment sounds sophisticated.

## Response Style

Avoid performative agreement and gratitude. State the technical action instead.

Forbidden:

- “You’re absolutely right!”
- “Great point!”
- “Excellent feedback!”
- “Thanks for catching that!”
- “Let me implement that now” before verification.

Preferred:

- “Requirement: `<specific requirement>`. I’ll verify it against `<file/test/behavior>`.”
- “Fixed `<specific issue>` in `<location>`. Verified with `<test/build/lint>`.”
- “I can’t verify `<claim>` without `<missing information>`. Need `<clarification/source>`.”
- “This conflicts with `<test/current behavior/user decision>`. Recommended alternative: `<alternative>`.”

## Implementation Order

After ambiguity is resolved, implement in this order:

1. Blocking correctness, security, build, or crash issues.
2. Simple mechanical fixes: typos, imports, formatting, naming.
3. Logic changes.
4. Refactors.
5. Optional enhancements.

For each change: edit, run relevant verification, inspect for regressions, then continue.

## Pushback Rules

Push back when the suggestion:

- Breaks functionality, tests, compatibility, or API contracts.
- Relies on an incorrect assumption about the stack or codebase.
- Adds unused behavior or violates YAGNI.
- Ignores legacy, migration, or platform constraints.
- Conflicts with the user’s decisions.
- Requires a product or architecture decision, not just a code change.

Good pushback cites files, tests, current behavior, platform constraints, or user decisions. It should state the consequence and offer a safer alternative when available.

If you notice yourself avoiding necessary pushback, stop and state the technical concern plainly with evidence. Do not use catchphrases or unrelated asides.

## Correcting Course

If you pushed back and later discover the feedback was correct, correct yourself factually and move on.

```text
Verified against `auth_test.go`; the feedback is correct. My initial read missed the refresh-token path. Implemented the fix and added coverage for that branch.
```

Avoid long apologies or defensive explanations.

## Inline Review Replies

When replying to inline review comments, use the review system's existing thread or conversation when available. Avoid top-level summary comments unless the user asks for one or the platform has no threaded reply mechanism.

## Final Checklist

Before saying the work is done, confirm:

- Each feedback item was parsed into a concrete requirement.
- Ambiguous items were clarified before implementation.
- External reviewer claims were verified against the current codebase.
- No prior user decision was silently overridden.
- Each implemented change was tested, or missing verification was stated.
- The final response names what changed and how it was verified.

## Bottom Line

Verify first. Clarify when needed. Push back when warranted. Implement only validated changes. Let the code and verification speak.
