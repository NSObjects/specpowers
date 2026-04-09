---
name: rules-cpp
description: Use when writing, reviewing, or modifying C++ code — provides C++-specific coding rules that override and extend the universal rules from rules-common
language: cpp
---

# C++ Coding Rules

These rules apply to C++ projects. They inherit all rules from `rules-common` and override specific entries where C++ conventions differ. Overrides are marked with `[覆盖 common: X.Y]` and include the reason.

---

## 1. Coding Style

### 1.1 Naming Conventions `[覆盖 common: 1.1]`

**Reason:** C++ has multiple naming conventions (Google, LLVM, Qt); pick one and enforce it project-wide.

- Classes and structs: `PascalCase` (`HttpClient`, `UserService`)
- Functions and methods: `camelCase` (Google) or `snake_case` (STL/LLVM) — be consistent within the project
- Variables: `snake_case` for locals, `snake_case_` with trailing underscore for private members (Google style)
- Constants: `kPascalCase` (Google) or `UPPER_SNAKE_CASE` — pick one
- Namespaces: `snake_case`, short
- Template parameters: `PascalCase` (`typename Container`, `typename ValueType`)
- Macros: `UPPER_SNAKE_CASE` — and avoid macros when possible

### 1.2 Function Size `[覆盖 common: 1.2]`

**Reason:** C++ templates, RAII patterns, and error handling add visual weight.

- Aim for ~50 lines including template declarations and error handling
- Extract complex template metaprogramming into named type aliases or helper traits
- Use early returns and guard clauses to reduce nesting

### 1.3 File Organization `[覆盖 common: 1.3]`

**Reason:** C++ has header/source separation and include management concerns.

- Header files (`.h` / `.hpp`): declarations, inline functions, templates
- Source files (`.cpp`): definitions, implementation details
- Use include guards (`#pragma once` or `#ifndef`) in all headers
- Order includes: corresponding header → C system → C++ standard → third-party → project headers
- Use forward declarations to minimize header dependencies

### 1.4 Formatting `[覆盖 common: 1.5]`

**Reason:** C++ has `clang-format` as the de facto standard formatter.

- Use `clang-format` with a `.clang-format` configuration file
- Use `clang-tidy` for static analysis and modernization suggestions
- Configure once, enforce in CI — no manual formatting debates

---

## 2. Modern C++ (C++17/20/23)

### 2.1 Use Modern Features

- Use `auto` for type deduction when the type is obvious from context
- Use structured bindings (`auto [key, value] = pair;`)
- Use `std::optional<T>` instead of sentinel values or output parameters
- Use `std::variant` and `std::visit` for type-safe unions
- Use `constexpr` for compile-time computation
- Use `std::string_view` for non-owning string references

### 2.2 Smart Pointers

- Use `std::unique_ptr` for exclusive ownership (default choice)
- Use `std::shared_ptr` only when shared ownership is genuinely needed
- Never use raw `new`/`delete` — use `std::make_unique` and `std::make_shared`
- Use `std::weak_ptr` to break circular references in `shared_ptr` graphs

---

## 3. Error Handling `[覆盖 common: 5.6]`

**Reason:** C++ has exceptions, error codes, and `std::expected` (C++23) — choose consistently.

- Pick one error handling strategy per project and stick with it
- If using exceptions: throw by value, catch by const reference
- If using error codes: use `std::expected<T, E>` (C++23) or a Result type library
- Use RAII to ensure cleanup happens regardless of error path
- Never throw from destructors — it causes `std::terminate`

---

## 4. Testing `[覆盖 common: 2.1]`

**Reason:** C++ has specific testing frameworks and compilation considerations.

### 4.1 Test-First with Google Test or Catch2

Use Google Test (`gtest`) or Catch2 for unit testing. Use `TEST()` / `TEST_F()` macros (gtest) or `TEST_CASE` / `SECTION` (Catch2).

### 4.2 Test Coverage Strategy `[覆盖 common: 2.4]`

**Reason:** C++ has undefined behavior and memory safety concerns that require targeted testing.

- Test memory safety: use AddressSanitizer (`-fsanitize=address`) in test builds
- Test undefined behavior: use UBSanitizer (`-fsanitize=undefined`)
- Use `rapidcheck` for property-based testing
- Test RAII: verify resources are released on all exit paths (normal, exception, early return)

---

## 5. Resource Cleanup `[覆盖 common: 4.3]`

