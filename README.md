# SpecPowers

[English](README.md) | [中文](README.zh-CN.md)

> Spec-driven development workflow for AI coding assistants. Your agent thinks before it codes.

## Why

AI coding agents are fast but sloppy. They skip requirements, ignore edge cases, and write code before understanding the problem. SpecPowers fixes this by enforcing a structured workflow:

```
exploring → proposing → specifying → designing → planning → spec-driven-development → archiving
```

Every line of code traces back to a spec. Nothing is built without one.

## How It Works

```text
You: "Add dark mode to the app"

AI:  [exploring]  "System-auto-detect, manual toggle, or both?"
You: "Both"

AI:  [proposing]  → proposal.md    ✓ intent, scope, non-goals
AI:  [specifying] → spec.md        ✓ 2 requirements, 4 scenarios (GIVEN/WHEN/THEN)
AI:  [designing]  → design.md      ✓ CSS Variables, 3 files
AI:  [planning]   → tasks.md       ✓ 3 TDD tasks mapped to specs

You: "Step-by-Step"

AI:  ✅ Task 1 — RED → GREEN → Code Review: APPROVED → ⏸️ you commit
AI:  ✅ Task 2 — done → ⏸️ you commit
AI:  ✅ Task 3 — done
     🎉 All tasks complete. Say "Archive" to merge specs.
```

The agent never runs git. You review and commit after each task.

For complex requests, `exploring` may research existing implementations or delegate bounded research, but that stays inside `exploring` rather than becoming a separate workflow phase.

```mermaid
flowchart TD
    Start([User Request]) --> Exploring[exploring<br/>Socratic dialogue]
    Exploring --> Proposing[proposing<br/>proposal.md]
    Proposing --> Specifying[specifying<br/>spec.md · GIVEN/WHEN/THEN]
    Specifying --> Designing[designing<br/>design.md]
    Designing --> Planning[planning<br/>tasks.md · TDD tasks]
    Planning --> Execution[spec-driven-development<br/>execution modes]
    Execution --> Choice{Execution Mode}
    Choice -->|Step-by-Step| Step[1 task → review → pause]
    Choice -->|Fast| Fast[all tasks → unified review]
    Step -.->|commit then continue| Step
    Step --> Done
    Fast --> Done
    Done{Done} --> Archiving[archiving<br/>merge delta specs]
```

## Install

> Requires Node.js for language rule auto-install and selective install.

| Platform | Status | How to install |
|----------|--------|---------------|
| **Claude Code** | ✅ | `/plugin marketplace add NSObjects/specpowers` then `/plugin install specpowers` |
| **Codex** | ✅ | Fetch and follow instructions from `https://raw.githubusercontent.com/NSObjects/specpowers/refs/heads/main/.codex/INSTALL.md` |
| **Kiro IDE** | ✅ | Powers panel → Add power from GitHub → `NSObjects/specpowers` |
| **Cursor** | ❌ | `/add-plugin https://github.com/NSObjects/specpowers` |
| **Gemini CLI** | ❌ | `gemini extensions install https://github.com/NSObjects/specpowers` |
| **OpenCode** | ❌ | Fetch and follow instructions from `https://raw.githubusercontent.com/NSObjects/specpowers/refs/heads/main/.opencode/INSTALL.md` |

For Codex local-plugin installs, bootstrap the managed skills payload once from the cloned repo before first use:

```bash
node scripts/install.js --platform codex --profile developer
```

### Language Rules

When the agent activates the `using-skills` skill at session start, it scans your project files and auto-installs matching language rules — e.g., `.ts` files trigger `rules-typescript`, `.py` triggers `rules-python`. No manual setup needed for language rules.

If it's the first session after install (no prior install state), the agent also runs the `developer` profile setup automatically.

### Verify

Start a new session and say "I want to build X". The agent should begin with `exploring` — asking questions, not writing code.

## What's Included

### Workflow (the spec-driven pipeline)

| Skill | What it does |
|-------|-------------|
| `exploring` | Socratic dialogue to understand intent, with implementation research only when needed |
| `proposing` | Scope, non-goals, success criteria → proposal.md |
| `specifying` | GIVEN/WHEN/THEN behavioral specs → spec.md |
| `designing` | Architecture with trade-offs → design.md |
| `planning` | TDD task breakdown → tasks.md |
| `spec-driven-development` | Step-by-step or fast execution engine |
| `archiving` | Merge delta specs into main spec |

### Quality

| Skill | What it does |
|-------|-------------|
| `test-driven-development` | RED → GREEN → REFACTOR, no exceptions |
| `verification-loop` | 6-stage pipeline: Build → Types → Lint → Tests → Security → Diff |
| `quality-gate` | Fast lint/type checks after edits |
| `systematic-debugging` | 4-phase root cause analysis |

### Language Rules

Auto-detected from your project files. `rules-common` loads first, then language-specific rules layer on top.

TypeScript · Python · Go · Rust · Java · Kotlin · C++ · Swift · PHP · Perl · C# · Dart

### Collaboration

| Skill | What it does |
|-------|-------------|
| `requesting-code-review` | Dispatch review subagent |
| `receiving-code-review` | Handle review feedback |
| `dispatching-parallel-agents` | Fan out independent tasks |

### Role Agents

Pre-built agent templates: `planner` (read-only analysis), `security-reviewer` (vulnerability grading), `tdd-guide` (TDD coaching).

## Design Principles

- **Specs before code** — define behavior, then implement
- **TDD is mandatory** — every task starts with a failing test
- **Evidence over claims** — prove it works before moving on
- **Research is embedded, not a phase** — investigate existing solutions inside decision-making stages instead of adding workflow branches
- **You control git** — the agent never commits; you review everything
- **Role isolation** — the AI plays a constrained role at each stage (interviewer, architect, developer…)
- **Brownfield-first** — built for existing codebases, works great for greenfield too

## Advanced: Selective Install

For fine-grained control (most users don't need this):

```bash
node scripts/install.js --platform claude-code --profile developer
node scripts/install.js --platform kiro-ide --add rules-typescript
node scripts/install.js --platform cursor --profile full --exclude rules-rust
```

Profiles: `core` (minimal) · `developer` (recommended) · `security` · `full` (everything).

Module lifecycle commands (`list`, `doctor`, `repair`, `uninstall`) are in the `selective-install` skill.

## Contributing

Issues and PRs welcome. If you're adding a new skill, use the `writing-skills` meta-skill — it enforces the skill template structure.

## Acknowledgments

Built on ideas from [OpenSpec](https://github.com/Fission-AI/OpenSpec) (structured artifact system) and [Superpowers](https://github.com/obra/superpowers) (behavioral shaping engine).

## License

MIT
