---
name: using-skills
description: Use when starting any conversation - establishes how to find and use skills, requiring Skill invocation before ANY response including clarifying questions
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

## Instruction Priority

SpecPowers skills override default system prompt behavior, but **user instructions always take precedence**:

1. **User's explicit instructions** (CLAUDE.md, GEMINI.md, AGENTS.md, direct requests) — highest priority
2. **SpecPowers skills** — override default system behavior where they conflict
3. **Default system prompt** — lowest priority

## How to Access Skills

**In Claude Code:** Use the `Skill` tool. When you invoke a skill, its content is loaded and presented to you—follow it directly.

**In Gemini CLI:** Skills activate via the `activate_skill` tool. Gemini loads skill metadata at session start and activates the full content on demand.

**In Cursor:** Skills load via the Cursor plugin system. Use the `Skill` tool the same way as Claude Code.

**In Codex:** Skills load natively via skill discovery. See `references/codex-tools.md` for tool name mapping between Claude Code and Codex.

**In OpenCode:** Skills load via OpenCode's native `skill` tool. Use `skill` tool to list and load skills.

# Using Skills

## The Rule

**Invoke relevant or requested skills BEFORE any response or action.** Even a 1% chance a skill might apply means that you should invoke the skill to check.

## SpecPowers Workflow Skills — Invocation Order

SpecPowers uses a **spec-driven artifact flow**. When building features, the skills chain is:

```
exploring → proposing → specifying → designing → planning → spec-driven-development → archiving
```

Each skill produces a specific artifact. **You cannot skip `specifying`** — it is the spine of the entire workflow.

**When user asks to build/create/implement something:**
1. Check if `specs/changes/` has an active change for this topic
2. If no active change → invoke `proposing` skill
3. If change exists but missing artifacts → invoke the next skill in the chain
4. If tasks.md exists and has unchecked items → invoke `spec-driven-development`

## Red Flags

These thoughts mean STOP—you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "This doesn't count as a task" | Action = task. Check for skills. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "I know what that means" | Knowing the concept ≠ using the skill. Invoke it. |

## Skill Priority

When multiple skills could apply, use this order:

1. **Process skills first** (exploring, proposing, specifying, debugging) - these determine HOW to approach
2. **Implementation skills second** - these guide execution

"Let's build X" → proposing/exploring first, then implementation skills.
"Fix this bug" → debugging first, then domain-specific skills.

## Skill Types

**Rigid** (TDD, debugging, specifying): Follow exactly. Don't adapt away discipline.

**Flexible** (exploring, designing): Adapt principles to context.

The skill itself tells you which.

## User Instructions

Instructions say WHAT, not HOW. "Add X" or "Fix Y" doesn't mean skip workflows.
