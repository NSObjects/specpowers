---
name: rules-kotlin
description: Use when writing, reviewing, or modifying Kotlin code — provides Kotlin-specific coding rules that override and extend the universal rules from rules-common
language: kotlin
---

# Kotlin Coding Rules

These rules apply to Kotlin projects. They inherit all rules from `rules-common` and override specific entries where Kotlin conventions differ. Overrides are marked with `[Overrides common: X.Y]` and include the reason.

---

## 1. Coding Style

### 1.1 Naming Conventions `[Overrides common: 1.1]`

**Reason:** Kotlin follows JetBrains coding conventions with some differences from Java.

- Classes, interfaces, objects: `PascalCase`
- Functions, properties, variables: `camelCase`
- Constants (`const val` and top-level `val`): `UPPER_SNAKE_CASE` for true constants, `camelCase` for computed values
- Packages: all lowercase, no underscores (`com.example.myapp`)
- Backing properties: prefix with underscore (`_mutableList` backing `mutableList`)
- Extension functions: name as if they were members of the receiver type

### 1.2 Function Size `[Overrides common: 1.2]`

**Reason:** Kotlin's concise syntax (expression bodies, scope functions) allows shorter functions.

- Aim for ~25 lines — Kotlin's expressiveness should reduce boilerplate
- Use single-expression functions (`fun double(x: Int) = x * 2`) when the body is simple
- Use scope functions (`let`, `apply`, `also`, `run`, `with`) to reduce temporary variables, but don't chain more than 2

### 1.3 File Organization `[Overrides common: 1.3]`

**Reason:** Kotlin allows multiple public classes per file and has top-level functions.

- Multiple related classes can live in one file — group by concept, not one-class-per-file
- Use top-level functions for utility operations instead of static methods in companion objects
- File name: `PascalCase.kt` if the file contains a single primary class, descriptive `camelCase.kt` otherwise

### 1.4 Formatting `[Overrides common: 1.5]`

**Reason:** Kotlin has an official style guide and formatter from JetBrains.

- Use `ktlint` or IntelliJ's built-in formatter configured to Kotlin coding conventions
- 4-space indentation
- Use trailing commas in multi-line declarations for cleaner diffs
- Use `detekt` for static analysis beyond formatting

---

## 2. Kotlin Idioms

### 2.1 Null Safety

- Use nullable types (`String?`) explicitly — never use `!!` except in tests
- Use safe calls (`?.`), Elvis operator (`?:`), and `let` for null handling
- Use `requireNotNull()` or `checkNotNull()` at boundaries where null indicates a programming error
- Prefer non-nullable types in public APIs — push nullability to the edges

### 2.2 Data Classes

- Use `data class` for value types — they provide `equals()`, `hashCode()`, `toString()`, `copy()`
- Use `sealed class` or `sealed interface` for restricted hierarchies with exhaustive `when`
- Prefer `data class` over plain classes for DTOs, events, and state objects

### 2.3 Scope Functions

- `let`: transform nullable values or introduce scoped variables
- `apply`: configure an object after creation
- `also`: perform side effects without changing the receiver
- `run`: execute a block on an object and return the result
- `with`: operate on an object when you don't need the result as a receiver

---

## 3. Error Handling `[Overrides common: 5.6]`

**Reason:** Kotlin has no checked exceptions and provides `Result<T>` and sealed classes for error modeling.

- Use `Result<T>` or custom sealed classes for expected errors — not exceptions
- Use exceptions only for truly exceptional, unrecoverable situations
- Use `runCatching { }` for wrapping exception-throwing code into `Result`
- Use `require()` and `check()` for precondition validation — they throw `IllegalArgumentException` and `IllegalStateException`
- Never catch `Exception` broadly — catch specific types

---

## 4. Testing `[Overrides common: 2.1]`

**Reason:** Kotlin has specific testing libraries and conventions.

### 4.1 Test-First with Kotlin Test Frameworks

Use JUnit 5 with Kotlin extensions, or `kotest` for a more Kotlin-idiomatic experience. Use `MockK` instead of Mockito for Kotlin-friendly mocking.

### 4.2 Test Coverage Strategy `[Overrides common: 2.4]`

**Reason:** Kotlin's null safety and type system reduce certain bug classes.

