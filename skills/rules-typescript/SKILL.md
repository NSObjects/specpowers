---
name: rules-typescript
description: 编写、审查或修改 TypeScript code 时使用；提供 TypeScript-specific coding rules，覆盖并扩展 rules-common 的通用规则。
language: typescript
---

# TypeScript Coding Rules（TypeScript 编码规则）

这些规则适用于 TypeScript projects。它们继承 `rules-common` 的全部规则，并在 TypeScript conventions 不同的地方用 `[Overrides common: X.Y]` 标记覆盖条目和原因。

---

## 1. Coding Style（编码风格）

### 1.1 Naming Conventions（命名约定）`[Overrides common: 1.1]`

**Reason:** TypeScript 有成熟 community conventions，其 casing 和 naming 与通用指导不同。

- Interfaces：`PascalCase`，不要用 `I` 前缀（用 `UserService`，不用 `IUserService`）。
- Types 和 Enums：`PascalCase`。
- Constants：真正 compile-time constants 用 `UPPER_SNAKE_CASE`，runtime constants 用 `camelCase`。
- Generics：简单情况用单个大写字母（`T`、`K`、`V`），复杂情况用描述性 `PascalCase`（`TResult`、`TInput`）。
- Files：modules 使用 `kebab-case.ts`，React components 使用 `PascalCase.tsx`。

### 1.2 Function Size（函数规模）`[Overrides common: 1.2]`

**Reason:** TypeScript type annotations 会增加视觉重量，因此调整行数目标。

- 目标约 40 行，包含 type annotations。
- 将复杂 type transformations 提取为命名 type aliases。
- 谨慎使用 overload signatures；可行时优先 union types 或 generics。

### 1.3 File Organization（文件组织）`[Overrides common: 1.3]`

**Reason:** TypeScript 对 exports、type-only files 和 barrel patterns 有特定 conventions。

- Types 和 interfaces 从专用 `types.ts` 导出，或与 implementation co-located。
- 谨慎使用 barrel files（`index.ts`）；它们会造成 bundle bloat 和 circular dependency issues。
- 顺序：type imports → external imports → internal imports → relative imports。
- Type-only imports 使用 `import type { ... }` syntax 分离。

### 1.4 Strict Mode（严格模式）

`tsconfig.json` 中始终启用 `strict: true`，包括 `strictNullChecks`、`noImplicitAny`、`strictFunctionTypes` 等。不要为了修复 type errors 弱化 strict mode；应修复 types。

### 1.5 Formatting（格式化）`[Overrides common: 1.5]`

**Reason:** TypeScript ecosystem 已收敛到特定 formatters。

- 使用 Prettier 作为 primary formatter，ESLint 只用于 logic rules。
- 不要用 ESLint 做 formatting；使用 `eslint-config-prettier` 关闭 formatting rules。
- 优先 single quotes、trailing commas、2-space indentation（Prettier defaults）。

---

## 2. Type System（类型系统）

### 2.1 Prefer Strict Types Over `any`（严格类型优先于 `any`）

除非接入 untyped JavaScript libraries，否则不要使用 `any`；即便接入，也应包进 typed adapter。类型真正未知时用 `unknown`，再通过 type guards narrow。

### 2.2 Use Discriminated Unions for State（状态使用判别联合）

用 discriminated unions 表达 state machines 和 variant types，不用 optional fields：

```typescript
// Good
type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

// Bad
type Result<T> = { ok: boolean; value?: T; error?: Error };
```

### 2.3 Readonly by Default（默认只读）`[Overrides common: 5.4]`

**Reason:** TypeScript 提供 `readonly`、`Readonly<T>` 和 `as const`，应积极使用。

- 不应 mutate 的 function parameters 标记为 `readonly`。
- 表示 snapshots 或 configs 的 object types 使用 `Readonly<T>`。
- Literal tuples 和 object literals 使用 `as const`。
- 不应 mutate 的 arrays 优先使用 `ReadonlyArray<T>` 或 `readonly T[]`。

### 2.4 Avoid Type Assertions（避免类型断言）

优先使用 type guards 和 narrowing，而不是 type assertions（`as`）。Type assertions 会绕过 compiler，是对 TypeScript 说的谎。用 `satisfies` operator 做 validation without widening。

### 2.5 Utility Types（工具类型）

使用 built-in utility types（`Partial`、`Required`、`Pick`、`Omit`、`Record`、`Extract`、`Exclude`），不要手写等价 types。它们经过良好测试，并能表达 intent。

---

## 3. Testing（测试）`[Overrides common: 2.1]`

**Reason:** TypeScript testing 有特定 toolchain considerations。

### 3.1 Test-First with Type Safety（带类型安全的测试先行）

Tests 用 TypeScript 写，不用 JavaScript。Tests 也要 type-check。可使用 `vitest`、带 `ts-jest` 的 `jest`，或带 TypeScript loader 的 `node:test`。

### 3.2 Test Coverage Strategy（测试覆盖策略）`[Overrides common: 2.4]`

**Reason:** TypeScript type system 消除了部分 bug classes，因此 tests 聚焦其他地方。

- Type system 负责：null checks（带 `strictNullChecks`）、type mismatches、missing properties。
- Tests 聚焦：runtime behavior、async flows、error handling、business logic、integration boundaries。
- Data transformation functions 和 parsers 使用 property-based testing（fast-check）。

---

## 4. Error Handling（错误处理）`[Overrides common: 5.6]`

