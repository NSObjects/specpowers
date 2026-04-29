# SpecPowers

This project uses spec-driven development with structured artifacts.

## For AI Agents

You have specpowers installed. At session start, the `using-skills` skill is loaded automatically via hooks.

If skills are NOT auto-loaded, read `skills/using-skills/SKILL.md` immediately and follow it.

## Workflow

```
exploring → proposing → specifying → designing → planning → spec-driven-development → archiving
```

## Key Rules

- **Never skip specifying.** It's the spine of the workflow.
- **Never touch git.** The user manages all git operations.
- **TDD is mandatory.** Every task starts with a failing test.
- **Per-task review gates.** In `spec-driven-development`, both execution modes run Stage 1 spec review and Stage 2 code-quality review after GREEN and before marking the task complete.
- **Check for active changes** in `specs/changes/` before starting new work.
