---
name: rules-python
description: 编写、审查或修改 Python code 时使用；提供 Python-specific coding rules，覆盖并扩展 rules-common 的通用规则。
language: python
---

# Python Coding Rules（Python 编码规则）

这些规则适用于 Python projects。它们继承 `rules-common` 的全部规则，并在 Python conventions 不同的地方用 `[Overrides common: X.Y]` 标记覆盖条目和原因。

---

## 1. Coding Style（编码风格）

### 1.1 Naming Conventions（命名约定）`[Overrides common: 1.1]`

**Reason:** Python 的 PEP 8 naming conventions 已深度嵌入生态。

- Variables 和 functions：`snake_case`。
- Classes：`PascalCase`。
- Constants：`UPPER_SNAKE_CASE`。
- Private members：单前导下划线 `_private_method`。
- Name-mangled members：双前导下划线 `__mangled`，谨慎使用，只用于避免 subclass collisions。
- Modules 和 packages：`snake_case`、短、小写。
- Booleans：使用 `is_`、`has_`、`should_`、`can_` 前缀。

### 1.2 Function Size（函数规模）`[Overrides common: 1.2]`

**Reason:** Python 的 significant whitespace 和 docstrings 会影响行数。

- 目标约 25 行 logic，不含 docstring 和 type hints。
- 用 early returns 降低 nesting，符合 Python flat-is-better-than-nested 的哲学。
- Complex comprehensions 超过一行 logic 时，提取为命名 helper functions。

### 1.3 File Organization（文件组织）`[Overrides common: 1.3]`

**Reason:** Python 对 module structure 和 `__init__.py` 有特定 conventions。

- 顺序：`__future__` imports → stdlib imports → third-party imports → local imports（由 `isort` enforcing）。
- 使用 `__init__.py` 定义 package 的 public API，并保持 minimal。
- 不要求 one class per file；related classes 可放在同一个 module。
- 使用 `__all__` 显式声明 public exports。

### 1.4 Formatting（格式化）`[Overrides common: 1.5]`

**Reason:** Python 社区已收敛到特定 formatters。

- 使用 `black` 作为 primary formatter，避免 configuration debates。
- 使用 `isort` 排序 imports，并配置为兼容 `black`。
- 可使用 `ruff` 作为结合 formatting 和 linting 的快速替代。
- 4-space indentation 是 PEP 8 standard，不可协商。

---

## 2. Type Hints（类型提示）

### 2.1 Use Type Hints for Public APIs（Public API 使用类型提示）

所有 public functions、methods 和 class attributes 必须有 type hints。Internal helper functions 在类型不明显时也应有 type hints。

```python
# Good
def fetch_user(user_id: int) -> User | None:
    ...

# Bad
def fetch_user(user_id):
    ...
```

### 2.2 Use Modern Type Syntax（使用现代类型语法）

- Python 3.10+ 使用 `X | Y`，不用 `Union[X, Y]`。
- Python 3.9+ 使用 `list[int]`，不用 `List[int]`。
- 旧版本 Python 使用 `from __future__ import annotations`。
- 复杂 type definitions 使用 `TypeAlias`。

### 2.3 Runtime Validation at Boundaries（边界做运行时校验）

Type hints 不会在 runtime 强制执行。跨 trust boundaries 的 data（API inputs、file parsing、config loading）使用 `pydantic`、`attrs` 或带 validation 的 `dataclasses`。

---

## 3. Testing（测试）`[Overrides common: 2.1]`

**Reason:** Python 有丰富 testing ecosystem 和特定 conventions。

### 3.1 Test-First with pytest（使用 pytest 测试先行）

使用 `pytest` 作为 test runner。默认写 test functions；只有需要 shared setup 时才使用 classes。Tests 中通过 fixtures 做 dependency injection。

### 3.2 Test Coverage Strategy（测试覆盖策略）`[Overrides common: 2.4]`

