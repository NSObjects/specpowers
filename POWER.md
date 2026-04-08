---
name: "specpowers"
displayName: "SpecPowers Workflow"
description: "Spec-driven development workflow enforcing TDD, explicit specs, and modular design."
keywords: ["specpowers", "workflow", "tdd", "spec-driven", "code review", "artifact", "behavioral shaping"]
---

# Onboarding

You now have access to SpecPowers — a spec-driven development workflow for AI coding assistants.

## Step 1: Install Skills

Copy each skill folder from this power's `skills/` directory into the user's workspace `.kiro/skills/` directory. Each folder contains a `SKILL.md` file that Kiro will auto-discover and activate based on context.

**Skills to install:**

| Source | Target |
|--------|--------|
| `skills/using-skills/` | `.kiro/skills/using-skills/` |
| `skills/exploring/` | `.kiro/skills/exploring/` |
| `skills/proposing/` | `.kiro/skills/proposing/` |
| `skills/specifying/` | `.kiro/skills/specifying/` |
| `skills/designing/` | `.kiro/skills/designing/` |
| `skills/planning/` | `.kiro/skills/planning/` |
| `skills/spec-driven-development/` | `.kiro/skills/spec-driven-development/` |
| `skills/archiving/` | `.kiro/skills/archiving/` |
| `skills/test-driven-development/` | `.kiro/skills/test-driven-development/` |
| `skills/systematic-debugging/` | `.kiro/skills/systematic-debugging/` |
| `skills/requesting-code-review/` | `.kiro/skills/requesting-code-review/` |
| `skills/receiving-code-review/` | `.kiro/skills/receiving-code-review/` |
| `skills/verification-before-completion/` | `.kiro/skills/verification-before-completion/` |
| `skills/dispatching-parallel-agents/` | `.kiro/skills/dispatching-parallel-agents/` |
| `skills/writing-skills/` | `.kiro/skills/writing-skills/` |

Copy each folder with all its contents (SKILL.md and any supporting files like prompt templates, reference docs).

Also copy `agents/code-reviewer.md` into `.kiro/skills/requesting-code-review/code-reviewer-prompt.md`.

## Step 2: Verify Installation

Confirm that `.kiro/skills/` contains all 15 skill folders, each with a `SKILL.md`. Skills should be visible in the Kiro panel under "Agent Steering & Skills".

# When to Load Steering Files
- When building, creating, implementing features, or resuming work → `specpowers-workflow.md`
