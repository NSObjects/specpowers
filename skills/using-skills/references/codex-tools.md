# Codex Tool Mapping

SpecPowers skills usually name Claude Code tools. In Codex, translate them as follows.

Codex supports subagent dispatch natively. Use `spawn_agent` to dispatch and `wait_agent` to collect results.

| Skill reference | Codex equivalent |
| --- | --- |
| `Skill` | Native skill discovery/load. Follow the loaded skill content. |
| `Agent` tool (dispatch subagent) | `spawn_agent`. Use `wait_agent` for results and `close_agent` when finished. |
| legacy `Task` | Treat as `Agent` and use `spawn_agent`. |
| Multiple `Agent` calls | Multiple `spawn_agent` calls, then `wait_agent` for each. |
| `TodoWrite` | `update_plan`. |
| `Read`, `Write`, `Edit` | Native file tools. |
| `Bash` | Native shell tool. |

If a Codex environment does not expose subagent tools, do not invent a prerequisite. Use the fallback path in the active skill, or perform the work serially and disclose the limitation only if it changes the result.

## Named Agent Dispatch

Claude Code skills may reference named agents such as `specpowers:code-reviewer`. Codex does not have a named SpecPowers agent registry. Dispatch named agents manually:

1. Find the referenced prompt file. For task-internal code quality review, use `skills/spec-driven-development/code-quality-reviewer-prompt.md`. For standalone review, use `skills/requesting-code-review/code-reviewer-prompt.md`.
2. Read the prompt content.
3. Fill all template placeholders such as `{BASE_SHA}` and `{WHAT_WAS_IMPLEMENTED}`.
4. Spawn a `worker` agent with the filled prompt as the message.
5. Wait for the result and close the agent slot.

| Skill instruction | Codex execution |
| --- | --- |
| `Agent tool (specpowers:code-reviewer)` in `spec-driven-development` | `spawn_agent(agent_type="worker", message=<filled skills/spec-driven-development/code-quality-reviewer-prompt.md>)` |
| `Agent tool (specpowers:code-reviewer)` in `requesting-code-review` | `spawn_agent(agent_type="worker", message=<filled skills/requesting-code-review/code-reviewer-prompt.md>)` |
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
