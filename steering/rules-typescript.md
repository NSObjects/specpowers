<!-- generated from skills/ by sync-steering.js -->
---
name: rules-typescript
description: Use when writing, reviewing, or modifying TypeScript code — provides TypeScript-specific coding rules that override and extend the universal rules from rules-common
language: typescript
---

# TypeScript Coding Rules

These rules apply to TypeScript projects. They inherit all rules from `rules-common` and override specific entries where TypeScript conventions differ. Overrides are marked with `[Overrides common: X.Y]` and include the reason.

---

## 1. Coding Style

### 1.1 Naming Conventions `[Overrides common: 1.1]`

**Reason:** TypeScript has established community conventions for casing and naming that differ from generic guidance.

- Interfaces: `PascalCase`, do NOT prefix with `I` (use `UserService`, not `IUserService`)
- Types and Enums: `PascalCase`
- Constants: `UPPER_SNAKE_CASE` for true compile-time constants, `camelCase` for runtime constants
- Generics: single uppercase letter for simple cases (`T`, `K`, `V`), descriptive `PascalCase` for complex ones (`TResult`, `TInput`)
- Files: `kebab-case.ts` for modules, `PascalCase.tsx` for React components

### 1.2 Function Size `[Overrides common: 1.2]`

**Reason:** TypeScript's type annotations add visual weight — adjust line targets accordingly.

- Aim for ~40 lines including type annotations
- Extract complex type transformations into named type aliases
- Use overload signatures sparingly — prefer union types or generics when possible

### 1.3 File Organization `[Overrides common: 1.3]`

**Reason:** TypeScript has specific conventions for exports, type-only files, and barrel patterns.

- Export types and interfaces from dedicated `types.ts` or co-located with their implementation
- Use barrel files (`index.ts`) sparingly — they cause bundle bloat and circular dependency issues
- Order: type imports → external imports → internal imports → relative imports
- Separate type-only imports with `import type { ... }` syntax

### 1.4 Strict Mode

Always enable `strict: true` in `tsconfig.json`. This includes `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, and more. Never weaken strict mode to fix type errors — fix the types instead.

### 1.5 Formatting `[Overrides common: 1.5]`

**Reason:** TypeScript ecosystem has converged on specific formatters.

- Use Prettier as the primary formatter, with ESLint for logic rules only
- Do not use ESLint for formatting — use `eslint-config-prettier` to disable formatting rules
- Prefer single quotes, trailing commas, 2-space indentation (Prettier defaults)

---

## 2. Type System

### 2.1 Prefer Strict Types Over `any`

Never use `any` unless interfacing with untyped JavaScript libraries — and even then, wrap it in a typed adapter. Use `unknown` when the type is genuinely unknown, then narrow with type guards.

### 2.2 Use Discriminated Unions for State

Model state machines and variant types with discriminated unions, not optional fields:

```typescript
// Good
type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

