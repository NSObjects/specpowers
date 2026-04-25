# Kiro IDE Tool Mapping

SpecPowers skills usually name Claude Code tools. In Kiro IDE Power mode, translate them as follows.

| Skill reference | Kiro equivalent |
| --- | --- |
| `Skill` | Read `skills/<name>/SKILL.md`, or read the matching steering file with `kiroPowers(action="readSteering", powerName="specpowers", steeringFile="<skill-name>.md")`. |
| `specpowers:<skill>` | Read `<skill>.md` from the SpecPowers steering files. |
| `Agent` or legacy `Task` | `invokeSubAgent` with the `general-task-execution` agent. |
| Multiple `Agent` calls | Multiple `invokeSubAgent` calls. |
| `TodoWrite` | Track tasks inline or in `tasks.md`, depending on the active skill. |
| `Read` | `readFile`, `readCode`, or `readMultipleFiles`. |
| `Write` | `fsWrite` or `fsAppend`. |
| `Edit` | `strReplace`. |
| `Bash` | `executeBash`. |

## Named Agent Dispatch

Claude Code skills may reference named agents such as `specpowers:code-reviewer`. In Kiro, dispatch these through `invokeSubAgent`:

1. Find the referenced prompt file, for example `skills/requesting-code-review/code-reviewer-prompt.md`.
2. Read the prompt content.
3. Fill all template placeholders such as `{BASE_SHA}` and `{WHAT_WAS_IMPLEMENTED}`.
4. Invoke `general-task-execution` with the filled prompt.

| Skill instruction | Kiro execution |
| --- | --- |
| `Agent tool (specpowers:code-reviewer)` | `invokeSubAgent(name="general-task-execution", prompt=<filled code-reviewer prompt>)` |
| `Agent tool (general-purpose)` with inline prompt | `invokeSubAgent(name="general-task-execution", prompt=<same inline prompt>)` |

## Steering Files

Kiro stores steering files in `.kiro/steering/*.md`. The project-level `steering/` files should mirror the skill contents. When a skill says to invoke another skill, read the corresponding steering file before continuing.

## Hooks

Kiro hooks live in `.kiro/hooks/*.json` and can automate file-event, prompt-submission, tool-use, and workflow actions. Only create or modify hooks when the user asks or when an active skill explicitly requires it.
