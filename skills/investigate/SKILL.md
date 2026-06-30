---
name: investigate
description: Read-only investigation for unclear requests, bug reports, failures, architecture questions, or project health checks.
---

# Investigate

Use this mode to learn before changing anything. Investigation ends with a
diagnosis, options, or a recommendation. It does not mutate project files.

## Interface

Input:
- User question or symptom.
- Relevant repository state, logs, commands, or examples.

Output:
- What is known.
- What was checked.
- Most likely cause or design issue.
- Evidence.
- What remains unknown.
- Recommended next action.

## Rules

- Start from first-party evidence: files, docs, commands, logs, diffs, and
  current runtime state.
- Do not treat general tests as the only evidence for real runtime failures.
- Separate confirmed facts from assumptions.
- If a fix is needed, stop at the fix boundary unless the user has authorized
  edits.
- If the investigation reveals a behavior change, hand off to `define-change`
  before editing.

## Report Shape

```text
结论：
- ...

证据：
- ...

建议：
- ...

未确认：
- ...
```

