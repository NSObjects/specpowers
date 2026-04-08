# SpecPowers Workflow

## Core Workflow

When the user asks to build, create, or implement something, follow this skill chain in order:

```
exploring → proposing → specifying → designing → planning → spec-driven-development → archiving
```

**You cannot skip `specifying`** — it is the spine of the entire workflow.

**When user asks to build/create/implement something:**
1. Check if `specs/changes/` has an active change for this topic
2. If no active change → activate `exploring` skill, then `proposing`
3. If change exists but missing artifacts → activate the next skill in the chain
4. If tasks.md exists and has unchecked items → activate `spec-driven-development`

## Key Rules

- **Never skip specifying.** It's the spine of the workflow.
- **Never touch git.** The user manages all git operations.
- **TDD is mandatory.** Every task starts with a failing test.
- **Auto code review.** Both execution modes dispatch code-reviewer after completion.
- **Check for active changes** in `specs/changes/` before starting new work.

## Resuming Work

When the user returns to a conversation or starts a new session:
1. Check `specs/changes/` for active changes
2. If a change directory exists with `tasks.md`, read it
3. Find the first unchecked `- [ ]` task
4. Activate `spec-driven-development` skill and resume from that task

## Tool Translation

Skills reference tools from other platforms. Translate as follows:

| Skill says | You do in Kiro |
|---|---|
| `Skill` tool / invoke skill | Activate the corresponding skill by name |
| `specpowers:code-reviewer` subagent | `invokeSubAgent(name="general-task-execution")` with `code-reviewer-prompt.md` in the `requesting-code-review` skill |
| `specpowers:test-driven-development` | Activate `test-driven-development` skill |
| `specpowers:planning` | Activate `planning` skill |
| `specpowers:requesting-code-review` | Activate `requesting-code-review` skill |
| `specpowers:verification-before-completion` | Activate `verification-before-completion` skill |
| `specpowers:systematic-debugging` | Activate `systematic-debugging` skill |
| `specpowers:dispatching-parallel-agents` | Activate `dispatching-parallel-agents` skill |
| `Task` tool (dispatch subagent) | `invokeSubAgent` with `general-task-execution` agent |
| `TodoWrite` | Track tasks inline in tasks.md |
| `@filename.md` references | Read the file from the skill's directory |
