<!-- generated from skills/ by sync-steering.js -->
---
name: rules-rust
description: Use when writing, reviewing, or modifying Rust code — provides Rust-specific coding rules that override and extend the universal rules from rules-common
language: rust
---

# Rust Coding Rules

These rules apply to Rust projects. They inherit all rules from `rules-common` and override specific entries where Rust conventions differ. Overrides are marked with `[Overrides common: X.Y]` and include the reason.

---

## 1. Coding Style

### 1.1 Naming Conventions `[Overrides common: 1.1]`

**Reason:** Rust has strict naming conventions enforced by `clippy` lints.

- Types, traits, enums: `PascalCase` (`HttpClient`, `Display`, `Option`)
- Functions, methods, variables, modules: `snake_case`
- Constants and statics: `UPPER_SNAKE_CASE`
- Lifetimes: short lowercase (`'a`, `'b`), descriptive for complex cases (`'input`, `'conn`)
- Crates: `kebab-case` in `Cargo.toml`, `snake_case` when imported (`use my_crate::...`)
- Type parameters: single uppercase letter (`T`, `E`, `K`, `V`) or descriptive (`Item`, `Error`)
- Conversion methods: `as_` (cheap, borrowed), `to_` (expensive, owned), `into_` (consuming)

### 1.2 Function Size `[Overrides common: 1.2]`

**Reason:** Rust's ownership, lifetime annotations, and pattern matching add visual weight.

- Aim for ~40 lines including match arms and error handling
- Extract complex match arms into named helper functions
- Use `?` operator to keep error propagation concise — avoid nested `match` on `Result`

### 1.3 File Organization `[Overrides common: 1.3]`

**Reason:** Rust has a module system with specific file layout conventions.

- Module tree mirrors directory structure: `mod foo;` looks for `foo.rs` or `foo/mod.rs`
- Prefer `foo.rs` over `foo/mod.rs` (Rust 2018+ convention) unless the module has submodules
- Use `pub(crate)` for crate-internal visibility — avoid making everything `pub`
- Re-export key types from `lib.rs` for a clean public API
- Group: `use` imports at top, then types, then implementations, then tests at bottom

### 1.4 Formatting `[Overrides common: 1.5]`

**Reason:** Rust has a single canonical formatter — there is no debate.

- Use `rustfmt` — it is the only accepted formatter
- Configure via `rustfmt.toml` only for project-wide settings (e.g., `edition`, `max_width`)
- Run `cargo fmt` before every commit
- Use `cargo clippy` alongside `rustfmt` — clippy catches idiomatic issues that formatting doesn't

---

## 2. Ownership and Borrowing

### 2.1 Prefer Borrowing Over Cloning

Pass references (`&T`, `&mut T`) instead of cloning data. Clone only when ownership transfer is genuinely needed or when the cost is negligible (small types, `Arc`, `Rc`).

### 2.2 Minimize Lifetime Annotations

Let the compiler infer lifetimes when possible (lifetime elision rules). Add explicit annotations only when the compiler requires them. If a function needs many lifetime parameters, consider restructuring to reduce them.

### 2.3 Use Smart Pointers Appropriately

- `Box<T>`: heap allocation for large types or recursive structures
- `Rc<T>` / `Arc<T>`: shared ownership (single-threaded / multi-threaded)
- `RefCell<T>` / `Mutex<T>`: interior mutability (single-threaded / multi-threaded)
- Avoid `Rc<RefCell<T>>` chains — they indicate a design that fights the borrow checker. Restructure instead.

---

## 3. Error Handling `[Overrides common: 5.6]`

**Reason:** Rust uses `Result<T, E>` and `Option<T>` as its primary error handling mechanism — no exceptions.

### 3.1 Use the Type System for Errors

- Return `Result<T, E>` for operations that can fail — never `panic!` for expected errors
- Use `Option<T>` for values that may be absent — never sentinel values (`-1`, `null`)
- Use `?` operator for concise error propagation
- Define custom error enums for library crates — implement `std::error::Error`

### 3.2 Error Libraries

