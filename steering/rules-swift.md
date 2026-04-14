<!-- generated from skills/ by sync-steering.js -->
---
name: rules-swift
description: Use when writing, reviewing, or modifying Swift code — provides Swift-specific coding rules that override and extend the universal rules from rules-common
language: swift
---

# Swift Coding Rules

These rules apply to Swift projects. They inherit all rules from `rules-common` and override specific entries where Swift conventions differ. Overrides are marked with `[Overrides common: X.Y]` and include the reason.

---

## 1. Coding Style

### 1.1 Naming Conventions `[Overrides common: 1.1]`

**Reason:** Swift has official API Design Guidelines from Apple that emphasize clarity at the point of use.

- Types, protocols, enums: `PascalCase` (`URLSession`, `Codable`)
- Functions, properties, variables: `camelCase`
- Enum cases: `camelCase` (`case loading`, `case loaded(Data)`)
- Boolean properties: read as assertions (`isEmpty`, `hasContent`, `shouldRefresh`)
- Factory methods: begin with `make` (`makeIterator()`)
- Mutating/non-mutating pairs: verb for mutating (`sort()`), past participle for non-mutating (`sorted()`)
- Label first arguments when they clarify meaning; omit when the function name provides context

### 1.2 Function Size `[Overrides common: 1.2]`

**Reason:** Swift's closures, guard statements, and protocol extensions enable concise code.

- Aim for ~30 lines — Swift's expressiveness should keep functions short
- Use `guard` for early exits instead of nested `if let`
- Extract complex closures into named functions or computed properties

### 1.3 File Organization `[Overrides common: 1.3]`

**Reason:** Swift uses extensions for organizing code within a file.

- Use `// MARK: -` comments to separate sections within a file
- Use extensions to group protocol conformances: `extension User: Codable { ... }`
- One primary type per file, with related extensions in the same file
- Order: properties → initializers → public methods → private methods → extensions

### 1.4 Formatting `[Overrides common: 1.5]`

**Reason:** Swift has `swift-format` (Apple's official formatter) and SwiftLint.

- Use `swift-format` or SwiftLint for automated formatting
- 4-space indentation
- Use SwiftLint for additional style and convention enforcement
- Configure rules in `.swiftlint.yml` at the project root

---

## 2. Type System

### 2.1 Value Types by Default

- Use `struct` over `class` unless you need reference semantics or inheritance
- Use `enum` with associated values for modeling variants and state machines
- Use `protocol` for defining shared behavior — prefer protocol-oriented design over class hierarchies

### 2.2 Optionals

- Use optionals (`T?`) for values that may be absent — never use sentinel values
- Use `guard let` for early unwrapping at function boundaries
- Use `if let` for conditional unwrapping in limited scope
- Use optional chaining (`?.`) for accessing nested optional properties
- Avoid force unwrapping (`!`) except in tests and `IBOutlet` declarations

---

## 3. Error Handling `[Overrides common: 5.6]`

**Reason:** Swift uses `throws`/`try`/`catch` with typed errors and `Result<T, E>`.

- Use `throws` for functions that can fail — callers must handle with `try`, `try?`, or `try!`
- Define error types as `enum` conforming to `Error` protocol
- Use `Result<Success, Failure>` for async callbacks or when you need to store errors
- Use `guard` with `throw` for precondition validation
- Never use `try!` in production code — it crashes on failure

---

## 4. Testing `[Overrides common: 2.1]`

**Reason:** Swift has XCTest and the newer Swift Testing framework.

### 4.1 Test-First with XCTest or Swift Testing

Use XCTest for established projects, or Swift Testing (`@Test`, `#expect`) for new projects (Swift 5.9+). Use `@testable import` to access internal members.

### 4.2 Test Coverage Strategy `[Overrides common: 2.4]`

**Reason:** Swift's type system and optionals eliminate null-related bugs — focus tests on logic.

- The compiler handles: null safety (optionals), type mismatches, exhaustive switch
- Focus tests on: business logic, async behavior, error handling, Codable conformance
- Use `XCTAssertThrowsError` for testing error paths
- Use `swift-testing` parameterized tests for table-driven scenarios

---

## 5. Resource Cleanup `[Overrides common: 4.3]`

**Reason:** Swift uses ARC (Automatic Reference Counting) — not garbage collection.

- ARC handles memory automatically, but watch for retain cycles
- Use `weak` references for delegates and parent references
- Use `unowned` only when you can guarantee the referenced object outlives the reference
- Use `defer` for non-memory cleanup (closing files, unlocking locks)
- Use `withCheckedContinuation` for bridging callback-based APIs to async/await

---

## 6. Immutability `[Overrides common: 5.4]`

**Reason:** Swift distinguishes `let` (immutable) from `var` (mutable) at the language level.

- Use `let` by default — use `var` only when mutation is needed
- Structs are value types — assignment creates a copy, providing natural immutability
- Mark methods that modify struct state as `mutating`
- Use `private(set)` for properties that are publicly readable but privately writable

---

## 7. Concurrency (Swift Concurrency)

### 7.1 Structured Concurrency

- Use `async`/`await` for asynchronous code — avoid callback-based patterns
- Use `Task` for launching concurrent work, `TaskGroup` for parallel operations
- Use `actor` for thread-safe mutable state — actors serialize access automatically
- Mark `@Sendable` closures that cross concurrency boundaries

---

## Red Flags

| Thought | Reality |
|---------|---------|
| "I'll force unwrap with `!`" | Use `guard let` or `if let`. Force unwraps crash in production. |
| "I need a class for this" | Use a `struct` unless you need reference semantics or inheritance. |
| "I'll use `try!` — it won't fail" | It will. Use `try` with proper error handling. |
| "This retain cycle won't matter" | It will leak memory. Use `weak` or `unowned` references. |
| "I'll use a callback instead of async/await" | Use Swift Concurrency. Callbacks create pyramid-of-doom nesting. |
| "Nested `if let` is fine" | Use `guard let` for early exits. Flat code is readable code. |

---

## Iron Laws

1. **No force unwrapping (`!`) in production code.** Use `guard let`, `if let`, or `??` with defaults.
2. **`struct` over `class` by default.** Use classes only for reference semantics, inheritance, or Objective-C interop.
3. **`let` by default.** Use `var` only when mutation is required.
4. **No retain cycles.** Use `weak` for delegates and closures that capture `self`. Audit with Instruments.
5. **SwiftLint in CI.** Automated style enforcement — no manual formatting debates.

---

## Behavioral Shaping

### When Starting a New Swift File

1. Import only what you need — avoid importing entire frameworks when a specific module suffices
2. Use `struct` as the default type unless reference semantics are required
3. Set up SwiftLint configuration if not already present in the project

### When Adding a New Dependency

1. Check if Foundation or the Swift standard library provides the functionality
2. Use Swift Package Manager (SPM) for dependency management
3. Prefer packages with Swift Concurrency support for new projects

### When Reviewing Swift Code

1. Check for force unwraps (`!`) — each must be eliminated or justified
2. Verify `weak`/`unowned` is used in closures and delegates to prevent retain cycles
3. Confirm `guard let` is used for early exits instead of nested `if let`
4. Look for classes that should be structs
