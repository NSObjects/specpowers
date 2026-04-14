<!-- generated from skills/ by sync-steering.js -->
---
name: rules-dart
description: Use when writing, reviewing, or modifying Dart code — provides Dart-specific coding rules that override and extend the universal rules from rules-common
language: dart
---

# Dart Coding Rules

These rules apply to Dart projects (including Flutter). They inherit all rules from `rules-common` and override specific entries where Dart conventions differ. Overrides are marked with `[Overrides common: X.Y]` and include the reason.

---

## 1. Coding Style

### 1.1 Naming Conventions `[Overrides common: 1.1]`

**Reason:** Dart has official Effective Dart naming conventions.

- Classes, enums, typedefs, extensions: `PascalCase` (`UserService`, `HttpClient`)
- Variables, functions, parameters, named parameters: `camelCase`
- Constants: `camelCase` (not `UPPER_SNAKE_CASE` — Dart convention uses `camelCase` for `const`)
- Libraries and packages: `snake_case` (`my_package`, `user_service`)
- Private members: prefix with underscore (`_privateField`, `_helperMethod`)
- File names: `snake_case.dart` (`user_service.dart`)
- Booleans: use `is`, `has`, `should`, `can` prefixes

### 1.2 Function Size `[Overrides common: 1.2]`

**Reason:** Dart's cascade notation, collection literals, and named parameters enable concise code.

- Aim for ~30 lines — Dart's expressiveness should keep functions short
- Use cascade notation (`..`) to chain operations on the same object
- Extract complex widget trees (Flutter) into separate widget classes or methods

### 1.3 File Organization `[Overrides common: 1.3]`

**Reason:** Dart uses `part`/`part of` and library-level organization.

- One primary class per file, filename in `snake_case.dart`
- Avoid `part`/`part of` — prefer separate files with imports
- Order: `import` directives (dart: → package: → relative) → class definition
- Use `export` directives in barrel files sparingly

### 1.4 Formatting `[Overrides common: 1.5]`

**Reason:** Dart has `dart format` as the single canonical formatter.

- Use `dart format` — it is the only accepted formatter, no configuration needed
- 2-space indentation (Dart standard)
- Use `dart analyze` for static analysis
- Use trailing commas in argument lists and collections for better formatting by `dart format`

---

## 2. Type System

### 2.1 Sound Null Safety

- Dart has sound null safety — use it. Non-nullable by default.
- Use `String?` for nullable types, `String` for non-nullable
- Use `!` (null assertion) sparingly — prefer null-aware operators (`?.`, `??`, `??=`)
- Use `late` for variables initialized after declaration but before use — avoid when possible

### 2.2 Prefer Type Inference

- Use `var` for local variables when the type is obvious from the right-hand side
- Use explicit types for public API signatures (function parameters, return types, class fields)
- Use `final` for variables that are assigned once — prefer `final` over `var`
- Use `const` for compile-time constants and immutable collections

---

## 3. Error Handling `[Overrides common: 5.6]`

**Reason:** Dart uses exceptions with `try`/`catch`/`on` and `Future` error handling.

- Use `on` clause to catch specific exception types: `on FormatException catch (e) { ... }`
- Use `catch` without `on` only at top-level error boundaries
- Use `rethrow` instead of `throw e` to preserve the stack trace
- For `Future`-based code, handle errors with `catchError` or `try/catch` with `await`
- Create custom exception classes for domain errors

---

## 4. Testing `[Overrides common: 2.1]`

**Reason:** Dart has a built-in `test` package with specific conventions.

### 4.1 Test-First with `package:test`

Use `package:test` for unit tests. Use `group()` for organizing related tests. Use `setUp()` and `tearDown()` for test lifecycle.

### 4.2 Test Coverage Strategy `[Overrides common: 2.4]`

**Reason:** Dart's sound null safety eliminates null-related bugs — focus tests on logic.

- The compiler handles: null safety, type mismatches
- Focus tests on: business logic, async behavior, state management, serialization
- Use `package:test` matchers (`expect`, `isA`, `throwsA`) for clear assertions
- For Flutter: use `testWidgets` for widget tests, `flutter_test` for integration tests
- Use `dart_quickcheck` or `glados` for property-based testing

