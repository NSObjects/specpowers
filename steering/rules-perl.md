<!-- generated from skills/ by sync-steering.js -->
---
name: rules-perl
description: Use when writing, reviewing, or modifying Perl code — provides Perl-specific coding rules that override and extend the universal rules from rules-common
language: perl
---

# Perl Coding Rules

These rules apply to Perl projects. They inherit all rules from `rules-common` and override specific entries where Perl conventions differ. Overrides are marked with `[Overrides common: X.Y]` and include the reason.

---

## 1. Coding Style

### 1.1 Naming Conventions `[Overrides common: 1.1]`

**Reason:** Perl has community conventions from `perlstyle` and Perl Best Practices.

- Variables and subroutines: `snake_case` (`$user_name`, `get_user_by_id`)
- Packages/modules: `PascalCase` with `::` separator (`My::App::UserService`)
- Constants: `UPPER_SNAKE_CASE`, defined with `use constant` or `Readonly`
- Private subroutines: prefix with underscore (`_validate_input`)
- Filehandle variables: uppercase (`STDIN`, `STDOUT`) or lexical (`my $fh`)
- Sigils indicate type: `$scalar`, `@array`, `%hash`, `&subroutine`

### 1.2 Function Size `[Overrides common: 1.2]`

**Reason:** Perl's concise syntax (regex, one-liners) can pack a lot into few lines — prioritize readability.

- Aim for ~30 lines — Perl's expressiveness should keep subroutines short
- Avoid complex one-liners in production code — readability beats cleverness
- Extract complex regex operations into named subroutines with comments explaining the pattern

### 1.3 File Organization `[Overrides common: 1.3]`

**Reason:** Perl modules use `package` declarations and `.pm` file extension.

- One package per `.pm` file, filename matches package path (`My/App/UserService.pm`)
- Use `lib/` directory for project modules
- End every module with `1;` (true return value)
- Order: `use strict` → `use warnings` → `use` imports → package declaration → subroutines

### 1.4 Formatting `[Overrides common: 1.5]`

**Reason:** Perl has `perltidy` as the standard formatter.

- Use `perltidy` with a `.perltidyrc` configuration file
- Use `perlcritic` for static analysis (Perl Best Practices enforcement)
- 4-space indentation
- Configure `perlcritic` severity level in `.perlcriticrc`

---

## 2. Strictness and Safety

### 2.1 Always Use Strict and Warnings

- Every Perl file must begin with `use strict;` and `use warnings;`
- Use `use warnings FATAL => 'all';` in new code for stricter enforcement
- Consider `use Moose;` or `use Moo;` which imply `strict` and `warnings`

### 2.2 Modern Perl Features

- Use `say` instead of `print` with `\n` (`use feature 'say';`)
- Use `//` (defined-or) operator for default values
- Use `try/catch` from `Syntax::Keyword::Try` or `Feature::Compat::Try` (Perl 5.40+)
- Use `Scalar::Util`, `List::Util`, `List::MoreUtils` for common operations

---

## 3. Error Handling `[Overrides common: 5.6]`

**Reason:** Perl uses `die`/`eval` for exception handling and return values for error codes.

- Use `die` with exception objects (not strings) for structured error handling
- Use `eval { ... }; if ($@) { ... }` for catching exceptions, or modern `try/catch`
- Use `Carp` module (`croak`, `confess`) for errors that report from the caller's perspective
- Check return values of system calls — `open(...) or die "..."` is idiomatic
- Use `autodie` pragma to automatically die on failed builtins

---

## 4. Testing `[Overrides common: 2.1]`

**Reason:** Perl has a mature testing ecosystem built on TAP (Test Anything Protocol).

### 4.1 Test-First with Test::More

Use `Test::More` for unit tests. Use `Test::Deep` for complex data structure comparisons. Use `prove` as the test runner.

### 4.2 Test Coverage Strategy `[Overrides common: 2.4]`

**Reason:** Perl's dynamic nature requires thorough testing — the language won't catch type errors.

- Use `Test::More` (`is`, `ok`, `is_deeply`, `like`) for assertions
- Use `Test::Exception` for testing `die`/`croak` behavior
- Use `Test::MockModule` or `Test::MockObject` for mocking
- Use `Devel::Cover` for coverage analysis
- Place tests in `t/` directory with `.t` extension

---

## 5. Resource Cleanup `[Overrides common: 4.3]`

**Reason:** Perl uses lexical scoping and reference counting for resource management.

- Use lexical filehandles (`open my $fh, ...`) — they auto-close when out of scope
- Use `eval { ... }` with cleanup in the outer scope for exception-safe resource management
- Use `File::Temp` for temporary files — they clean up automatically
- Close database handles explicitly in long-running processes

---

## 6. SQL and Injection Prevention `[Overrides common: 3.6]`

**Reason:** Perl's DBI module has strong parameterized query support.

- Use DBI with placeholders (`$dbh->prepare("SELECT * FROM users WHERE id = ?")`)
- Never interpolate variables into SQL strings
- Use DBIx::Class or Rose::DB::Object for ORM-style database access
- Enable `RaiseError` and `AutoCommit` on DBI connections

---

## 7. Immutability `[Overrides common: 5.4]`

**Reason:** Perl variables are mutable by default — use modules to enforce immutability.

- Use `Readonly` module for immutable variables (`Readonly my $MAX => 100;`)
- Use `use constant` for simple compile-time constants
- Use `Moo`/`Moose` with `is => 'ro'` for read-only object attributes
- Avoid modifying `@_` directly — copy arguments into lexical variables first

---

## Red Flags

| Thought | Reality |
|---------|---------|
| "I don't need `use strict`" | You do. Without it, typos become silent bugs via auto-vivification. |
| "This regex is self-explanatory" | Use `/x` flag and comments for any regex longer than 20 characters. |
| "I'll interpolate this into the SQL" | Use DBI placeholders. String interpolation in SQL is injection. |
| "Global variables are convenient" | Use lexical variables and pass data through parameters. |
| "This one-liner is elegant" | If it takes more than 5 seconds to understand, expand it. |
| "I'll skip `use warnings`" | Warnings catch real bugs. Enable them. Always. |

---

## Iron Laws

1. **`use strict; use warnings;` in every file.** No exceptions. These catch entire categories of bugs.
2. **DBI placeholders for all SQL.** No string interpolation in queries. Ever.
3. **`perltidy` and `perlcritic` in CI.** Automated formatting and best-practice enforcement.
4. **Lexical filehandles only.** `open my $fh, ...` — never bareword filehandles.
5. **No complex one-liners in production.** Readability beats cleverness. Expand and comment.

---

## Behavioral Shaping

### When Starting a New Perl File

1. Begin with `use strict;` and `use warnings;`
2. Use `use feature 'say', 'state', 'signatures';` for modern Perl features
3. Set up `perltidy` and `perlcritic` configuration if not already present

### When Adding a New Dependency

1. Check if core Perl modules provide the functionality (`File::Path`, `JSON::PP`, `HTTP::Tiny`)
2. Use CPAN or cpanminus (`cpanm`) for dependency installation
3. Track dependencies in `cpanfile` or `Makefile.PL` / `dist.ini`

### When Reviewing Perl Code

1. Check for missing `use strict` and `use warnings`
2. Verify DBI placeholders are used for all database queries
3. Confirm complex regexes use `/x` flag with comments
4. Look for bareword filehandles and global variables
