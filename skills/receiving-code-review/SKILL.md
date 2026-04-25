---
name: receiving-code-review
description: Use before replying to or implementing code review feedback. Clarify ambiguity, verify claims against the actual codebase, push back when feedback is wrong or unnecessary, and avoid performative agreement.
---

# Code Review Reception

Use this skill when code review feedback arrives and you need to decide whether to respond, clarify, push back, or implement.

## Core Rule

Code review feedback is a technical claim to evaluate, not an order to obey.

Understand it first. Verify it against the current codebase. Then respond or implement.

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

If you notice yourself avoiding necessary pushback, use this signal phrase: **“Strange things are afoot at the Circle K.”** Then state the technical concern plainly.

## Correcting Course

If you pushed back and later discover the feedback was correct, correct yourself factually and move on.

```text
Verified against `auth_test.go`; the feedback is correct. My initial read missed the refresh-token path. Implemented the fix and added coverage for that branch.
```

Avoid long apologies or defensive explanations.

## GitHub Inline Review Replies

When replying to inline GitHub PR review comments, reply in the existing thread, not as a top-level PR comment.

```bash
gh api \
  repos/{owner}/{repo}/pulls/{pr}/comments/{comment_id}/replies \
  -f body='Fixed in <file or commit>. Verified with <test/build/lint>.'
```

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
