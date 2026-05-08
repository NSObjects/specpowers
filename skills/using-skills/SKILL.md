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
2. User's explicit request and repository instructions such as `CLAUDE.md`, `AGENTS.md`, or equivalent project guidance.
3. Loaded SpecPowers skills.
4. Default agent habits and preferences.

When instructions conflict at the same priority level, follow the more specific instruction unless it would violate a higher-priority constraint.

## How to Access Skills

Use the mechanism provided by the current environment:

| Environment | How to load a skill |
| --- | --- |
| Claude Code | Use the native `Skill` tool or `/skill-name`. For tool, subagent, task-list, and plugin details, read `references/claude-code-tools.md`. |
| Codex | Use native skill discovery. For tool translation, read `references/codex-tools.md`. |

If the named tool is unavailable in the current environment, use the closest native equivalent. If no equivalent exists, state the limitation briefly and continue with the best available manual workflow.

## Platform Reference Files

Load the relevant reference file only when the current environment or a loaded skill needs platform-specific translation:

For `Agent` tool (or legacy `Task` references), use the platform reference below before dispatching subagents.

| Reference file | Use when |
| --- | --- |
| `references/claude-code-tools.md` | Running in Claude Code, handling `Skill`, `Agent`, `Task`, `TodoWrite`, `Task*`, subagent, or plugin instructions. |
| `references/codex-tools.md` | Running in Codex or translating Claude Code tool names to Codex equivalents. |

## Skill Check Procedure

1. Identify the task type: exploration, feature/change request, bug fix, implementation, quality review, verification, installation, or archival.
2. Check whether the user explicitly named or implied a skill.
3. Check repository state when relevant: `specs/changes/`, existing artifacts, task files, project languages, installed rule modules, and platform-specific skill directories such as `.claude/` or `.codex/`.
4. Load process skills before implementation skills.
5. Load `rules-common` before any language-specific `rules-*` skill when coding or reviewing code.
6. Follow the loaded skill exactly. If it instructs you to load another skill, do so before continuing.
7. Tell the user only meaningful workflow decisions, not every internal lookup.

## Skill Priority

When multiple skills apply, load them in this order:

1. **Process skills** — `exploring`, `proposing`, `specifying`, `designing`, `planning`, `debugging`.
2. **Rules skills** — `rules-common`, then applicable `rules-{language}` modules.
3. **Implementation skills** — `spec-driven-development`.
4. **Quality skills** — `verification-loop`, `quality-gate`, `confidence-loop`, `requesting-code-review`.
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

## Bug Diagnostic Routing

Bug-like input is not edit authorization. A bug report, error report, test failure, regression, unexpected behavior, or failure-related why-question defaults to `systematic-debugging` in diagnostic discussion mode.

Design, trade-off, architecture, workflow, or explanation-only why-questions do not imply a failure. Route those by their actual task type, and do not treat it as a bug diagnostic unless the question is tied to a bug, error, failure, regression, unexpected behavior, or broken test.

For ordinary bug diagnostics, use a lightweight path: route to `systematic-debugging`, perform read-only investigation, discuss the evidence and root-cause direction with the user, and wait for explicit fix authorization before editing files.

Ordinary read-only diagnostic work does not require `proposing`, `specifying`, `designing`, or `planning`. Escalate to the artifact workflow when investigation reveals a behavior change or expanded scope that needs a new user-visible contract.

Fix authorization is not an artifact-workflow bypass. Before editing for a bug fix, bind the fix to an existing accepted spec, existing observable contract, or failing test. If the expected behavior is not already specified, or the fix changes user-visible behavior, create or confirm a minimal bug specification before implementation. If no new spec artifact is required because the repair only restores an existing observable contract, state that contract and the failing test or reproduction that proves it before entering implementation.

## Routing Decision Table

Choose one primary workflow skill first. Add rule or quality skills only when the selected workflow reaches that checkpoint.

