---
name: rules-csharp
description: Use when writing, reviewing, or modifying C# code — provides C#-specific coding rules that override and extend the universal rules from rules-common
language: csharp
---

# C# Coding Rules

These rules apply to C# projects. They inherit all rules from `rules-common` and override specific entries where C# conventions differ. Overrides are marked with `[Overrides common: X.Y]` and include the reason.

---

## 1. Coding Style

### 1.1 Naming Conventions `[Overrides common: 1.1]`

**Reason:** C# has official Microsoft naming guidelines that are deeply embedded in the ecosystem.

- Classes, structs, interfaces, enums, methods, properties, events: `PascalCase`
- Interfaces: prefix with `I` (`IUserService`, `IDisposable`) — this is the C# convention
- Private fields: `_camelCase` with leading underscore (`_userRepository`)
- Local variables and parameters: `camelCase`
- Constants: `PascalCase` (not `UPPER_SNAKE_CASE` — C# convention differs from most languages)
- Namespaces: `PascalCase` matching folder structure (`MyApp.Services.Users`)
- Async methods: suffix with `Async` (`GetUserAsync`, `SaveChangesAsync`)

### 1.2 Function Size `[Overrides common: 1.2]`

**Reason:** C#'s LINQ, pattern matching, and expression-bodied members enable concise code.

- Aim for ~30 lines — use LINQ and pattern matching to reduce boilerplate
- Use expression-bodied members (`=>`) for single-expression methods and properties
- Extract complex LINQ chains into named methods when they exceed 3-4 operations

### 1.3 File Organization `[Overrides common: 1.3]`

**Reason:** C# has one-type-per-file convention and namespace-to-folder mapping.

- One type per file, filename matches type name (`UserService.cs`)
- Use file-scoped namespaces (C# 10+): `namespace MyApp.Services;` — saves one level of indentation
- Use `partial class` to split large classes across files (e.g., generated + handwritten code)
- Order: `using` directives → namespace → type → fields → constructors → properties → methods

### 1.4 Formatting `[Overrides common: 1.5]`

**Reason:** C# has `dotnet format` and `.editorconfig` as the standard formatting tools.

- Use `dotnet format` with `.editorconfig` for automated formatting
- Use Roslyn analyzers for static analysis
- 4-space indentation, Allman brace style (braces on new lines)
- Configure severity levels in `.editorconfig` for consistent enforcement

---

## 2. Type System and Modern C#

### 2.1 Nullable Reference Types

- Enable nullable reference types (`<Nullable>enable</Nullable>` in `.csproj`) — treat warnings as errors
- Use `string?` for nullable, `string` for non-nullable — the compiler enforces null safety
- Use null-conditional (`?.`), null-coalescing (`??`), and null-forgiving (`!`) operators appropriately
- Never use `!` (null-forgiving) to silence warnings without justification

### 2.2 Records and Value Types

- Use `record` (C# 9+) for immutable data types with value equality
- Use `record struct` for small, stack-allocated value types
- Use `init` properties for immutable-after-construction objects
- Use `required` properties (C# 11+) for mandatory initialization

### 2.3 Pattern Matching

- Use pattern matching in `switch` expressions for type-safe branching
- Use `is` patterns for type checks with variable binding
- Use property patterns for concise conditional logic
- Prefer pattern matching over `as` + null check

---

## 3. Error Handling `[Overrides common: 5.6]`

**Reason:** C# uses exceptions with specific conventions for custom exceptions and async error handling.

- Throw specific exception types — never `throw new Exception("message")`
- Custom exceptions: inherit from `Exception`, name with `Exception` suffix, include standard constructors
- Use `when` clause in catch blocks for conditional exception handling
- Never catch `Exception` broadly unless at the top-level error boundary
- In async code, `await` propagates exceptions naturally — don't wrap in `try/catch` unnecessarily

---

## 4. Testing `[Overrides common: 2.1]`

**Reason:** C# has multiple testing frameworks with specific conventions.

### 4.1 Test-First with xUnit, NUnit, or MSTest

Use xUnit (preferred for new projects), NUnit, or MSTest. Use FluentAssertions for readable assertions. Use Moq or NSubstitute for mocking.

### 4.2 Test Coverage Strategy `[Overrides common: 2.4]`

**Reason:** C#'s type system and nullable reference types eliminate certain bug classes.

- The compiler handles: null safety (with NRT), type mismatches, exhaustive switch (with warnings)
- Focus tests on: business logic, async behavior, LINQ queries, integration boundaries
- Use `[Theory]` with `[InlineData]` (xUnit) for parameterized tests
- Use FsCheck or CsCheck for property-based testing

---

## 5. Async/Await

### 5.1 Async All the Way

- Use `async`/`await` for all I/O-bound operations — never block with `.Result` or `.Wait()`
- Suffix async methods with `Async`
- Use `ConfigureAwait(false)` in library code to avoid deadlocks
- Use `ValueTask<T>` for hot paths where the result is often synchronous
- Use `CancellationToken` for cancellable async operations — propagate it through the call chain

---

## 6. Resource Cleanup `[Overrides common: 4.3]`

**Reason:** C# has `IDisposable` and `using` statements as the idiomatic cleanup pattern.

- Implement `IDisposable` for types that hold unmanaged resources
- Use `using` declarations (C# 8+) or `using` blocks for all `IDisposable` resources
- Use `IAsyncDisposable` and `await using` for async resource cleanup
- Follow the Dispose pattern with a `protected virtual void Dispose(bool disposing)` method for inheritance

---

## 7. Dependency Injection `[Overrides common: 5.2]`

**Reason:** C# has a built-in DI container in `Microsoft.Extensions.DependencyInjection`.

- Use constructor injection — the built-in DI container resolves dependencies automatically
- Register services in `Program.cs` or `Startup.cs` with appropriate lifetimes (`Transient`, `Scoped`, `Singleton`)
- Depend on interfaces (`IUserService`), not implementations (`UserService`)
- Use `IOptions<T>` pattern for configuration injection

---

## 8. SQL and Injection Prevention `[Overrides common: 3.6]`

**Reason:** C# has Entity Framework and Dapper as primary data access tools.

- Use Entity Framework Core with LINQ queries for type-safe database access
- Use Dapper with parameterized queries for lightweight data access
- Never use string interpolation or concatenation in SQL — use `@param` placeholders
- Use `FromSqlInterpolated()` (EF Core) which auto-parameterizes interpolated strings

---

## Red Flags

| Thought | Reality |
|---------|---------|
| "I'll use `.Result` to get the async value" | That deadlocks. Use `await` all the way. |
| "Nullable reference types are too noisy" | They catch null bugs at compile time. Enable them and fix the warnings. |
| "I'll throw `new Exception()`" | Throw specific exception types. Generic exceptions are unhandleable. |
| "I'll use `!` to suppress the null warning" | You're hiding a potential `NullReferenceException`. Fix the nullability. |
| "This `catch (Exception)` is fine" | Catch specific types. Broad catches hide bugs and swallow critical errors. |
| "I don't need `using` — GC will handle it" | GC handles memory, not unmanaged resources. Use `using` for `IDisposable`. |

---

## Iron Laws

1. **Nullable reference types enabled.** `<Nullable>enable</Nullable>` in every project. Treat warnings as errors.
2. **`async`/`await` all the way.** Never `.Result` or `.Wait()`. Blocking on async code deadlocks.
3. **`using` for all `IDisposable`.** No manual `Dispose()` calls. The language provides a better mechanism.
4. **Constructor injection only.** No service locator pattern. Dependencies are explicit in the constructor.
5. **`dotnet format` in CI.** Automated formatting with `.editorconfig` — no manual style debates.

---

## Behavioral Shaping

### When Starting a New C# File

1. Enable nullable reference types if not already enabled project-wide
2. Use file-scoped namespaces (C# 10+) to reduce indentation
3. Use `record` for data types that need value equality

### When Adding a New Dependency

1. Check if the .NET BCL provides the functionality (`System.Text.Json`, `System.Net.Http`, `System.IO`)
2. Use NuGet for dependency management — verify the package is actively maintained
3. Prefer packages from Microsoft or well-known maintainers

### When Reviewing C# Code

1. Check for `.Result` or `.Wait()` on async code — they should be `await`
2. Verify nullable reference type warnings are addressed, not suppressed with `!`
3. Confirm `using` is used for all `IDisposable` resources
4. Look for broad `catch (Exception)` blocks — they should catch specific types
