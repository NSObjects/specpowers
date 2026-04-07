# SpecPowers

Spec-driven development workflow for AI coding assistants. Merges [OpenSpec](https://github.com/Fission-AI/OpenSpec)'s structured artifact system with [Superpowers](https://github.com/obra/superpowers)' behavioral shaping engine.

## Philosophy

```text
→ specs before code
→ structured not freeform
→ incremental not waterfall
→ user controls the pace
→ brownfield-first
```

## How It Works

SpecPowers guides your AI coding assistant through a structured workflow:

1. **Exploring** — Socratic dialogue to understand what you're building
2. **Proposing** — Capture intent, scope, and approach in `proposal.md`
3. **Specifying** — Define testable behavior with GIVEN/WHEN/THEN scenarios
4. **Designing** — Technical architecture and file-level planning
5. **Planning** — Fine-grained TDD tasks, each mapped to a Spec scenario
6. **Executing** — Step-by-step or fast execution with Spec compliance checks
7. **Archiving** — Merge specs into long-term knowledge, preserve audit trail

## See It In Action

```text
You: "Add dark mode to the app"

AI:  [proposing] Created specs/changes/add-dark-mode/proposal.md
     ✓ Intent, scope, success criteria defined

AI:  [specifying] Created specs/changes/add-dark-mode/specs/ui/spec.md
     ✓ 2 Requirements, 4 Scenarios (GIVEN/WHEN/THEN)

AI:  [designing] Created specs/changes/add-dark-mode/design.md
     ✓ CSS Variables approach, 3 files to touch

AI:  [planning] Created specs/changes/add-dark-mode/tasks.md
     ✓ 3 Tasks, each mapped to Spec Scenarios

You: "逐任务执行"

AI:  ✅ Task 1.1: Theme Context — test written, RED, implemented, GREEN
     ⏸️ Please review and commit, then say "继续"

You: [reviews, commits] "继续"

AI:  ✅ Task 1.2: Theme Toggle — complete
     ⏸️ Please review and commit

You: [reviews, commits] "继续"

AI:  ✅ Task 1.3: CSS Variables — complete
     🎉 All done! Say "归档" to finalize.

You: "归档"

AI:  ✅ Specs merged into specs/specs/ui/spec.md
     ✅ Archived to specs/changes/archive/2026-04-07-add-dark-mode/
```

## Key Innovations

### Spec-Task Mapping

Every implementation task traces back to a specific behavioral scenario:

```
Spec Scenario (GIVEN/WHEN/THEN) → Task → Test → Code
```

This ensures nothing is built without a spec, and nothing is specified without being built.

### Structured Behavioral Specs

Not freeform prose. Structured, testable, with RFC 2119 keywords:

```markdown
### Requirement: Theme Switching
The system SHALL support light and dark themes.

#### Scenario: System preference detection
- GIVEN the user has not set a manual preference
- WHEN the OS is set to dark mode
- THEN the app renders in dark theme
```

### Delta Specs for Brownfield

For existing projects, specs describe only what's changing:

```markdown
## ADDED Requirements
### Requirement: Dark Mode Support
...

## MODIFIED Requirements
### Requirement: Theme Default
(Previously: always light)
...
```

### Behavioral Shaping

Red Flags tables, Iron Laws, and Rationalization defenses in every skill prevent the AI from cutting corners.

## Installation

### Claude Code

```bash
/plugin install specpowers
```

### Cursor

See `.cursor-plugin/plugin.json` — install via Cursor's plugin system.

### Gemini CLI

```bash
gemini extensions install <path-to-specpowers>
```

### Codex

```bash
git clone <specpowers-repo-url> ~/.codex/specpowers
mkdir -p ~/.agents/skills
ln -s ~/.codex/specpowers/skills ~/.agents/skills/specpowers
```

See `.codex/INSTALL.md` for full details.

### OpenCode

Add to `opencode.json`:

```json
{
  "plugin": ["specpowers@git+<specpowers-repo-url>"]
}
```

See `.opencode/INSTALL.md` for full details.

### Manual

Copy this directory into your AI tool's plugin/extension path.

## What's Inside

### Skills (New)
- **using-skills** — Session initialization and skill routing
- **exploring** — Socratic requirement exploration
- **proposing** — Intent and scope capture (proposal.md)
- **specifying** — Structured behavioral specs (GIVEN/WHEN/THEN + Delta)
- **designing** — Architecture decisions (design.md)
- **planning** — TDD task decomposition with Spec-Task mapping
- **spec-driven-development** — Dual-mode execution (step-by-step / fast)
- **archiving** — Delta Spec merging and change archiving

### Skills (From Superpowers)
- **test-driven-development** — RED-GREEN-REFACTOR iron law
- **systematic-debugging** — 4-phase root cause analysis
- **requesting-code-review** — Code review dispatch
- **receiving-code-review** — Responding to review feedback
- **verification-before-completion** — Verify before declaring success
- **writing-skills** — Meta-skill for creating new skills

## License

MIT
