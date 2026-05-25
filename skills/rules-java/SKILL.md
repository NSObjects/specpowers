---
name: rules-java
description: 编写、审查或修改 Java code 时使用；提供 Java-specific coding rules，覆盖并扩展 rules-common 的通用规则。
language: java
---

# Java Coding Rules（Java 编码规则）

这些规则适用于 Java projects。它们继承 `rules-common` 的全部规则，并在 Java conventions 不同的地方用 `[Overrides common: X.Y]` 标记覆盖条目和原因。

---

## 1. Coding Style（编码风格）

### 1.1 Naming Conventions（命名约定）`[Overrides common: 1.1]`

**Reason:** Java 在 Java Language Specification 和 Google Java Style Guide 中已有成熟命名约定。

- Classes 和 interfaces：`PascalCase`（`HttpClient`、`UserService`）。
- Methods 和 variables：`camelCase`。
- Constants：`UPPER_SNAKE_CASE`（`MAX_RETRY_COUNT`）。
- Packages：全小写、reverse domain（`com.example.myapp.service`）。
- Generics：单个大写字母（`T`、`E`、`K`、`V`）或描述性名称（`TResult`）。
- Booleans：methods 使用 `is`、`has`、`should`、`can` 前缀；使用期望 `getX()` 的 frameworks 时，fields 避免这些前缀。

### 1.2 Function Size（函数规模）`[Overrides common: 1.2]`

**Reason:** Java 的 type declarations、checked exceptions 和 annotations 会增加行数。

- 目标约 40 行，包含 annotations 和 exception handling。
- 将复杂 conditionals 提取为命名清楚的 private methods。
- 使用 early returns 降低 nesting，避免深层 `if/else` chains。

### 1.3 File Organization（文件组织）`[Overrides common: 1.3]`

**Reason:** Java 强制一个 public class 对应一个文件，且文件名匹配 class name。

- 每个文件一个 public class，filename 与 class name 精确匹配。
- 顺序：static fields → instance fields → constructors → public methods → private methods。
- Related classes 放在同一个 package，而不是同一个 file。
- 使用 `package-info.java` 编写 package-level documentation。

### 1.4 Formatting（格式化）`[Overrides common: 1.5]`

**Reason:** Java ecosystem 已收敛到特定 formatters。

- 使用 Google Java Format，或配置为 team standards 的 IDE built-in formatter。
- 4-space indentation（Google style）或 4-space with tabs（Eclipse default）二选一并强制执行。
- 在 build pipeline 中使用 `spotless` 或 `checkstyle` 强制 formatting。

---

## 2. Type System and Modern Java（类型系统和现代 Java）

### 2.1 Use Records for Data Classes（数据类使用 records）

对 immutable data carriers 使用 `record`（Java 16+），不要手写 POJO boilerplate。Records 会自动提供 `equals()`、`hashCode()` 和 `toString()`。

### 2.2 Use Sealed Classes for Restricted Hierarchies（受限层级使用 sealed classes）

使用 `sealed` classes/interfaces（Java 17+）定义 closed type hierarchies。结合 `switch` 的 pattern matching 做 exhaustive handling。

### 2.3 Prefer `var` for Local Variables（局部变量优先 `var`）

当右侧表达式让类型明显时，使用 `var`（Java 10+）。如果 `var` 降低 readability，就不要使用。

### 2.4 Use Optional Correctly（正确使用 Optional）

- 可能没有结果的方法返回 `Optional<T>`，不要返回 `null`。
- 不要把 `Optional` 用作 field type、method parameter 或 collection element。
- 使用 `orElseThrow()`、`map()`、`flatMap()`；避免没有 `isPresent()` check 就调用 `get()`。

---

## 3. Error Handling（错误处理）`[Overrides common: 5.6]`

**Reason:** Java 同时使用 checked 和 unchecked exceptions，这是独特的双系统。

- 对 caller 必须处理的 recoverable conditions 使用 checked exceptions。
- 对 programming errors 使用 unchecked exceptions（`RuntimeException` subclasses）。
- 不要宽泛 catch `Exception` 或 `Throwable`；catch specific types。
- 对所有 `AutoCloseable` resources 使用 try-with-resources，不依赖 `finalize()`。
- 创建 rooted in project base exception 的 domain-specific exception hierarchies。

---

## 4. Testing（测试）`[Overrides common: 2.1]`

**Reason:** Java 有成熟 testing ecosystem 和特定 conventions。

### 4.1 Test-First with JUnit 5（使用 JUnit 5 测试先行）

使用 JUnit 5（`@Test`、`@ParameterizedTest`、`@Nested`）。使用 AssertJ 做 fluent assertions。Mockito 只用于 mocking external dependencies。

### 4.2 Test Coverage Strategy（测试覆盖策略）`[Overrides common: 2.4]`