- The compiler handles: null safety (with nullable types), type mismatches, exhaustive `when`
- Focus tests on: business logic, coroutine behavior, state transitions, integration boundaries
- Use `kotest` property testing or `jqwik` for property-based tests
- Use backtick-quoted test names for readability: `` `should return empty list when no items match` ``

---

## 5. Coroutines

### 5.1 Structured Concurrency

- Always launch coroutines within a `CoroutineScope` — never use `GlobalScope`
- Use `supervisorScope` when child failures should not cancel siblings
- Use `withContext(Dispatchers.IO)` for blocking I/O operations
- Cancel coroutines via `Job.cancel()` or scope cancellation — check `isActive` in long-running loops

### 5.2 Flow for Reactive Streams

- Use `Flow` for cold asynchronous streams — prefer over `Channel` for most use cases
- Use `StateFlow` and `SharedFlow` for hot streams (UI state, event buses)
- Handle exceptions in flows with `catch` operator — don't let them propagate silently

---

## 6. Resource Cleanup `[Overrides common: 4.3]`

**Reason:** Kotlin provides `use` extension function for `Closeable` resources.

- Use `.use { }` for all `Closeable` / `AutoCloseable` resources
- For coroutine resources, use `withContext` and structured concurrency for cleanup
- Use `try/finally` only when `.use` is not applicable

---

## 7. Immutability `[Overrides common: 5.4]`

**Reason:** Kotlin distinguishes `val` (read-only) from `var` (mutable) at the language level.

- Use `val` by default — use `var` only when mutation is genuinely needed
- Use `List`, `Set`, `Map` (read-only interfaces) over `MutableList`, `MutableSet`, `MutableMap`
- Use `data class` with `val` properties for immutable value objects
- Use `copy()` on data classes for creating modified copies

---

## 8. Dependency Injection `[Overrides common: 5.2]`

**Reason:** Kotlin supports constructor injection naturally and has Kotlin-specific DI frameworks.

- Prefer constructor injection — Kotlin's concise constructors make this natural
- Use Koin for lightweight, Kotlin-idiomatic DI, or Dagger/Hilt for Android projects
- Avoid `lateinit var` for injected dependencies when constructor injection is possible

---

## Red Flags

| Thought | Reality |
|---------|---------|
| "I'll just use `!!` to unwrap" | `!!` is a `NullPointerException` waiting to happen. Use `?.`, `?:`, or `requireNotNull()`. |
| "GlobalScope is fine for this coroutine" | It leaks. Use structured concurrency with a proper `CoroutineScope`. |
| "I'll use `var` — I might need to change it" | Start with `val`. Change to `var` only when you actually need mutation. |
| "This `when` doesn't need an `else`" | If it's on a sealed type, the compiler checks exhaustiveness. Otherwise, add `else`. |
| "Chaining 5 scope functions is readable" | It's not. Limit to 2 chained scope functions maximum. |
| "Java patterns work fine in Kotlin" | Write Kotlin, not Java-with-Kotlin-syntax. Use idioms: data classes, extensions, scope functions. |

---

## Iron Laws

1. **No `!!` in production code.** Use safe calls, Elvis operator, or `requireNotNull()` with a message.
2. **No `GlobalScope`.** All coroutines launch within a structured `CoroutineScope`.
3. **`val` by default.** Use `var` only when mutation is required and justified.
4. **Sealed types for state modeling.** Use `sealed class` / `sealed interface` with exhaustive `when` for state machines and variants.
5. **`ktlint` or `detekt` in CI.** Automated style enforcement — no manual formatting debates.

---

## Behavioral Shaping

### When Starting a New Kotlin File

1. Use Kotlin idioms from the start — data classes, sealed types, extension functions
2. Set up `ktlint` and `detekt` in the build pipeline if not already present
3. Prefer top-level functions over companion object methods for stateless utilities

### When Adding a New Dependency

1. Check if Kotlin stdlib provides the functionality (`kotlin.collections`, `kotlin.io`, `kotlinx.coroutines`)
2. Prefer Kotlin-first libraries over Java libraries with Kotlin wrappers
3. For coroutines, use `kotlinx-coroutines` official extensions

### When Reviewing Kotlin Code

1. Check for `!!` usage — each instance should be eliminated or justified
2. Verify coroutines use structured concurrency (no `GlobalScope`)
3. Confirm `val` is used over `var` wherever possible
4. Look for Java-style patterns that have Kotlin-idiomatic alternatives
