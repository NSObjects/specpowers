---
name: systematic-debugging
description: 遇到 bug、test failure 或 unexpected behavior，且尚未提出修复方案前使用。
---

# Systematic Debugging（系统化调试）

## Overview（概览）

随机修复会浪费时间并制造新 bug。快速补丁会掩盖 underlying issues。

**核心原则：** 尝试 fix 前，始终先找到 root cause。只修 symptom 就是失败。

**违反此流程的字面要求，就是违反 debugging 的精神。**

## The Iron Law（铁律）

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

如果还没完成 Phase 1，就不能提出 fixes。

## Diagnostic Discussion Gate（诊断讨论门槛）

A bug report is not edit authorization。Bug report 不是编辑授权。

当用户报告 bug、error report、test failure、regression、unexpected behavior，或提出 failure-related why-question 时，默认进入 diagnostic discussion mode。除非用户已经 explicitly authorized a direct fix，否则用户请求的是 investigation 和 explanation。

Diagnostic discussion mode 中：

- 先仔细阅读相关代码（Read the relevant code carefully），再下结论。
- 命名 root cause 前，追踪 entry points、call flow、data flow、configuration、tests 和 recent changes。
- 使用 read-only actions，例如 reading files、searching code、running tests、reading logs 和 inspecting read-only git state。
- 不编辑文件（do not edit files）。
- 不生成 patches（do not generate patches）。
- 不 refactor（do not refactor）。
- 不尝试 fixes 或 “just try” changes（do not attempt fixes）。
- Before Phase 4 Implementation，先报告 confirmed facts、suspected root cause、unresolved doubts 和 smallest repair direction。
- 除非用户已经明确授权 direct fix，否则 implementation 前 Ask for user confirmation。
- Fix authorization is not permission to skip specification discipline。Before Phase 4 Implementation，把 repair 绑定到 existing accepted spec、existing observable contract 或 failing test。如果 expected behavior 未指定，或 repair 会改变 user-visible behavior，编辑前创建或确认 minimal bug spec。No new spec artifact is required 的情况仅限 repair 恢复 existing observable contract，且 failing test 或 reproduction 证明该 contract。

如果 evidence 不足，说清楚缺什么，并继续 read-only investigation 或请求所需 context。不要通过修改代码来猜。

## When to Use（使用时机）

任何 technical issue 都使用：

- Test failures
- Production bugs
- Unexpected behavior
- Performance problems
- Build failures
- Integration issues

**尤其在以下情况使用：**

- 有 time pressure，紧急情况容易诱发猜测。
- “Just one quick fix” 看起来很明显。
- 已经尝试过多个 fixes。
- Previous fix 没有效果。
- 你还没有完全理解 issue。

**不要跳过：**

- Issue 看起来简单，简单 bug 也有 root cause。
- 时间很急，系统化比反复试错更快。
- Manager 要求立刻修好；systematic debugging 比 thrashing 更快。

## The Four Phases（四个阶段）

进入下一阶段前，必须完成当前阶段。

### Phase 1: Root Cause Investigation（根因调查）

**尝试任何 fix 前：**

1. **仔细阅读 Error Messages**
   - 不要跳过 errors 或 warnings。
   - 它们常常包含确切 solution。
   - 完整读取 stack traces。
   - 记录 line numbers、file paths、error codes。

2. **稳定复现**
   - 能否 reliable trigger？
   - Exact steps 是什么？
   - 是否每次都发生？
   - 如果 not reproducible，收集更多 data，不要猜。

3. **检查 Recent Changes**
   - 最近什么变化可能导致它？
   - Git diff、recent commits。
   - New dependencies、config changes。
   - Environmental differences。

