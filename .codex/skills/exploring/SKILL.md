---
name: exploring
description: "Use when the request is vague, requirements are incomplete, or more context is needed before deciding what should be built."
---

# Exploring Ideas

Help turn vague ideas into clear understanding through natural collaborative dialogue.

Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what needs to be built, hand off to the `proposing` skill.

**Announce at start:** "I'm using the exploring skill to understand what we're building."

<HARD-GATE>
Do NOT create any artifacts (proposal.md, specs, design, tasks) during exploring. The ONLY output of this skill is shared understanding in the conversation.
Do NOT invoke any implementation skill. The terminal state is invoking `proposing` (Kiro: readSteering → proposing.md).
</HARD-GATE>

## Anti-Pattern: "This Is Too Simple To Explore"

Every non-trivial project benefits from exploration. "Simple" projects are where unexamined assumptions cause the most wasted work. The exploration can be brief (2-3 questions for truly simple projects), but you MUST understand intent before proposing.

## Checklist

1. **Explore project context** — check files, docs, recent commits, existing specs
2. **Detect project type** — check if `specs/specs/` exists (brownfield) or not (greenfield)
3. **Assess scope** — is this one feature or multiple independent subsystems?
4. **Decompose if too large** — help user break into sub-projects (see below)
5. **Ask clarifying questions** — one at a time, understand purpose/constraints/success criteria
6. **Use implementation research when warranted** — research existing implementations inside `exploring` when approach quality depends on real evidence
7. **Propose 2-3 approaches** — with trade-offs and your recommendation
8. **Get user alignment** — confirm direction before moving on
9. **Transition** — invoke `proposing` skill (Kiro: readSteering → proposing.md)

## The Process

**Understanding the idea:**
- Check the current project state first (files, docs, recent commits)
- Before asking detailed questions, assess scope first (see Scope Assessment below)
- Ask questions one at a time to refine the idea
- Prefer multiple choice questions when possible
- Only one question per message
- Focus on understanding: purpose, constraints, success criteria

**Scope Assessment (BEFORE detailed questions):**

If the request describes multiple independent subsystems (e.g., "build a platform with chat, file storage, billing, and analytics"), flag this immediately. Don't spend questions refining details of a project that needs to be decomposed first.

```
IF request contains multiple independent subsystems:
  STOP detailed questions
  TELL user: "This looks like [N] independent features. Let's break it into sub-projects."
  HELP decompose: what are the pieces, how do they relate, what order to build?
  THEN explore the FIRST sub-project through the normal flow
  Each sub-project gets its own specs/changes/<name>/ cycle
```

**Exploring approaches:**
- Propose 2-3 different approaches with trade-offs
- Treat implementation research as part of `exploring`, not as a separate workflow stage.
- When an approach depends on understanding existing implementations, dependencies, or prior art, perform implementation research before finalizing the trade-offs.
- For simple requests, skip implementation research and continue the normal exploration conversation.
- For complex requests, a bounded subagent MAY gather implementation research if the platform supports it; the main agent remains responsible for synthesizing findings, recommending an approach, and aligning with the user.
- Present options conversationally with your recommendation and reasoning
- Lead with your recommended option and explain why

## Implementation Research Inside Exploring

Use implementation research only when it improves the quality of the exploration outcome.

**Good triggers:**
- Choosing between adopting an existing solution and building custom code
- Comparing new dependencies, integrations, or architectural patterns
- Understanding how similar behavior is already implemented in the current codebase

**Not required:**
- Simple requests that can be clarified through normal questioning
- Cases where the existing codebase patterns already make the direction obvious

**Research order:**
1. Search the current codebase first
2. Then check the most relevant external sources for the project's language or runtime
3. Synthesize the evidence back into the approach trade-offs

**Platform dispatch:**
- Claude Code: use the `Agent` tool (general-purpose) with the filled `./implementation-researcher-prompt.md` template. Claude Code renamed `Task` to `Agent` in v2.1.63; older `Task` references remain compatible aliases.
- Kiro: use `invokeSubAgent(name="general-task-execution", prompt=...)` with the filled `./implementation-researcher-prompt.md` template
- Codex: use `spawn_agent(message=...)` with the filled `./implementation-researcher-prompt.md` template
- Cursor, Gemini CLI, OpenCode: no research subagent dispatch; perform the same implementation research inline in the main agent and continue `exploring`

**Important:** Implementation research never changes the visible workflow stage. The user is still in `exploring`.

**Working in existing codebases:**
- Explore the current structure before proposing changes
- Follow existing patterns
- Check `specs/specs/` for existing behavior specifications
- Where existing code has problems that affect the work, note them for the design phase — don't propose unrelated refactoring

## Red Flags

If you catch yourself thinking any of these, STOP:

| Thought | Reality |
|---------|---------|
| "I already know what they want" | You don't. Ask. Your assumptions are the #1 source of wasted work. |
| "Let me just start building, we can figure it out" | Building without understanding = rebuilding. Every time. |
| "This is just like [other project]" | No two projects are the same. The differences matter more than the similarities. |
| "The user will tell me if something's wrong" | Users don't know what you assumed. They can't correct invisible mistakes. |
| "One more question would be annoying" | One wrong assumption is more annoying than one more question. |
| "I'll explore while implementing" | Exploring during implementation = scope creep + rework. Separate the phases. |
| "This scope is fine, no need to decompose" | If you can't describe it in one sentence, it needs decomposition. |

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "The user said 'just build it'" | Instructions say WHAT, not HOW. You still need to understand WHAT. |
| "I'll figure out the details as I go" | 'Details' = requirements. Figuring them out during coding = bugs. |
| "Asking too many questions wastes time" | Building the wrong thing wastes more time. Every question has ROI. |

## After Exploring

**Transition to proposing:**

> "I have a clear understanding of what we're building. Ready to create a proposal. Shall I proceed?"

Wait for user confirmation, then invoke the `proposing` skill (Kiro: readSteering → proposing.md).

**The terminal state is invoking proposing (Kiro: readSteering → proposing.md).** Do NOT invoke any implementation skill.

## Key Principles

- **One question at a time** — Don't overwhelm with multiple questions
- **Multiple choice preferred** — Easier to answer than open-ended
- **YAGNI ruthlessly** — Remove unnecessary features from consideration
- **Explore alternatives** — Always propose 2-3 approaches before settling
- **No artifacts yet** — Exploring produces understanding, not documents
- **Scope before details** — Assess project size before diving into specifics
- **Decompose large projects** — Each sub-project gets its own spec cycle
