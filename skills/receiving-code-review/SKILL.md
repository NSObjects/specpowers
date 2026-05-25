---
name: receiving-code-review
description: 回复或实现 code review feedback 前使用。澄清歧义，对照真实代码库验证 claims，在反馈错误或不必要时 push back，并避免表演式赞同。
---

# 接收代码审查（Code Review Reception）

当需要处理 code review feedback，并决定是回复、澄清、push back 还是实现时，使用此 skill。

## 核心规则（Core Rule）

Code review feedback 是需要评估的技术 claim，不是必须服从的命令。

先理解它。再对照当前代码库验证。然后回复或实现。

## Feedback Input Boundary（反馈输入边界）

评估 review feedback 前，先确保真实 comments 已经可用。

- 如果用户粘贴了 review comments，直接使用这些 comments。
- 如果用户提供了 review link、merge request ID、pull request ID 或等价 review identifier，先用配置好的 review source 拉取 comments，再评估。
- 如果用户没有粘贴 comments 或 identifier，先使用当前 repository context 和配置好的 review source 尝试找到 active review，再请用户提供 comments。
- 如果配置好的 review source 不可用、缺少权限，或无法为该 review system 拉取 comments，向用户请求继续所需的 missing comments、link、review identifier、platform 或 permissions。
- 不要发明、推断或模拟 review comments。缺失 review input 是 blocker，不是猜测许可。

## Review Comment Acquisition（获取 Review Comments）

当 review comments 尚未粘贴到对话中时，把获取动作视为 source lookup，而不是固定脚本。优先顺序：

- 从最具体信号开始：pasted comments、review link、merge request ID、pull request ID、repository remote 或用户提供的 platform context。
- 当只有当前 repository context 可用时，使用 active branch、upstream branch（如存在）、repository remote 和既有 platform context，先发现关联 pull request 或 merge request，再请求粘贴 comments。
- 当 review source 有 native repository 或 code-host integration 时，用它收集 pull request 或 merge request review comments、conversation comments 和 inline threads。
- 否则使用该 host 的 configured MCP 或 platform integration 收集同一组 review comments。
- 收集所选 integration 可访问的 review-level comments 以及 inline/threaded discussions。平台暴露 pagination 时要跟随分页。
- 只有在 repository-context discovery 无法识别 review、可用 review source 无法拉取 comments，或缺少必需 source、tool、permission 或 identifier 后，才询问用户。
- 如果缺少 source、tool、permission 或 identifier，只询问缺失项并等待。不要带着猜测反馈继续。

## Default Workflow（默认工作流）

对每个 review item：

1. **Read** — 反应前读取所有 feedback。
2. **Parse** — 把 comment 解析成具体 technical requirement。
3. **Clarify** — 实现前澄清不清楚的 requirements。
4. **Verify** — 对照 code、tests、platform/version constraints 和 prior decisions 验证 claim。
5. **Classify** — 对 item 分类：
   - `valid` → 实现最小正确 fix 并测试。
   - `unclear` → 提出具体澄清问题。
   - `wrong/harmful` → 用证据 push back。
   - `unnecessary` → 提出 YAGNI question。
   - `architectural/product` → 改变方向前让用户参与决策。
6. **Report** — 报告改了什么、在哪里改、如何验证。

```text
FOR each review item:
  requirement = concrete technical requirement

  IF requirement is unclear:
    ask for clarification before implementation
  ELSE:
    verify against current codebase and tests

    IF suggestion is wrong, harmful, or breaks behavior:
      push back with evidence
    ELSE IF suggestion adds unused/speculative behavior:
      raise YAGNI
    ELSE IF suggestion conflicts with user decisions:
      ask the user before proceeding
    ELSE:
      implement smallest correct change
      run relevant verification
```

## 审查解决循环（Review Resolution Loop）

当处理的 feedback 会在 `specpowers:confidence-loop` Review Confidence Loop 下送回 re-review 时，使用此 loop。

对每个 review item，产出 Resolution Package entry：

- `valid` / `fixed` — 已对照 codebase 验证，用最小正确变更修复，并由相关 verification 覆盖。
- `wrong/harmful` / `rejected` — 被 code、tests、specs、platform constraints 或 prior user decisions 反驳；包含证据。
- `out_of_scope` — 真实顾虑，但在请求的 review scope 外，或被 accepted boundary 明确排除。
- `needs_user_decision` — 只有用户能做的 product、boundary、permission、failure-mode 或 success-criteria decision。

修复后，带 updated diff、prior findings、unresolved confidence gaps、verification evidence 和 Resolution Package 请求 re-review。当 Critical 或 Important issues 或 approval-blocking gaps 仍存在时，不要声称 approval。

## 按来源处理（Source-Specific Handling）

### 来自用户的反馈

