---
name: "specpowers"
displayName: "SpecPowers Workflow"
description: "Spec-driven development workflow enforcing TDD, explicit specs, and modular design."
keywords: ["specpowers", "workflow", "tdd", "spec-driven", "code review", "artifact", "behavioral shaping"]
---

# Onboarding

You now have access to SpecPowers — a spec-driven development workflow for AI coding assistants.

## Step 1: Install Skills

Copy each skill folder from this power's `skills/` directory into the user's workspace `.kiro/skills/` directory. Each folder contains a `SKILL.md` file that Kiro will auto-discover.

**Skills to install:**

```
skills/using-skills/         → .kiro/skills/using-skills/
skills/exploring/            → .kiro/skills/exploring/
skills/proposing/            → .kiro/skills/proposing/
skills/specifying/           → .kiro/skills/specifying/
skills/designing/            → .kiro/skills/designing/
skills/planning/             → .kiro/skills/planning/
skills/spec-driven-development/ → .kiro/skills/spec-driven-development/
skills/archiving/            → .kiro/skills/archiving/
skills/test-driven-development/ → .kiro/skills/test-driven-development/
skills/systematic-debugging/ → .kiro/skills/systematic-debugging/
skills/requesting-code-review/ → .kiro/skills/requesting-code-review/
skills/receiving-code-review/ → .kiro/skills/receiving-code-review/
skills/verification-before-completion/ → .kiro/skills/verification-before-completion/
skills/dispatching-parallel-agents/ → .kiro/skills/dispatching-parallel-agents/
skills/writing-skills/       → .kiro/skills/writing-skills/
```

Also copy `agents/code-reviewer.md` to `.kiro/skills/requesting-code-review/code-reviewer-prompt.md` so it is available when dispatching code review subagents.

Copy each skill's supporting files (e.g., `skills/spec-driven-development/implementer-prompt.md`, `skills/spec-driven-development/spec-reviewer-prompt.md`, `skills/spec-driven-development/code-quality-reviewer-prompt.md`, `skills/test-driven-development/testing-anti-patterns.md`, `skills/systematic-debugging/root-cause-tracing.md`, `skills/systematic-debugging/defense-in-depth.md`, `skills/systematic-debugging/condition-based-waiting.md`, `skills/specifying/delta-format-guide.md`) into their respective `.kiro/skills/` folders.

## Step 2: Install Steering

Create a steering file at `.kiro/steering/specpowers-workflow.md` with the following content:

```markdown
---
inclusion: auto
name: specpowers-workflow
description: Use when building, creating, or implementing features, fixing bugs, or when the user asks to start a new change. Guides the spec-driven development workflow.
---

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

## Tool Translation

Skills reference tools from other platforms. Translate as follows:

| Skill says | You do in Kiro |
|---|---|
| `Skill` tool / invoke skill | Activate the corresponding skill from `.kiro/skills/` |
| `specpowers:code-reviewer` subagent | `invokeSubAgent(name="general-task-execution")` with prompt from `.kiro/skills/requesting-code-review/code-reviewer-prompt.md` |
| `Task` tool (dispatch subagent) | `invokeSubAgent` with `general-task-execution` agent |
| `TodoWrite` | Track tasks inline in tasks.md |
| `@filename.md` references | Read the file from the skill's directory |
```

## Step 3: Verify Installation

Confirm that:
- `.kiro/skills/` contains all 15 skill folders, each with a `SKILL.md`
- `.kiro/steering/specpowers-workflow.md` exists
- Skills are visible in the Kiro panel under "Agent Steering & Skills"
