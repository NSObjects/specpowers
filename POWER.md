---
name: "specpowers"
displayName: "SpecPowers Workflow"
description: "Spec-driven development workflow enforcing TDD, explicit specs, and modular design."
keywords: ["specpowers", "workflow", "tdd", "spec-driven", "code review", "artifact", "behavioral shaping"]
---

# Onboarding

You now have access to SpecPowers — a spec-driven development workflow for AI coding assistants.

SpecPowers enforces a structured artifact flow: every feature goes through exploring → proposing → specifying → designing → planning → implementation → archiving. TDD is mandatory. Code review is automatic.

No installation steps needed. Use the scenario detection below to load the right steering file for the current task.

# Scenario Detection & Steering File Selection

## 🏗️ Building / Implementing → `specpowers-workflow.md`

**Load when:** "build", "create", "implement", "add feature", "develop", or resuming work.

Workflow chain: `exploring → proposing → specifying → designing → planning → spec-driven-development → archiving`

## 🔍 Exploring → `exploring.md`

**Load when:** "explore", "understand", "how does this work", "investigate"
- Subagent prompt: `exploring--implementation-researcher-prompt.md`

## 📝 Proposing → `proposing.md`

**Load when:** "propose", "suggest", "what if we", "RFC"

## 📋 Specifying → `specifying.md`

**Load when:** "specify", "requirements", "behavioral spec", "acceptance criteria"
- Reference: `specifying--delta-format-guide.md`

## 🏛️ Designing → `designing.md`

**Load when:** "design", "architecture", "technical approach"

## 📅 Planning → `planning.md`

**Load when:** "plan", "break down", "task list", "implementation plan"

## ⚙️ Implementing → `spec-driven-development.md`

**Load when:** "implement", "start coding", "next task", "continue", or `tasks.md` has unchecked items.
- Subagent prompts: `spec-driven-development--implementer-prompt.md`, `spec-driven-development--code-quality-reviewer-prompt.md`, `spec-driven-development--spec-reviewer-prompt.md`

## 🐛 Debugging → `systematic-debugging.md`

**Load when:** "bug", "debug", "fix", "broken", "failing", "error"
- References: `systematic-debugging--root-cause-tracing.md`, `systematic-debugging--defense-in-depth.md`, `systematic-debugging--condition-based-waiting.md`

## ✅ Verification → `verification-loop.md`

**Load when:** "verify", "check", "validate", "ready to commit", "pre-PR"

## ✔️ Completion Check → `verification-before-completion.md`

**Load when:** claiming work is complete.

## 🔒 Quality Gate → `quality-gate.md`

**Load when:** "lint", "format", "type check", "code quality"
- Reference: `quality-gate--protected-configs.md`

## 🧪 TDD → `test-driven-development.md`

**Load when:** "test first", "TDD", "write tests", "red-green-refactor"
- Reference: `test-driven-development--testing-anti-patterns.md`

## 📦 Archiving → `archiving.md`

**Load when:** "archive", "done", "complete", "wrap up"

## 👀 Code Review → `requesting-code-review.md` / `receiving-code-review.md`

**Load when:** "review", "code review", "feedback"
- Subagent prompt: `requesting-code-review--code-reviewer-prompt.md`

## 🚀 Parallel Agents → `dispatching-parallel-agents.md`

**Load when:** "parallel", "dispatch", "multiple agents"
- Subagent prompts: `dispatching-parallel-agents--planner-agent-prompt.md`, `dispatching-parallel-agents--security-reviewer-prompt.md`, `dispatching-parallel-agents--tdd-guide-prompt.md`

## 📏 Coding Rules → `rules-common.md`

**Load when writing or reviewing code.** Then layer language-specific rules:

`rules-typescript.md` · `rules-python.md` · `rules-golang.md` · `rules-rust.md` · `rules-java.md` · `rules-kotlin.md` · `rules-csharp.md` · `rules-swift.md` · `rules-cpp.md` · `rules-dart.md` · `rules-php.md` · `rules-perl.md`

## ✍️ Writing Skills → `writing-skills.md`

**Load when:** "write a skill", "create a skill", "new skill"

## 🔧 Module Management → `selective-install.md`

**Load when:** "install modules", "manage skills", "profiles", "doctor", "repair"

## 📖 Skill System → `using-skills.md`

**Load when:** starting a session or unsure which skill applies.
- References: `using-skills--references--kiro-tools.md`, `using-skills--references--codex-tools.md`