- 理解 requirement 后，把它视为可信方向。
- 只有当 scope、behavior 或 intent 不清楚时才提问。
- 不要赞美、奉承或表演式赞同。
- 如果请求和 codebase facts 冲突，改代码前说明技术风险。

### 来自外部 Reviewer 的反馈

实现前检查：

- 这个 claim 在**当前** codebase 中是否为真？
- 该变更是否会破坏 behavior、tests、API contracts 或 compatibility？
- 当前实现是否有理由：legacy support、migration state、platform constraint、performance 或 prior decision？
- 建议是否适用于 required platforms、versions 和 environments？
- Reviewer 是否拥有完整 context？
- 它是否和用户的 architectural 或 product decisions 冲突？

外部反馈应被谨慎怀疑，但认真检查。

## 歧义规则（Ambiguity Rule）

如果任何不清楚的 item 可能影响 implementation order 或 shared code paths，改代码前停止并请求澄清。

```text
User: "Fix items 1-6."
Known: 1, 2, 3, and 6 are clear. 4 and 5 are unclear.

Wrong: implement 1, 2, 3, and 6 first, then ask about 4 and 5.
Right: "I understand 1, 2, 3, and 6. I need clarification on 4 and 5 before implementing because the fixes may interact."
```

当 feedback 使用 “properly”、“clean up” 或 “handle edge cases” 等含糊词，而没有说明 expected behavior 时，请求澄清。

## YAGNI 检查（YAGNI Check）

当 reviewer 要求更宽泛或更“professional”的实现时：

1. 搜索 codebase 中的实际 usage。
2. 如果未使用，询问是移除、延后，还是有意保留。
3. 如果已使用，只实现当前 callers 所需 behavior。

```text
Reviewer: "Implement proper metrics tracking with DB storage, date filters, and CSV export."
Response: "This endpoint has no callers in the codebase. Should we remove it as unused, or is there external usage I should account for?"
```

不要因为 review comment 听起来高级，就构建 speculative infrastructure。

## 回复风格（Response Style）

避免表演式赞同和感谢。直接说明技术动作。

Forbidden:

- “You’re absolutely right!”
- “Great point!”
- “Excellent feedback!”
- “Thanks for catching that!”
- 未验证前说 “Let me implement that now”。

Preferred:

- “Requirement: `<specific requirement>`. I’ll verify it against `<file/test/behavior>`.”
- “Fixed `<specific issue>` in `<location>`. Verified with `<test/build/lint>`.”
- “I can’t verify `<claim>` without `<missing information>`. Need `<clarification/source>`.”
- “This conflicts with `<test/current behavior/user decision>`. Recommended alternative: `<alternative>`.”

## 实现顺序（Implementation Order）

歧义解决后，按此顺序实现：

1. 阻塞 correctness、security、build 或 crash 的问题。
2. 简单机械 fixes：typos、imports、formatting、naming。
3. Logic changes。
4. Refactors。
5. Optional enhancements。

每个 change：编辑、运行相关 verification、检查 regressions，然后继续。

## Pushback 规则

当建议存在以下情况时 push back：

- 破坏 functionality、tests、compatibility 或 API contracts。
- 依赖对 stack 或 codebase 的错误假设。
- 添加 unused behavior 或违反 YAGNI。
- 忽略 legacy、migration 或 platform constraints。
- 与用户 decisions 冲突。
- 需要 product 或 architecture decision，而不仅是 code change。

好的 pushback 会引用 files、tests、current behavior、platform constraints 或 user decisions。它应说明后果，并在可用时提供更安全替代方案。

如果你发现自己在回避必要 pushback，停止并用证据直接说明技术顾虑。不要使用 catchphrases 或无关旁白。

## 纠正方向（Correcting Course）

如果你 push back 后发现反馈其实正确，事实性纠正自己，然后继续。

```text
Verified against `auth_test.go`; the feedback is correct. My initial read missed the refresh-token path. Implemented the fix and added coverage for that branch.
```

避免长篇道歉或防御性解释。

## 行内审查回复（Inline Review Replies）

回复 inline review comments 时，优先使用 review system 现有 thread 或 conversation。除非用户要求 top-level summary comment，或平台没有 threaded reply mechanism，否则避免顶层 summary comments。

## 最终检查清单（Final Checklist）

在说工作完成前，确认：

- 每个 feedback item 都已解析成具体 requirement。
- Ambiguous items 在 implementation 前已澄清。
- External reviewer claims 已对照当前 codebase 验证。
- 没有静默覆盖 prior user decision。
- 每个 implemented change 已测试，或已说明 missing verification。
- 最终回复说明改了什么以及如何验证。

## 底线（Bottom Line）

先验证。需要时澄清。该 push back 时 push back。只实现已验证的 changes。让代码和 verification 说话。
