---
name: "specpowers"
displayName: "SpecPowers Workflow"
description: "Spec-driven development workflow enforcing TDD, explicit specs, and modular design."
keywords: ["specpowers", "workflow", "tdd", "spec-driven", "code review", "artifact", "behavioral shaping"]
---

# Onboarding

You now have access to SpecPowers — a spec-driven development workflow for AI coding assistants.

## Step 1: Install Skills

Copy each skill folder from this power's `skills/` directory into the user's workspace `.kiro/skills/` directory. Each folder contains a `SKILL.md` file that Kiro will auto-discover and activate based on context.

**Core skills (always install):**

| Source | Target |
|--------|--------|
| `skills/using-skills/` | `.kiro/skills/using-skills/` |
| `skills/exploring/` | `.kiro/skills/exploring/` |
| `skills/proposing/` | `.kiro/skills/proposing/` |
| `skills/specifying/` | `.kiro/skills/specifying/` |
| `skills/designing/` | `.kiro/skills/designing/` |
| `skills/planning/` | `.kiro/skills/planning/` |
| `skills/spec-driven-development/` | `.kiro/skills/spec-driven-development/` |
| `skills/archiving/` | `.kiro/skills/archiving/` |
| `skills/test-driven-development/` | `.kiro/skills/test-driven-development/` |
| `skills/systematic-debugging/` | `.kiro/skills/systematic-debugging/` |
| `skills/requesting-code-review/` | `.kiro/skills/requesting-code-review/` |
| `skills/receiving-code-review/` | `.kiro/skills/receiving-code-review/` |
| `skills/verification-before-completion/` | `.kiro/skills/verification-before-completion/` |
| `skills/verification-loop/` | `.kiro/skills/verification-loop/` |
| `skills/dispatching-parallel-agents/` | `.kiro/skills/dispatching-parallel-agents/` |
| `skills/writing-skills/` | `.kiro/skills/writing-skills/` |
| `skills/quality-gate/` | `.kiro/skills/quality-gate/` |
| `skills/selective-install/` | `.kiro/skills/selective-install/` |
| `skills/rules-common/` | `.kiro/skills/rules-common/` |

**Language rule skills (install based on project languages):**

| Source | Target | Language |
|--------|--------|----------|
| `skills/rules-typescript/` | `.kiro/skills/rules-typescript/` | TypeScript |
| `skills/rules-python/` | `.kiro/skills/rules-python/` | Python |
| `skills/rules-golang/` | `.kiro/skills/rules-golang/` | Go |
| `skills/rules-rust/` | `.kiro/skills/rules-rust/` | Rust |
| `skills/rules-java/` | `.kiro/skills/rules-java/` | Java |
| `skills/rules-kotlin/` | `.kiro/skills/rules-kotlin/` | Kotlin |
| `skills/rules-csharp/` | `.kiro/skills/rules-csharp/` | C# |
| `skills/rules-swift/` | `.kiro/skills/rules-swift/` | Swift |
| `skills/rules-cpp/` | `.kiro/skills/rules-cpp/` | C++ |
| `skills/rules-dart/` | `.kiro/skills/rules-dart/` | Dart |
| `skills/rules-php/` | `.kiro/skills/rules-php/` | PHP |
| `skills/rules-perl/` | `.kiro/skills/rules-perl/` | Perl |

Copy each folder with all its contents (SKILL.md and any supporting files like prompt templates, reference docs). For language rule skills, install only the ones matching the project's languages — use `selective-install` for profile-based installation.

## Step 2: Verify Installation

Confirm that `.kiro/skills/` contains at minimum the 19 core skill folders, each with a `SKILL.md`. Skills should be visible in the Kiro panel under "Agent Steering & Skills".
Also confirm `.kiro/skills/requesting-code-review/code-reviewer-prompt.md` exists, since that skill depends on the reviewer prompt template being installed alongside `SKILL.md`.

# When to Load Steering Files
- When building, creating, implementing features, or resuming work → `specpowers-workflow.md`
