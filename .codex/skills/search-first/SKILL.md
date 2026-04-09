---
name: search-first
description: Use when adding new functionality, dependencies, or integrations — research existing solutions before writing custom code to avoid reinventing the wheel and make evidence-based technology decisions
---

# Search First

## Overview

A 5-stage research workflow that runs before writing custom code. When a developer requests new functionality or a new dependency, this skill ensures existing solutions are evaluated first. The goal: make an informed Adopt / Extend / Compose / Build decision backed by evidence, not assumptions.

**Core principle:** The best code is code you don't write. Search before you build.

This skill integrates with `exploring` (during the "propose 2-3 approaches" step) and `designing` (during technology selection) to inject research into the standard SpecPowers workflow.

---

## The Workflow

```
Requirements Analysis → Parallel Search → Evaluation → Decision → Implementation
        ↓                     ↓                ↓            ↓            ↓
   What do we need?     Where does it      How well do   Adopt/Extend  Execute the
   Constraints?         already exist?     they fit?     /Compose/Build decision
```

### Stage 1: Requirements Analysis

Before searching, define what you're looking for. Vague searches produce vague results.

1. **State the need** — one sentence describing the capability required
2. **List hard constraints** — license, language, runtime, size budget, security requirements
3. **List soft preferences** — active maintenance, community size, documentation quality, TypeScript types
4. **Define "good enough"** — what minimum bar must a solution clear to avoid building from scratch?

```
NEED: [one-sentence capability description]
HARD: [license: MIT/Apache | language: TS | runtime: Node 18+ | ...]
SOFT: [maintained in last 6 months | >1k stars | typed | ...]
BAR:  [what "good enough" looks like]
```

### Stage 2: Parallel Search

Search multiple sources simultaneously. **Always start with the project codebase** — the best solution may already exist in your repo.

**Search order (mandatory):**

