# SpecPowers

This project uses spec-driven development with structured artifacts.

## For AI Agents

You have specpowers installed. At session start, the `using-skills` skill should be loaded automatically.

If skills are NOT auto-loaded, read `skills/using-skills/SKILL.md` immediately and follow it.

## Workflow

```
exploring → proposing → specifying → designing → planning → spec-driven-development → archiving
```

## Key Rules

- **Never skip specifying.** It's the spine of the workflow.
- **Never touch git.** The user manages all git operations.
- **TDD is mandatory.** Every task starts with a failing test.
- **Auto code review.** Both execution modes dispatch code-reviewer after completion.
- **Check for active changes** in `specs/changes/` before starting new work.