**Reason:** Java type system 会在 compile time 捕捉 type errors，因此 tests 聚焦 behavior。

- 使用 `@ParameterizedTest` 搭配 `@CsvSource` 或 `@MethodSource` 做 table-driven tests。
- 使用 `jqwik` 做 property-based testing。
- 使用 `assertThrows()` 测试 exception paths。
- 使用 `@Nested` classes 按 scenario 组织 tests。

---

## 5. Resource Cleanup（资源清理）`[Overrides common: 4.3]`

**Reason:** Java 的 idiomatic cleanup pattern 是 try-with-resources。

- 对 `AutoCloseable` resources（streams、connections、readers）始终使用 try-with-resources。
- Custom resource types 实现 `AutoCloseable`。
- 不要使用 `finalize()`，它已 deprecated 且不可靠。
- 对 non-closeable cleanup 使用 `try/finally`。

---

## 6. Immutability（不可变性）`[Overrides common: 5.4]`

**Reason:** Java 中的 immutability 需要显式努力。

- Fields、parameters 和 local variables 默认使用 `final`。
- 对 immutable collections 使用 `Collections.unmodifiableList()` 或 `List.of()`、`Map.of()`。
- 对 immutable data classes 使用 `record` types。
- 避免 setters；优先 builder pattern 或 constructor initialization。

---

## 7. Dependency Injection（依赖注入）`[Overrides common: 5.2]`

**Reason:** Java 有以 Spring 和 CDI 为中心的强 DI ecosystem。

- 优先 constructor injection，而不是 field injection；它让 dependencies 显式且可测试。
- Constructors 使用 `@Autowired`（Spring）或 `@Inject`（CDI/Jakarta）。
- DI container configuration 保持在 composition root。
- Tests 中通过 constructors 手动 inject mocks，避免启动完整 DI container。

---

## 8. SQL and Injection Prevention（SQL 和注入防护）`[Overrides common: 3.6]`

**Reason:** Java 有成熟 ORM 和 query builder patterns。

- 使用 JPA/Hibernate 搭配 JPQL 或 Criteria API 做 type-safe queries。
- 常见 CRUD 使用 Spring Data JPA repositories。
- 必须写 raw SQL 时，始终使用带 parameterized queries 的 `PreparedStatement`。
- 不要拼接 strings 构建 SQL；使用 named parameters 或 positional placeholders。

---

## Red Flags（风险信号）

| Thought | Reality |
|---------|---------|
| "I'll just catch `Exception`" | Catch specific types。Broad catches 会隐藏 bugs。 |
| "Null is fine as a return value" | 可能没有结果的方法使用 `Optional<T>`。 |
| "I'll add getters and setters for everything" | Data classes 使用 `record`。不是所有东西都需要 mutation。 |
| "Field injection is simpler" | Constructor injection 显式、可测试，并让 dependencies 可见。 |
| "I'll use `finalize()` for cleanup" | 它已 deprecated 且不可靠。使用 try-with-resources。 |
| "This checked exception is annoying" | 它在告诉你重要信息。Handle it or wrap it，不要 swallow。 |

---

## Iron Laws（铁律）

1. **所有 `AutoCloseable` 使用 try-with-resources。** 不要在 `finally` blocks 中手写 `close()`；语言已经提供更好机制。
2. **Public methods 不返回 `null`。** Absent values 使用 `Optional<T>`。
3. **只使用 constructor injection。** Field injection 隐藏 dependencies 并破坏 testability。
4. **不使用 raw types。** Generics 始终 parameterize。没有 `<T>` 的 `List` 是 compile-time warning 和 runtime bug。
5. **默认 `final`。** Fields、parameters、local variables 除非需要 mutation，否则设为 `final`。

---

## Behavioral Shaping（行为塑形）

### When Starting a New Java File（开始新的 Java 文件时）

1. 设置与 directory structure 匹配的 package declaration。
2. 使用 latest stable Java LTS features（records、sealed classes、pattern matching）。
3. 若尚未配置，在 build 中配置 `checkstyle` 或 `spotless`。

### When Adding a New Dependency（新增依赖时）

1. 检查 JDK 是否已提供功能（`java.util`、`java.nio`、`java.net.http`）。
2. 通过 Maven Central 查找 dependency，并确认 artifact 仍被积极维护。
3. 以具体 version 添加到 `pom.xml` 或 `build.gradle`，避免 dynamic versions。

### When Reviewing Java Code（审查 Java 代码时）

1. 检查 broad exception catches（`catch (Exception e)`），它们应改为 specific。
2. 验证 `Optional` 使用正确：只作为 return type，且没有未经 check 的 `get()`。
3. 确认所有 `AutoCloseable` resources 都使用 try-with-resources。
4. 查找 raw generic types 和缺失的 `final` modifiers。
