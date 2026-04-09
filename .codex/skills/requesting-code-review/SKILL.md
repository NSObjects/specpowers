---
name: requesting-code-review
description: Use for standalone reviews before merge, after major features, or when the user explicitly asks for review
---

# Requesting Code Review

Dispatch specpowers:code-reviewer subagent to catch issues before they cascade. The reviewer gets precisely crafted context for evaluation — never your session's history. This keeps the reviewer focused on the work product, not your thought process, and preserves your own context for continued work.

> **Scope:** This skill is for standalone/manual reviews outside the built-in two-stage per-Task review in `spec-driven-development`.
>
> **Platform dispatch:**
> - Claude Code: use `Task` tool with `specpowers:code-reviewer`
> - Kiro: use `invokeSubAgent(name="general-task-execution", prompt=...)` with `./code-reviewer-prompt.md`
> - Codex: use `spawn_agent(agent_type="worker", message=...)` with filled `./code-reviewer-prompt.md`

**Core principle:** Review early, review often.

## When to Request Review

**Typical uses:**
- After completing a major feature
- Before merge to main
- When the user explicitly asks for a standalone review

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## How to Request

**1. Choose review scope and get git SHAs:**
```bash
# Whole branch / before merge review
BASE_SHA=$(git merge-base HEAD origin/main)
HEAD_SHA=$(git rev-parse HEAD)
```

For a narrower review, set `BASE_SHA` to the commit right before the change you want reviewed.
Do not default to `merge-base` if you only want feedback on one task or one follow-up fix.

**2. Dispatch code-reviewer subagent:**

Use `Task tool (specpowers:code-reviewer)` and fill the reviewer template from `./code-reviewer-prompt.md`.
On Kiro and Codex, translate that dispatch using the platform mappings above.

**Placeholders:**
- `{WHAT_WAS_IMPLEMENTED}` - What you just built
- `{SPEC_SCENARIOS}` - The GIVEN/WHEN/THEN scenarios from the spec that this code should satisfy
- `{BASE_SHA}` - Starting commit
- `{HEAD_SHA}` - Ending commit
- `{DESCRIPTION}` - Brief summary

**3. Act on feedback** (see also: `receiving-code-review` skill):
- Fix Critical issues immediately
- Fix Important issues before proceeding
- Note Minor issues for later
- Push back if reviewer is wrong (with reasoning)
- If fixes are non-trivial, re-request review after fixing (re-review loop)

## Example

```
[Just completed a major feature and want a standalone review before merge]

You: Let me request code review before proceeding.

BASE_SHA=$(git merge-base HEAD origin/main)
HEAD_SHA=$(git rev-parse HEAD)

[Dispatch specpowers:code-reviewer subagent]
  WHAT_WAS_IMPLEMENTED: Verification and repair functions for conversation index
  SPEC_SCENARIOS: |
    Scenario: Detect orphaned entries
      GIVEN an index with references to deleted files
      WHEN verifyIndex() runs
      THEN it reports orphaned entries with file paths
    Scenario: Repair orphaned entries
      GIVEN verifyIndex() found orphaned entries
      WHEN repairIndex() runs
      THEN orphaned entries are removed from the index
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661
  DESCRIPTION: Added verifyIndex() and repairIndex() with 4 issue types

[Subagent returns]:
  Spec Compliance: 2/2 scenarios covered ✅
  Strengths: Clean architecture, real tests
  Issues:
    Important: Missing progress indicators
    Minor: Magic number (100) for reporting interval
  Assessment: NEEDS_CHANGES

You: [Fix progress indicators, re-request review]
[Reviewer returns APPROVED]
[Proceed to merge or next manual checkpoint]
```

## Integration with Workflows

**Spec-Driven Development:**
- `spec-driven-development` already performs its own per-Task spec review and code quality review
- Use this skill only when you want an extra standalone/manual review outside that flow

**Ad-Hoc Development:**
- Review before merge
- Review when stuck

## Red Flags

**Never:**
- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues
- Argue with valid technical feedback

**If reviewer wrong:**
- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification

See also:
- Reviewer template: `./code-reviewer-prompt.md`
- Handling feedback: `receiving-code-review` skill
