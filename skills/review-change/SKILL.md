---
name: review-change
description: Review a diff, commit range, worktree, or implementation plan for correctness, risk, maintainability, and evidence gaps.
---

# Review Change

Use this mode for code review and merge-readiness checks. A review produces a
single decision and prioritized findings. It does not fix code unless the user
asks for fixes.

## Required Context

- Review scope: commit range, branch diff, worktree diff, files, or supplied
  patch.
- Intended behavior or contract. If none exists, review against the user
  request, repository conventions, and observable behavior.
- Verification evidence already run.

## Decision

Return exactly one:

- `APPROVED`: no blocking findings.
- `NEEDS_CHANGES`: correctness, security, scope, or maintainability issues must
  be fixed.
- `NEEDS_CONTEXT`: the review cannot be fair because scope, diff, behavior, or
  evidence is missing.

## Finding Rules

- Findings first, ordered by severity.
- Each finding needs a concrete file, line, behavior, or evidence reference.
- Do not report style-only issues as blockers unless they create real risk.
- Missing verification is a finding only when it blocks confidence in the
  reviewed scope.
- Do not expand review beyond the supplied scope.

## Report Shape

```text
审查结果：
**决策：** APPROVED / NEEDS_CHANGES / NEEDS_CONTEXT

阻塞问题：
- ...

非阻塞说明：
- ...

验证缺口：
- ...
```

