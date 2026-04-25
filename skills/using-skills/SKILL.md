---
name: using-skills
description: Use at session start, before responding to a user task, or whenever the next step is unclear, to select, load, and order applicable SpecPowers skills.
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill unless your subagent prompt explicitly tells you to load skills.
</SUBAGENT-STOP>

# Using Skills

## Purpose

This skill is the routing layer for SpecPowers. It decides which skills apply, loads them in the right order, and prevents work from starting before the correct workflow instructions are active.

## Non-Negotiable Rule

Before answering or taking action on a user task, perform a skill check.

- If the user explicitly requests a skill, load it.
- If a known skill is plausibly relevant, load it before acting.
- Do not wait for certainty; use a low threshold for relevance.
- Do not re-load `using-skills` recursively after this file is already active.
- If no skill applies after the check, proceed normally.

Skills are current instructions, not memory. Even when you remember a skill, load the current version before relying on it.

## Instruction Priority

Resolve conflicts in this order:

1. Platform, system, safety, and tool constraints.
2. User's explicit request and repository instructions such as `CLAUDE.md`, `GEMINI.md`, `AGENTS.md`, `.qoder/` project assets, `.kiro/steering/`, or equivalent project guidance.
3. Loaded SpecPowers skills.
4. Default agent habits and preferences.

When instructions conflict at the same priority level, follow the more specific instruction unless it would violate a higher-priority constraint.

## How to Access Skills

Use the mechanism provided by the current environment:

| Environment | How to load a skill |
| --- | --- |
| Claude Code | Use the native `Skill` tool or `/skill-name`. For tool, subagent, task-list, and plugin details, read `references/claude-code-tools.md`. |
| Cursor | Use the Cursor plugin system and the `Skill` tool, equivalent to Claude Code when available. |
| Gemini CLI | Use `activate_skill`. Gemini loads skill metadata at session start and full skill content on demand. |
| Codex | Use native skill discovery. For tool translation, read `references/codex-tools.md`. |
| OpenCode | Use OpenCode's native `skill` tool to list and load skills. |
| Kiro IDE Power mode | Use `kiroPowers(action="readSteering", powerName="specpowers", steeringFile="<skill-name>.md")`. For tool translation, read `references/kiro-tools.md`. |
| Qoder CLI / IDE | Use Qoder Skills via automatic matching or `/skill-name`. For Skills, Subagents, Custom Agents, and tool translation, read `references/qoder-tools.md`. |

If the named tool is unavailable in the current environment, use the closest native equivalent. If no equivalent exists, state the limitation briefly and continue with the best available manual workflow.

## Platform Reference Files

Load the relevant reference file only when the current environment or a loaded skill needs platform-specific translation:

| Reference file | Use when |
| --- | --- |
| `references/claude-code-tools.md` | Running in Claude Code, handling `Skill`, `Agent`, `Task`, `TodoWrite`, `Task*`, subagent, or plugin instructions. |
| `references/codex-tools.md` | Running in Codex or translating Claude Code tool names to Codex equivalents. |
| `references/kiro-tools.md` | Running in Kiro IDE Power mode or translating skills into steering/subagent operations. |
| `references/qoder-tools.md` | Running in Qoder CLI/IDE or translating Claude Code skills/subagents into Qoder Skills or Subagents. |

## Skill Check Procedure

1. Identify the task type: exploration, feature/change request, bug fix, implementation, quality review, verification, installation, or archival.
2. Check whether the user explicitly named or implied a skill.
3. Check repository state when relevant: `specs/changes/`, existing artifacts, task files, project languages, installed rule modules, and platform-specific skill/agent directories such as `.claude/`, `.qoder/`, or `.kiro/`.
4. Load process skills before implementation skills.
5. Load `rules-common` before any language-specific `rules-*` skill when coding or reviewing code.
6. Follow the loaded skill exactly. If it instructs you to load another skill, do so before continuing.
7. Tell the user only meaningful workflow decisions, not every internal lookup.

## Skill Priority

When multiple skills apply, load them in this order:

1. **Process skills** — `exploring`, `proposing`, `specifying`, `designing`, `planning`, `debugging`.
2. **Rules skills** — `rules-common`, then applicable `rules-{language}` modules.
3. **Implementation skills** — `spec-driven-development`.
4. **Quality skills** — `verification-loop`, `quality-gate`, `requesting-code-review`.
5. **Utility skills** — `dispatching-parallel-agents`, `selective-install`, and other support skills.

## SpecPowers Artifact Workflow

SpecPowers uses a spec-driven artifact flow:

```text
exploring → proposing → specifying → designing → planning → spec-driven-development → archiving
```

Each stage creates or validates a specific artifact:

| Stage | Skill | Typical artifact |
| --- | --- | --- |
| Understand context or alternatives | `exploring` | research notes, discovered constraints, option comparison |
| Define a change candidate | `proposing` | proposal under `specs/changes/<change>/` |
| Define requirements | `specifying` | requirements/specification artifact |
| Define technical approach | `designing` | design artifact |
| Break work into executable steps | `planning` | `tasks.md` |
| Implement checked tasks | `spec-driven-development` | code/config/docs changes, task updates |
| Close completed change | `archiving` | archived change record |

`specifying` is mandatory for feature/change work. Do not jump from proposal to design or implementation without it.

## Routing Rules

### New feature, behavior change, or implementation request

1. Check `specs/changes/` for an active change matching the topic.
2. If no active change exists, load `proposing`.
3. If the request is ambiguous or requires understanding existing behavior first, load `exploring` before `proposing`.
4. If an active change exists but required artifacts are missing, load the next missing workflow skill in order: `specifying`, `designing`, then `planning`.
5. If `tasks.md` exists and has unchecked tasks, establish an execution mode before loading `spec-driven-development`:
   - `Step-by-Step`: implement one task or small group, then report and wait when required by the active skill.
   - `Fast`: continue through the task list, reporting meaningful progress.
6. If the execution mode was already chosen for the current change in the current conversation, reuse it.

### Bug, failure, regression, or flaky behavior

Load `debugging` first. After the root cause is understood, load additional workflow, rules, or verification skills as needed.

### Code quality, review, or standards check

Load `quality-gate` for a quick quality pass. Load `verification-loop` for test/build/lint execution. Load `requesting-code-review` when an independent review is needed or requested.

### Research, unclear next step, or multiple possible approaches

Load `exploring` first. Use `dispatching-parallel-agents` only when independent branches of investigation would reduce risk or time.

### Module installation or skill/rule management

Load `selective-install` before adding, removing, or changing SpecPowers modules, except for automatic language-rule installation described below.

### Completed change ready to close

Load `archiving` when implementation and verification are complete or when the user explicitly asks to archive a change.

## Session Bootstrap for Language Rules

When this skill is activated at session start or before the first project coding/review task, run the language-rule bootstrap if all preconditions are true:

- You are in a project workspace.
- SpecPowers installation scripts are present, including `scripts/install.js` and `scripts/lib/session-bootstrap.js`.
- File writes are allowed in the workspace.
- You are not acting as a subagent.

Bootstrap flow:

1. Detect project languages from repository files.
2. Check which `rules-*` language modules are already installed.
3. Install missing detected `rules-{language}` modules automatically.
4. Activate `rules-common` first, then activate each detected language rule skill.
5. Report installed modules and activated rules briefly.

If this is the first run after plugin installation and no install-state file exists:

1. Auto-detect the platform.
2. Run a full install using the `developer` profile.
3. Detect and install language-specific rules.
4. Show a brief welcome and installation summary.

### Auto-Install Boundary

- Auto-install without confirmation: detected `rules-*` language modules only.
- Require user confirmation: non-language modules, profile switches, manual additions, destructive changes, or changes outside the active workspace.
- If bootstrap scripts are missing or unavailable, skip bootstrap and continue; do not invent replacement installation steps.

## Skill Types

- **Rigid:** `debugging`, `specifying`, `verification-loop`, `quality-gate`, and TDD-oriented skills. Follow the steps exactly.
- **Flexible:** `exploring`, `designing`, `rules-common`, and `rules-{language}`. Apply principles to the project context.
- **Utility:** `selective-install`, `dispatching-parallel-agents`, and support skills. Use them to enable the main workflow.

## Red Flags

Stop and perform the skill check if you catch yourself thinking any of the following:

| Thought | Required correction |
| --- | --- |
| "This is simple." | Simple tasks still need a skill check. |
| "I need context first." | Load exploration or routing skills before gathering context. |
| "I remember the skill." | Load the current skill content. |
| "The workflow is overkill." | If the skill applies, use it. |
| "I'll just inspect or edit one thing first." | Check skills before tool use. |
| "This is only a question." | Questions are tasks; check whether a skill applies. |

## Completion Check

Before producing the final answer or taking the next major action, verify:

- Relevant skills were loaded before action.
- Required artifacts were not skipped.
- `rules-common` and language rules were considered for coding/review tasks.
- Execution mode was established when implementing from `tasks.md`.
- Any skipped bootstrap or unavailable tool was disclosed only when it affects the task.