// Bad
type Result<T> = { ok: boolean; value?: T; error?: Error };
```

### 2.3 Readonly by Default `[Overrides common: 5.4]`

**Reason:** TypeScript provides `readonly`, `Readonly<T>`, and `as const` — use them aggressively.

- Mark function parameters as `readonly` when they should not be mutated
- Use `Readonly<T>` for object types that represent snapshots or configs
- Use `as const` for literal tuples and object literals
- Prefer `ReadonlyArray<T>` or `readonly T[]` for arrays that should not be mutated

### 2.4 Avoid Type Assertions

Prefer type guards and narrowing over type assertions (`as`). Type assertions bypass the compiler — they are lies you tell TypeScript. Use `satisfies` operator for validation without widening.

### 2.5 Utility Types

Leverage built-in utility types (`Partial`, `Required`, `Pick`, `Omit`, `Record`, `Extract`, `Exclude`) instead of manually constructing types. They are well-tested and communicate intent.

---

## 3. Testing `[Overrides common: 2.1]`

**Reason:** TypeScript testing has specific toolchain considerations.

### 3.1 Test-First with Type Safety

Write tests in TypeScript, not JavaScript. Type-check your tests — they are code too. Use `vitest`, `jest` with `ts-jest`, or `node:test` with a TypeScript loader.

### 3.2 Test Coverage Strategy `[Overrides common: 2.4]`

**Reason:** TypeScript's type system eliminates certain classes of bugs — focus testing elsewhere.

- The type system handles: null checks (with `strictNullChecks`), type mismatches, missing properties
- Focus tests on: runtime behavior, async flows, error handling, business logic, integration boundaries
- Use property-based testing (fast-check) for data transformation functions and parsers

---

## 4. Error Handling `[Overrides common: 5.6]`

**Reason:** TypeScript lacks checked exceptions — use the type system for error handling.

- Prefer Result types (`{ ok: true; value: T } | { ok: false; error: E }`) over thrown exceptions for expected errors
- Use exceptions only for truly exceptional, unrecoverable situations
- Never catch `unknown` and assume it's an `Error` — narrow first: `if (error instanceof Error)`
- Use `never` type to ensure exhaustive error handling in switch statements

---

## 5. Async Patterns

### 5.1 Always Await or Return Promises

Never create a floating (unhandled) Promise. Every Promise must be `await`ed, returned, or explicitly handled with `.catch()`. Use `eslint-plugin-promise` or `@typescript-eslint/no-floating-promises` to enforce this.

### 5.2 Prefer async/await Over .then() Chains

Use `async/await` for readability. Reserve `.then()` for cases where you genuinely need to compose Promises without blocking.

### 5.3 Concurrent Operations

Use `Promise.all()` for independent parallel operations. Use `Promise.allSettled()` when you need results from all operations regardless of individual failures. Never use `Promise.all()` when operations have side effects that need rollback on partial failure.

---

## 6. Resource Cleanup `[Overrides common: 4.3]`

**Reason:** TypeScript/Node.js has specific patterns for resource management.

- Use `using` declarations (TC39 Explicit Resource Management) when available
- Use `try/finally` for cleanup in older environments
- For streams, always handle both `error` and `close` events
- Use `AbortController` for cancellable async operations

---

## 7. Dependency Injection `[Overrides common: 5.2]`

**Reason:** TypeScript supports multiple DI patterns with varying trade-offs.

- Prefer constructor injection with interfaces for testability
- Use factory functions over DI containers for simple cases
- If using a DI container (tsyringe, inversify), keep the container configuration at the composition root
- Never import concrete implementations in business logic — depend on interfaces

---

## 8. SQL and Injection Prevention `[Overrides common: 3.6]`

**Reason:** TypeScript ecosystem has type-safe query builders that go beyond parameterized queries.

- Use type-safe query builders (Prisma, Drizzle, Kysely) over raw SQL strings
- If raw SQL is necessary, always use parameterized queries — never template literals with user input
- Use `zod` or `io-ts` to validate external data at runtime boundaries

---

## Red Flags

| Thought | Reality |
|---------|---------|
| "I'll just use `any` to make it compile" | You're hiding a bug. Use `unknown` and narrow, or fix the types. |
| "Type assertions are fine here" | They bypass the compiler. Use type guards or `satisfies` instead. |
| "I don't need `strict: true`" | You need it. Non-strict TypeScript is JavaScript with extra steps. |
| "I'll add types later" | Untyped code attracts more untyped code. Type it now. |
| "This barrel file makes imports cleaner" | It also causes circular deps and bundle bloat. Import directly. |
| "I'll catch the error as `any`" | Catch as `unknown`, narrow with `instanceof`. `any` hides bugs. |
| "Floating promises are fine in fire-and-forget" | They swallow errors silently. Always handle or explicitly void them. |
| "Mocking the type system with `as` is faster" | Faster to write, slower to debug. The compiler is your ally. |

---

## Iron Laws

1. **`strict: true` is non-negotiable.** Every TypeScript project starts with full strict mode. No exceptions.
2. **No `any` in production code.** Use `unknown` and narrow. `any` is a type system escape hatch that defeats the purpose of TypeScript.
3. **No floating Promises.** Every Promise is awaited, returned, or explicitly handled. Unhandled rejections crash Node.js.
4. **No type assertions for convenience.** `as` is for rare interop cases, not for silencing the compiler.
5. **Type-check your tests.** Tests are code. Untyped tests miss bugs that typed tests catch at compile time.
6. **No `@ts-ignore` without a tracking issue.** If you must suppress an error, use `@ts-expect-error` with a comment explaining why and a link to the fix.

---

## Behavioral Shaping

### When Starting a New TypeScript File

1. Ensure `strict: true` is enabled in the project's `tsconfig.json`
2. Use `import type` for type-only imports to avoid runtime overhead
3. Define types/interfaces at the top of the file, before implementation

### When Adding a New Dependency

1. Check if `@types/{package}` is needed — prefer packages with built-in types
2. Verify the package supports ESM if the project uses ESM
3. Check bundle size impact with `bundlephobia.com` for frontend projects

### When Reviewing TypeScript Code

1. Check for `any` usage — each instance should be justified or eliminated
2. Verify error handling uses type narrowing, not assertions
3. Confirm async code has no floating Promises
4. Ensure discriminated unions are used for variant types instead of optional fields
