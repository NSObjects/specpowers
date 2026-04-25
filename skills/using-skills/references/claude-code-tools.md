# Claude Code Tool Mapping

SpecPowers skills are closest to Claude Code conventions. In Claude Code, use the native tool names directly unless the active environment exposes a newer or narrower equivalent.

## Skill Loading

| Skill reference | Claude Code execution |
| --- | --- |
| `Skill` | Use the native `Skill` tool, or invoke the skill directly as `/skill-name` when user-facing invocation is appropriate. |
| `skills/<name>/SKILL.md` | Install or inspect the skill directory. Claude Code discovers skills from personal, project, enterprise, and plugin locations. |
| Supporting file reference | Read the referenced file only when the loaded skill asks for it or when the task requires the detail. |

Skill locations and precedence:

| Scope | Path / source | Notes |
| --- | --- | --- |
| Enterprise | Managed settings | Highest precedence. |
| Personal | `~/.claude/skills/<skill-name>/SKILL.md` | Available across projects. |
| Project | `.claude/skills/<skill-name>/SKILL.md` | Current project only. |
| Plugin | `<plugin>/skills/<skill-name>/SKILL.md` | Namespaced as `plugin-name:skill-name`. |

Claude Code watches existing skill directories for changes during a session. If a top-level skill directory did not exist when the session started, restart Claude Code so it can be watched.

## Core Tool Translation

| SpecPowers / Claude-style reference | Claude Code execution |
| --- | --- |
| `Agent` | Use the `Agent` tool to spawn a subagent with an independent context window. |
| legacy `Task` | Treat as `Agent`. `Task(...)` references may still work as aliases in settings and agent definitions, but new instructions should say `Agent`. |
| Multiple `Agent` calls | Spawn multiple subagents when the work is independent. Use foreground/background behavior according to the active skill and Claude Code UI. |
| `TodoWrite` | In non-interactive mode or Agent SDK, use `TodoWrite`. In interactive Claude Code sessions, use `TaskCreate`, `TaskGet`, `TaskList`, and `TaskUpdate` when available. If the active SpecPowers skill requires `tasks.md`, update `tasks.md` instead of replacing it with an internal todo list. |
| `Read`, `Write`, `Edit` | Use native file tools. Respect permissions and approval prompts. |
| `Glob`, `Grep` | Use native search tools. Prefer targeted searches over broad scans. |
| `Bash` | Use the native shell tool. Remember that environment variables do not persist between shell calls; working-directory persistence depends on Claude Code settings and project boundaries. |
| `PowerShell` | Use only when available or explicitly configured. On Windows, Claude Code may route commands through PowerShell when enabled. |
| `LSP` | Use when available for definitions, references, symbol lookup, implementations, call hierarchy, type errors, and diagnostics. |
| `WebFetch`, `WebSearch` | Use native web tools when available and allowed by policy. |
| `EnterPlanMode`, `ExitPlanMode` | Use when the workflow requires plan-mode behavior before edits. Do not use these to bypass SpecPowers artifact stages. |

## Named Agent Dispatch

Claude Code skills may reference named agents such as `specpowers:code-reviewer`.

1. If the named agent is registered, dispatch it directly with `Agent(agent_type="specpowers:code-reviewer", prompt=<task>)`.
2. If it is not registered but the skill includes a prompt file, read the prompt file, fill all template placeholders, and dispatch a suitable available subagent such as `general-purpose`.
3. If no suitable subagent exists, perform the work in the main conversation and disclose the limitation only if it changes the result.

| Skill instruction | Claude Code execution |
| --- | --- |
| `Agent tool (specpowers:code-reviewer)` | `Agent(agent_type="specpowers:code-reviewer", prompt=<filled code-reviewer prompt>)` if available. |
| `Agent tool (general-purpose)` with inline prompt | `Agent(agent_type="general-purpose", prompt=<same inline prompt>)`. |
| `Agent` with no named type | Use the most appropriate built-in or custom subagent. Prefer `Explore` for read-only codebase discovery and `general-purpose` for complex multi-step work. |

## Subagent Files

Subagents are Markdown files with YAML frontmatter followed by the system prompt.

Project-level agents usually live at:

```text
.claude/agents/<agent-name>.md
```

User-level agents usually live at:

```text
~/.claude/agents/<agent-name>.md
```

Minimal example:

```markdown
---
name: code-reviewer
description: Reviews code for quality, security, and maintainability
tools: Read, Grep, Glob, Bash
model: sonnet
---

You are a senior code reviewer. Provide specific, actionable findings.
```

Use only `name` and `description` as required fields. Add `tools`, `disallowedTools`, `model`, `permissionMode`, `maxTurns`, `skills`, `mcpServers`, `hooks`, `memory`, `background`, `effort`, `isolation`, `color`, or `initialPrompt` only when the workflow needs them.

Important boundaries:

- Subagents do not inherit skills loaded in the parent conversation. Use the subagent `skills` frontmatter field when a skill must be preloaded into a subagent.
- Subagents cannot spawn other subagents.
- To limit subagent capability, prefer explicit `tools` allowlists or `disallowedTools` denylists.
- Use `isolation: worktree` only when an isolated repository copy is useful and supported.

## Skill Frontmatter Notes

Claude Code supports the open Agent Skills structure and adds platform-specific fields. Common fields:

| Field | Use |
| --- | --- |
| `name` | Optional display/slash-command name. If omitted, the directory name is used. |
| `description` | Recommended. Claude uses it to decide when to invoke the skill. |
| `when_to_use` | Extra trigger guidance, appended to the skill listing. |
| `disable-model-invocation` | Set `true` for manual-only workflows such as deploy or commit. |
| `user-invocable` | Set `false` for background knowledge skills. |
| `allowed-tools` | Tools Claude can use without asking while the skill is active. |
| `context: fork` | Run the skill in a forked subagent context. |
| `agent` | Subagent type to use with `context: fork`. |
| `paths` | Restrict automatic activation to matching file paths. |
| `shell` | Select `bash` or `powershell` for skill shell blocks. |

Keep `SKILL.md` concise. Put large API references, examples, templates, and helper scripts in supporting files and reference them from the main skill.
