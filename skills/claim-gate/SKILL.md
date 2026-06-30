---
name: claim-gate
description: Use before saying work is complete, fixed, passing, approved, ready, or safe to hand off.
---

# Claim Gate

This is the only completion gate. It replaces separate confidence,
verification, quality, and completion gates.

## Gate Questions

Before making a claim, answer:

1. Scope: What exactly did I cover?
2. Evidence: What did I inspect, run, or verify?
3. Gaps: What did I not verify?
4. Drift: Did I make unrelated changes?
5. Risk: What could still be wrong?

## Claim Rules

- If required evidence is missing, do not say complete, fixed, passing,
  approved, or ready.
- If checks failed, say what failed and whether the failure is in scope.
- If validation was impossible, say why.
- If there were destructive changes, name them.
- If no gaps remain for the requested scope, state that directly.

## Output

Use the user's required final format when one exists. Otherwise include:

```text
完成内容：
- ...

验证：
- ...

破坏性变更：
- ...

剩余风险：
- ...
```