**Reason:** Python 的 dynamic nature 会带来更多 runtime bugs，因此 tests 要更积极。

- Type checker 覆盖范围少于 statically typed languages，用更多 tests 补偿。
- 显式测试 duck typing contracts，验证 objects 是否实现 expected protocols。
- 对 data transformations 和 parsers 使用 `hypothesis` 做 property-based testing。
- 使用 `pytest.mark.parametrize` 做 table-driven tests。

---

## 4. Error Handling（错误处理）`[Overrides common: 5.6]`

**Reason:** Python 将 exceptions 作为主要 control flow mechanism（EAFP over LBYL）。

- 优先 "Easier to Ask Forgiveness than Permission"（EAFP）：使用 `try/except`，而不是事前 pre-checking。
- Catch specific exceptions；不要使用 bare `except:` 或 `except Exception:`。
- Domain errors 使用 custom exception classes，并继承 project-level base exception。
- 使用 `raise ... from ...` 保留 exception chains。
- Resource cleanup 使用 context managers（`with` statement），不依赖 `__del__`。

---

## 5. Resource Cleanup（资源清理）`[Overrides common: 4.3]`

**Reason:** Python 的 idiomatic resource management pattern 是 context managers。

- Files、database connections、locks 和 network sockets 始终使用 `with` statements。
- Custom resource types 实现 `__enter__` / `__exit__`，或使用 `@contextmanager`。
- 动态管理多个 resources 时使用 `contextlib.ExitStack`。
- Async resources 使用 `async with` 和 `@asynccontextmanager`。

---

## 6. Immutability（不可变性）`[Overrides common: 5.4]`

**Reason:** Python 有不同于其他语言的 immutability 工具。

- Fixed collections 使用 `tuple`，不用 `list`。
- 需要 hashable immutable sets 时使用 `frozenset`。
- Immutable data structures 使用 `@dataclass(frozen=True)` 或 `NamedTuple`。
- Read-only dict views 使用 `types.MappingProxyType`。
- 避免 mutable default arguments；使用 `None` 并在 function 内创建。

---

## 7. Composition and Inheritance（组合和继承）`[Overrides common: 5.1]`

**Reason:** Python 支持 multiple inheritance 和 mixins，需谨慎使用。

- 优先 composition over inheritance，但 Python 的 mixin pattern 可用于 cross-cutting concerns。
- 尽可能使用 `Protocol`（structural subtyping）替代 ABC，它更 Pythonic。
- 使用 inheritance 时，hierarchies 保持 shallow，最多 2-3 层。
- 正确使用 `super()`，理解 MRO（Method Resolution Order）。

---

## 8. Dependency Injection（依赖注入）`[Overrides common: 5.2]`

**Reason:** Python 的 dynamic nature 支持比其他语言更简单的 DI patterns。

- 简单 DI 使用 function parameters 和 default arguments。
- 使用 `Protocol` classes 定义 dependency interfaces。
- 避免 heavyweight DI frameworks；Python 的简单性让它们在多数场景没必要。
- Tests 中使用 `pytest` fixtures 作为 DI mechanism。

---

## 9. Algorithm Complexity（算法复杂度）`[Overrides common: 4.2]`

**Reason:** Python 是 interpreted language，algorithmic choices 影响更大。

- Python 通常比 compiled languages 慢 10-100 倍，因此 algorithm choice 更重要。
- 使用 built-in data structures：`dict` 和 `set` 做 O(1) lookups，`collections.deque` 做两端 O(1) append/pop。
- 大数据集 memory-efficient iteration 使用 `itertools` 和 generators。
- 优化前用 `cProfile` 或 `py-spy` profile，不要猜。

---

## 10. Batch Operations（批量操作）`[Overrides common: 4.5]`

**Reason:** Python 的 per-call overhead 让 batching 尤其重要。

- 可行时用 list comprehensions 和 generator expressions，而不是 explicit loops。
- Batch database operations 使用 `executemany()`。
- Concurrent I/O operations 使用 `asyncio.gather()`。
- 避免 N+1 query patterns；使用 eager loading 或 batch fetching。

