---
name: dispatching-parallel-agents
description: Use when a request can be split into 2+ independent workstreams that can run concurrently without shared mutable state, file ownership conflicts, or sequential dependencies.
---

# Dispatching Parallel Agents

## Purpose

Use this skill to coordinate multiple isolated specialist agents when a task has independent problem domains. The orchestrator remains the single owner of the user-facing answer, task decomposition, integration, verification, and final judgment.

Sub-agents do **not** inherit the current conversation, hidden assumptions, or each other's work. Every dispatched task must include the exact context, scope, constraints, and expected output needed for that agent to succeed independently.

**Core principle:** dispatch one agent per independent domain, then integrate their findings through a single orchestration layer.

## Activation Criteria

Use this skill only when all of the following are true:

- There are **2 or more separable workstreams**.
- Each workstream has a clear boundary, such as a file, subsystem, feature slice, test group, or review dimension.
- No workstream needs another workstream's result before it can begin.
- Agents can avoid editing the same files or mutating the same external state.
- The orchestrator can inspect, reconcile, and verify the returned work.

Prefer this skill for:

- Multiple failing test files with likely different causes.
- Independent bugs in separate modules or services.
- Large investigations that can be split by subsystem, API, package, platform, or concern.
- Mixed expert analysis where each specialist has a bounded role, such as planning, security review, test strategy, and implementation review.

Do **not** use this skill when:

- Failures may share a root cause and should be diagnosed together first.
- The task requires a single coherent mental model of the whole system.
- Agents would edit the same files, migrations, generated artifacts, dependency manifests, or global configuration.
- The work is exploratory and the boundaries are not yet known.
- The task is small enough that orchestration overhead would exceed the benefit.

If independence is uncertain, first do a short triage pass. Dispatch read-only planning agents before writer agents when boundaries are unclear.

## Parallel Readiness Checklist

Before dispatching, answer these questions:

| Check | Ready Signal | If Not Ready |
|------|--------------|--------------|
| Domain boundary | Each agent owns a distinct file set, subsystem, or concern | Do a triage/planning pass first |
| Dependency order | Agents do not need each other's outputs to start | Run sequentially or split into phases |
| Write conflicts | Writable paths do not overlap | Assign one writer and make others read-only |
| Shared state | No shared test database, service, branch state, or generated artifact conflict | Serialize the risky steps |
| Verification | You know how to validate each result and the integrated result | Define focused and full verification first |

## Workflow

### 1. Partition the Work

Group the request by independent problem domain:

- failing test file or test category
- module, package, service, or API boundary
- platform or environment
- review concern, such as security, correctness, performance, or testability
- delivery phase, such as planning, implementation, verification, or review

For each domain, record:

- owner agent role
- allowed scope
- forbidden scope
- expected deliverable
- verification method
- possible integration conflicts

### 2. Choose the Agent Type

Use the smallest specialist role that can complete the domain:

| Role | Template | Use When |
|------|----------|----------|
| Planner | [`./planner-agent-prompt.md`](./planner-agent-prompt.md) | You need read-only codebase analysis, dependency mapping, implementation sequencing, or risk assessment before editing. |
| Security Reviewer | [`./security-reviewer-prompt.md`](./security-reviewer-prompt.md) | You need a security-focused read-only review with severity, evidence, confidence, and coverage boundaries. Usually invoke through `requesting-code-review`. |
| TDD Guide | [`./tdd-guide-prompt.md`](./tdd-guide-prompt.md) | You need a test-first plan, behavior matrix, or red-green-refactor coaching for a feature. |
| Code Reviewer | [`../requesting-code-review/code-reviewer-prompt.md`](../requesting-code-review/code-reviewer-prompt.md) | You need general code quality review. Invoke through `requesting-code-review`, not as a separate user-facing flow. |
| Debug/Fix Agent | Inline prompt | You need a bounded implementation or investigation against one file, subsystem, or failing test group. |

### 3. Build a Self-Contained Dispatch Packet

Every agent prompt must include:

- **Objective:** the concrete outcome for this agent.
- **Scope:** files, directories, tests, modules, or concerns it owns.
- **Context:** relevant errors, requirements, constraints, diffs, assumptions, and prior findings.
- **Allowed actions:** read-only, write-limited, test-running permissions, or other tool constraints.
- **Forbidden actions:** files not to edit, behaviors not to change, commands not to run.
- **Success criteria:** how the agent knows the work is complete.
- **Return contract:** the exact summary format the orchestrator needs.

Use this template for ad hoc agents:

```markdown
You are a focused sub-agent working on one independent domain.

## Objective
[Concrete task]

## Scope
- Own: [files/directories/tests/concerns]
- Do not touch: [out-of-scope areas]

## Context
[Paste all relevant errors, requirements, design notes, and constraints. Do not assume access to the parent conversation.]

## Working Rules
- [Allowed tools/actions]
- [Forbidden tools/actions]
- [Behavior-preserving constraints]
- [Conflict-avoidance constraints]

## Success Criteria
- [Measurable completion condition]
- [Focused verification command or evidence, if applicable]

## Return Format
### Outcome
[Done / Partial / Blocked]

### Root Cause or Key Findings
[Concise evidence-based explanation]

### Changes Made or Recommendations
- `[file]`: [change or recommendation]

### Verification
[Commands run, results, or why verification was not possible]

### Risks and Follow-ups
[Remaining concerns, integration risks, or open questions]
```

### 4. Dispatch Concurrently

Dispatch agents in parallel only after the scopes are separated. Treat the following as shared resources owned by the orchestrator unless explicitly assigned:

- dependency manifests and lockfiles
- global config files
- migrations
- generated files
- test snapshots
- build scripts
- shared fixtures
- public interfaces used by multiple domains

If two agents may need the same shared file, make one agent read-only or sequence the edits.

### 5. Integrate the Results

When agents return:

1. Read each summary before accepting any change.
2. Check whether any files, assumptions, or interfaces overlap.
3. Inspect diffs or recommendations for behavior regressions.
4. Resolve contradictions explicitly.
5. Run focused verification for each domain when possible.
6. Run the broadest practical integration verification.
7. Apply the AI-generated code review checklist before presenting the final result.

Do not blindly concatenate sub-agent outputs. The orchestrator must produce one coherent final conclusion.

### 6. Report to the User

The final response should include:

- what workstreams were split out
- the integrated result
- important fixes or findings
- verification performed
- unresolved risks or incomplete parts

Avoid exposing raw sub-agent transcripts unless the user asks for detailed logs.

## Review Orchestration Boundary

Review-oriented specialists should sit behind a **unified review orchestration** layer. Use `requesting-code-review` as the user-facing review entrypoint. Dispatch security, general code quality, or other review specialists only as internal helpers for that unified review flow.

The user should receive one review conclusion, not separate uncoordinated reviewer opinions.

## AI-Generated Code Review Checklist

Apply these checks to code or recommendations produced by sub-agents:

- **Behavior regression:** compare before/after behavior for affected call sites.
- **Security assumptions:** ensure validations, authorization checks, trust boundaries, and secret handling were not weakened.
- **Hidden coupling:** look for new dependencies on globals, shared state, timing, ordering, or environment.
- **Over-broad edits:** reject changes outside the assigned scope unless justified.
- **Unnecessary complexity:** remove abstractions, helpers, or layers that do not pay for themselves.
- **Verification gaps:** separate verified claims from unverified assumptions.

## Examples

### Good Parallel Dispatch

Scenario: six test failures across three unrelated files after a refactor.

Claude Code dispatch example: `Agent("Fix agent-tool-abort.test.ts failures")`

- Agent 1 owns `agent-tool-abort.test.ts` timing failures.
- Agent 2 owns `batch-completion-behavior.test.ts` event-shape failures.
- Agent 3 owns `tool-approval-race-conditions.test.ts` async completion failures.

Each agent receives the failing test names, error messages, relevant scope, constraints, and return contract. The orchestrator later inspects the changes, checks for file overlap, and runs the full suite.

### Bad Parallel Dispatch

Scenario: several failures all involve the same request lifecycle state machine.

Do not dispatch separate writer agents by failing test file. First investigate the shared state machine as one domain. After the root cause is understood, split only independent follow-up work.

## Common Mistakes

| Mistake | Why It Fails | Better Approach |
|--------|--------------|-----------------|
| “Fix all tests” | Too broad; agent loses focus | Assign one failing file or root-cause domain |
| Missing error context | Agent repeats discovery work or guesses | Include test names, errors, logs, and relevant constraints |
| Overlapping write scope | Agents produce conflicts or inconsistent behavior | Assign exclusive writable ownership |
| No return contract | Orchestrator cannot integrate results reliably | Require outcome, findings, changes, verification, risks |
| Skipping verification | Parallel fixes may conflict silently | Run focused checks and integration checks |

## Verification Protocol

After all agents return, complete as much of this protocol as practical:

1. Confirm each domain's success criteria.
2. Inspect changed files or recommendations against the original scope.
3. Check for overlapping edits and shared-interface drift.
4. Run targeted tests for each changed domain.
5. Run full test suite or broad integration check when feasible.
6. Document any verification that could not be performed.