**Reason:** C++ uses RAII as its fundamental resource management pattern.

- RAII (Resource Acquisition Is Initialization) is mandatory — wrap all resources in RAII types
- Use smart pointers for heap memory, `std::lock_guard` / `std::scoped_lock` for mutexes
- Use `std::fstream` (auto-closes) over raw `FILE*`
- Custom resources: write a class with constructor (acquire) and destructor (release)
- Follow the Rule of Five (or Rule of Zero): if you define any of destructor/copy-ctor/copy-assign/move-ctor/move-assign, define all five — or define none and let the compiler generate them

---

## 6. Immutability `[覆盖 common: 5.4]`

**Reason:** C++ provides `const` at multiple levels — use it aggressively.

- Use `const` on variables, parameters, member functions, and return types by default
- Use `constexpr` for values computable at compile time
- Mark member functions `const` when they don't modify object state
- Pass large objects by `const&` — pass small types by value

---

## 7. Composition and Inheritance `[覆盖 common: 5.1]`

**Reason:** C++ supports multiple inheritance — use it carefully.

- Prefer composition over inheritance
- If using inheritance, prefer `public` virtual inheritance for interfaces (pure abstract classes)
- Use `override` keyword on all overriding methods — the compiler catches mistakes
- Use `final` to prevent further inheritance when the hierarchy is complete
- Avoid diamond inheritance — use virtual inheritance only when absolutely necessary

---

## 8. Algorithm Complexity `[覆盖 common: 4.2]`

**Reason:** C++ gives direct control over memory layout, which affects performance significantly.

- Use `std::vector` as the default container — cache-friendly and fast for most use cases
- Use `std::unordered_map` / `std::unordered_set` for O(1) average lookups
- Reserve capacity with `.reserve()` when the size is known
- Prefer algorithms from `<algorithm>` over hand-written loops
- Be aware of iterator invalidation rules for each container

---

## 9. Concurrency

### 9.1 Thread Safety

- Use `std::mutex` with `std::lock_guard` or `std::scoped_lock` — never lock/unlock manually
- Use `std::atomic` for simple shared counters and flags
- Use `std::jthread` (C++20) over `std::thread` for automatic joining
- Avoid data races — they are undefined behavior in C++

---

## Red Flags

| Thought | Reality |
|---------|---------|
| "I'll use raw `new`/`delete`" | Use `std::make_unique` or `std::make_shared`. Manual memory management leaks. |
| "This cast with `reinterpret_cast` is fine" | It's almost never fine. Use `static_cast` or redesign. |
| "I don't need `const` here" | You do. `const` by default, `mutable` by exception. |
| "I'll just use a raw pointer" | Use smart pointers for ownership. Raw pointers are for non-owning observation only. |
| "This macro is simpler than a template" | Macros are unscoped, untyped, and undebuggable. Use `constexpr`, templates, or inline functions. |
| "I'll handle cleanup in the caller" | Use RAII. The destructor handles cleanup automatically on all exit paths. |

---

## Iron Laws

1. **No raw `new`/`delete`.** Use smart pointers and RAII. Manual memory management is the #1 source of C++ bugs.
2. **RAII for all resources.** Files, locks, sockets, memory — wrap them in RAII types. No exceptions.
3. **`const` by default.** Variables, parameters, member functions — mark them `const` unless mutation is required.
4. **`override` on all virtual overrides.** The compiler catches signature mismatches. No silent bugs.
5. **Sanitizers in test builds.** Run tests with AddressSanitizer and UBSanitizer. Memory bugs and UB are silent killers.
6. **`clang-format` and `clang-tidy` in CI.** Automated formatting and static analysis — no manual debates.

---

## Behavioral Shaping

### When Starting a New C++ File

1. Add include guards (`#pragma once`) to all header files
2. Use the project's established naming convention and `.clang-format` configuration
3. Include the corresponding header first in `.cpp` files to catch missing dependencies

### When Adding a New Dependency

1. Check if the C++ standard library provides the functionality (`<algorithm>`, `<filesystem>`, `<ranges>`)
2. Prefer header-only libraries for simpler integration when appropriate
3. Use a package manager (vcpkg, Conan) — avoid manual dependency management

### When Reviewing C++ Code

1. Check for raw `new`/`delete` — they should be smart pointers
2. Verify RAII is used for all resource management
3. Confirm `const` correctness on parameters, member functions, and variables
4. Look for missing `override` on virtual method overrides
