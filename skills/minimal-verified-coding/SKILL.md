---
name: minimal-verified-coding
description: Use this skill whenever the user asks for software engineering help with code, especially Go/Golang but also any language: implement a feature, fix a bug, debug an error, modify repository files, refactor, review code or PR diffs, write tests, or validate builds. Enforce explicit assumptions, minimal implementation, surgical changes, no speculative abstractions, and verification with tests, lint, build, or targeted checks.
---

# Minimal Verified Coding

Use this skill for coding and software engineering tasks where correctness, scope control, and verification matter. It is derived from Karpathy-style observations about common LLM coding mistakes: assuming too much, over-engineering, changing unrelated code, and failing to verify.

For trivial code answers, skip ceremony and answer directly. For nontrivial implementation, debugging, refactoring, review, or repository-editing work, apply the workflow below.

## When to use

Use this skill when the user asks to:

- write, edit, or generate code;
- implement a feature;
- fix a bug or failing test;
- debug an error, panic, stack trace, race, performance issue, or build failure;
- refactor existing code;
- review code, a PR, a diff, or an architecture decision;
- add, update, or explain tests;
- modify a repository, package, module, API, CLI, service, or configuration related to code;
- run or interpret tests, linters, builds, benchmarks, or static analysis.

## Core rules

### 1. Think before coding

Do not silently assume important details.

Before making a nontrivial change:

- State the interpretation being used when the request has multiple plausible meanings.
- Ask only when ambiguity blocks a correct implementation; otherwise make the smallest reasonable assumption and name it.
- Surface relevant tradeoffs before committing to an approach.
- Prefer the simpler approach when it satisfies the request.
- Push back on speculative complexity or requirements that do not serve the stated goal.

### 2. Simplicity first

Write the minimum code that solves the stated problem.

Avoid:

- features beyond what was requested;
- abstractions for one-off use;
- premature configurability;
- unnecessary framework, dependency, or architecture changes;
- defensive error handling for impossible or irrelevant scenarios.

If the implementation is much longer than necessary, simplify it before presenting it.

### 3. Surgical changes

Touch only what is required.

When editing existing code:

- Do not improve adjacent code, comments, formatting, or naming unless required by the task.
- Do not refactor unrelated code.
- Match the repository's existing style, even if a different style would be preferable.
- Mention unrelated dead code or design issues instead of changing them.

When the requested change creates unused imports, variables, functions, files, or tests, remove only those introduced or orphaned by the change.

Every changed line should be traceable to the user's request.

### 4. Goal-driven execution

Turn the request into verifiable success criteria.

Examples:

- “Add validation” → add or identify tests for invalid inputs, then make them pass.
- “Fix the bug” → reproduce the bug or identify the failing path, then verify the fix.
- “Refactor this” → preserve behavior and run relevant tests before and after when possible.
- “Review this code” → evaluate correctness, edge cases, maintainability, and test coverage without rewriting unrelated code.

For multi-step tasks, use a brief plan:

```text
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

## Operating workflow

1. Identify the smallest useful outcome.
2. State assumptions only when they affect correctness or scope.
3. Define the verification target: tests, build, lint, benchmark, reproduction, or code review criteria.
4. Make the smallest change that satisfies the target.
5. Run available checks when tools and context permit.
6. Report what changed, what was verified, and what remains unverified.

## Response style

For nontrivial coding work, include:

- the assumption or interpretation used;
- the plan and verification target;
- the exact patch, code, or file changes;
- the checks performed and their results;
- caveats for any behavior not verified.

For code review, prioritize findings by severity and include concrete fixes only where useful.

For trivial coding work, do not over-format the answer. Provide the direct answer or minimal snippet.
