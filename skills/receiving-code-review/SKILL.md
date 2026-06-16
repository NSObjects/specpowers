---
name: receiving-code-review
description: 用于处理 PR/MR 代码评审评论。先从用户粘贴内容、PR/MR 链接、评审 ID，或配置好的 review source 中获取真实评审评论；再结合当前代码库、测试和既有决策验证每条评论是否成立，并决定修复、澄清、反驳、延后或交由用户决策。
---

# PR/MR 评审评论处理

当需要查看、分析或处理 PR/MR 的代码评审评论时，使用此 skill。

这些评论可能来自用户直接粘贴的内容，也可能来自配置好的 review source、native repository 或 code-host integration、MCP 或 platform integration、CLI/API、仓库上下文，或内部代码评审系统。

当评论没有直接出现在对话中时，应优先通过已配置的 MCP、平台集成、代码托管集成、CLI/API、仓库上下文，或其他可用评审来源获取评论。

本 skill 的目标不是盲目接受评审意见，而是：

1. 获取真实的 PR/MR 评审评论。
2. 将每条评论解析成具体的技术要求。
3. 结合当前代码库、测试、平台约束和既有决策验证评论是否成立。
4. 判断每条评论应该修复、澄清、反驳、延后，还是交由用户做产品/架构决策。
5. 对需要修复的评论实施最小且正确的修改，并运行相关验证。
6. 最终清楚报告每条评论的处理结果、修改位置和验证方式。

## 核心原则

代码评审评论是一项需要评估的技术主张，不是必须服从的命令。

先获取真实评论。  
再理解评论要求。  
然后结合当前代码库验证。  
最后再决定回复、修复、澄清或反驳。

不要为了显得配合而直接修改代码。  
不要在未验证前假设评审者一定正确。  
不要在缺少评论内容时编造、推断或模拟评审意见。

## 适用场景

在以下场景中使用此 skill：

- 用户要求查看某个 PR/MR 的评审评论。
- 用户提供了 PR 链接、MR 链接、评审链接、PR ID、MR ID 或等效评审标识。
- 用户要求“处理评审意见”“修一下 code review comments”“看下 reviewer 的评论是否要改”。
- 用户只给出了当前仓库或分支上下文，希望自动定位关联 PR/MR。
- 用户粘贴了一组评审评论，要求判断是否需要修改代码。
- 用户要求根据远端平台中的评审意见完成修复。
- 用户要求回复 reviewer、resolve discussion、处理 inline comments 或重新提交评审。

## Feedback Input Boundary（反馈输入边界）

在评估评审评论之前，必须确保真实评论内容已经可用。

- 如果用户已经粘贴了评审评论，直接使用这些评论。
- 如果用户提供了 PR/MR 链接、评审链接、PR ID、MR ID 或等效标识，应先通过配置好的 review source 获取评论，再进行评估。
- 如果用户没有粘贴评论，也没有提供标识，应先根据当前仓库上下文和已配置评审来源，尝试查找正在进行的 PR/MR。
- 如果当前仓库上下文可以定位远端仓库、当前分支、上游分支或默认分支，应优先尝试发现关联 PR/MR。
- 如果配置好的 review source 不可用、权限不足，或无法访问相关评论，应向用户请求继续所需的 missing comments、link、review identifier、platform 或 permissions。
- 缺失信息可能包括：评论内容、PR/MR 链接、评审 ID、平台名称、仓库信息、访问权限或具体分支。
- 不要发明、推断或模拟 review comments。缺少真实评审输入是阻塞点，不是猜测理由。

## Review Comment Acquisition（评审评论获取）

当评审评论没有直接粘贴到对话中时，应把获取评论视为一次远端评审来源查询，而不是执行固定脚本。

使用以下优先顺序，但不要把它当成固定脚本：

- **用户提供的最具体信号优先。** 先使用用户粘贴的评审评论、PR/MR 链接、评审链接、PR ID、MR ID、review identifier、平台名称、repository remote、active branch 或目标分支信息。
- **native repository 或 code-host integration 优先于手工猜测。** 如果存在原生集成，应通过它获取 pull request 或 merge request 的总体评论、review comments、conversation comments、inline comments、threaded discussions、unresolved discussions、change request comments、reviewer summary，以及属于代码评审流程的 bot/CI 反馈。
- **MCP 或 platform integration 可作为等价来源。** 如果没有原生集成，但存在配置好的 MCP、CLI、API、脚本、内部评审系统或专用工具，应通过这些 review source 获取同样范围的评论。
- **当前 repository context 可以先发现关联 review。** 当用户只提供当前仓库或分支上下文时，使用当前 repository context、active branch、repository remote、upstream 分支、默认分支、最近提交、本地 git metadata 和平台上下文，先发现关联 pull request 或 merge request。
- **先发现，再询问。** 只有在 repository-context discovery 无法识别 review，或配置好的 review source 无法读取评论时，才向用户请求 missing comments、link、review identifier、platform 或 permissions。
- **处理分页和线程。** 如果 review source 返回分页结果，应继续翻页直到收集完当前权限范围内可访问的评论；如果存在评论线程，应保留线程上下文，不要只读取最后一条评论。
- **无法获取时停止并说明缺口。** 如果缺少平台、权限、链接、ID、仓库信息或工具能力，只询问缺失的那一项；不要在没有真实评论的情况下继续分析。

## 需要收集的评论范围

