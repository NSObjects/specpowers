---
name: rules-php
description: Use when writing, reviewing, or modifying PHP code — provides PHP-specific coding rules that override and extend the universal rules from rules-common
language: php
---

# PHP Coding Rules

These rules apply to PHP projects. They inherit all rules from `rules-common` and override specific entries where PHP conventions differ. Overrides are marked with `[Overrides common: X.Y]` and include the reason.

---

## 1. Coding Style

### 1.1 Naming Conventions `[Overrides common: 1.1]`

**Reason:** PHP follows PSR-12 and PSR-1 naming conventions.

- Classes, interfaces, traits, enums: `PascalCase` (`UserService`, `Cacheable`)
- Methods and functions: `camelCase` (`getUserById`, `processPayment`)
- Variables and properties: `camelCase` (`$userName`, `$isActive`)
- Constants: `UPPER_SNAKE_CASE` (`MAX_RETRIES`, `DEFAULT_TIMEOUT`)
- Namespaces: `PascalCase` matching directory structure (`App\Services\UserService`)
- Booleans: use `is`, `has`, `should`, `can` prefixes

### 1.2 Function Size `[Overrides common: 1.2]`

**Reason:** PHP's mixed paradigm (OOP + procedural) and type declarations affect line counts.

- Aim for ~30 lines including type declarations and docblocks
- Use early returns with type checks to reduce nesting
- Extract complex array operations into named helper methods

### 1.3 File Organization `[Overrides common: 1.3]`

**Reason:** PHP uses PSR-4 autoloading with namespace-to-directory mapping.

- One class per file, filename matches class name (`UserService.php`)
- Namespace matches directory structure per PSR-4
- Use `declare(strict_types=1);` at the top of every file
- Order: `declare` → `namespace` → `use` imports → class definition

### 1.4 Formatting `[Overrides common: 1.5]`

**Reason:** PHP has PSR-12 as the community standard and PHP-CS-Fixer as the primary formatter.

- Use PHP-CS-Fixer or PHP_CodeSniffer configured to PSR-12
- 4-space indentation
- Use PHPStan or Psalm for static analysis
- Configure in `composer.json` scripts for easy execution

---

## 2. Type System (Modern PHP)

### 2.1 Strict Types

- Add `declare(strict_types=1);` to every PHP file — no exceptions
- Use type declarations for all function parameters, return types, and properties
- Use union types (`string|int`), intersection types (`Countable&Iterator`), and nullable (`?string`)
- Use `enum` (PHP 8.1+) instead of class constants for fixed value sets

### 2.2 Null Handling

- Use nullable types (`?string`) explicitly — never return `null` without declaring it
- Use null coalescing (`??`) and nullsafe operator (`?->`) for safe access
- Prefer returning empty collections over `null` for list-returning methods

---

## 3. Error Handling `[Overrides common: 5.6]`

**Reason:** PHP has exceptions and a legacy error system — use exceptions consistently.

- Use exceptions for error handling — not PHP's legacy `trigger_error()`
- Catch specific exception types, never bare `catch (\Exception $e)` without re-throwing
- Create domain-specific exception classes extending a project base exception
- Use `finally` blocks for cleanup when try-with-resources is not available
- Set `error_reporting(E_ALL)` in development — never suppress errors with `@`

---

## 4. Testing `[Overrides common: 2.1]`

**Reason:** PHP has PHPUnit as the dominant testing framework.

### 4.1 Test-First with PHPUnit

Use PHPUnit for unit and integration tests. Use `@dataProvider` for table-driven tests. Use Pest PHP for a more expressive syntax if the team prefers it.

### 4.2 Test Coverage Strategy `[Overrides common: 2.4]`

**Reason:** PHP's dynamic nature means more runtime errors — test defensively.

- Test type coercion edge cases (PHP's loose comparisons are a bug factory)
- Use `@dataProvider` for parameterized tests
- Use PHPUnit's `expectException()` for error path testing
- Use `eris/eris` or `phpunit-quickcheck` for property-based testing

---

## 5. Resource Cleanup `[Overrides common: 4.3]`

**Reason:** PHP has no built-in RAII — use try/finally and destructors carefully.

- Use `try/finally` for resource cleanup (database connections, file handles)
- Close database connections explicitly when using long-running processes (workers, daemons)
- Use `register_shutdown_function()` for critical cleanup in CLI scripts
- In Laravel/Symfony, rely on the framework's service container for lifecycle management

---

## 6. SQL and Injection Prevention `[Overrides common: 3.6]`

**Reason:** PHP has a history of SQL injection vulnerabilities — be extra vigilant.

- Use PDO with prepared statements — never concatenate variables into SQL
- Use Eloquent (Laravel) or Doctrine (Symfony) ORM for type-safe database access
- Never use `mysql_*` functions — they are removed in modern PHP
- Validate and sanitize all user input with `filter_var()` or validation libraries

---

## 7. Dependency Injection `[Overrides common: 5.2]`

**Reason:** PHP frameworks (Laravel, Symfony) have mature DI containers.

- Use constructor injection — frameworks auto-resolve dependencies from the container
- Define interfaces for services and bind implementations in the container configuration
- Avoid service locator pattern (`app()->make()`) — it hides dependencies
- In tests, override bindings in the container to inject mocks

---

## Red Flags

| Thought | Reality |
|---------|---------|
| "I don't need `strict_types`" | You do. Without it, PHP silently coerces types and hides bugs. |
| "I'll use `==` for comparison" | Use `===`. Loose comparison (`==`) is PHP's biggest footgun. |
| "I'll suppress this error with `@`" | Never suppress errors. Fix the root cause or handle the exception. |
| "String concatenation in SQL is fine" | It's SQL injection. Use prepared statements. Always. |
| "I'll use `array` for everything" | Use typed collections, DTOs, or value objects. Untyped arrays are bug magnets. |
| "Global state with `$_SESSION` is convenient" | Inject dependencies. Global state makes testing impossible. |

---

## Iron Laws

1. **`declare(strict_types=1)` in every file.** No exceptions. Strict types catch bugs at the boundary.
2. **`===` over `==`.** Loose comparison is the source of countless PHP bugs. Always use strict comparison.
3. **Prepared statements for all SQL.** No string concatenation, no `sprintf` with user input. PDO or ORM only.
4. **Type declarations on all public APIs.** Parameters, return types, properties — type everything.
5. **PHPStan or Psalm at level 6+.** Static analysis catches what PHP's runtime doesn't.

---

## Behavioral Shaping

### When Starting a New PHP File

1. Add `declare(strict_types=1);` as the first statement after `<?php`
2. Set up the namespace matching the PSR-4 autoload configuration
3. Configure PHPStan/Psalm if not already present in the project

### When Adding a New Dependency

1. Check if PHP's standard library or the framework provides the functionality
2. Use Composer for dependency management — verify the package on Packagist
3. Check the package's PHP version requirements and maintenance status

### When Reviewing PHP Code

1. Check for missing `strict_types` declaration
2. Verify `===` is used instead of `==` for comparisons
3. Confirm prepared statements are used for all database queries
4. Look for untyped function signatures and properties
