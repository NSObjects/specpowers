---
name: "specpowers"
displayName: "SpecPowers Workflow"
description: "Spec-driven development workflow enforcing TDD, explicit specs, and modular design."
keywords: ["specpowers", "workflow", "tdd", "spec-driven", "code review", "artifact", "behavioral shaping"]
---

# Onboarding

You now have access to SpecPowers — a spec-driven development workflow for AI coding assistants.

## Step 1: Deploy Skills as Steering Files

SpecPowers skills need to be installed as workspace steering files so Kiro can auto-load them based on context.

For each `.md` file in this power's `skills/*/SKILL.md`, copy it to the user's `.kiro/steering/` directory with the skill name as filename. When copying, add `inclusion: auto` to the existing YAML frontmatter (after the opening `---`, before `name:`).

**Skills to deploy:**

| Source | Target |
|--------|--------|
| `skills/using-skills/SKILL.md` | `.kiro/steering/using-skills.md` |
| `skills/exploring/SKILL.md` | `.kiro/steering/exploring.md` |
| `skills/proposing/SKILL.md` | `.kiro/steering/proposing.md` |
| `skills/specifying/SKILL.md` | `.kiro/steering/specifying.md` |
| `skills/designing/SKILL.md` | `.kiro/steering/designing.md` |
| `skills/planning/SKILL.md` | `.kiro/steering/planning.md` |
| `skills/spec-driven-development/SKILL.md` | `.kiro/steering/spec-driven-development.md` |
| `skills/archiving/SKILL.md` | `.kiro/steering/archiving.md` |
| `skills/test-driven-development/SKILL.md` | `.kiro/steering/test-driven-development.md` |
| `skills/systematic-debugging/SKILL.md` | `.kiro/steering/systematic-debugging.md` |
| `skills/requesting-code-review/SKILL.md` | `.kiro/steering/requesting-code-review.md` |
| `skills/receiving-code-review/SKILL.md` | `.kiro/steering/receiving-code-review.md` |
| `skills/verification-before-completion/SKILL.md` | `.kiro/steering/verification-before-completion.md` |
| `skills/dispatching-parallel-agents/SKILL.md` | `.kiro/steering/dispatching-parallel-agents.md` |
| `skills/writing-skills/SKILL.md` | `.kiro/steering/writing-skills.md` |

**Frontmatter transformation example:**

Source file has:
```yaml
---
name: exploring
description: "Use when the request is vague..."
---
```

Deployed file should have:
```yaml
---
inclusion: auto
name: exploring
description: "Use when the request is vague..."
---
```

Also copy `agents/code-reviewer.md` to `.kiro/steering/code-reviewer-prompt.md` (with `inclusion: manual` frontmatter) so it can be referenced when dispatching code review subagents.

## Step 2: Verify Deployment

After deploying, confirm that `.kiro/steering/` contains all 15 skill files plus the code reviewer prompt. The steering files will now auto-activate based on their descriptions when the user's requests match.

## CRITICAL: How Skills Work in Kiro

The skill files contain instructions written for multiple platforms (Claude Code, Cursor, Codex, etc.). You MUST apply the translation rules below when following them.

### Tool Translation Table

Skill files reference tools from other platforms. Translate them as follows:

| Skill file says | You do in Kiro |
|---|---|
| `Skill` tool / invoke skill | Read the corresponding `.kiro/steering/<skill-name>.md` file |
| `specpowers:code-reviewer` subagent | `invokeSubAgent(name="general-task-execution")` with the prompt from `.kiro/steering/code-reviewer-prompt.md` |
| `specpowers:test-driven-development` | Read `.kiro/steering/test-driven-development.md` |
| `specpowers:planning` | Read `.kiro/steering/planning.md` |
| `specpowers:requesting-code-review` | Read `.kiro/steering/requesting-code-review.md` |
| `specpowers:verification-before-completion` | Read `.kiro/steering/verification-before-completion.md` |
| `specpowers:systematic-debugging` | Read `.kiro/steering/systematic-debugging.md` |
| `specpowers:dispatching-parallel-agents` | Read `.kiro/steering/dispatching-parallel-agents.md` |
| `Task` tool (dispatch subagent) | `invokeSubAgent` with `general-task-execution` agent |
| `TodoWrite` | Track tasks inline in tasks.md |
| `Read`, `Write`, `Edit` | Kiro native: `readFile`/`readCode`, `fsWrite`/`fsAppend`, `strReplace` |
| `Bash` | `executeBash` |
| `@filename.md` references | Read the file from the skill's directory in the power |

## Core Workflow

When the user asks to build, create, or implement something, follow this chain:

```
exploring → proposing → specifying → designing → planning → spec-driven-development → archiving
```

**You cannot skip `specifying`** — it is the spine of the entire workflow.

**When user asks to build/create/implement something:**
1. Check if `specs/changes/` has an active change for this topic
2. If no active change → follow `exploring` steering and then `proposing`
3. If change exists but missing artifacts → follow the next skill in the chain
4. If tasks.md exists and has unchecked items → follow `spec-driven-development`

## Key Rules

- **Never skip specifying.** It's the spine of the workflow.
- **Never touch git.** The user manages all git operations.
- **TDD is mandatory.** Every task starts with a failing test.
- **Auto code review.** Both execution modes dispatch code-reviewer after completion.
- **Check for active changes** in `specs/changes/` before starting new work.
