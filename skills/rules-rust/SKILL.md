---
name: rules-rust
description: 编写、审查或修改 Rust code 时使用；提供 Rust-specific coding rules，覆盖并扩展 rules-common 的通用规则。
language: rust
---

# Rust Coding Rules（Rust 编码规则）

这些规则适用于 Rust projects。它们继承 `rules-common` 的全部规则，并在 Rust conventions 不同的地方用 `[Overrides common: X.Y]` 标记覆盖条目和原因。

---

## 1. Coding Style（编码风格）

### 1.1 Naming Conventions（命名约定）`[Overrides common: 1.1]`

**Reason:** Rust 有由 `clippy` lints 强化的严格 naming conventions。

- Types、traits、enums：`PascalCase`（`HttpClient`、`Display`、`Option`）。
- Functions、methods、variables、modules：`snake_case`。
- Constants 和 statics：`UPPER_SNAKE_CASE`。
- Lifetimes：短小 lower-case（`'a`、`'b`），复杂情况可描述性命名（`'input`、`'conn`）。
- Crates：`Cargo.toml` 中用 `kebab-case`，import 时用 `snake_case`（`use my_crate::...`）。
- Type parameters：单个大写字母（`T`、`E`、`K`、`V`）或描述性名称（`Item`、`Error`）。
- Conversion methods：`as_`（cheap、borrowed）、`to_`（expensive、owned）、`into_`（consuming）。

### 1.2 Function Size（函数规模）`[Overrides common: 1.2]`

**Reason:** Rust 的 ownership、lifetime annotations 和 pattern matching 会增加视觉重量。

- 目标约 40 行，包含 match arms 和 error handling。
- 将复杂 match arms 提取成命名 helper functions。
- 使用 `?` operator 保持 error propagation 简洁，避免对 `Result` 做 nested `match`。

### 1.3 File Organization（文件组织）`[Overrides common: 1.3]`

**Reason:** Rust 有特定 module system 和 file layout conventions。

- Module tree 映射 directory structure：`mod foo;` 查找 `foo.rs` 或 `foo/mod.rs`。
- Rust 2018+ 优先 `foo.rs`，除非 module 有 submodules。
- Crate-internal visibility 使用 `pub(crate)`，避免所有内容都 `pub`。
- 从 `lib.rs` re-export key types，形成清晰 public API。
- 顺序：顶部 `use` imports，然后 types、implementations，最后 tests。

### 1.4 Formatting（格式化）`[Overrides common: 1.5]`

**Reason:** Rust 有单一 canonical formatter。

- 使用 `rustfmt`，它是唯一 accepted formatter。
- 仅用 `rustfmt.toml` 配置 project-wide settings（如 `edition`、`max_width`）。
- 每次 commit 前运行 `cargo fmt`。
- `rustfmt` 搭配 `cargo clippy`；clippy 捕获 formatting 之外的 idiomatic issues。

---

## 2. Ownership and Borrowing（所有权和借用）

### 2.1 Prefer Borrowing Over Cloning（借用优先于克隆）

传 references（`&T`、`&mut T`），不要随意 clone data。只有真正需要 ownership transfer，或成本可忽略（small types、`Arc`、`Rc`）时才 clone。

### 2.2 Minimize Lifetime Annotations（最小化生命周期标注）

尽可能让 compiler infer lifetimes（lifetime elision rules）。只有 compiler 要求时才添加 explicit annotations。如果一个 function 需要很多 lifetime parameters，考虑重构以减少它们。

### 2.3 Use Smart Pointers Appropriately（适当使用智能指针）

- `Box<T>`：用于 large types 或 recursive structures 的 heap allocation。
- `Rc<T>` / `Arc<T>`：shared ownership（single-threaded / multi-threaded）。
- `RefCell<T>` / `Mutex<T>`：interior mutability（single-threaded / multi-threaded）。
- 避免 `Rc<RefCell<T>>` chains；它们说明设计在对抗 borrow checker，应重构。

---

## 3. Error Handling（错误处理）`[Overrides common: 5.6]`

**Reason:** Rust 使用 `Result<T, E>` 和 `Option<T>` 作为主要 error handling mechanism，没有 exceptions。

### 3.1 Use the Type System for Errors（用类型系统表达错误）

- 可能失败的 operations 返回 `Result<T, E>`；expected errors 不使用 `panic!`。
- 可能缺失的 values 使用 `Option<T>`；不使用 sentinel values（`-1`、`null`）。
- 使用 `?` operator 做 concise error propagation。
- Library crates 定义 custom error enums，并实现 `std::error::Error`。

### 3.2 Error Libraries（错误库）

- Library error types 使用 `thiserror`（derive `Error` trait，structured variants）。
- Application error handling 使用 `anyhow`，适用于 callers 不需要 match error variants 的情况。
- Library crates 不使用 `anyhow`；callers 需要 structured errors 才能处理。

### 3.3 Panic Discipline（Panic 纪律）