4. **在 Multi-Component Systems 中收集 Evidence**

   **当 system 有多个 components（CI → build → signing，API → service → database）时：**

   **提出 fixes 前，添加 diagnostic instrumentation：**

   ```text
   For EACH component boundary:
     - Log what data enters component
     - Log what data exits component
     - Verify environment/config propagation
     - Check state at each layer

   Run once to gather evidence showing WHERE it breaks
   THEN analyze evidence to identify failing component
   THEN investigate that specific component
   ```

   **示例（multi-layer system）：**

   ```bash
   # Layer 1: Workflow
   echo "=== Secrets available in workflow: ==="
   echo "IDENTITY: ${IDENTITY:+SET}${IDENTITY:-UNSET}"

   # Layer 2: Build script
   echo "=== Env vars in build script: ==="
   env | grep IDENTITY || echo "IDENTITY not in environment"

   # Layer 3: Signing script
   echo "=== Keychain state: ==="
   security list-keychains
   security find-identity -v

   # Layer 4: Actual signing
   codesign --sign "$IDENTITY" --verbose=4 "$APP"
   ```

   **这会揭示：** 哪一层失败，例如 secrets → workflow ✓，workflow → build ✗。

5. **Trace Data Flow（追踪数据流）**

   **当 error 位于 deep call stack 时：**

   完整 backward tracing technique 见同目录 `root-cause-tracing.md`。

   **快速版本：**
   - Bad value 从哪里来？
   - 谁用 bad value 调用了这里？
   - 持续向上追踪，直到找到 source。
   - Fix at source, not at symptom。

### Phase 2: Pattern Analysis（模式分析）

**Fix 前先找 pattern：**

1. **找 Working Examples**
   - 在同一 codebase 中定位类似 working code。
   - 什么工作方式和 broken 部分类似？

2. **对照 References**
   - 如果在实现某种 pattern，完整阅读 reference implementation。
   - 不要 skim；逐行阅读。
   - 完全理解 pattern 后再应用。

3. **识别 Differences**
   - Working 与 broken 之间有什么不同？
   - 列出每个 difference，不论多小。
   - 不要假设 “that can't matter”。

4. **理解 Dependencies**
   - 它需要哪些 other components？
   - 需要哪些 settings、config、environment？
   - 它依赖哪些 assumptions？

### Phase 3: Hypothesis and Testing（假设和测试）

**使用 scientific method：**

1. **形成单一 Hypothesis**
   - 清楚写出：“I think X is the root cause because Y”。
   - 记录下来。
   - 要具体，不要 vague。

2. **最小化测试**
   - 做最小 change 来验证 hypothesis。
   - 一次只改一个 variable。
   - 不要一次修多个东西。

3. **继续前验证**
   - 有效？进入 Phase 4。
   - 无效？形成 new hypothesis。
   - 不要在失败 fix 上继续叠加更多 fixes。

4. **不知道时**
   - 说 “I don't understand X”。
   - 不要假装知道。
   - 请求帮助。
   - 继续研究。

### Phase 4: Implementation（实现）

**修 root cause，不修 symptom：**

1. **创建 Failing Test Case**
   - 最简单 reproduction。
   - 可行时写 automated test。
   - 没有 framework 时写 one-off test script。
   - Fix 前必须有。
   - 编写 proper failing tests 时使用 `specpowers:test-driven-development` skill。

2. **实现单一 Fix**
   - 处理已识别 root cause。
   - 一次一个 change。
   - 不做 “while I'm here” improvements。
   - 不捆绑 refactoring。

3. **验证 Fix**
   - Test 现在是否通过？
   - 是否没有破坏其他 tests？
   - Issue 是否真的 resolved？

4. **如果 Fix 无效**
   - 停止。
   - 计数：已经尝试了多少 fixes？
   - 如果 < 3：带着新信息回到 Phase 1 重新分析。
   - **如果 ≥ 3：停止并质疑 architecture（见下方 step 5）。**
   - 没有 architectural discussion 前，不尝试 Fix #4。

