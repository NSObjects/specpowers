---
name: rules-java
description: Use when writing, reviewing, or modifying Java code — provides Java-specific coding rules that override and extend the universal rules from rules-common
language: java
---

# Java Coding Rules

These rules apply to Java projects. They inherit all rules from `rules-common` and override specific entries where Java conventions differ. Overrides are marked with `[覆盖 common: X.Y]` and include the reason.

---

## 1. Coding Style

### 1.1 Naming Conventions `[覆盖 common: 1.1]`

**Reason:** Java has deeply established naming conventions from the Java Language Specification and Google Java Style Guide.

- Classes and interfaces: `PascalCase` (`HttpClient`, `UserService`)
- Methods and variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE` (`MAX_RETRY_COUNT`)
- Packages: all lowercase, reverse domain (`com.example.myapp.service`)
- Generics: single uppercase letter (`T`, `E`, `K`, `V`) or descriptive (`TResult`)
- Booleans: use `is`, `has`, `should`, `can` prefixes for methods; avoid for fields when using frameworks that expect `getX()`

### 1.2 Function Size `[覆盖 common: 1.2]`

**Reason:** Java's verbosity (type declarations, checked exceptions, annotations) inflates line counts.

- Aim for ~40 lines including annotations and exception handling
- Extract complex conditionals into well-named private methods
- Use early returns to reduce nesting — avoid deep `if/else` chains

### 1.3 File Organization `[覆盖 common: 1.3]`

**Reason:** Java enforces one public class per file, named to match the file.

- One public class per file, filename matches class name exactly
- Order: static fields → instance fields → constructors → public methods → private methods
- Group related classes in the same package, not the same file
- Use `package-info.java` for package-level documentation

### 1.4 Formatting `[覆盖 common: 1.5]`

**Reason:** Java ecosystem has converged on specific formatters.

- Use Google Java Format or the IDE's built-in formatter configured to team standards
- 4-space indentation (Google style) or 4-space with tabs (Eclipse default) — pick one, enforce it
- Use `spotless` or `checkstyle` in the build pipeline to enforce formatting

---

## 2. Type System and Modern Java

### 2.1 Use Records for Data Classes

Use `record` (Java 16+) for immutable data carriers instead of manual POJO boilerplate. Records provide `equals()`, `hashCode()`, and `toString()` automatically.

### 2.2 Use Sealed Classes for Restricted Hierarchies

Use `sealed` classes/interfaces (Java 17+) to define closed type hierarchies. Combine with pattern matching in `switch` for exhaustive handling.

### 2.3 Prefer `var` for Local Variables

Use `var` (Java 10+) when the type is obvious from the right-hand side. Do not use `var` when it reduces readability.

### 2.4 Use Optional Correctly

- Return `Optional<T>` from methods that may not have a result — never return `null`
- Never use `Optional` as a field type, method parameter, or collection element
- Use `orElseThrow()`, `map()`, `flatMap()` — avoid `get()` without `isPresent()` check

---

## 3. Error Handling `[覆盖 common: 5.6]`

**Reason:** Java uses checked and unchecked exceptions — a unique dual system.

- Use checked exceptions for recoverable conditions the caller must handle
- Use unchecked exceptions (`RuntimeException` subclasses) for programming errors
- Never catch `Exception` or `Throwable` broadly — catch specific types
- Use try-with-resources for all `AutoCloseable` resources — never rely on `finalize()`
- Create domain-specific exception hierarchies rooted in a project base exception

---

## 4. Testing `[覆盖 common: 2.1]`

**Reason:** Java has a mature testing ecosystem with specific conventions.

### 4.1 Test-First with JUnit 5

Use JUnit 5 (`@Test`, `@ParameterizedTest`, `@Nested`). Use AssertJ for fluent assertions. Use Mockito for mocking external dependencies only.

### 4.2 Test Coverage Strategy `[覆盖 common: 2.4]`

**Reason:** Java's type system catches type errors at compile time — focus tests on behavior.

- Use `@ParameterizedTest` with `@CsvSource` or `@MethodSource` for table-driven tests
- Use `jqwik` for property-based testing
- Test exception paths with `assertThrows()`
- Use `@Nested` classes to organize tests by scenario

---

## 5. Resource Cleanup `[覆盖 common: 4.3]`

**Reason:** Java has try-with-resources as the idiomatic cleanup pattern.

- Always use try-with-resources for `AutoCloseable` resources (streams, connections, readers)
- Implement `AutoCloseable` for custom resource types
- Never use `finalize()` — it is deprecated and unreliable
- For non-closeable cleanup, use `try/finally`

---

## 6. Immutability `[覆盖 common: 5.4]`

**Reason:** Java requires explicit effort for immutability.

- Use `final` on fields, parameters, and local variables by default
- Use `Collections.unmodifiableList()` or `List.of()`, `Map.of()` for immutable collections
- Use `record` types for immutable data classes
- Avoid setters — prefer builder pattern or constructor initialization

---

## 7. Dependency Injection `[覆盖 common: 5.2]`

**Reason:** Java has a strong DI ecosystem centered on Spring and CDI.

- Prefer constructor injection over field injection — it makes dependencies explicit and testable
- Use `@Autowired` on constructors (Spring) or `@Inject` (CDI/Jakarta)
- Keep the DI container configuration at the composition root
- In tests, inject mocks manually via constructors — avoid starting the full DI container

---

## 8. SQL and Injection Prevention `[覆盖 common: 3.6]`

**Reason:** Java has mature ORM and query builder patterns.

- Use JPA/Hibernate with JPQL or Criteria API for type-safe queries
- Use Spring Data JPA repositories for common CRUD operations
- If raw SQL is necessary, always use `PreparedStatement` with parameterized queries
- Never concatenate strings to build SQL — use named parameters or positional placeholders

---

## Red Flags

| Thought | Reality |
|---------|---------|
| "I'll just catch `Exception`" | Catch specific types. Broad catches hide bugs. |
| "Null is fine as a return value" | Use `Optional<T>` for methods that may not return a result. |
| "I'll add getters and setters for everything" | Use `record` for data classes. Not everything needs mutation. |
| "Field injection is simpler" | Constructor injection is explicit, testable, and makes dependencies visible. |
| "I'll use `finalize()` for cleanup" | It's deprecated and unreliable. Use try-with-resources. |
| "This checked exception is annoying" | It's telling you something. Handle it or wrap it — don't swallow it. |

---

## Iron Laws

1. **Try-with-resources for all `AutoCloseable`.** No manual `close()` in `finally` blocks. The language provides a better mechanism.
2. **No `null` returns from public methods.** Use `Optional<T>` for absent values. `null` is a billion-dollar mistake.
3. **Constructor injection only.** Field injection hides dependencies and breaks testability.
4. **No raw types.** Always parameterize generics. `List` without `<T>` is a compile-time warning and a runtime bug.
5. **`final` by default.** Fields, parameters, local variables — make them `final` unless mutation is required.

---

## Behavioral Shaping

### When Starting a New Java File

1. Set up the package declaration matching the directory structure
2. Use the latest stable Java LTS features (records, sealed classes, pattern matching)
3. Configure `checkstyle` or `spotless` in the build if not already present

### When Adding a New Dependency

1. Check if the JDK already provides the functionality (`java.util`, `java.nio`, `java.net.http`)
2. Use Maven Central for dependency lookup — verify the artifact is actively maintained
3. Add to `pom.xml` or `build.gradle` with a specific version — avoid dynamic versions

### When Reviewing Java Code

1. Check for broad exception catches (`catch (Exception e)`) — they should be specific
2. Verify `Optional` is used correctly (return type only, no `get()` without check)
3. Confirm try-with-resources is used for all `AutoCloseable` resources
4. Look for raw generic types and missing `final` modifiers
