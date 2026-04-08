# SpecPowers

[English](README.md) | [中文](README.zh-CN.md)

Spec-driven development workflow for AI coding assistants. Your agent thinks before it codes.

## What It Does

When you ask your AI agent to build something, it doesn't jump into code. Instead:

```
exploring → proposing → specifying → designing → planning → executing → archiving
```

1. **Explores** your intent through Socratic dialogue
2. **Proposes** scope, non-goals, and success criteria
3. **Specifies** testable behavior in GIVEN/WHEN/THEN format — the spine of the workflow
4. **Designs** architecture with documented trade-offs
5. **Plans** fine-grained TDD tasks, each mapped to a spec scenario
6. **Executes** with strict RED→GREEN→REFACTOR, auto code review after each task
7. **Archives** delta specs into the main specification

Every line of code traces back to a spec. Nothing is built without one.

```mermaid
flowchart TD
    Start([User Request]) --> Exploring[exploring<br/>Socratic dialogue]
    Exploring --> Proposing[proposing<br/>proposal.md]
    Proposing --> Specifying[specifying<br/>spec.md · GIVEN/WHEN/THEN]
    Specifying --> Designing[designing<br/>design.md]
    Designing --> Planning[planning<br/>tasks.md · TDD tasks ↔ specs]
    Planning --> Choice{Execution Mode}
    Choice -->|Step-by-Step| Step[Execute 1 task → Review → Pause]
    Choice -->|Fast| Fast[Execute all → Unified review]
    Step -.->|commit then continue| Step
    Step --> Done
    Fast --> Done
    Done{All done} --> Archiving[archiving<br/>Merge delta specs]
```

## Quick Example

```text
You: "Add dark mode to the app"

AI:  [exploring]  "System-auto-detect, manual toggle, or both?"
You: "Both"

AI:  [proposing]  → proposal.md    ✓ intent, scope, non-goals
AI:  [specifying] → spec.md        ✓ 2 requirements, 4 scenarios
AI:  [designing]  → design.md      ✓ CSS Variables, 3 files
AI:  [planning]   → tasks.md       ✓ 3 tasks mapped to specs
     "Step-by-Step or Fast Mode?"

You: "Step-by-Step"

AI:  ✅ Task 1: Theme Context — RED → GREEN → Code Review: APPROVED
     ⏸️ "Review and commit, then say Continue"
You: "Continue"
AI:  ✅ Task 2: Toggle — done
You: "Continue"
AI:  ✅ Task 3: CSS Variables — done
     🎉 All tasks complete. Say "Archive" to merge specs.
```

## Installation

### Supported Platforms

| Platform | Command |
|----------|---------|
| **Claude Code** | Step 1: `/plugin marketplace add NSObjects/specpowers` <br> Step 2: `/plugin install specpowers` |
| **Cursor** | `/add-plugin https://github.com/NSObjects/specpowers` |
| **Gemini CLI** | `gemini extensions install https://github.com/NSObjects/specpowers` |
| **Kiro IDE** | Powers panel → Add power from GitHub → `https://github.com/NSObjects/specpowers` |
| **Codex** | Fetch and follow instructions from `https://raw.githubusercontent.com/NSObjects/specpowers/refs/heads/main/.codex/INSTALL.md` |
| **OpenCode** | Fetch and follow instructions from `https://raw.githubusercontent.com/NSObjects/specpowers/refs/heads/main/.opencode/INSTALL.md` |

### Verify

Start a new session and say "I want to build X". The agent should begin with `exploring` — asking questions, not writing code.

## Key Design Choices

### You Control Git

The agent never runs git commands. It pauses after each task for you to review and commit.

### Behavioral Shaping

Every skill includes Red Flags tables, Iron Laws, and rationalization defenses — hard constraints derived from real failure patterns, not suggestions.

### Role Isolation

The AI plays a different constrained role at each stage:

| Stage | Role | Cannot |
|-------|------|--------|
| Exploring | Interviewer | Create artifacts |
| Proposing | Product Manager | Write specs or design |
| Specifying | QA Architect | Mention implementation details |
| Designing | System Architect | Write code |
| Planning | Tech Lead | Start implementing |
| Executing | Developer | Skip TDD or modify specs |

### Dual Execution Mode

- **Step-by-Step** (default): one task → review → commit → continue
- **Fast Mode**: all tasks → unified review → commit everything

## Skills

### Core Workflow

| Skill | Purpose |
|-------|---------|
| `using-skills` | Session init and skill routing |
| `exploring` | Socratic requirement exploration |
| `proposing` | Intent and scope capture → proposal.md |
| `specifying` | Behavioral specs in GIVEN/WHEN/THEN → spec.md |
| `designing` | Architecture decisions → design.md |
| `planning` | TDD task decomposition → tasks.md |
| `spec-driven-development` | Dual-mode execution engine |
| `archiving` | Delta spec merging and history |

### Foundation

| Skill | Purpose |
|-------|---------|
| `test-driven-development` | RED-GREEN-REFACTOR iron law |
| `systematic-debugging` | 4-phase root cause analysis |
| `dispatching-parallel-agents` | Parallel agent dispatch for independent problems |
| `requesting-code-review` | Code review subagent dispatch |
| `receiving-code-review` | Handling review feedback |
| `verification-before-completion` | Evidence before claims |
| `writing-skills` | Meta-skill for creating new skills |

## Philosophy

- **Specs before code** — define behavior before implementing
- **Structured not freeform** — GIVEN/WHEN/THEN, not prose
- **Incremental not waterfall** — delta specs for existing projects
- **TDD is mandatory** — every task starts with a failing test
- **Evidence over claims** — prove it works before moving on
- **Brownfield-first** — built for existing codebases, works great for greenfield too

## Acknowledgments

SpecPowers builds on ideas from two projects:

- [OpenSpec](https://github.com/Fission-AI/OpenSpec) — structured artifact system for spec-driven workflows
- [Superpowers](https://github.com/obra/superpowers) — behavioral shaping engine for AI coding agents

## License

MIT