处理 PR/MR 评审时，应尽可能收集以下内容：

- review-level comments。
- inline code comments。
- conversation comments。
- unresolved discussions。
- resolved discussions，如果它们仍可能影响当前修改。
- reviewer requested changes。
- reviewer approval comments。
- CI、lint、security scan、coverage bot 等自动评论。
- 与代码评审直接相关的产品、架构、测试或兼容性讨论。
- 最新 diff 上的评论。
- 因代码更新而 outdated 的评论，若平台仍显示其上下文且可能影响当前实现，也应评估。

不要只处理顶层评论而忽略 inline comments。  
不要只处理 unresolved comments 而忽略 reviewer 明确要求变更但已被平台自动折叠的评论。  
不要把自动 bot 评论全部视为噪音；如果它指出构建、测试、安全、格式或覆盖率问题，也应纳入判断。

## Default Workflow（默认工作流）

对于每一条评审评论：

1. **读取**

   先读完所有评论，再开始修改代码。

   避免看到第一条评论就立即动手，因为后续评论可能改变实现方向，或者多条评论可能指向同一个根因。

2. **归并**

   将重复评论、同一线程内的连续评论、同一问题的多处表现合并处理。

   不要对同一个问题重复修改多次。

3. **解析**

   将评论转化为具体的技术要求。

   例如：

   - reviewer 说“这里要处理异常”。
   - 解析为：“当 `foo()` 返回错误时，当前代码应返回可识别错误，并避免继续使用无效结果。”

4. **澄清**

   如果评论要求不明确，并且不明确点会影响实现路径、行为边界、共享代码路径或产品语义，应先请求澄清。

5. **验证**

   根据当前代码库、测试、平台/版本约束、接口契约、历史实现和用户既有决策验证该评论是否成立。

6. **分类**

   将每条评论归类为：

   - `valid`：评论成立，需要修复。
   - `unclear`：评论不清楚，需要澄清。
   - `wrong/harmful`：评论错误、有害，或会破坏现有行为。
   - `unnecessary`：评论提出的是未使用、推测性或过度设计的能力。
   - `out_of_scope`：问题真实存在，但超出本次 PR/MR 范围。
   - `architectural/product`：涉及架构、产品、边界、权限、失败模式或成功标准，需要用户决策。
   - `needs_user_decision`：评论涉及产品、架构、边界、权限、失败模式或成功标准，必须由用户决策。
   - `already_handled`：当前代码或后续提交已经处理。
   - `duplicate`：与其他评论重复，应合并处理。

7. **处理**

   - `valid`：实施最小且正确的修复，并运行验证。
   - `unclear`：提出具体澄清问题，不要猜测实现。
   - `wrong/harmful`：用代码、测试、约束或决策证据进行反驳。
   - `unnecessary`：提出 YAGNI 问题，避免引入未使用能力。
   - `out_of_scope`：说明为什么不在当前 PR/MR 中处理，并建议后续处理方式。
   - `architectural/product` / `needs_user_decision`：列出选项、影响和风险，让用户决策。
   - `already_handled`：说明已在哪个位置处理，必要时补充验证。
   - `duplicate`：说明该评论已并入哪条问题处理。

8. **报告**

   最终说明：

   - 每条评论的处理结论。
   - 修改了哪些文件。
   - 关键行为如何变化。
   - 使用了哪些验证方式。
   - 哪些问题仍需用户或 reviewer 决策。

```text
FOR each review item:
  comment =真实评审评论
  requirement =具体技术要求

  IF comment 缺失:
    停止，获取真实评论
  ELSE IF requirement 不明确:
    在实施前请求澄清
  ELSE:
    根据当前代码库、测试、接口契约和平台约束验证

    IF 评论成立:
      实施最小且正确的修改
      运行相关验证
    ELSE IF 评论错误、有害或会破坏现有行为:
      用证据反驳
    ELSE IF 评论要求未使用或推测性能力:
      提出 YAGNI 问题
    ELSE IF 评论超出当前 PR/MR 范围:
      标记为 out_of_scope，并说明原因
    ELSE IF 评论涉及产品或架构决策:
      交由用户决策
    ELSE:
      说明当前判断和剩余不确定性
```

## Review Resolution Loop（评审处理闭环）

处理 review feedback 后，需要为 re-review 准备一个可核查的 Resolution Package。该包必须逐条列出原始 review comments、分类、处理决定、修改位置、验证证据和剩余缺口。

每条评论的 Resolution Package 状态只能是：

- `valid`：评论成立，已用最小正确修改处理，并给出验证证据。
- `wrong/harmful`：评论不成立或会破坏现有行为，已用代码、测试、约束或既有决策证据反驳。
- `out_of_scope`：问题真实存在，但不属于当前 PR/MR 范围，已说明边界和后续建议。
- `needs_user_decision`：评论涉及产品、架构、权限、失败模式或成功标准，需要用户决策后才能继续。
- `already_handled`：当前代码或后续提交已经处理，并给出位置和验证。
- `duplicate`：已合并到另一条评论处理。

re-review 前应用 Review Confidence Loop：确认所有 `valid` 评论都有对应修改和验证，所有 `wrong/harmful`、`out_of_scope`、`needs_user_decision` 都有证据或明确决策边界，且没有编造、遗漏或跳过真实评论。若仍存在无法判断的 review item，把它作为 unresolved gap 报告，不要声称已完成处理。
