---
name: requesting-code-review
description: Use when the user asks for a standalone code review, before merge, after a major feature, after a risky fix, or when a fresh review would reduce implementation risk.
---

# Requesting Code Review

Use this skill to run a standalone code review through the single surfaced entrypoint. The main agent owns orchestration, sends a bounded review package to the reviewer, integrates any specialist reviewer findings, and returns one consolidated decision to the user.

The reviewer receives only the packaged review context, not the full session history. This keeps review focused on the implementation, specification, and changed code rather than on the main agent's reasoning process.

## Scope

Use this skill for manual or standalone reviews outside the built-in review checkpoints of `spec-driven-development`.

Use it when:

- The user explicitly asks for code review.
- A major feature or risky fix has just been completed.
- The change is ready for merge or release gating.
- The main agent is stuck and a bounded second opinion would help.
- A refactor needs a baseline check before or after implementation.

Do not use this skill as a replacement for normal implementation, testing, or the per-task review flow already performed by `spec-driven-development`.

## Unified Review Model

1. Run the general `specpowers:code-reviewer` review over the full requested scope.
2. Escalate to a specialist reviewer only when there is a concrete risk hypothesis.
3. Deduplicate and reconcile all findings in the main agent.
4. Return one final user-facing conclusion: `APPROVED`, `NEEDS_CHANGES`, or `NEEDS_CONTEXT`.

Specialist reviewers deepen a scoped risk area. They do not become separate user-facing workflows.

## Platform Dispatch

Use the platform's closest equivalent review mechanism:

Claude Code: use `Agent` tool with `specpowers:code-reviewer`; legacy `Task` references are compatible aliases.

| Platform | Dispatch method |
|---|---|
| Claude Code | Use `Agent` tool with `specpowers:code-reviewer`. Treat legacy `Task` references as compatible aliases. |
| Codex | Use `spawn_agent(agent_type="worker", message=...)` with the filled `./code-reviewer-prompt.md`. |

## Review Package Requirements

Before dispatching, build a compact review package and apply the `specpowers:confidence-loop` Review Package Adequacy Gate. The reviewer should receive enough context to evaluate the change without reading the full conversation.

Required fields:

- `{WHAT_WAS_IMPLEMENTED}` — factual summary of the completed change
- `{SPEC_SCENARIOS}` — GIVEN / WHEN / THEN scenarios or `None provided`
- `{BASE_SHA}` — starting commit, merge base, or explicit review base
- `{HEAD_SHA}` — ending commit or explicit review head
- `{DESCRIPTION}` — purpose, constraints, known risks, relevant test results, and anything intentionally out of scope

If the package cannot include the diff, scope, relevant specs/design/tasks, test evidence, known risks, or prior findings/gaps needed for a fair review, do not ask the reviewer to guess. Provide the missing evidence first, or expect `NEEDS_CONTEXT` / **Unresolved Confidence Gaps** rather than approval.

Useful preflight commands:

```bash
git status --short
BASE_SHA=$(git merge-base HEAD origin/main)
HEAD_SHA=$(git rev-parse HEAD)
git diff --stat "$BASE_SHA..$HEAD_SHA"
```

For a narrow task review, set `BASE_SHA` to the commit immediately before that task. Do not default to the branch merge base when the user requested review of only one fix or follow-up change.

If the change includes uncommitted work, either commit it before review or explicitly include the working-tree diff/context in `{DESCRIPTION}` and label `{HEAD_SHA}` as `WORKTREE`. Do not claim a review covers uncommitted changes unless the reviewer receives them.

## How to Request Review

1. **Determine scope.** Confirm whether the review is for the whole branch, one task, one commit range, or the current working tree.
2. **Collect specification context.** Include the relevant Spec Scenarios. If none exist, write `None provided` and instruct the reviewer to assess against the description and tests.
3. **Collect implementation context.** Summarize what changed, why it changed, and any known limitations.
4. **Collect test context.** Include relevant test commands already run and their results. If no tests were run, state that plainly.
5. **Fill `./code-reviewer-prompt.md`.** Replace all placeholders with concrete values.
6. **Dispatch or review inline.** Use the platform dispatch table above.
7. **Synthesize findings.** Return one consolidated result to the user with a single final conclusion.

## Specialist Escalation

Use the general reviewer by default. Add a specialist reviewer only when a clear risk area exists.

Security escalation is warranted when the diff touches:

- authentication or authorization
- secrets, tokens, credentials, or key material
- permissions, roles, access checks, or tenant boundaries
- untrusted input, parsing, deserialization, uploads, or external callbacks
- sensitive data flows, logging, telemetry, or privacy boundaries
- externally exposed API behavior or attack surface

Specialist template:

- Security deep review: `../dispatching-parallel-agents/security-reviewer-prompt.md`

When escalating, scope the specialist prompt to the exact concern. Do not ask the specialist to re-review the entire diff unless the entire diff is security-sensitive.

When specialist escalation is needed, keep it behind the same surfaced review entrypoint and return one consolidated conclusion.

## Synthesis Rules

The main agent must integrate review output before responding to the user.

- Deduplicate overlapping issues.
- Reconcile disagreements between general and specialist reviewers.
- Promote or demote severity only with clear reasoning.
- Put blocking findings first.
- Include file paths, line numbers, scenario names, and evidence where available.
- Do not paste raw reviewer output as the final answer.
- Do not present separate final decisions from different reviewers.

Final user-facing result should include:

```markdown
## Review Result
**Decision:** APPROVED / NEEDS_CHANGES / NEEDS_CONTEXT
**Why:** [short synthesis]

## Blocking Issues
- [Critical or Important issues, approval-blocking confidence gaps, or "None"]

## Non-Blocking Notes
- [Minor issues or follow-ups, or "None"]

## Specialist Review
- `none` — no specialist review was needed
- `security-reviewer` — [summary, only if performed or recommended]

## Next Step
[fix, re-review, merge, or continue]
```

## Re-Review Loop

Use the `specpowers:confidence-loop` Review Confidence Loop for every re-review.

After fixes:

1. Use the previous review head as the new base when only reviewing the fixes.
2. Include the prior blocking findings and unresolved confidence gaps in `{DESCRIPTION}`.
3. Include a Resolution Package that classifies each prior item as `fixed`, `rejected`, `out_of_scope`, or `needs_user_decision`, with evidence.
4. Ask the reviewer to verify that the fixes address those findings, close the confidence gaps, and do not introduce regressions.
5. Repeat until no Critical or Important issues or approval-blocking unresolved confidence gaps remain.

## Decision Policy

- Any Critical issue => `NEEDS_CHANGES`.
- Any Important issue => `NEEDS_CHANGES`.
- Missing context or approval-blocking evidence gap => `NEEDS_CONTEXT`.
- Any approval-blocking unresolved confidence gap with a required in-scope fix => `NEEDS_CHANGES`.
- Minor issues only => usually `APPROVED` with notes.
- Missing or incomplete Spec Scenarios do not automatically block the review, but missing tests for provided required scenarios are Critical.
- If the reviewer is wrong, push back with code, tests, or specification evidence.

## Example

```text
Context: completed a branch-level review before merge.

BASE_SHA=$(git merge-base HEAD origin/main)
HEAD_SHA=$(git rev-parse HEAD)

Dispatch specpowers:code-reviewer with:

WHAT_WAS_IMPLEMENTED:
  Added verifyIndex() and repairIndex() for conversation index maintenance.

SPEC_SCENARIOS:
  Scenario: Detect orphaned entries
    GIVEN an index with references to deleted files
    WHEN verifyIndex() runs
    THEN it reports orphaned entries with file paths

  Scenario: Repair orphaned entries
    GIVEN verifyIndex() found orphaned entries
    WHEN repairIndex() runs
    THEN orphaned entries are removed from the index

BASE_SHA:
  a7981ec

HEAD_SHA:
  3df7661

DESCRIPTION:
  Added verification and repair support for four issue types.
  Tests run: npm test -- index-maintenance.test.ts — passed.
  Known risk: repair mutates persistent index state.

Reviewer result:
  Decision: NEEDS_CHANGES
  Blocking issue: Important — repairIndex() removes orphaned entries but does not report repair count.

Main agent response:
  Consolidate the issue, fix it, and re-request review for the fix range.
```

## Red Flags

Never:

- Claim a review covered code that was not included in the diff or package.
- Skip a requested review because the change appears simple.
- Split one review request into multiple user-facing review workflows.
- Launch specialist reviewers without a concrete risk hypothesis.
- Ignore Critical issues.
- Proceed with unresolved Important issues unless the user explicitly accepts the risk.
- Treat reviewer output as final without main-agent synthesis.

See also:

- Reviewer template: `./code-reviewer-prompt.md`
- Specialist deep-dive template: `../dispatching-parallel-agents/security-reviewer-prompt.md`
- Handling feedback: `receiving-code-review` skill
