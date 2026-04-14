<!-- generated from skills/ by sync-steering.js -->
# Codex Tool Mapping

Skills use current Claude Code tool names. Claude Code renamed `Task` to `Agent` in v2.1.63; older `Task` references still mean the same subagent-dispatch tool. When you encounter these in a skill, use your platform equivalent:

| Skill references | Codex equivalent |
|-----------------|------------------|
| `Agent` tool (dispatch subagent) | `spawn_agent` (see [Named agent dispatch](#named-agent-dispatch)) |
| Multiple `Agent` calls (parallel) | Multiple `spawn_agent` calls |
| Agent returns result | `wait_agent` |
| Agent completes automatically | `close_agent` to free slot |
| `TodoWrite` (task tracking) | `update_plan` |
| `Skill` tool (invoke a skill) | Skills load natively — just follow the instructions |
| `Read`, `Write`, `Edit` (files) | Use your native file tools |
| `Bash` (run commands) | Use your native shell tools |

## Native subagent support

Codex supports subagent dispatch natively. Use `spawn_agent`, `wait_agent`, and
`close_agent` when a skill asks you to delegate work. If a particular Codex
environment does not expose subagent tools, follow the fallback path described
in that skill instead of inventing a new prerequisite step.

## Named agent dispatch

Claude Code skills reference named agent types like `specpowers:code-reviewer`.
Codex does not have a named agent registry — `spawn_agent` creates generic agents
from built-in roles (`default`, `explorer`, `worker`).

When a skill says to dispatch a named agent type:

1. Find the agent's prompt file (e.g., `skills/requesting-code-review/code-reviewer-prompt.md`)
2. Read the prompt content
3. Fill any template placeholders (`{BASE_SHA}`, `{WHAT_WAS_IMPLEMENTED}`, etc.)
4. Spawn a `worker` agent with the filled content as the `message`

| Skill instruction | Codex equivalent |
|-------------------|------------------|
| `Agent tool (specpowers:code-reviewer)` | `spawn_agent(agent_type="worker", message=...)` with `code-reviewer-prompt.md` content |
| `Agent tool (general-purpose)` with inline prompt | `spawn_agent(message=...)` with the same prompt |

### Message framing

The `message` parameter is user-level input, not a system prompt. Structure it
for maximum instruction adherence:

```
Your task is to perform the following. Follow the instructions below exactly.

<agent-instructions>
[filled prompt content from the agent's .md file]
</agent-instructions>

Execute this now. Output ONLY the structured response following the format
specified in the instructions above.
```

- Use task-delegation framing ("Your task is...") rather than persona framing ("You are...")
- Wrap instructions in XML tags — the model treats tagged blocks as authoritative
- End with an explicit execution directive to prevent summarization of the instructions