**Reason:** TypeScript 没有 checked exceptions，因此用 type system 表达 error handling。

- Expected errors 优先用 Result types（`{ ok: true; value: T } | { ok: false; error: E }`），而不是 thrown exceptions。
- Exceptions 只用于 truly exceptional、unrecoverable situations。
- Catch 到 `unknown` 时，不要假定它是 `Error`；先 narrow：`if (error instanceof Error)`。
- Switch statements 中使用 `never` type 确保 exhaustive error handling。

---

## 5. Async Patterns（异步模式）

### 5.1 Always Await or Return Promises（始终 await 或 return Promise）

不要创建 floating / unhandled Promise。每个 Promise 必须被 `await`、returned，或用 `.catch()` 显式处理。用 `eslint-plugin-promise` 或 `@typescript-eslint/no-floating-promises` enforcing。

### 5.2 Prefer async/await Over .then() Chains（优先 async/await）

使用 `async/await` 提高 readability。只有确实需要不阻塞地 compose Promises 时，才保留 `.then()`。

### 5.3 Concurrent Operations（并发操作）

Independent parallel operations 使用 `Promise.all()`。需要无论单项是否失败都收集全部结果时，使用 `Promise.allSettled()`。当 operations 有 side effects 且 partial failure 需要 rollback 时，不要使用 `Promise.all()`。

---

## 6. Resource Cleanup（资源清理）`[Overrides common: 4.3]`

**Reason:** TypeScript/Node.js 有特定 resource management patterns。

- 可用时使用 `using` declarations（TC39 Explicit Resource Management）。
- 旧环境中使用 `try/finally` 做 cleanup。
- Streams 始终同时处理 `error` 和 `close` events。
- Cancellable async operations 使用 `AbortController`。

---

## 7. Dependency Injection（依赖注入）`[Overrides common: 5.2]`

**Reason:** TypeScript 支持多种 DI patterns，取舍不同。

- 优先 constructor injection with interfaces，以提升 testability。
- 简单场景使用 factory functions，而不是 DI containers。
- 使用 DI container（tsyringe、inversify）时，container configuration 保持在 composition root。
- Business logic 不要 import concrete implementations；依赖 interfaces。

---

## 8. SQL and Injection Prevention（SQL 和注入防护）`[Overrides common: 3.6]`

**Reason:** TypeScript ecosystem 有超出 parameterized queries 的 type-safe query builders。

- 使用 type-safe query builders（Prisma、Drizzle、Kysely），优先于 raw SQL strings。
- 必须写 raw SQL 时，始终使用 parameterized queries，不要把 user input 放进 template literals。
- Runtime boundaries 使用 `zod` 或 `io-ts` validate external data。

---

## Red Flags（风险信号）

| Thought | Reality |
|---------|---------|
| "I'll just use `any` to make it compile" | 这会隐藏 bug。使用 `unknown` 并 narrow，或修复 types。 |
| "Type assertions are fine here" | 它们绕过 compiler。使用 type guards 或 `satisfies`。 |
| "I don't need `strict: true`" | 需要。Non-strict TypeScript 只是多了步骤的 JavaScript。 |
| "I'll add types later" | Untyped code 会吸引更多 untyped code。现在就 type it。 |
| "This barrel file makes imports cleaner" | 它也会造成 circular deps 和 bundle bloat。直接 import。 |
| "I'll catch the error as `any`" | Catch as `unknown`，用 `instanceof` narrow。`any` 隐藏 bugs。 |
| "Floating promises are fine in fire-and-forget" | 它们会静默吞掉 errors。始终 handle，或显式 `void`。 |
| "Mocking the type system with `as` is faster" | 写起来快，debug 更慢。Compiler 是你的 ally。 |

---

## Iron Laws（铁律）

1. **`strict: true` 不可协商。** 每个 TypeScript project 从 full strict mode 开始。
2. **Production code 不用 `any`。** 使用 `unknown` 并 narrow。`any` 是 type system escape hatch，会破坏 TypeScript 的意义。
3. **No floating Promises。** 每个 Promise 都要 await、return 或显式 handle。Unhandled rejections 会 crash Node.js。
4. **不为方便使用 type assertions。** `as` 只用于少数 interop cases，不用于压制 compiler。
5. **Type-check your tests。** Tests 也是 code。Untyped tests 会漏掉 typed tests 在 compile time 能发现的 bugs。
6. **没有 tracking issue 不用 `@ts-ignore`。** 必须 suppress error 时，用 `@ts-expect-error`，并写 comment 解释原因和 fix link。

---

## Behavioral Shaping（行为塑形）

### When Starting a New TypeScript File（开始新的 TypeScript 文件时）

1. 确认 project 的 `tsconfig.json` 已启用 `strict: true`。
2. Type-only imports 使用 `import type`，避免 runtime overhead。
3. 在 implementation 前定义文件顶部的 types/interfaces。

### When Adding a New Dependency（新增依赖时）

1. 检查是否需要 `@types/{package}`；优先选择 built-in types 的 packages。
2. 如果 project 使用 ESM，验证 package 支持 ESM。
3. Frontend projects 用 `bundlephobia.com` 检查 bundle size impact。

### When Reviewing TypeScript Code（审查 TypeScript 代码时）

1. 检查 `any` usage；每处都应 justified 或 eliminated。
2. 验证 error handling 使用 type narrowing，而不是 assertions。
3. 确认 async code 没有 floating Promises。
4. 确认 variant types 使用 discriminated unions，而不是 optional fields。
