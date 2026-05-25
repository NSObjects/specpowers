---
name: using-skills
description: 在 session start、回应用户任务前，或下一步不清楚时使用，用来选择、加载并排序适用的 SpecPowers skills。
---

<SUBAGENT-STOP>
如果你是被派发来执行特定 task 的 subagent，除非 subagent prompt 明确要求你 load skills，否则跳过此 skill。
</SUBAGENT-STOP>

# Using Skills（使用技能）

## Purpose（目的）

此 skill 是 SpecPowers 的 routing layer。它决定哪些 skills 适用，按正确顺序加载，并防止正确 workflow instructions 尚未激活时就开始工作。

## Non-Negotiable Rule（不可协商规则）

回应或执行用户 task 前，先做 skill check。

- 如果用户明确请求某个 skill，加载它。
- 如果 known skill 可能相关，行动前加载它。
- 不要等到完全确定；相关性 threshold 要低。
- 当前文件已经 active 后，不要递归重新加载 `using-skills`。
- 如果检查后没有任何 skill 适用，正常继续。

Skills 是 current instructions，不是 memory。即使你记得某个 skill，也要先加载当前版本再依赖它。

## Instruction Priority（指令优先级）

按以下顺序解决冲突：

1. Platform、system、safety 和 tool constraints。
2. 用户明确请求，以及 repository instructions，例如 `CLAUDE.md`、`AGENTS.md` 或等价 project guidance。
3. 已加载的 SpecPowers skills。
4. Default agent habits 和 preferences。

同一优先级内冲突时，遵循更具体的 instruction，除非它违反更高优先级 constraint。

## How to Access Skills（如何访问技能）

使用当前 environment 提供的机制：

| Environment | How to load a skill |
| --- | --- |
| Claude Code | 使用 native `Skill` tool 或 `/skill-name`。Tool、subagent、task-list 和 plugin 细节见 `references/claude-code-tools.md`。 |
| Codex | 使用 native skill discovery。Tool translation 见 `references/codex-tools.md`。 |

如果当前 environment 没有所需 named tool，使用最接近的 native equivalent。没有 equivalent 时，简短说明限制，并使用最佳可用 manual workflow 继续。

## Platform Reference Files（平台参考文件）

只有当前 environment 或已加载 skill 需要 platform-specific translation 时，才加载相关 reference file。

For `Agent` tool (or legacy `Task` references), use the platform reference below before dispatching subagents.

| Reference file | Use when |
| --- | --- |
| `references/claude-code-tools.md` | 在 Claude Code 中运行，或处理 `Skill`、`Agent`、`Task`、`TodoWrite`、`Task*`、subagent 或 plugin instructions。 |
| `references/codex-tools.md` | 在 Codex 中运行，或把 Claude Code tool names 翻译成 Codex equivalents。 |

## Skill Check Procedure（技能检查流程）

1. 识别 task type：exploration、feature/change request、bug fix、implementation、quality review、verification、installation 或 archival。
2. 检查用户是否明确点名或暗示某个 skill。
3. 相关时检查 repository state：`specs/changes/`、existing artifacts、task files、project languages、installed rule modules，以及 `.claude/` 或 `.codex/` 等 platform-specific skill directories。
4. Implementation skills 前先加载 process skills。
5. Coding 或 reviewing code 时，在任何 language-specific `rules-*` skill 前先加载 `rules-common`。
6. 严格遵循已加载 skill。如果它要求加载另一个 skill，继续前先加载。
7. 只告诉用户有意义的 workflow decisions，不逐条汇报内部 lookup。

## Skill Priority（技能优先级）

多个 skills 适用时，按此顺序加载：

1. **Process skills** — `exploring`、`proposing`、`specifying`、`designing`、`planning`、`debugging`。
2. **Rules skills** — `rules-common`，然后是适用的 `rules-{language}` modules。
3. **Implementation skills** — `spec-driven-development`。
4. **Quality skills** — `verification-loop`、`quality-gate`、`confidence-loop`、`requesting-code-review`。
5. **Utility skills** — `dispatching-parallel-agents`、`selective-install` 和其他 support skills。

## SpecPowers Artifact Workflow（SpecPowers 工件工作流）

SpecPowers 使用 spec-driven artifact flow：

