# Qoder Tool Mapping

SpecPowers skills usually name Claude Code tools. In Qoder CLI or Qoder IDE, translate them through Qoder Skills, Subagents, Custom Agents, and Agent Mode tooling.

## Skill Loading

| Skill reference | Qoder execution |
| --- | --- |
| `Skill` | Use Qoder Skills. Let Qoder trigger the skill automatically from the request, or invoke it manually with `/skill-name`. |
| `skills/<name>/SKILL.md` | Install or inspect the corresponding Qoder skill directory. |
| `What Skills are available?` | Ask this in chat or use `/skills` in Qoder CLI. |
| Supporting file reference | Read the referenced file only when the active skill asks for it or when the task requires the detail. |

Qoder skill locations:

| Scope | Path | Notes |
| --- | --- | --- |
| User-level | `~/.qoder/skills/<skill-name>/SKILL.md` | Available across projects for the current user. |
| Project-level | `.qoder/skills/<skill-name>/SKILL.md` | Current project only; project-level skills override user-level skills with the same name. |

Qoder loads skill name and description at startup. After creating or modifying a skill, restart Qoder CLI if the current session does not pick it up.

Minimal skill shape:

```markdown
---
name: api-doc-generator
description: Generate API documentation from code. Use when documenting endpoints or generating OpenAPI specs.
---

When generating API documentation:
1. Identify endpoints and routes.
2. Document request and response formats.
3. Include authentication requirements.
4. Add examples.
```

## Core Tool Translation

| SpecPowers / Claude-style reference | Qoder execution |
| --- | --- |
| `Agent` or legacy `Task` | Use Qoder Subagents or Custom Agents. Invoke explicitly with natural language such as `Use the code-reviewer subagent to review this code`, or let Qoder choose implicitly from the task description. |
| Multiple `Agent` calls | Use chained subagent invocation when order matters. For independent parallel work, use separate subagent requests if the current Qoder mode supports it; otherwise perform serially. |
| `TodoWrite` | Use Qoder To-dos when visible in Agent Mode. If the active SpecPowers skill requires an artifact, update `tasks.md` instead. |
| `Read` | Use Qoder `Read`. |
| `Write` | Use Qoder `Write`. |
| `Edit` | Use Qoder `Edit`. |
| `Glob` | Use Qoder `Glob`. |
| `Grep` | Use Qoder `Grep`. |
| `Bash` | Use Qoder `Bash` or Agent Mode command execution. Commands may require user confirmation unless allowlisted in Qoder settings. |
| `WebFetch` | Use Qoder `WebFetch` when available. |
| `WebSearch` | Use Qoder `WebSearch` when available. |
| MCP tools | Use configured MCP tools. Agent Mode may ask for confirmation before invoking an MCP tool. |

## Built-in and Custom Subagents

Qoder CLI includes built-in subagents such as:

| Built-in subagent | Use |
| --- | --- |
| `code-reviewer` | Local code review. |
| `design-agent` | Software design and design documents. |
| `general-purpose` | General multi-step tasks. |
| `task-executor` | Development from design documents. |

Invoke explicitly:

```text
Use the code-reviewer subagent to review this code
```

Headless example:

```bash
qodercli -p "Use the code-reviewer subagent to review this code"
```

For chained execution:

```text
First use general-purpose subagent to complete the design, then use code-reviewer subagent to review the generated code
```

## Custom Agent Files

Project-level custom agents:

```text
.qoder/agents/<agentName>.md
```

User-level custom agents:

```text
~/.qoder/agents/<agentName>.md
```

Project-level agents take precedence over user-level agents with the same name.

Minimal Qoder CLI subagent:

```markdown
---
name: api-reviewer
description: Review API designs for RESTful compliance and best practices.
tools: Read,Grep,Glob
---

You are an expert API design reviewer. Identify REST violations and provide actionable fixes.
```

Qoder IDE Custom Agent frontmatter may also include `skills` and `mcpServers`:

```markdown
---
name: code-review
description: Code review expert, checks code quality and security
tools: Read, Grep, Glob, Bash
skills:
 - using-skills
mcpServers:
 - playwright
---

You are a senior code reviewer responsible for ensuring code quality.
```

Use only the fields the workflow needs. Keep tool permissions narrow for review-only agents.

## Named Agent Dispatch

SpecPowers skills may reference named Claude Code agents such as `specpowers:code-reviewer`. Qoder does not automatically know those names unless matching agents are installed.

Use this order:

1. If a matching Qoder custom agent exists, invoke it directly.
2. If a close built-in agent exists, invoke the built-in agent with the filled SpecPowers prompt.
3. If no matching agent exists and file writes are allowed, create a project-level `.qoder/agents/<agentName>.md` only when the user or active skill permits creating platform assets.
4. Otherwise, perform the work in the main agent and disclose the limitation only if it changes the result.

| Skill instruction | Qoder execution |
| --- | --- |
| `Agent tool (specpowers:code-reviewer)` | Use an installed `specpowers-code-reviewer` custom agent, or invoke `code-reviewer` / `general-purpose` with the filled prompt. |
| `Agent tool (general-purpose)` with inline prompt | `Use the general-purpose subagent to perform the following: <prompt>`. |
| `Agent tool (design-agent)` | Use Qoder `design-agent` when available. |
| `Agent tool (task-executor)` | Use Qoder `task-executor` when implementing from an approved design or task plan. |

## Message Framing for Qoder Subagents

Frame delegated tasks as concrete work, not just persona text:

```text
Use the general-purpose subagent to perform the following task.

<agent-instructions>
[filled prompt content]
</agent-instructions>

Execute this now. Return only the structured result requested in the instructions.
```

For code review, prefer read-only tools where possible:

```markdown
tools: Read,Grep,Glob,Bash
```

Avoid granting `Write` or `Edit` to review-only agents unless the task explicitly requires making changes.

## Qoder Agent Mode Notes

- Agent Mode can plan, edit files, search the project, and execute terminal commands.
- Commands may require confirmation by default; use allowlists only for safe, expected commands.
- Qoder To-dos can track execution progress, but SpecPowers artifact workflows still own `specs/changes/<change>/tasks.md` when present.
- Qoder Skills are best for reusable workflows; Commands are better for simple explicit shortcuts.
- When multiple similar skills conflict, make descriptions more specific rather than adding broad routing rules.
