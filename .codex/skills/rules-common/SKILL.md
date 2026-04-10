---
name: rules-common
description: Use when writing, reviewing, or modifying code in any language — provides universal coding rules that apply across all programming languages and can be overridden by language-specific rule skills
---

# Universal Coding Rules

These rules apply to all programming languages. Language-specific rule skills (e.g., `rules-typescript`, `rules-python`) inherit these rules and may override entries marked `[Overridable]`.

**Override mechanism:** When a language rule declares `[Overrides common: X.Y]`, that language-specific version replaces the common rule for projects using that language.

---

## 1. Coding Style

### 1.1 Naming Clarity `[Overridable]`

Use descriptive, intention-revealing names. Avoid abbreviations unless they are universally understood within the domain (e.g., `id`, `url`, `http`).

- Variables: describe what they hold, not their type
- Functions: describe what they do, starting with a verb
- Booleans: use `is`, `has`, `should`, `can` prefixes

### 1.2 Function Size `[Overridable]`

Keep functions focused on a single responsibility. A function that requires a comment to explain "what it does" is too complex — split it.

- Aim for functions that fit on one screen (~30 lines)
- Extract helper functions when logic branches exceed 2 levels of nesting

### 1.3 File Organization `[Overridable]`

One module = one concept. Group related functionality into cohesive files. Avoid "utils" or "helpers" grab-bags — name files after what they contain.

### 1.4 Comments and Documentation

Write comments that explain **why**, not **what**. The code explains what; comments explain intent, trade-offs, and non-obvious decisions.

- Document public APIs with purpose, parameters, return values, and edge cases
- Remove commented-out code — version control remembers

### 1.5 Consistent Formatting `[Overridable]`

Use the project's established formatter. If none exists, adopt the language community's standard formatter. Never mix formatting styles within a project.

### 1.6 Magic Values

No magic numbers or strings in logic. Extract them into named constants with descriptive names that explain their purpose.

---

## 2. Testing

### 2.1 Test-First When Possible `[Overridable]`

Write tests before or alongside implementation. Tests are specifications — they document what the code should do.

### 2.2 Test Naming

Test names describe the scenario, not the implementation. Use the pattern: `[unit] [condition] [expected result]`.

### 2.3 Test Independence

Each test must be independent — no shared mutable state between tests, no ordering dependencies. A test that fails in isolation but passes in a suite (or vice versa) is broken.

### 2.4 Test Coverage Strategy `[Overridable]`

Test the behavior, not the implementation. Focus on:
- Happy path (the common case)
- Edge cases (empty inputs, boundaries, nulls)
- Error paths (invalid inputs, failures)
- Property-based tests for algorithmic logic

### 2.5 No Mocks for Core Logic

Do not mock the system under test. Mocks are for external dependencies (network, filesystem, databases), not for the code you're verifying.

### 2.6 Assertion Quality

Each test should have clear, specific assertions. Avoid testing too many things in one test. One logical assertion per test — multiple `assert` calls are fine if they verify one behavior.

---

## 3. Security

### 3.1 Input Validation

Validate all external input at system boundaries. Never trust data from users, APIs, files, or environment variables without validation.

### 3.2 Secrets Management

Never hardcode secrets, API keys, tokens, or passwords. Use environment variables or secret management systems. Never log secrets, even at debug level.

### 3.3 Least Privilege

Request only the permissions needed. File access, network access, database access — scope them to the minimum required.

### 3.4 Dependency Awareness

Know your dependencies. Audit new dependencies before adding them. Prefer well-maintained packages with active security response. Pin versions in production.

### 3.5 Error Message Safety

Error messages shown to users must not leak internal details (stack traces, file paths, database schemas, internal IPs). Log details internally; show generic messages externally.

### 3.6 SQL and Injection Prevention `[Overridable]`

Use parameterized queries or prepared statements. Never concatenate user input into queries, commands, or templates.

---

## 4. Performance

### 4.1 Measure Before Optimizing

Do not optimize without evidence. Profile first, identify the bottleneck, then optimize that specific path. Premature optimization obscures intent.

### 4.2 Algorithm Complexity Awareness `[Overridable]`

Choose appropriate data structures and algorithms. Know the Big-O of your operations. An O(n²) loop hidden inside an O(n) loop is O(n³) — watch for nested iterations.

### 4.3 Resource Cleanup `[Overridable]`

Close what you open. File handles, database connections, network sockets, timers — ensure cleanup happens even on error paths. Use language-provided resource management patterns (try-with-resources, defer, using, context managers).

### 4.4 Avoid Premature Caching

Caching adds complexity (invalidation, staleness, memory pressure). Add caching only when measurement shows it's needed, and always define an invalidation strategy.

### 4.5 Batch Over Chatty `[Overridable]`

Prefer batch operations over many small ones. One query returning 100 rows beats 100 queries returning 1 row each. This applies to database calls, API requests, and file I/O.

---

## 5. Design Patterns

### 5.1 Composition Over Inheritance `[Overridable]`

Prefer composing behavior from small, focused components over deep inheritance hierarchies. Inheritance creates tight coupling; composition creates flexibility.

