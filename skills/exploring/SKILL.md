---
name: exploring
description: "Use when requirements are unclear or the user has a vague idea. Explores intent through Socratic dialogue before creating any artifacts."
---

# Exploring Ideas

Help turn vague ideas into clear understanding through natural collaborative dialogue.

Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what needs to be built, hand off to the `proposing` skill.

<HARD-GATE>
Do NOT create any artifacts (proposal.md, specs, design, tasks) during exploring. The ONLY output of this skill is shared understanding in the conversation.
</HARD-GATE>

## Anti-Pattern: "This Is Too Simple To Explore"

Every non-trivial project benefits from exploration. "Simple" projects are where unexamined assumptions cause the most wasted work. The exploration can be brief (2-3 questions for truly simple projects), but you MUST understand intent before proposing.

## Checklist

1. **Explore project context** — check files, docs, recent commits
2. **Detect project type** — check if `specs/specs/` exists (brownfield) or not (greenfield)
3. **Ask clarifying questions** — one at a time, understand purpose/constraints/success criteria
4. **Propose 2-3 approaches** — with trade-offs and your recommendation
5. **Get user alignment** — confirm direction before moving on
6. **Transition** — invoke `proposing` skill

## The Process

**Understanding the idea:**
- Check the current project state first (files, docs, recent commits)
- Before asking detailed questions, assess scope: if the request describes multiple independent subsystems, flag this immediately
- Ask questions one at a time to refine the idea
- Prefer multiple choice questions when possible
- Only one question per message
- Focus on understanding: purpose, constraints, success criteria

**Exploring approaches:**
- Propose 2-3 different approaches with trade-offs
- Lead with your recommended option and explain why

**Working in existing codebases:**
- Explore the current structure before proposing changes
- Follow existing patterns
- Check `specs/specs/` for existing behavior specifications

## After Exploring

**Transition to proposing:**

> "I have a clear understanding of what we're building. Ready to create a proposal. Shall I proceed?"

Wait for user confirmation, then invoke the `proposing` skill.

**The terminal state is invoking proposing.** Do NOT invoke any implementation skill.

## Key Principles

- **One question at a time** — Don't overwhelm with multiple questions
- **Multiple choice preferred** — Easier to answer than open-ended
- **YAGNI ruthlessly** — Remove unnecessary features from consideration
- **Explore alternatives** — Always propose 2-3 approaches before settling
- **No artifacts yet** — Exploring produces understanding, not documents