- `panic!` 用于 programmer errors（invariant violations、unreachable code）。
- `unwrap()` 和 `expect()` 只在 tests 和 prototypes 中可接受。
- Production code 使用 `unwrap_or()`、`unwrap_or_else()`、`unwrap_or_default()`，或用 `?` propagate。
- 必须使用时，优先 `expect("reason")` 而不是 `unwrap()`；message 记录 invariant。

---

## 4. Testing（测试）`[Overrides common: 2.1]`

**Reason:** Rust 有内置 test framework 和特定 conventions。

### 4.1 Test-First with `#[cfg(test)]`（使用 `#[cfg(test)]` 测试先行）

Unit tests 放在每个 source file 底部的 `#[cfg(test)] mod tests` block 中。Integration tests 放在 `tests/` directory。

### 4.2 Test Coverage Strategy（测试覆盖策略）`[Overrides common: 2.4]`

**Reason:** Rust type system 和 ownership model 消除了许多 bug classes，因此 testing 聚焦 logic。

- Compiler 负责：null safety、data races、use-after-free、type mismatches。
- Tests 聚焦：business logic、state transitions、error handling paths、serialization/deserialization。
- 使用 `proptest` 或 `quickcheck` 做 property-based testing。
- 使用 `#[should_panic]` 验证 panic behavior。
- 使用 `assert_eq!`、`assert_ne!`、`assert!(matches!(...))` 写清晰 assertions。

---

## 5. Immutability（不可变性）`[Overrides common: 5.4]`

**Reason:** Rust variables 默认 immutable，这是核心 language feature。

- Variables 默认 immutable（`let x = 5;`）；只有需要 mutation 时才使用 `mut`。
- 除非 performance 需要，优先返回 new values，而不是原地 mutate。
- Compile-time constants 使用 `const`；global state 使用 `static`，若需 mutability 搭配 `Mutex` 或 `RwLock`。
- Shadowing（`let x = x + 1;`）是 transformation 的 idiomatic 写法，不是 mutation。

---

## 6. Resource Cleanup（资源清理）`[Overrides common: 4.3]`

**Reason:** Rust ownership system 通过 `Drop` 自动 resource cleanup。

- Resources 在离开 scope 时通过 RAII / `Drop` trait 自动 cleanup。
- 管理 external resources（file handles、network connections）的 types 实现 `Drop`。
- Ad-hoc cleanup 可使用 `scopeguard` crate，不必强行写 `Drop` implementation。
- Async resources 使用 `tokio::spawn` 时要有 proper cancellation handling。

---

## 7. Traits and Composition（Traits 和组合）`[Overrides common: 5.1]`

**Reason:** Rust 没有 inheritance；traits 和 composition 是主要 abstraction mechanisms。

- 使用 traits 定义 shared behavior，它们是 Rust 的 interfaces。
- 性能敏感时优先 trait bounds（`fn process<T: Display>(item: T)`），少用 trait objects（`&dyn Display`）。
- 需要 runtime polymorphism 或 heterogeneous collections 时使用 trait objects（`Box<dyn Trait>`）。
- 实现 standard traits：`Debug`、`Clone`、`PartialEq`，可 derive 时优先 derive。
- 大量使用 `#[derive(...)]`，这是 idiomatic 且减少 boilerplate。

---

## 8. Dependency Injection（依赖注入）`[Overrides common: 5.2]`

**Reason:** Rust 使用 generics 和 trait bounds 做 compile-time DI。

- Dependency injection 使用带 trait bounds 的 generic parameters：`fn new<S: Storage>(storage: S) -> Self`。
- Generic parameters 会污染整个 API 时，使用 trait objects（`Box<dyn Trait>`）。
- 不需要 DI frameworks；Rust type system 已足够。
- 在 `main()` 中 wire dependencies，它是 composition root。

---

## 9. Algorithm Complexity（算法复杂度）`[Overrides common: 4.2]`

**Reason:** Rust 的 zero-cost abstractions 和 ownership model 会影响 performance patterns。

- Iterators 是 zero-cost；优先 `.iter().map().filter().collect()`，而不是 manual loops。
- 大多数 collections 使用 `Vec`；O(1) lookups 使用 `HashMap` / `HashSet`。
- 已知 size 时，用 `Vec::with_capacity()` 和 `HashMap::with_capacity()` pre-allocate。
- Function parameters 不需要 ownership 时，使用 `&str` 而不是 `String`。
- 函数有时需要 allocate、有时不需要时，使用 `Cow<'_, str>`。

---

## 10. Concurrency（并发）

### 10.1 Fearless Concurrency（无畏并发）

Rust type system 在 compile time 防止 data races。利用这一点：

- CPU-bound parallelism 使用 `std::thread`。
- I/O-bound concurrency 使用 `tokio` 或 `async-std`。
- Data parallelism 使用 `rayon`（parallel iterators）。
- `Send` 和 `Sync` traits 会自动 derive；如果 type 没有实现，通常有原因。

### 10.2 Shared State（共享状态）

