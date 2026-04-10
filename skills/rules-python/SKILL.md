---
name: rules-python
description: Use when writing, reviewing, or modifying Python code — provides Python-specific coding rules that override and extend the universal rules from rules-common
language: python
---

# Python Coding Rules

These rules apply to Python projects. They inherit all rules from `rules-common` and override specific entries where Python conventions differ. Overrides are marked with `[Overrides common: X.Y]` and include the reason.

---

## 1. Coding Style

### 1.1 Naming Conventions `[Overrides common: 1.1]`

**Reason:** Python has PEP 8 naming conventions that are deeply embedded in the ecosystem.

- Variables and functions: `snake_case`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Private members: single leading underscore `_private_method`
- Name-mangled members: double leading underscore `__mangled` — use sparingly, only to avoid subclass collisions
- Modules and packages: `snake_case`, short, lowercase
- Booleans: use `is_`, `has_`, `should_`, `can_` prefixes

### 1.2 Function Size `[Overrides common: 1.2]`

**Reason:** Python's significant whitespace and docstrings affect line counts.

- Aim for ~25 lines of logic (excluding docstring and type hints)
- Use early returns to reduce nesting — Python's flat-is-better-than-nested philosophy
- Extract complex comprehensions into named helper functions when they exceed one line of logic

### 1.3 File Organization `[Overrides common: 1.3]`

**Reason:** Python has specific conventions for module structure and `__init__.py`.

- Order: `__future__` imports → stdlib imports → third-party imports → local imports (enforced by `isort`)
- Use `__init__.py` to define the public API of a package — keep it minimal
- One class per file is NOT required — group related classes in a single module
- Use `__all__` to explicitly declare public exports

### 1.4 Formatting `[Overrides common: 1.5]`

**Reason:** Python has converged on specific formatters with strong community adoption.

- Use `black` as the primary formatter — no configuration debates
- Use `isort` for import sorting, configured to be compatible with `black`
- Use `ruff` as a fast alternative that combines formatting and linting
- 4-space indentation (PEP 8 standard, non-negotiable)

---

## 2. Type Hints

### 2.1 Use Type Hints for Public APIs

All public functions, methods, and class attributes must have type hints. Internal helper functions should have type hints when the types are not obvious.

```python
# Good
def fetch_user(user_id: int) -> User | None:
    ...

# Bad
def fetch_user(user_id):
    ...
```

### 2.2 Use Modern Type Syntax

- Use `X | Y` instead of `Union[X, Y]` (Python 3.10+)
- Use `list[int]` instead of `List[int]` (Python 3.9+)
- Use `from __future__ import annotations` for older Python versions
- Use `TypeAlias` for complex type definitions

### 2.3 Runtime Validation at Boundaries

Type hints are not enforced at runtime. Use `pydantic`, `attrs`, or `dataclasses` with validation for data crossing trust boundaries (API inputs, file parsing, config loading).

---

## 3. Testing `[Overrides common: 2.1]`

**Reason:** Python has a rich testing ecosystem with specific conventions.

### 3.1 Test-First with pytest

Use `pytest` as the test runner. Write test functions (not classes) unless you need shared setup. Use fixtures for dependency injection in tests.

### 3.2 Test Coverage Strategy `[Overrides common: 2.4]`

**Reason:** Python's dynamic nature means more runtime bugs — test more aggressively.

- The type checker handles less than in statically typed languages — compensate with more tests
- Test duck typing contracts explicitly — verify objects implement expected protocols
- Use `hypothesis` for property-based testing of data transformations and parsers
- Use `pytest.mark.parametrize` for table-driven tests

---

## 4. Error Handling `[Overrides common: 5.6]`

**Reason:** Python uses exceptions as a primary control flow mechanism (EAFP over LBYL).

- Prefer "Easier to Ask Forgiveness than Permission" (EAFP) — use `try/except` over pre-checking
- Catch specific exceptions, never bare `except:` or `except Exception:`
- Use custom exception classes for domain errors — inherit from a project-level base exception
- Use `raise ... from ...` to preserve exception chains
- Context managers (`with` statement) for resource cleanup — never rely on `__del__`

---

## 5. Resource Cleanup `[Overrides common: 4.3]`

**Reason:** Python has context managers as the idiomatic resource management pattern.

- Always use `with` statements for files, database connections, locks, and network sockets
- Implement `__enter__` / `__exit__` or use `@contextmanager` for custom resource types
- Use `contextlib.ExitStack` for managing multiple resources dynamically
- For async resources, use `async with` and `@asynccontextmanager`

---

## 6. Immutability `[Overrides common: 5.4]`

**Reason:** Python has specific tools for immutability that differ from other languages.

- Use `tuple` instead of `list` for fixed collections
- Use `frozenset` instead of `set` for hashable, immutable sets
- Use `@dataclass(frozen=True)` or `NamedTuple` for immutable data structures
- Use `types.MappingProxyType` for read-only dict views
- Avoid mutable default arguments — use `None` and create inside the function