### 5.2 Dependency Injection `[Overridable]`

Pass dependencies in rather than creating them internally. This makes code testable and configurable. Hard-coded dependencies are hidden coupling.

### 5.3 Fail Fast

Validate preconditions early and fail immediately with clear error messages. Do not let invalid state propagate through the system.

### 5.4 Immutability by Default `[Overridable]`

Prefer immutable data structures. Mutation is a common source of bugs, especially in concurrent code. When mutation is necessary, contain it — minimize the scope of mutable state.

### 5.5 Interface Segregation

Don't force consumers to depend on methods they don't use. Prefer small, focused interfaces over large, general-purpose ones.

### 5.6 Error Handling Strategy `[Overridable]`

Handle errors explicitly. Don't swallow exceptions silently. Choose a consistent error handling pattern for the project (exceptions, result types, error codes) and stick with it.

### 5.7 Research Before Reinvention

Before recommending custom code, research what already exists. Start with the current codebase, then check the most relevant external solutions for the project's language and runtime.

- Search the project codebase first to avoid duplicating internal implementations
- Use research when making implementation or technology decisions, not as a separate workflow stage
- Make the decision explicit: **Adopt / Extend / Compose / Build**
- If you choose Build, document why existing solutions were not sufficient

---

## 6. Git Workflow

### 6.1 Atomic Commits

Each commit should represent one logical change. Don't mix refactoring with feature work. Don't mix formatting changes with behavior changes.

### 6.2 Commit Messages

Write commit messages that explain **why** the change was made, not just what changed. The diff shows what; the message explains intent.

Format: `<type>: <short summary>` with optional body for context.

### 6.3 Branch Hygiene

Keep branches short-lived and focused. One branch = one feature or fix. Rebase or merge from main regularly to avoid drift.

### 6.4 Review Before Merge

All code changes should be reviewed before merging. Self-review at minimum — read your own diff as if someone else wrote it.

### 6.5 No Generated Files in VCS `[Overridable]`

Don't commit generated files (build artifacts, compiled output, lock files for non-root packages). Use `.gitignore` to exclude them. Exception: lock files at the project root (e.g., `package-lock.json`, `pnpm-lock.yaml`) should be committed.

### 6.6 Sensitive Data Protection

Never commit secrets, credentials, or PII to version control. Use pre-commit hooks or scanning tools to catch accidental commits. If a secret is committed, rotate it immediately — removing from history is not enough.

---

## Red Flags

These thoughts mean you're about to violate a rule — stop and reconsider:

| Thought | Reality |
|---------|---------|
| "I'll clean this up later" | Later never comes. Fix it now or file a tracked issue. |
| "It's just a small hack" | Small hacks compound. Follow the rule or document the exception. |
| "Nobody will see this code" | You will see it in 3 months and not remember why. |
| "The tests are slowing me down" | Tests are saving future-you hours of debugging. |
| "I'll add tests after" | Code without tests ships without tests. Write them now. |
| "This secret is just for testing" | Test secrets leak to production. Use env vars from the start. |
| "Performance doesn't matter yet" | True, but O(n³) matters always. Know your complexity. |
| "I know this works, no need to test" | Confidence without evidence is the #1 source of bugs. |
| "Let me just commit everything together" | Atomic commits make debugging, reverting, and reviewing possible. |
| "This override is fine without documenting why" | Undocumented overrides become mysterious bugs. Always explain. |
| "I'll just build it; research can come later" | Reinventing existing solutions creates avoidable maintenance burden. Search first, then decide. |

---

## Iron Laws

These are non-negotiable. No exceptions, no "just this once."

1. **No secrets in code.** Ever. Not "temporarily." Not "just for local dev." Environment variables or secret managers only.
2. **No untested code ships.** If it's worth writing, it's worth testing. If it can't be tested, redesign it.
3. **No silent failures.** Every error path must be handled explicitly. Swallowed exceptions are hidden bugs.
4. **No unvalidated external input.** All data crossing a trust boundary gets validated. No exceptions.
5. **No commit without review.** At minimum, review your own diff. Preferably, have someone else review it.
6. **No magic values in logic.** Every literal in a conditional or calculation gets a named constant.
7. **No copy-paste duplication.** If you're copying code, extract it. Duplication is a maintenance multiplier.

---

## Behavioral Shaping

### When Starting a New File

1. Check if the project has an established structure for this type of file
2. Follow existing patterns — consistency beats personal preference
3. Add the file to the appropriate location in the project hierarchy

### When Modifying Existing Code

1. Read the surrounding code first — understand the local conventions
2. Match the existing style, even if you prefer a different one
3. If the existing style violates these rules, fix the style in a separate commit

### When Adding Dependencies

1. Search the project codebase first — the functionality may already exist
2. Evaluate the dependency: maintenance status, security record, license compatibility, size
3. Pin the version. Document why this dependency was chosen.

### When Reviewing Code

1. Check against these rules systematically — don't rely on gut feeling
2. Prioritize: security issues > correctness bugs > design problems > style nits
3. Provide specific, actionable feedback with examples