- Use `thiserror` for library error types (derive `Error` trait with structured variants)
- Use `anyhow` for application error handling (when you don't need callers to match on error variants)
- Never use `anyhow` in library crates — callers need structured errors to handle them

### 3.3 Panic Discipline

- `panic!` is for programmer errors (invariant violations, unreachable code)
- `unwrap()` and `expect()` are acceptable only in tests and prototypes
- In production code, use `unwrap_or()`, `unwrap_or_else()`, `unwrap_or_default()`, or propagate with `?`
- Use `expect("reason")` over `unwrap()` when you must — the message documents the invariant

---

## 4. Testing `[Overrides common: 2.1]`

**Reason:** Rust has a built-in test framework with specific conventions.

### 4.1 Test-First with `#[cfg(test)]`

Place unit tests in a `#[cfg(test)] mod tests` block at the bottom of each source file. Integration tests go in the `tests/` directory.

### 4.2 Test Coverage Strategy `[Overrides common: 2.4]`

**Reason:** Rust's type system and ownership model eliminate many bug classes — focus testing on logic.

- The compiler handles: null safety, data races, use-after-free, type mismatches
- Focus tests on: business logic, state transitions, error handling paths, serialization/deserialization
- Use `proptest` or `quickcheck` for property-based testing
- Use `#[should_panic]` for tests that verify panic behavior
- Use `assert_eq!`, `assert_ne!`, `assert!(matches!(...))` for clear assertions

---

## 5. Immutability `[Overrides common: 5.4]`

**Reason:** Rust variables are immutable by default — this is a core language feature.

- Variables are immutable by default (`let x = 5;`) — use `mut` only when mutation is needed
- Prefer returning new values over mutating in place, unless performance requires it
- Use `const` for compile-time constants, `static` for global state (with `Mutex` or `RwLock` for mutability)
- Shadowing (`let x = x + 1;`) is idiomatic for transformations — it's not mutation

---

## 6. Resource Cleanup `[Overrides common: 4.3]`

**Reason:** Rust's ownership system provides automatic resource cleanup via `Drop`.

- Resources are cleaned up automatically when they go out of scope (RAII via `Drop` trait)
- Implement `Drop` for types that manage external resources (file handles, network connections)
- Use `scopeguard` crate for ad-hoc cleanup that doesn't warrant a `Drop` implementation
- For async resources, use `tokio::spawn` with proper cancellation handling

---

## 7. Traits and Composition `[Overrides common: 5.1]`

**Reason:** Rust has no inheritance — traits and composition are the only abstraction mechanisms.

- Use traits to define shared behavior — they are Rust's interfaces
- Prefer trait bounds (`fn process<T: Display>(item: T)`) over trait objects (`&dyn Display`) for performance
- Use trait objects (`Box<dyn Trait>`) when you need runtime polymorphism or heterogeneous collections
- Implement standard traits: `Debug`, `Clone`, `PartialEq` (derive when possible)
- Use `#[derive(...)]` liberally — it's idiomatic and reduces boilerplate

---

## 8. Dependency Injection `[Overrides common: 5.2]`

**Reason:** Rust uses generics and trait bounds for compile-time DI.

- Use generic parameters with trait bounds for dependency injection: `fn new<S: Storage>(storage: S) -> Self`
- Use trait objects (`Box<dyn Trait>`) when generic parameters would infect the entire API
- No DI frameworks — Rust's type system makes them unnecessary
- Wire dependencies in `main()` — it's the composition root

---

## 9. Algorithm Complexity `[Overrides common: 4.2]`

**Reason:** Rust's zero-cost abstractions and ownership model affect performance patterns.

- Iterators are zero-cost — prefer `.iter().map().filter().collect()` over manual loops
- Use `Vec` for most collections, `HashMap` / `HashSet` for O(1) lookups
- Pre-allocate with `Vec::with_capacity()` and `HashMap::with_capacity()` when size is known
- Use `&str` over `String` for function parameters that don't need ownership
- Use `Cow<'_, str>` when a function sometimes needs to allocate and sometimes doesn't

---

## 10. Concurrency

### 10.1 Fearless Concurrency

Rust's type system prevents data races at compile time. Leverage this:

- Use `std::thread` for CPU-bound parallelism
- Use `tokio` or `async-std` for I/O-bound concurrency
- Use `rayon` for data parallelism (parallel iterators)
- `Send` and `Sync` traits are automatically derived — if your type doesn't implement them, there's a reason

### 10.2 Shared State

- Use `Arc<Mutex<T>>` for shared mutable state across threads
- Use `RwLock` when reads vastly outnumber writes
- Use channels (`std::sync::mpsc`, `crossbeam`, `tokio::sync::mpsc`) for message passing
- Prefer message passing over shared state when possible

---

## 11. SQL and Injection Prevention `[Overrides common: 3.6]`

**Reason:** Rust has type-safe database access patterns.

- Use `sqlx` for compile-time checked SQL queries
- Use `diesel` for type-safe ORM with schema DSL
- Use `sea-orm` for async ORM
- Never use `format!()` to build SQL queries with user input
- Use parameterized queries with `$1`, `?` placeholders

---

## 12. Unsafe Code

### 12.1 Minimize `unsafe`

- Use `unsafe` only when the safe alternative is impossible or has unacceptable performance cost
- Document every `unsafe` block with a `// SAFETY:` comment explaining why it's sound
- Encapsulate `unsafe` in safe abstractions — callers should never need to use `unsafe`
- Audit all `unsafe` blocks during code review with extra scrutiny

---

## 13. Git Workflow `[Overrides common: 6.5]`

**Reason:** Rust has specific build artifacts and generated files.

- Never commit `target/` directory (build artifacts)
- Commit `Cargo.lock` for binary crates (reproducible builds), but NOT for library crates
- Commit `Cargo.toml` — it defines the project and dependencies
- Use `.gitignore` with Rust-specific patterns

---

## Red Flags

| Thought | Reality |
|---------|---------|
| "I'll just `unwrap()` here" | Use `?` or `expect("reason")`. `unwrap()` is a hidden panic. |
| "I'll clone to satisfy the borrow checker" | Cloning is a band-aid. Restructure ownership instead. |
| "I need `unsafe` for this" | Probably not. Check if there's a safe abstraction in a crate first. |
| "This `Rc<RefCell<T>>` chain is fine" | It means you're fighting the borrow checker. Redesign the data flow. |
| "`anyhow` is fine for my library" | Libraries need structured errors (`thiserror`). `anyhow` is for applications. |
| "I'll add lifetimes everywhere" | If you need many lifetimes, the design may need restructuring. Simplify ownership. |
| "I'll use `String` for everything" | Use `&str` for borrows, `Cow<str>` for maybe-owned. `String` implies ownership. |
| "Trait objects are simpler than generics" | They have runtime cost (vtable). Use generics when performance matters. |

---

## Iron Laws

1. **No `unwrap()` in production code.** Use `?`, `expect("reason")`, or `unwrap_or_*` variants. Every `unwrap()` is a potential panic.
2. **Every `unsafe` block has a `// SAFETY:` comment.** No exceptions. If you can't explain why it's sound, it probably isn't.
3. **`cargo clippy` passes clean.** Fix all clippy warnings. They catch real bugs and non-idiomatic patterns.
4. **`cargo fmt` on every commit.** No manual formatting. `rustfmt` is the standard.
5. **Libraries use `thiserror`, applications use `anyhow`.** Never mix them up. Callers of libraries need structured errors.
6. **No `Rc<RefCell<T>>` without justification.** If you need it, document why. It usually means the ownership model needs rethinking.

---

## Behavioral Shaping

### When Starting a New Rust File

1. Add `#![deny(clippy::all)]` or configure in `clippy.toml` for the workspace
2. Derive standard traits (`Debug`, `Clone`, `PartialEq`) on all public types
3. Place `#[cfg(test)] mod tests` at the bottom of the file

### When Adding a New Dependency

1. Check if the standard library provides the functionality (`std::collections`, `std::fs`, `std::io`)
2. Evaluate with `crates.io` downloads, last update, and `lib.rs` documentation
3. Use `cargo add` to add dependencies — it updates `Cargo.toml` correctly
4. Check for `unsafe` usage in the dependency with `cargo geiger`

### When Reviewing Rust Code

1. Check for `unwrap()` and `expect()` in non-test code — each must be justified
2. Verify `unsafe` blocks have `// SAFETY:` comments and are minimal
3. Confirm error types are appropriate (`thiserror` for libs, `anyhow` for apps)
4. Look for unnecessary clones — suggest borrowing or restructuring ownership