---

## 7. Composition and Inheritance `[Overrides common: 5.1]`

**Reason:** Python supports multiple inheritance and mixins — use them carefully.

- Prefer composition over inheritance, but Python's mixin pattern is acceptable for cross-cutting concerns
- Use `Protocol` (structural subtyping) instead of ABC when possible — it's more Pythonic
- If using inheritance, keep hierarchies shallow (max 2-3 levels)
- Use `super()` correctly — understand MRO (Method Resolution Order)

---

## 8. Dependency Injection `[Overrides common: 5.2]`

**Reason:** Python's dynamic nature enables simpler DI patterns than other languages.

- Use function parameters and default arguments for simple DI
- Use `Protocol` classes to define interfaces for dependencies
- Avoid heavyweight DI frameworks — Python's simplicity makes them unnecessary in most cases
- Use `pytest` fixtures as the DI mechanism in tests

---

## 9. Algorithm Complexity `[Overrides common: 4.2]`

**Reason:** Python's interpreted nature makes algorithmic choices more impactful.

- Python is ~10-100x slower than compiled languages — algorithm choice matters more
- Use built-in data structures: `dict` and `set` for O(1) lookups, `collections.deque` for O(1) append/pop from both ends
- Use `itertools` and generators for memory-efficient iteration over large datasets
- Profile with `cProfile` or `py-spy` before optimizing — don't guess

---

## 10. Batch Operations `[Overrides common: 4.5]`

**Reason:** Python's per-call overhead makes batching especially important.

- Use list comprehensions and generator expressions over explicit loops when possible
- Use `executemany()` for batch database operations
- Use `asyncio.gather()` for concurrent I/O operations
- Avoid N+1 query patterns — use eager loading or batch fetching

---

## 11. SQL and Injection Prevention `[Overrides common: 3.6]`

**Reason:** Python has specific ORM and query builder patterns.

- Use SQLAlchemy, Django ORM, or Tortoise ORM for database access
- If raw SQL is necessary, always use parameterized queries with `%s` or `:param` placeholders
- Never use f-strings or `.format()` to build SQL queries
- Use `pydantic` to validate and sanitize input before it reaches the database layer

---

## 12. Git Workflow `[Overrides common: 6.5]`

**Reason:** Python has specific generated files and virtual environment patterns.

- Never commit `__pycache__/`, `.pyc` files, or virtual environments (`venv/`, `.venv/`)
- Commit `requirements.txt` or `poetry.lock` / `pdm.lock` for reproducible installs
- Commit `pyproject.toml` — it is the modern standard for Python project configuration
- Use `.gitignore` templates specific to Python (GitHub's `Python.gitignore`)

---

## Red Flags

| Thought | Reality |
|---------|---------|
| "I don't need type hints for this" | Public APIs always need type hints. Your future self and your team need them. |
| "Bare `except:` will catch everything" | It catches `KeyboardInterrupt` and `SystemExit` too. Catch specific exceptions. |
| "Mutable default arguments are fine" | `def f(items=[])` is a classic Python bug. Use `None` and create inside. |
| "I'll just use `global`" | Global mutable state is the root of all evil. Pass it as a parameter. |
| "This comprehension is readable" | If it's more than one line of logic, extract it into a named function. |
| "I don't need a virtual environment" | You do. System Python is not your playground. Always use `venv` or equivalent. |
| "f-strings in SQL are convenient" | They're also SQL injection vectors. Use parameterized queries. |
| "`isinstance` checks everywhere" | Use Protocols and duck typing. Explicit type checks are often a design smell. |

---

## Iron Laws

1. **Virtual environments are mandatory.** Never install project dependencies into system Python. Use `venv`, `poetry`, `pdm`, or `conda`.
2. **Type hints on all public APIs.** No exceptions. Internal helpers get them when types are non-obvious.
3. **No bare `except:`.** Always catch specific exception types. `except Exception:` is acceptable only at top-level error boundaries.
4. **No mutable default arguments.** Use `None` sentinel and create mutable objects inside the function body.
5. **Format with `black` or `ruff`.** No manual formatting debates. The formatter is always right.
6. **No `global` keyword in production code.** Pass state through function parameters or class attributes.

---

## Behavioral Shaping

### When Starting a New Python File

1. Add `from __future__ import annotations` if supporting Python < 3.10
2. Set up imports in the correct order: stdlib → third-party → local
3. Define `__all__` if the module is part of a package's public API

### When Adding a New Dependency

1. Check if the stdlib already provides the functionality (`pathlib`, `dataclasses`, `itertools`, `functools`)
2. Verify the package supports your minimum Python version
3. Add to `pyproject.toml` dependencies, not just `requirements.txt`

### When Reviewing Python Code

1. Check for bare `except:` clauses and mutable default arguments
2. Verify type hints are present on public APIs
3. Confirm context managers are used for resource management
4. Look for N+1 query patterns in database access code