5. **如果 3+ Fixes Failed：Question Architecture**

   **说明 architectural problem 的 pattern：**
   - 每个 fix 都在不同地方揭示新的 shared state/coupling/problem。
   - Fixes 需要 “massive refactoring” 才能实现。
   - 每个 fix 在别处制造 new symptoms。

   **停止并质疑 fundamentals：**
   - 此 pattern 是否 fundamentally sound？
   - 我们是否只是 “sticking with it through sheer inertia”？
   - 应该 refactor architecture，还是继续修 symptoms？

   **继续尝试更多 fixes 前，先和用户讨论。**

   这不是 failed hypothesis，而是 wrong architecture。

## Red Flags - STOP and Follow Process（风险信号：停止并遵循流程）

如果发现自己在想：

- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "Skip the test, I'll manually verify"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- "Pattern says X but I'll adapt it differently"
- "Here are the main problems: [lists fixes without investigation]"
- 在 tracing data flow 前提出 solutions
- **"One more fix attempt"（已经尝试 2+ 时）**
- **每个 fix 都在不同地方揭示 new problem**

**这些都意味着：停止，回到 Phase 1。**

**如果 3+ fixes failed：** 质疑 architecture（见 Phase 4.5）。

## Signals You're Doing It Wrong（做错的信号）

**注意这些 redirections：**

- "Is that not happening?" — 你未经验证就假设了。
- "Will it show us...?" — 你本该添加 evidence gathering。
- "Stop guessing" — 你还没理解就提出 fixes。
- "Ultrathink this" — 质疑 fundamentals，不只看 symptoms。
- "We're stuck?"（frustrated）— 你的 approach 没有奏效。

**看到这些时：** 停止，回到 Phase 1。

## Common Rationalizations（常见合理化）

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | 简单 issues 也有 root causes。Process 对简单 bugs 也很快。 |
| "Emergency, no time for process" | Systematic debugging 比 guess-and-check thrashing 更快。 |
| "Just try this first, then investigate" | 第一个 fix 会设置 pattern。从一开始就做对。 |
| "I'll write test after confirming fix works" | Untested fixes 不牢靠。Test first 能证明它。 |
| "Multiple fixes at once saves time" | 这样无法 isolate what worked，还会造成 new bugs。 |
| "Reference too long, I'll adapt the pattern" | Partial understanding 会保证产生 bugs。完整阅读。 |
| "I see the problem, let me fix it" | 看到 symptoms 不等于理解 root cause。 |
| "One more fix attempt"（2+ failures 后） | 3+ failures = architectural problem。质疑 pattern，不要继续修。 |

## Quick Reference（快速参考）

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| **1. Root Cause** | Read errors、reproduce、check changes、gather evidence | 理解 WHAT 和 WHY |
| **2. Pattern** | 找 working examples、compare | 识别 differences |
| **3. Hypothesis** | 形成 theory、minimally test | Confirmed 或 new hypothesis |
| **4. Implementation** | 创建 test、fix、verify | Bug resolved，tests pass |

## When Process Reveals "No Root Cause"（当流程显示没有根因）

如果 systematic investigation 发现 issue 确实是 environmental、timing-dependent 或 external：

1. 你已经完成 process。
2. 记录调查过什么。
3. 实现 appropriate handling（retry、timeout、error message）。
4. 添加 monitoring/logging，方便未来 investigation。

**但是：** 95% 的 “no root cause” cases 都是不完整 investigation。

## Supporting Techniques（支持技术）

这些 techniques 属于 systematic debugging，位于本目录：

- **`root-cause-tracing.md`** — 沿 call stack 反向追踪 bug，找到 original trigger。
- **`defense-in-depth.md`** — 找到 root cause 后，在多层添加 validation。
- **`condition-based-waiting.md`** — 用 condition polling 替代 arbitrary timeouts。

**Related skills:**

- **specpowers:test-driven-development** — 创建 failing test case（Phase 4, Step 1）。
- **specpowers:verification-before-completion** — 声称成功前验证 fix 确实有效。

## Real-World Impact（真实影响）

来自 debugging sessions：

- Systematic approach：15-30 分钟修复。
- Random fixes approach：2-3 小时反复试错。
- First-time fix rate：95% vs 40%。
- New bugs introduced：接近零 vs 常见。
