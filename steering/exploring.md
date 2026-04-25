<!-- generated from skills/ by sync-steering.js -->
---
name: exploring
description: "Use when a request is vague, incomplete, strategically ambiguous, or needs project context before deciding what should be built."
---

# Exploring Ideas

Turn an unclear idea into shared, actionable understanding through a short collaborative dialogue. Use the minimum exploration necessary: enough to avoid wrong assumptions, not enough to become a design phase.

**Announce once at start:** "I'm using the exploring skill to understand what we're building."

## Hard Gate

During `exploring`, the agent MUST NOT:

- create or edit project artifacts such as `proposal.md`, specs, design docs, task lists, tickets, or implementation files;
- invoke implementation, design, task-planning, or coding skills;
- start building while requirements are still being discovered;
- treat implementation research as a separate visible workflow stage.

The only visible output is conversational: questions, summaries, trade-offs, recommendations, and alignment checks.

The terminal transition is `proposing` only after the user confirms the explored direction. For Kiro, this means `readSteering → proposing.md`.

## When To Use

Use `exploring` when any of these are true:

- The user describes a goal but not the concrete outcome.
- Requirements, constraints, users, success criteria, or scope are missing.
- The request may include several independent features or subsystems.
- The right approach depends on existing codebase patterns, dependencies, integrations, or prior art.
- The user asks for a solution but multiple valid solution shapes are plausible.

Do not overuse this skill for already-specific implementation requests. If the requested change is concrete and bounded, hand off to the appropriate next skill instead.

## Operating Loop

1. **Inspect available context**
    - Check existing files, docs, recent commits, project structure, and existing specs when available.
    - Identify whether this is greenfield or brownfield work.
    - Check for existing behavior specifications, especially under known spec directories such as `specs/`, `.kiro/specs/`, or `specs/specs/` when present.

2. **Assess scope before details**
    - Decide whether the request is one feature, one workflow, or multiple independent subsystems.
    - If the request is too broad, decompose before asking detailed product questions.

3. **Clarify one thing at a time**
    - Ask one question per message.
    - Prefer multiple-choice questions when they reduce effort for the user.
    - Focus on purpose, users, constraints, exclusions, success criteria, and acceptable trade-offs.
    - Do not ask questions already answered by available context.

4. **Research only when it changes the decision**
    - First search the current codebase.
    - Then check relevant external sources only if codebase context is insufficient and external evidence would materially affect the recommendation.
    - Keep research bounded and synthesize it into the exploration conversation.

5. **Present options**
    - Once context is sufficient, propose 2-3 viable approaches.
    - Lead with the recommended approach.
    - For each option, summarize trade-offs, risk, complexity, and fit with existing patterns.

6. **Confirm alignment**
    - Restate the agreed problem, scope, non-goals, constraints, and recommended direction.
    - Ask whether to proceed to `proposing`.

7. **Transition**
    - Only after the user confirms, invoke `proposing`.
    - Do not invoke implementation skills from `exploring`.

## Scope Assessment

Before detailed clarification, classify the request:

| Scope | Signal | Action |
|---|---|---|
| Single feature | One user goal, one main workflow, clear boundary | Continue normal exploration |
| Compound feature | One goal with several dependent parts | Clarify dependencies and minimal first slice |
| Multiple subsystems | Separate domains such as auth, billing, analytics, chat, storage, admin, integrations | Stop detailed questioning and decompose first |
| Platform/product | Broad product vision or many user roles/workflows | Define phases and choose the first sub-project |

If decomposition is needed, say this directly:

> "This looks like several independent features. Let's break it into sub-projects before refining details."

Then help identify:

- the independent pieces;
- how they depend on each other;
- the smallest valuable first slice;
- which sub-project should enter the spec cycle first.

Each sub-project should get its own `specs/changes/<name>/` cycle when the workflow supports that structure.

## Questioning Guidelines

Good exploration questions are specific and decision-oriented.

Prefer:

> "Should this be optimized for speed of delivery, long-term extensibility, or lowest operational risk?"

Avoid:

> "Tell me more about what you want."

Use questions to discover:

- **Outcome:** what should be true when the work is done;
- **User:** who uses or benefits from it;
- **Workflow:** what happens before, during, and after the feature;
- **Constraints:** technology, security, performance, budget, schedule, compliance;
- **Success criteria:** observable acceptance conditions;
- **Non-goals:** what should explicitly stay out of scope.

## Implementation Research Inside Exploring

Implementation research is allowed only to improve exploration quality. It does not change the visible stage.

### Use research when

- choosing between adopting an existing solution and building custom code;
- comparing dependencies, integrations, or architectural patterns;
- checking whether similar behavior already exists in the current codebase;
- evaluating risk, compatibility, migration cost, or maintenance burden;
- validating assumptions that would materially affect the recommended approach.

### Skip research when

- the request can be clarified through normal questioning;
- existing project patterns clearly determine the direction;
- the result would not change the recommendation;
- the question belongs in design or implementation rather than exploration.

### Research order

1. Search the current codebase first.
2. Check internal docs/specs next.
3. Use external sources only when needed.
4. Return concise evidence and translate it into trade-offs.

### Platform dispatch

Use the filled `./implementation-researcher-prompt.md` template when delegating research.

- **Claude Code:** use `Agent` with the general-purpose agent. `Task` may exist as a backward-compatible alias in older environments.
- **Kiro:** use `invokeSubAgent(name="general-task-execution", prompt=...)`.
- **Codex:** use `spawn_agent(message=...)`.
- **Cursor, Gemini CLI, OpenCode:** if no subagent dispatch is available, perform the same bounded research inline.

The main agent remains responsible for synthesis, recommendation, and user alignment.

## Completion Criteria

Exploration is complete only when all of these are true:

- The problem statement is clear.
- The user and primary workflow are clear enough to propose against.
- Scope and non-goals are explicit.
- Major constraints and risks are known or deliberately deferred.
- A recommended approach has been presented with alternatives.
- The user has agreed to proceed to `proposing`.

## Red Flags

If any of these thoughts appear, stop and return to exploration:

| Thought | Corrective action |
|---|---|
| "I already know what they want." | Ask or verify the missing assumption. |
| "I'll explore while implementing." | Do not implement; clarify first. |
| "The scope is probably fine." | Classify scope before details. |
| "This is too simple to explore." | Use a shorter exploration, not zero exploration. |
| "The user will correct me later." | Make assumptions visible now. |
| "One more question would be annoying." | Ask only the highest-value next question. |
| "Research would be interesting." | Research only if it can change the decision. |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "The user said just build it." | That clarifies urgency, not requirements. |
| "I'll figure out details as I go." | Details are requirements; guessing creates rework. |
| "Asking questions wastes time." | Building the wrong thing wastes more. |
| "This resembles another project." | Similarity is useful, but differences define the work. |

## Handoff To Proposing

When ready, summarize in conversation:

- agreed problem;
- target users/workflow;
- scope and non-goals;
- constraints and risks;
- recommended approach;
- open questions that can safely be resolved during proposing.

Then ask:

> "I have a clear understanding of what we're building. Ready to create a proposal. Shall I proceed?"

After confirmation, invoke `proposing` and do not invoke implementation skills.

## Key Principles

- Scope before details.
- One question at a time.
- Multiple choice when helpful.
- Prefer the smallest valuable first slice.
- Make assumptions explicit.
- Explore alternatives before committing.
- Research only when evidence changes the decision.
- No artifacts during `exploring`.