1. **Project codebase first** — grep/search for similar functionality already implemented
2. **Package managers** — npm, PyPI, crates.io, pkg.go.dev (match the project's language)
3. **GitHub / open source** — broader search for libraries, utilities, patterns
4. **Web / documentation** — articles, Stack Overflow, official docs for known approaches

```
FOR each search source (in order):
  1. Search with 2-3 query variations (exact term, synonyms, related concepts)
  2. Record top 3-5 candidates per source
  3. Note: name, description, last update, license, download count / stars
  STOP EARLY if project codebase already has the functionality
```

**Why project codebase first?** Duplicating existing internal code is worse than duplicating an external package — it creates maintenance burden with zero discoverability.

### Stage 3: Evaluation

Score each candidate against the requirements from Stage 1.

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Match quality | High | How closely does it solve the stated need? (exact / partial / weak) |
| Maintenance status | High | Last commit < 6 months? Active issue response? Regular releases? |
| License compatibility | Hard | Must be compatible with project license. Incompatible = disqualified |
| API fit | Medium | How well does the API match the project's patterns and conventions? |
| Dependency footprint | Medium | How many transitive dependencies? Any known problematic ones? |
| Community / adoption | Low | Download count, stars, known users — signals but not decisive |

```
EVALUATION TABLE
================
| Candidate   | Match   | Maintained | License | API Fit | Deps | Community | Score |
|-------------|---------|------------|---------|---------|------|-----------|-------|
| [package-a] | exact   | active     | MIT     | good    | 3    | 50k/wk    | ★★★★  |
| [package-b] | partial | stale      | Apache  | fair    | 12   | 5k/wk     | ★★    |
| [internal]  | partial | n/a        | n/a     | native  | 0    | n/a       | ★★★   |
```

### Stage 4: Decision

Apply the decision matrix to the evaluation results.

| Decision | Criteria | Action |
|----------|----------|--------|
| **Adopt** | Exact match + actively maintained + compatible license | Install and use directly. Document the dependency and why it was chosen. |
| **Extend** | Partial match + solid foundation | Install the package, write a thin wrapper or adapter to fill the gap. Document what's wrapped and why. |
| **Compose** | Multiple weak matches that together cover the need | Combine 2-3 small packages with glue code. Document the composition and each package's role. |
| **Build** | No suitable candidates, or all candidates fail hard constraints | Write custom code. Document what was searched and why nothing fit. |

**Decision output format:**

```
SEARCH DECISION
===============
Need: [capability description]
Searched: [sources checked]
Candidates: [N found, M evaluated]

Decision: [Adopt / Extend / Compose / Build]
Rationale: [why this decision, what was the deciding factor]
Package(s): [name@version] (if Adopt/Extend/Compose)
Gap: [what's missing, if Extend/Compose]
```

### Stage 5: Implementation

Execute the decision. The implementation approach depends on the decision:

- **Adopt:** Install, import, use. Add to project dependencies. Write integration tests.
- **Extend:** Install, create wrapper module. Test the wrapper, not the package internals.
- **Compose:** Install all pieces, create composition layer. Test the composition.
- **Build:** Write from scratch. Full TDD cycle. Document why build was chosen over existing options.

**For all decisions:** Update the project's dependency documentation or decision log.

---

## Search Shortcuts

Common search patterns organized by category. Use these to accelerate Stage 2.

### Dev Tools

| Need | Search Terms | Common Solutions |
|------|-------------|-----------------|
| CLI argument parsing | `cli parser`, `argument parser`, `command line` | commander, yargs, meow, clap (Rust), cobra (Go) |
| Configuration management | `config loader`, `env config`, `dotenv` | cosmiconfig, dotenv, convict, viper (Go) |
| Logging | `logger`, `structured logging`, `log levels` | pino, winston, bunyan, slog (Go), tracing (Rust) |
| File watching | `file watcher`, `fs watch`, `file change` | chokidar, watchpack, fsnotify (Go), notify (Rust) |
| Task runner / build | `task runner`, `build tool`, `script runner` | tsx, tsup, esbuild, turbo, just |
| Terminal UI | `terminal ui`, `cli ui`, `tui` | ink, blessed, prompts, bubbletea (Go), ratatui (Rust) |

### AI / LLM Integration

| Need | Search Terms | Common Solutions |
|------|-------------|-----------------|
| LLM API client | `openai client`, `llm sdk`, `ai api` | openai, anthropic, ai (Vercel AI SDK) |
| Prompt templating | `prompt template`, `llm prompt`, `string template` | handlebars, mustache, langchain prompts |
| Embedding / vector search | `vector store`, `embedding`, `similarity search` | pgvector, chromadb, pinecone, qdrant |
| Token counting | `token counter`, `tokenizer`, `tiktoken` | tiktoken, gpt-tokenizer, tokenizers (HF) |
| Streaming responses | `sse client`, `stream parser`, `ndjson` | eventsource-parser, ai (Vercel), ndjson |

### Data & API

| Need | Search Terms | Common Solutions |
|------|-------------|-----------------|
| HTTP client | `http client`, `fetch wrapper`, `api client` | ky, got, axios, undici, reqwest (Rust) |
| Schema validation | `schema validation`, `type validation`, `runtime types` | zod, valibot, ajv, typebox, serde (Rust) |
| Database ORM / query | `orm`, `database client`, `query builder` | drizzle, prisma, kysely, sqlx (Rust), sqlc (Go) |
| Date / time | `date library`, `datetime`, `timezone` | date-fns, dayjs, temporal (proposal), chrono (Rust) |
| UUID / ID generation | `uuid`, `nanoid`, `unique id`, `cuid` | nanoid, uuid, cuid2, ulid |
| Caching | `cache`, `memoize`, `lru cache` | lru-cache, keyv, node-cache |

### Content & Publishing

| Need | Search Terms | Common Solutions |
|------|-------------|-----------------|
| Markdown parsing | `markdown parser`, `mdx`, `remark` | remark, marked, markdown-it, mdx |
| YAML / TOML parsing | `yaml parser`, `toml parser`, `config format` | yaml, js-yaml, toml, gray-matter |
| PDF generation | `pdf generator`, `pdf create`, `document pdf` | pdfkit, puppeteer, jspdf, react-pdf |
| Email sending | `email`, `smtp`, `transactional email` | nodemailer, resend, postmark, sendgrid |
| Image processing | `image resize`, `image optimize`, `sharp` | sharp, jimp, squoosh, image (Rust) |

---

## Red Flags

These thoughts mean you're about to skip research — stop and search first:

| Thought | Reality |
|---------|---------|
| "I'll just write it myself, it's simple" | Simple things have edge cases. Someone already handled them. Search first. |
| "I know the perfect package for this" | You know *a* package. There might be a better one. Search confirms or updates your knowledge. |
| "Searching takes too long, I'll just code it" | Coding + debugging + maintaining a custom solution takes longer. 10 minutes of research saves hours. |
| "We don't want external dependencies" | Zero dependencies is a valid constraint — but state it in Stage 1, don't use it to skip research. |
| "The existing code is close enough, I'll copy-paste and modify" | That's the Extend decision — but make it explicitly, not by accident. |
| "No one has solved this specific problem" | You're probably searching too narrowly. Broaden the terms. Decompose the problem. |
| "I already searched last month" | The ecosystem moves fast. Search again. New packages appear, old ones get abandoned. |
| "This is too project-specific for a package" | The core algorithm probably isn't. Separate the project-specific glue from the reusable logic. |
| "I'll add the dependency later if needed" | Later means rewriting. Choose now with evidence. |
| "The internal code works fine" | Does it? Is it tested? Documented? Maintained? Evaluate it like you'd evaluate a package. |

---

## Iron Laws

Non-negotiable rules for the search-first workflow:

1. **Project codebase is searched first.** Before looking externally, check if the functionality already exists in the repo. Duplicating internal code is the worst kind of reinvention.
2. **No custom code without a search record.** If you chose Build, document what you searched and why nothing fit. "I didn't look" is not a valid reason to build.
3. **License compatibility is a hard gate.** An incompatible license disqualifies a candidate regardless of how good it is. No exceptions, no "we'll sort it out later."
4. **The decision is explicit.** Every search ends with a clear Adopt / Extend / Compose / Build decision and a rationale. Implicit decisions lead to accidental dependencies.
5. **Maintenance status matters.** A package abandoned for 2+ years is a liability, not a solution. Weight recent activity heavily.
6. **Evaluate internal code like external code.** Existing project code isn't automatically "good enough." Apply the same criteria: is it tested, documented, maintained, fit for purpose?

---

## Behavioral Shaping

### Starting a Search

1. Trigger: developer requests new functionality, a new dependency, or asks "how should we implement X?"
2. Run Stage 1 (Requirements Analysis) — define what you need before searching
3. Run Stage 2 (Parallel Search) — always start with project codebase
4. Run Stage 3 (Evaluation) — score candidates against requirements
5. Run Stage 4 (Decision) — apply the decision matrix
6. Run Stage 5 (Implementation) — execute the decision

### Integrating with Exploring

When the `exploring` skill reaches the "propose 2-3 approaches" step:
1. For each approach that involves new functionality or dependencies, trigger a search-first pass
2. Include search results in the approach trade-offs
3. An approach backed by a well-maintained package scores higher than one requiring custom code (all else equal)

### Integrating with Designing

When the `designing` skill reaches the technology selection phase:
1. For each technology choice, run a search-first evaluation
2. Include the search decision (Adopt/Extend/Compose/Build) in the Architecture Decision
3. Document the search record alongside the trade-off analysis

### When Search Finds Nothing

1. Record what was searched (sources, terms, date)
2. Proceed to Build — this is a valid outcome, not a failure
3. Document the gap — future contributors should know this was researched
4. Consider: is the problem decomposable? Maybe parts of it have existing solutions even if the whole doesn't

### When Multiple Good Options Exist

1. Narrow by hard constraints first (license, language, runtime)
2. Compare on maintenance status and API fit
3. Prefer the option with fewer transitive dependencies
4. When still tied, prefer the option with broader community adoption
5. Document why the chosen option won over alternatives