| User request or repository state | Primary skill | Notes |
| --- | --- | --- |
| Vague request, unclear scope, competing approaches, or context needed before choosing a change | `exploring` | Do not create artifacts during exploration. Transition to `proposing` only after user confirmation. |
| Concrete new feature, behavior change, or implementation intent without an active change artifact | `proposing` | If discovery is still required, use `exploring` first. |
| Accepted proposal but missing behavioral requirements | `specifying` | Mandatory before design or implementation. |
| Requirements agreed but technical approach, trade-offs, or file boundaries unresolved | `designing` | Keep design separate from task planning. |
| Requirements and design agreed but no executable task list exists | `planning` | Produce small test-first tasks and establish execution mode. |
| Approved `tasks.md` exists and the user wants implementation to begin or resume | `spec-driven-development` | Reuse the current execution mode if already chosen; otherwise ask for `Step-by-Step` or `Fast`. |
| Bug report, error report, failure, regression, flaky behavior, unexpected test result, or failure-related why-question | `systematic-debugging` | Enter diagnostic discussion mode; understand root cause, then keep any authorized fix bound to an existing spec, observable contract, failing test, or minimal bug specification before editing. |
| User explicitly asks for standalone review or merge-readiness review | `requesting-code-review` | Keep one surfaced review conclusion; specialist reviewers stay internal. |
| User asks to respond to or implement review feedback | `receiving-code-review` | Verify feedback against code before accepting it. |
| User asks to install, repair, diagnose, add, remove, or change SpecPowers modules | `selective-install` | Runtime routing must not call installers implicitly. |
| Completed and accepted change should be closed | `archiving` | Only after implementation and review are done. |

Support skills are not primary routes:

| Support skill | Use only when |
| --- | --- |
| `rules-common` / `rules-*` | Coding or review is active and the rule skill exists in the managed payload. |
| `test-driven-development` | An implementation task reaches its TDD step or a subagent asks for TDD coaching. |
| `confidence-loop` | An artifact handoff, implementation, review, or completion gate needs evidence-bound confidence before proceeding or claiming done, approved, fixed, passing, or ready. |
| `quality-gate` | The user asks for automated quality checks or an active workflow reaches that checkpoint. |
| `verification-loop` | A milestone or final readiness checkpoint explicitly requires full verification. |
| `verification-before-completion` | The workflow is about to make a completion, fixed, passing, commit-ready, or PR-ready claim. |
| `dispatching-parallel-agents` | Independent workstreams exist and subagent use is explicitly appropriate for the platform. |

Post-implementation routing:

- During coding or review, load `rules-common` and the relevant language rules first.
- After a `completed code implementation`, including `ordinary code implementation`, run or apply `confidence-loop` before reporting complete, fixed, passing, ready for review, or safe to proceed.
- Ordinary implementation uses the `same evidence-bound confidence definition` from `confidence-loop`; do not create a new route or weaker local checklist.
- A `read-only investigation, proposal, spec, design, or planning` result `does not trigger the post-implementation Confidence Loop`; do not claim code implementation is complete for non-code work.

## Language Rule Activation

`using-skills` is a runtime routing skill, not an installer. During a chat session it must not write files, regenerate plugin payloads, or install language rules.

Runtime rule handling:

1. When coding or reviewing code, load `rules-common` if it exists in the managed plugin payload.
2. If the relevant language rule skill also exists in the managed payload, load it after `rules-common`.
3. If the relevant language rule skill is missing, continue with `rules-common` and tell the user which install command would add the missing rule.
4. Do not call `scripts/install.js` or `scripts/lib/session-bootstrap.js` from this skill unless the user explicitly asks to install or repair modules.

Installer boundary:

- `scripts/install.js` is the supported way to generate plugin payloads.
- `scripts/lib/session-bootstrap.js` is a programmatic installer helper, not an active runtime hook.
- `scripts/lib/language-detect.js` may identify installable language rule modules, but detection alone does not make a rule available in the current session.

## Skill Types

- **Rigid:** `debugging`, `specifying`, `verification-loop`, `quality-gate`, `confidence-loop`, and TDD-oriented skills. Follow the steps exactly.
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
- Completed code implementation ran or applied `confidence-loop` before any complete, fixed, passing, ready for review, or safe-to-proceed claim.
- Execution mode was established when implementing from `tasks.md`.
- Any skipped bootstrap or unavailable tool was disclosed only when it affects the task.
