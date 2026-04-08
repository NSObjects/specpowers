# Kiro IDE Tool Mapping

Skills use Claude Code tool names. When you encounter these in a skill, use your Kiro equivalent:

| Skill references | Kiro equivalent |
|-----------------|-----------------|
| `Skill` tool (invoke a skill) | Read `skills/<name>/SKILL.md` directly with readFile/readCode |
| `Task` tool (dispatch subagent) | `invokeSubAgent` with `general-task-execution` agent |
| Multiple `Task` calls (parallel) | Multiple `invokeSubAgent` calls |
| `TodoWrite` (task tracking) | Track tasks inline in conversation or in tasks.md |
| `Read` (read files) | `readFile`, `readCode`, `readMultipleFiles` |
| `Write` (create files) | `fsWrite`, `fsAppend` |
| `Edit` (modify files) | `strReplace` |
| `Bash` (run commands) | `executeBash` |

## Named agent dispatch

Claude Code skills reference named agent types like `specpowers:code-reviewer`.
Kiro uses `invokeSubAgent` with the `general-task-execution` agent.

When a skill says to dispatch a named agent type:

1. Find the agent's prompt file (e.g., `skills/requesting-code-review/code-reviewer-prompt.md`)
2. Read the prompt content
3. Fill any template placeholders (`{BASE_SHA}`, `{WHAT_WAS_IMPLEMENTED}`, etc.)
4. Use `invokeSubAgent` with `general-task-execution` and the filled content as the prompt

| Skill instruction | Kiro equivalent |
|-------------------|-----------------|
| `Task tool (specpowers:code-reviewer)` | `invokeSubAgent(name="general-task-execution", prompt=...)` with `code-reviewer-prompt.md` content |
| `Task tool (general-purpose)` with inline prompt | `invokeSubAgent(name="general-task-execution", prompt=...)` with the same prompt |

## Steering files

Kiro supports steering files in `.kiro/steering/*.md`. The project's steering files in `steering/` contain the same content as the skills and are loaded via the Kiro steering system.

## Hooks

Kiro supports hooks in `.kiro/hooks/*.json`. These can automate actions on file events, prompt submission, tool use, and more.
