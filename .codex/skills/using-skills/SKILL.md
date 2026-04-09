---
name: using-skills
description: Use when starting a new conversation, or whenever the next step is unclear and the agent needs to decide which skills apply before responding
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

**In Claude Code:** Use the `Skill` tool. When you invoke a skill, its content is loaded and presented to you—follow it directly. Claude Code now names the subagent-dispatch tool `Agent`; older `Task` references in legacy docs or prompts remain compatible aliases.

**In Gemini CLI:** Skills activate via the `activate_skill` tool. Gemini loads skill metadata at session start and activates the full content on demand.

**In Cursor:** Skills load via the Cursor plugin system. Use the `Skill` tool the same way as Claude Code.

**In Codex:** Skills load natively via skill discovery. See `references/codex-tools.md` for tool name mapping between Claude Code and Codex.

**In OpenCode:** Skills load via OpenCode's native `skill` tool. Use `skill` tool to list and load skills.

**In Kiro IDE (Power mode):** Skills are steering files in this power. Use `kiroPowers` with action="readSteering", powerName="specpowers", steeringFile="<skill-name>.md" to load each skill. When steering files say "invoke X skill", translate to readSteering. When they reference `specpowers:X`, load the corresponding steering file. When they say `Agent` tool (or legacy `Task` references) for subagents, use `invokeSubAgent`. When they say `TodoWrite`, track tasks in tasks.md. See POWER.md onboarding for the full tool translation table.

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
2. **Implementation skills** (spec-driven-development) - these guide execution
3. **Quality skills** (verification-loop, quality-gate, rules-common, rules-{language}) - these enforce standards and decision constraints
4. **Utility skills** (dispatching-parallel-agents, requesting-code-review, selective-install) - these support execution

"Let's build X" → proposing/exploring first; if existing-solution research matters, handle it inside `exploring` or `designing` under `rules-common`; then implementation skills.
"Fix this bug" → debugging first, then domain-specific skills.
"Check code quality" → quality-gate for quick checks, verification-loop for full pipeline.
"Install/manage modules" → selective-install for lifecycle management.

## Skill Types

**Rigid** (TDD, debugging, specifying, verification-loop, quality-gate): Follow exactly. Don't adapt away discipline.

**Flexible** (exploring, designing, rules-common, rules-{language}): Adapt principles to context.

**Utility** (selective-install): Support tooling for managing SpecPowers modules.

The skill itself tells you which.

## Language Rule Auto-Install

When the agent session starts and this skill is activated, the agent MUST execute
the session bootstrap flow to detect and install missing language rule modules:

1. Scan project files and call `detectLanguages()` to identify project languages
2. Check install state to find already-installed modules
3. For any missing `rules-{language}` modules, call `installModules()` to install them
4. Report installed modules to the user with a brief summary

The agent calls these functions from `scripts/install.js` and `scripts/lib/session-bootstrap.js`.

### Auto-Install Boundary

- **Auto-install (no confirmation needed):** `rules-*` language modules detected from project files
- **Needs confirmation:** Any non-language module, profile switches, or manual additions

### First-Run Detection

If install state file does not exist (first use after plugin install):
1. Auto-detect platform
2. Run full install with `developer` profile
3. Then detect and install language-specific rules
4. Show welcome message with install summary

Always activate `rules-common` first (universal rules), then layer the language-specific
skill on top. Language rules override common rules where annotated.

## User Instructions

Instructions say WHAT, not HOW. "Add X" or "Fix Y" doesn't mean skip workflows.
