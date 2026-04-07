---
name: "specpowers"
displayName: "SpecPowers Workflow"
description: "Spec-driven development workflow enforcing TDD, explicit specs, and modular design."
keywords: ["specpowers", "workflow", "tdd", "spec-driven", "code review", "artifact", "behavioral shaping"]
---

# Onboarding

You now have access to SpecPowers — a spec-driven development workflow for AI coding assistants.

## CRITICAL: How Skills Work in Kiro

Steering files in this power are the skill guides. They contain instructions written for multiple platforms (Claude Code, Cursor, Codex, etc.). You MUST apply the translation rules below when following them.

### Loading Skills

When a steering file says "invoke X skill" or "invoke `specifying` skill", use `readSteering` to load the corresponding steering file:

```
"invoke exploring skill"     → readSteering(powerName="specpowers", steeringFile="exploring.md")
"invoke proposing skill"     → readSteering(powerName="specpowers", steeringFile="proposing.md")
"invoke specifying skill"    → readSteering(powerName="specpowers", steeringFile="specifying.md")
"invoke designing skill"     → readSteering(powerName="specpowers", steeringFile="designing.md")
"invoke planning skill"      → readSteering(powerName="specpowers", steeringFile="planning.md")
"invoke spec-driven-development skill" → readSteering(powerName="specpowers", steeringFile="spec-driven-development.md")
"invoke archiving skill"     → readSteering(powerName="specpowers", steeringFile="archiving.md")
```

### Tool Translation Table

Steering files reference tools from other platforms. Translate them as follows:

| Steering file says | You do in Kiro |
|---|---|
| `Skill` tool / invoke skill | `readSteering` with this power |
| `specpowers:code-reviewer` subagent | `invokeSubAgent(name="general-task-execution")` with the prompt from `agents/code-reviewer.md` in the workspace |
| `specpowers:test-driven-development` | `readSteering(steeringFile="test-driven-development.md")` |
| `specpowers:planning` | `readSteering(steeringFile="planning.md")` |
| `specpowers:requesting-code-review` | `readSteering(steeringFile="requesting-code-review.md")` |
| `specpowers:verification-before-completion` | `readSteering(steeringFile="verification-before-completion.md")` |
| `specpowers:systematic-debugging` | `readSteering(steeringFile="systematic-debugging.md")` |
| `specpowers:dispatching-parallel-agents` | `readSteering(steeringFile="dispatching-parallel-agents.md")` |
| `Task` tool (dispatch subagent) | `invokeSubAgent` with `general-task-execution` agent |
| `TodoWrite` | Track tasks inline in tasks.md |
| `Read`, `Write`, `Edit` | Kiro native: `readFile`/`readCode`, `fsWrite`/`fsAppend`, `strReplace` |
| `Bash` | `executeBash` |
| `@filename.md` references | Read the file from the skill's directory in the workspace |

## Core Workflow

When the user asks to build, create, or implement something, follow this chain by loading each steering file in order:

```
exploring → proposing → specifying → designing → planning → spec-driven-development → archiving
```

**You cannot skip `specifying`** — it is the spine of the entire workflow.

**When user asks to build/create/implement something:**
1. Check if `specs/changes/` has an active change for this topic
2. If no active change → load `exploring.md` steering and follow it
3. If change exists but missing artifacts → load the next steering file in the chain
4. If tasks.md exists and has unchecked items → load `spec-driven-development.md`

## Key Rules

- **Never skip specifying.** It's the spine of the workflow.
- **Never touch git.** The user manages all git operations.
- **TDD is mandatory.** Every task starts with a failing test.
- **Auto code review.** Both execution modes dispatch code-reviewer after completion.
- **Check for active changes** in `specs/changes/` before starting new work.

# When to Load Steering Files
- For session bootstrap and skill routing → `using-skills.md`
- When exploring requirements for a new feature → `exploring.md`
- When proposing high-level scope and intent → `proposing.md`
- When specifying behavior with GIVEN/WHEN/THEN → `specifying.md`
- When doing architecture design → `designing.md`
- When breaking down into TDD tasks → `planning.md`
- When executing tasks and enforcing Spec compliance → `spec-driven-development.md`
- When finalizing Delta Spec merging and change history → `archiving.md`
- When enforcing RED-GREEN-REFACTOR iron law → `test-driven-development.md`
- When debugging issues systematically → `systematic-debugging.md`
- When dispatching a code reviewer subagent → `requesting-code-review.md`
- When handling code review feedback → `receiving-code-review.md`
- When forwarding evidence before claims (Verification) → `verification-before-completion.md`
- When creating or tuning new skills → `writing-skills.md`
- When dispatching parallel agents for independent problems → `dispatching-parallel-agents.md`