---

## 11. SQL and Injection Prevention（SQL 和注入防护）`[Overrides common: 3.6]`

**Reason:** Python 有特定 ORM 和 query builder patterns。

- Database access 使用 SQLAlchemy、Django ORM 或 Tortoise ORM。
- 必须写 raw SQL 时，始终使用带 `%s` 或 `:param` placeholders 的 parameterized queries。
- 不要用 f-strings 或 `.format()` 构建 SQL queries。
- Input 到达 database layer 前，使用 `pydantic` validate 和 sanitize。

---

## 12. Git Workflow（Git 工作流）`[Overrides common: 6.5]`

**Reason:** Python 有特定 generated files 和 virtual environment patterns。

- 不要 commit `__pycache__/`、`.pyc` files 或 virtual environments（`venv/`、`.venv/`）。
- Commit `requirements.txt` 或 `poetry.lock` / `pdm.lock`，保证 reproducible installs。
- Commit `pyproject.toml`，它是现代 Python project configuration 标准。
- 使用 Python-specific `.gitignore` templates（GitHub 的 `Python.gitignore`）。

---

## Red Flags（风险信号）

| Thought | Reality |
|---------|---------|
| "I don't need type hints for this" | Public APIs 始终需要 type hints。未来的你和团队都需要它们。 |
| "Bare `except:` will catch everything" | 它也会捕获 `KeyboardInterrupt` 和 `SystemExit`。Catch specific exceptions。 |
| "Mutable default arguments are fine" | `def f(items=[])` 是经典 Python bug。使用 `None` 并在内部创建。 |
| "I'll just use `global`" | Global mutable state 是问题根源。通过 parameter 传递。 |
| "This comprehension is readable" | 如果超过一行 logic，提取成命名 function。 |
| "I don't need a virtual environment" | 需要。System Python 不是 playground。始终使用 `venv` 或等价工具。 |
| "f-strings in SQL are convenient" | 它们也是 SQL injection vectors。使用 parameterized queries。 |
| "`isinstance` checks everywhere" | 使用 Protocols 和 duck typing。大量 explicit type checks 往往是 design smell。 |

---

## Iron Laws（铁律）

1. **Virtual environments are mandatory.** 不要把 project dependencies 安装进 system Python。使用 `venv`、`poetry`、`pdm` 或 `conda`。
2. **Public APIs 全部加 type hints。** 没有例外。Internal helpers 在 types 不明显时也要添加。
3. **No bare `except:`。** 始终 catch specific exception types。`except Exception:` 只可用于 top-level error boundaries。
4. **No mutable default arguments。** 使用 `None` sentinel，并在 function body 内创建 mutable objects。
5. **用 `black` 或 `ruff` format。** 不做手动 formatting debates，formatter 始终是标准。
6. **Production code 不使用 `global` keyword。** State 通过 function parameters 或 class attributes 传递。

---

## Behavioral Shaping（行为塑形）

### When Starting a New Python File（开始新的 Python 文件时）

1. 如果支持 Python < 3.10，添加 `from __future__ import annotations`。
2. 按正确顺序组织 imports：stdlib → third-party → local。
3. 如果 module 是 package public API 的一部分，定义 `__all__`。

### When Adding a New Dependency（新增依赖时）

1. 检查 stdlib 是否已提供功能（`pathlib`、`dataclasses`、`itertools`、`functools`）。
2. 验证 package 支持项目 minimum Python version。
3. 添加到 `pyproject.toml` dependencies，不只写入 `requirements.txt`。

### When Reviewing Python Code（审查 Python 代码时）

1. 检查 bare `except:` clauses 和 mutable default arguments。
2. 验证 public APIs 上有 type hints。
3. 确认 resource management 使用 context managers。
4. 查找 database access code 中的 N+1 query patterns。
