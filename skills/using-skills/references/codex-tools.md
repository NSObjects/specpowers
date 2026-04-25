# Codex Tool Mapping

SpecPowers skills usually name Claude Code tools. In Codex, translate them as follows.

| Skill reference | Codex equivalent |
| --- | --- |
| `Skill` | Native skill discovery/load. Follow the loaded skill content. |
| `Agent` or legacy `Task` | `spawn_agent`. Use `wait_agent` for results and `close_agent` when finished. |
| Multiple `Agent` calls | Multiple `spawn_agent` calls, then `wait_agent` for each. |
| `TodoWrite` | `update_plan`. |
| `Read`, `Write`, `Edit` | Native file tools. |
| `Bash` | Native shell tool. |

If a Codex environment does not expose subagent tools, do not invent a prerequisite. Use the fallback path in the active skill, or perform the work serially and disclose the limitation only if it changes the result.

## Named Agent Dispatch

Claude Code skills may reference named agents such as `specpowers:code-reviewer`. Codex does not have a named SpecPowers agent registry. Dispatch named agents manually:

1. Find the referenced prompt file, for example `skills/requesting-code-review/code-reviewer-prompt.md`.
2. Read the prompt content.
3. Fill all template placeholders such as `{BASE_SHA}` and `{WHAT_WAS_IMPLEMENTED}`.
4. Spawn a `worker` agent with the filled prompt as the message.
5. Wait for the result and close the agent slot.

| Skill instruction | Codex execution |
| --- | --- |
| `Agent tool (specpowers:code-reviewer)` | `spawn_agent(agent_type="worker", message=<filled code-reviewer prompt>)` |
| `Agent tool (general-purpose)` with inline prompt | `spawn_agent(message=<same inline prompt>)` |

## Message Framing for Subagents

The `message` parameter is user-level input. Frame it as a concrete task, not as a persona prompt:

```text
Your task is to perform the following. Follow the instructions below exactly.

<agent-instructions>
[filled prompt content]
</agent-instructions>

Execute this now. Output ONLY the structured response format requested above.
```

Use XML tags around the instructions and end with an explicit execution directive so the subagent performs the task rather than summarizing the prompt.
