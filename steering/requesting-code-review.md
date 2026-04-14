<!-- generated from skills/ by sync-steering.js -->
---
name: requesting-code-review
description: Use for standalone reviews before merge, after major features, or when the user explicitly asks for review
---

# Requesting Code Review

Dispatch specpowers:code-reviewer subagent to catch issues before they cascade. The reviewer gets precisely crafted context for evaluation — never your session's history. This keeps the reviewer focused on the work product, not your thought process, and preserves your own context for continued work.

This is the **single surfaced entrypoint** for review work. Specialist reviewer roles are optional deep dives behind this entrypoint, not parallel user-facing workflows. The main agent owns orchestration and returns a **single final conclusion** after integrating any specialist reviewer findings.

> **Scope:** This skill is for standalone/manual reviews outside the built-in two-stage per-Task review in `spec-driven-development`.
>
> **Platform dispatch:**
> - Claude Code: use `Agent` tool with `specpowers:code-reviewer` (`Task` remains a compatible legacy alias)
> - Kiro: use `invokeSubAgent(name="general-task-execution", prompt=...)` with `./code-reviewer-prompt.md`
> - Codex: use `spawn_agent(agent_type="worker", message=...)` with filled `./code-reviewer-prompt.md`
> - Cursor, Gemini CLI, OpenCode: no review subagent dispatch; perform the same review inline in the main agent and keep the single surfaced entrypoint

**Core principle:** Review early, review often.

## Unified Review Model

This skill owns unified review orchestration for standalone code review:

1. Run the general reviewer across the full requested scope.
2. Escalate to a specialist reviewer only when a concrete risk area deserves deeper analysis.
3. Synthesize all findings in the main agent and return one user-facing decision.

The user should not have to choose between multiple peer review skills for the same request. Specialist reviewer roles deepen this review; they do not replace the single surfaced entrypoint.

## When to Request Review

**Typical uses:**
- After completing a major feature
- Before merge to main
- When the user explicitly asks for a standalone review

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## When to Escalate Review Depth

Use the general reviewer by default. Add a specialist reviewer only when there is a clear reason:

- Security-sensitive changes touching authentication, authorization, secrets, external inputs, or data exposure:
  use `../dispatching-parallel-agents/security-reviewer-prompt.md`
- Cross-cutting changes where the general review identifies a risk area but lacks confidence for a deep assessment:
  scope the specialist reviewer to that exact concern rather than broadening the whole review
- Large or risky diffs where one domain could hide subtle issues:
  keep the general reviewer for breadth, then add the specialist reviewer for depth

If there is no concrete risk area, do not escalate just because the diff is large.

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

Use `Agent tool (specpowers:code-reviewer)` and fill the reviewer template from `./code-reviewer-prompt.md`.
If an older Claude Code prompt or doc says `Task`, treat it as the same tool.
On Kiro and Codex, translate that dispatch using the platform mappings above.

**Placeholders:**
- `{WHAT_WAS_IMPLEMENTED}` - What you just built
- `{SPEC_SCENARIOS}` - The GIVEN/WHEN/THEN scenarios from the spec that this code should satisfy
- `{BASE_SHA}` - Starting commit
- `{HEAD_SHA}` - Ending commit
- `{DESCRIPTION}` - Brief summary

**3. Escalate to a specialist reviewer only when warranted:**

On platforms with subagents, dispatch the specialist reviewer with the same bounded-review discipline:

- Claude Code: use `Agent` with the filled specialist template
- Kiro: use `invokeSubAgent(name="general-task-execution", prompt=...)` with the specialist template
- Codex: use `spawn_agent(agent_type="worker", message=...)` with the filled specialist template

Current specialist deep-dive template:
- Security deep review: `../dispatching-parallel-agents/security-reviewer-prompt.md`

On Cursor, Gemini CLI, OpenCode, perform the same specialist deep check inline in the main agent. Do not create a second visible workflow.

**4. Synthesize and act on feedback** (see also: `receiving-code-review` skill):
- Main agent responsibilities:
  - Deduplicate overlapping findings across the general reviewer and each specialist reviewer
  - Reconcile disagreements and call out which concerns are actually blocking
  - Return a single final conclusion to the user, even if multiple reviewers contributed
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

You: [If the diff touches a sensitive boundary, dispatch `security-reviewer-prompt.md` for a scoped deep dive]
[Main agent deduplicates findings and returns one user-facing result]
[Fix progress indicators, re-request review]
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

## Single Conclusion Contract

When this skill uses multiple reviewers, the main agent still owns the final user-facing report.

- Do not dump raw reviewer outputs without synthesis.
- Do not present specialist reviewer assessments as separate final decisions.
- Do present one consolidated outcome with blocking issues first, supporting detail second.
- Do keep specialist reviewer output scoped to its risk domain instead of re-reviewing the entire diff.

## Red Flags

**Never:**
- Skip review because "it's simple"
- Split one review request into multiple peer review workflows the user must choose between
- Launch specialist reviewers without a concrete risk hypothesis
- Ignore Critical issues
- Proceed with unfixed Important issues
- Argue with valid technical feedback

**If reviewer wrong:**
- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification

See also:
- Reviewer template: `./code-reviewer-prompt.md`
- Specialist deep-dive template: `../dispatching-parallel-agents/security-reviewer-prompt.md`
- Handling feedback: `receiving-code-review` skill