- 跨 threads 的 shared mutable state 使用 `Arc<Mutex<T>>`。
- Reads 远多于 writes 时使用 `RwLock`。
- Message passing 使用 channels（`std::sync::mpsc`、`crossbeam`、`tokio::sync::mpsc`）。
- 可行时，message passing 优于 shared state。

---

## 11. SQL and Injection Prevention（SQL 和注入防护）`[Overrides common: 3.6]`

**Reason:** Rust 有 type-safe database access patterns。

- 使用 `sqlx` 做 compile-time checked SQL queries。
- 使用 `diesel` 做 type-safe ORM with schema DSL。
- 使用 `sea-orm` 做 async ORM。
- 不要用 `format!()` 拼接包含 user input 的 SQL queries。
- 使用带 `$1`、`?` placeholders 的 parameterized queries。

---

## 12. Unsafe Code（Unsafe 代码）

### 12.1 Minimize `unsafe`（最小化 `unsafe`）

- 只有 safe alternative 不可能或 performance cost 不可接受时，才使用 `unsafe`。
- 每个 `unsafe` block 都要有 `// SAFETY:` comment，解释为什么 sound。
- 将 `unsafe` 封装在 safe abstractions 中；callers 不应需要使用 `unsafe`。
- Code review 时对所有 `unsafe` blocks 做额外 scrutiny。

---

## 13. Git Workflow（Git 工作流）`[Overrides common: 6.5]`

**Reason:** Rust 有特定 build artifacts 和 generated files。

- 不要 commit `target/` directory（build artifacts）。
- Binary crates commit `Cargo.lock` 以保证 reproducible builds；library crates 不提交。
- Commit `Cargo.toml`，它定义 project 和 dependencies。
- 使用 Rust-specific `.gitignore` patterns。

---

## Red Flags（风险信号）

| Thought | Reality |
|---------|---------|
| "I'll just `unwrap()` here" | 使用 `?` 或 `expect("reason")`。`unwrap()` 是隐藏 panic。 |
| "I'll clone to satisfy the borrow checker" | Cloning 是临时补丁。应重构 ownership。 |
| "I need `unsafe` for this" | 多半不需要。先检查 crate 是否已有 safe abstraction。 |
| "This `Rc<RefCell<T>>` chain is fine" | 这说明你在和 borrow checker 对抗。重新设计 data flow。 |
| "`anyhow` is fine for my library" | Libraries 需要 structured errors（`thiserror`）。`anyhow` 属于 applications。 |
| "I'll add lifetimes everywhere" | 如果需要很多 lifetimes，design 可能需要重构。简化 ownership。 |
| "I'll use `String` for everything" | Borrow 用 `&str`，maybe-owned 用 `Cow<str>`。`String` 表示 ownership。 |
| "Trait objects are simpler than generics" | 它们有 runtime cost（vtable）。性能重要时使用 generics。 |

---

## Iron Laws（铁律）

1. **Production code 不用 `unwrap()`。** 使用 `?`、`expect("reason")` 或 `unwrap_or_*` variants。每个 `unwrap()` 都可能 panic。
2. **每个 `unsafe` block 都有 `// SAFETY:` comment。** 没有例外；解释不了 soundness，通常就不 sound。
3. **`cargo clippy` clean 通过。** 修复所有 clippy warnings；它们会捕捉真实 bugs 和 non-idiomatic patterns。
4. **每次 commit 前运行 `cargo fmt`。** 不做 manual formatting；`rustfmt` 是标准。
5. **Libraries 用 `thiserror`，applications 用 `anyhow`。** 不要混用；library callers 需要 structured errors。
6. **没有理由不使用 `Rc<RefCell<T>>`。** 如果需要它，记录原因；它通常说明 ownership model 需要重想。

---

## Behavioral Shaping（行为塑形）

### When Starting a New Rust File（开始新的 Rust 文件时）

1. 添加 `#![deny(clippy::all)]`，或在 workspace 的 `clippy.toml` 中配置。
2. 对所有 public types derive standard traits（`Debug`、`Clone`、`PartialEq`）。
3. 将 `#[cfg(test)] mod tests` 放在文件底部。

### When Adding a New Dependency（新增依赖时）

1. 检查 standard library 是否已提供功能（`std::collections`、`std::fs`、`std::io`）。
2. 通过 `crates.io` downloads、last update 和 `lib.rs` documentation 评估。
3. 使用 `cargo add` 添加 dependencies，确保正确更新 `Cargo.toml`。
4. 用 `cargo geiger` 检查 dependency 中的 `unsafe` usage。

### When Reviewing Rust Code（审查 Rust 代码时）

1. 检查 non-test code 中的 `unwrap()` 和 `expect()`；每处都必须 justified。
2. 验证 `unsafe` blocks 有 `// SAFETY:` comments 且最小化。
3. 确认 error types 适当：libs 用 `thiserror`，apps 用 `anyhow`。
4. 查找不必要 clones，并建议 borrowing 或 restructuring ownership。