---

## 5. Async Patterns

### 5.1 Futures and Streams

- Use `async`/`await` for all asynchronous operations — avoid raw `Future.then()` chains
- Use `Stream` for sequences of asynchronous events
- Use `StreamController` for creating custom streams — always close controllers when done
- Use `Future.wait()` for parallel operations, `Stream.asyncMap` for sequential async processing

### 5.2 Error Handling in Async Code

- Always handle errors in `Future` chains — unhandled errors crash the app
- Use `runZonedGuarded` for top-level async error handling
- Use `Completer` only when bridging callback-based APIs to `Future`-based APIs

---

## 6. Resource Cleanup `[Overrides common: 4.3]`

**Reason:** Dart has no `using`/`with` statement — use `try/finally` and dispose patterns.

- Use `try/finally` for resource cleanup
- In Flutter, implement `dispose()` in `State` classes to clean up controllers, streams, and subscriptions
- Close `StreamController`, `AnimationController`, and `TextEditingController` in `dispose()`
- Use `addPostFrameCallback` for cleanup that depends on the widget tree

---

## 7. Immutability `[Overrides common: 5.4]`

**Reason:** Dart provides `final`, `const`, and immutable collections.

- Use `final` for variables assigned once — it's the default choice over `var`
- Use `const` for compile-time constants and immutable widget trees (Flutter performance)
- Use `List.unmodifiable()`, `Map.unmodifiable()` for runtime-immutable collections
- Use `@immutable` annotation on classes that should be immutable (Flutter widgets)
- Use `freezed` package for immutable data classes with union types

---

## 8. Dependency Injection `[Overrides common: 5.2]`

**Reason:** Dart/Flutter has specific DI patterns and packages.

- Use constructor injection for explicit dependencies
- In Flutter, use `Provider`, `Riverpod`, or `get_it` for dependency injection
- Avoid global singletons — use the DI container to manage lifetimes
- In tests, override providers or inject mocks via constructors

---

## Red Flags

| Thought | Reality |
|---------|---------|
| "I'll use `!` to force unwrap" | Use `?.`, `??`, or handle the null case. `!` throws at runtime. |
| "I'll use `late` for everything" | `late` defers the error, not the problem. Initialize properly or use nullable. |
| "I don't need to close this controller" | Memory leak. Always `dispose()` controllers and close streams. |
| "I'll use `dynamic` for flexibility" | `dynamic` disables type checking. Use generics or proper types. |
| "This `var` is fine without `final`" | Use `final` by default. `var` implies you intend to reassign. |
| "I'll skip `const` on this widget" | `const` widgets are free performance. Use them wherever possible in Flutter. |

---

## Iron Laws

1. **`final` by default.** Use `var` only when reassignment is needed. `const` when the value is compile-time known.
2. **No `dynamic` in production code.** Use proper types or generics. `dynamic` defeats the type system.
3. **`dispose()` everything.** Controllers, streams, subscriptions — clean up in `dispose()` or `try/finally`.
4. **`dart format` on every commit.** No manual formatting. The formatter is the standard.
5. **`dart analyze` clean.** Fix all analysis warnings. They catch real bugs.

---

## Behavioral Shaping

### When Starting a New Dart File

1. Run `dart format` to ensure consistent formatting from the start
2. Use `final` for all variable declarations unless reassignment is needed
3. Set up `analysis_options.yaml` with recommended lints if not already present

### When Adding a New Dependency

1. Check if `dart:core`, `dart:async`, `dart:io`, or `dart:convert` provides the functionality
2. Use `pub.dev` to find packages — check scores, popularity, and maintenance status
3. Add to `pubspec.yaml` and run `dart pub get` or `flutter pub get`

### When Reviewing Dart Code

1. Check for `dynamic` usage — each instance should be eliminated or justified
2. Verify `dispose()` is called for all controllers and stream subscriptions
3. Confirm `final` and `const` are used wherever possible
4. Look for missing error handling in `Future` chains
