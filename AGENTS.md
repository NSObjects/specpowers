# SpecPowers

This project uses spec-driven development with structured artifacts.

## For AI Agents

You have specpowers installed. At session start, the `using-skills` skill should be loaded automatically.

If skills are NOT auto-loaded, read `skills/using-skills/SKILL.md` immediately and follow it.

## Workflow

```
exploring → proposing → specifying → designing → planning → spec-driven-development → archiving
```

## Key Rules

- **Never skip specifying.** It's the spine of the workflow.
- **Do not mutate git state.** The user manages commits, resets, branch changes, pushes, and stash operations. Read-only inspection commands such as `git status`, `git diff`, `git log`, and `git show` are allowed when useful.
- **TDD is mandatory.** Every task starts with a failing test.
- **Per-task review gates.** In `spec-driven-development`, both execution modes run Stage 1 spec review and Stage 2 code-quality review after GREEN and before marking the task complete.
- **Check for active changes** in `specs/changes/` before starting new work.

## 调试真实问题

遇到真实 bug、生产问题、用户可见错误行为、crash、数据不一致、集成失败、配置问题、flaky 行为、回归或性能问题时，使用 `log-guided-debugging` skill。从代码路径发现和运行时证据开始。日志可能来自本地文件、云日志、通过 MCP 使用的 Alibaba Cloud SLS、traces、metrics、APM、错误上报或其他观测工具。不要把普通测试套件当成第一份或唯一的正确性证据。使用从当前仓库和已配置的 MCP servers 中发现的仓库专属命令和观测工具。