```text
exploring → proposing → specifying → designing → planning → spec-driven-development → archiving
```

每个阶段创建或验证一个 specific artifact：

| Stage | Skill | Typical artifact |
| --- | --- | --- |
| 理解 context 或 alternatives | `exploring` | research notes、discovered constraints、option comparison |
| 定义 change candidate | `proposing` | `specs/changes/<change>/` 下的 proposal |
| 定义 requirements | `specifying` | requirements/specification artifact |
| 定义 technical approach | `designing` | design artifact |
| 拆成 executable steps | `planning` | `tasks.md` |
| 实现 checked tasks | `spec-driven-development` | code/config/docs changes、task updates |
| 关闭 completed change | `archiving` | archived change record |

`specifying` 对 feature/change work 是 mandatory。不要从 proposal 直接跳到 design 或 implementation。

## Bug Diagnostic Routing（Bug 诊断路由）

Bug-like input is not edit authorization。Bug report、error report、test failure、regression、unexpected behavior 或 failure-related why-question 默认路由到 `systematic-debugging` 的 diagnostic discussion mode。

Design、trade-off、architecture、workflow 或 explanation-only why-questions 不表示 failure。按真实 task type 路由；除非问题与 bug、error、failure、regression、unexpected behavior 或 broken test 相关，否则 do not treat it as a bug diagnostic。

For ordinary bug diagnostics，使用 lightweight path：路由到 `systematic-debugging`，执行 read-only investigation，与用户讨论 evidence 和 root-cause direction，并在编辑文件前等待 explicit fix authorization。

Ordinary read-only diagnostic work does not require `proposing`, `specifying`, `designing`, or `planning`。当 investigation 暴露 behavior change 或 expanded scope，需要新的 user-visible contract 时，才升级到 artifact workflow。

fix authorization is not an artifact-workflow bypass。Bug fix 编辑前，bind the fix to an existing accepted spec, existing observable contract, or failing test。如果 expected behavior 尚未指定，或 fix 会改变 user-visible behavior，implementation 前 create or confirm a minimal bug specification。如果 no new spec artifact is required，因为 repair 只是恢复 existing observable contract，那么进入 implementation 前说明该 contract 以及证明它的 failing test 或 reproduction。

## Routing Decision Table（路由决策表）

先选择一个 primary workflow skill。只有当所选 workflow 到达对应 checkpoint 时，才添加 rule 或 quality skills。

| User request or repository state | Primary skill | Notes |
| --- | --- | --- |
| Vague request、unclear scope、competing approaches，或选择 change 前需要 context | `exploring` | Exploration 期间不创建 artifacts。只有用户确认后才 transition to `proposing`。 |
| 具体 new feature、behavior change 或 implementation intent，但没有 active change artifact | `proposing` | 如果仍需 discovery，先用 `exploring`。 |
| Accepted proposal but missing behavioral requirements | `specifying` | Design 或 implementation 前 mandatory。 |
| Requirements 已同意，但 technical approach、trade-offs 或 file boundaries 未解决 | `designing` | 保持 design 与 task planning 分离。 |
| Requirements 和 design 已同意，但没有 executable task list | `planning` | 产出 small test-first tasks，并建立 execution mode。 |
| Approved `tasks.md` exists and the user wants implementation to begin or resume | `spec-driven-development` | Reuse the current execution mode if already chosen; otherwise ask for `Step-by-Step` or `Fast`. |
| Bug report、error report、failure、regression、flaky behavior、unexpected test result 或 failure-related why-question | `systematic-debugging` | Enter diagnostic discussion mode；先理解 root cause，再把任何 authorized fix 绑定到 existing spec、observable contract、failing test 或 minimal bug specification。 |
| 用户明确要求 standalone review 或 merge-readiness review | `requesting-code-review` | 保持一个 surfaced review conclusion；specialist reviewers 留在内部。 |
| 用户要求回复或实现 review feedback | `receiving-code-review` | 接受 feedback 前，先对照 code 验证。 |
| 用户要求 install、repair、diagnose、add、remove 或 change SpecPowers modules | `selective-install` | Runtime routing 不隐式调用 installers。 |
| Completed and accepted change should be closed | `archiving` | 只在 implementation 和 review 完成后使用。 |

Support skills are not primary routes:

| Support skill | Use only when |
| --- | --- |
| `rules-common` / `rules-*` | Coding 或 review active，且 rule skill 存在于 managed payload。 |
| `test-driven-development` | Implementation task 到达 TDD step，或 subagent 请求 TDD coaching。 |
| `confidence-loop` | Artifact handoff、implementation、review 或 completion gate 在 proceeding 或 claiming done/approved/fixed/passing/ready 前需要 evidence-bound confidence。 |
| `quality-gate` | 用户要求 automated quality checks，或 active workflow 到达该 checkpoint。 |
| `verification-loop` | Milestone 或 final readiness checkpoint 明确要求 full verification。 |
| `verification-before-completion` | Workflow 即将作出 completion、fixed、passing、commit-ready 或 PR-ready claim。 |
| `dispatching-parallel-agents` | 存在 independent workstreams，且平台明确适合 subagent use。 |

Post-implementation routing：

- Coding 或 review 期间，先加载 `rules-common` 和相关 language rules。
- After a `completed code implementation`, including `ordinary code implementation`, run or apply `confidence-loop` before reporting complete, fixed, passing, ready for review, or safe to proceed.
- Before the final response after code edits，针对 implemented scope load/apply `confidence-loop`，然后针对任何 complete、fixed、passing、ready-for-review 或 safe-to-proceed claim load/apply `verification-before-completion`。
- Ordinary implementation 使用 `confidence-loop` 中的 `same evidence-bound confidence definition`；不要创建新 route 或更弱 local checklist。
- `read-only investigation, proposal, spec, design, or planning` result `does not trigger the post-implementation Confidence Loop`；不要对 non-code work 声称 code implementation complete。

## Language Rule Activation（语言规则激活）

`using-skills` 是 runtime routing skill，不是 installer。Chat session 中它不得 write files、regenerate plugin payloads 或 install language rules。

Runtime rule handling：

1. Coding 或 reviewing code 时，如果 managed plugin payload 中存在 `rules-common`，加载它。
2. 如果相关 language rule skill 也存在于 managed payload，在 `rules-common` 后加载。
3. 如果相关 language rule skill 缺失，continue with `rules-common`，并告诉用户哪个 install command 可添加缺失 rule。
4. 除非用户明确要求 install 或 repair modules，否则不要从此 skill 调用 `scripts/install.js` 或 `scripts/lib/session-bootstrap.js`。

Installer boundary：

- `scripts/install.js` 是生成 plugin payloads 的 supported way。
- `scripts/lib/session-bootstrap.js` 是 programmatic installer helper，不是 active runtime hook。
- `scripts/lib/language-detect.js` 可以识别 installable language rule modules，但 detection 本身不会让 rule 在当前 session 可用。

## Skill Types（技能类型）

- **Rigid:** `debugging`、`specifying`、`verification-loop`、`quality-gate`、`confidence-loop` 和 TDD-oriented skills。严格按 steps 执行。
- **Flexible:** `exploring`、`designing`、`rules-common` 和 `rules-{language}`。把 principles 应用到 project context。
- **Utility:** `selective-install`、`dispatching-parallel-agents` 和 support skills。用它们支持 main workflow。

## Red Flags（风险信号）

如果发现自己出现以下想法，停止并执行 skill check：

| Thought | Required correction |
| --- | --- |
| "This is simple." | 简单 tasks 也需要 skill check。 |
| "I need context first." | 收集 context 前，先加载 exploration 或 routing skills。 |
| "I remember the skill." | 加载 current skill content。 |
| "The workflow is overkill." | 如果 skill 适用，就使用它。 |
| "I'll just inspect or edit one thing first." | Tool use 前先 check skills。 |
| "This is only a question." | Questions 也是 tasks；检查是否有 skill 适用。 |

## Completion Check（完成前检查）

最终回答或采取下一个 major action 前，确认：

- Relevant skills 已在 action 前加载。
- Required artifacts 未被跳过。
- Coding/review tasks 已考虑 `rules-common` 和 language rules。
- Completed code implementation 在任何 complete、fixed、passing、ready for review 或 safe-to-proceed claim 前，已运行或应用 `confidence-loop`。
- 从 `tasks.md` implementation 时，execution mode 已建立。
- 跳过 bootstrap 或 unavailable tool 的情况，仅在影响 task 时披露。
