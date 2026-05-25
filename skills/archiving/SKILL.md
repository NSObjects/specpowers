---
name: archiving
description: "当实现和审查已经完成、变更已被接受，并且用户希望干净收尾当前变更时使用。"
---

# 归档变更（Archiving Changes）

通过把 Delta Specs 合并到主规格，并把变更目录归档为历史记录，完成一个已经结束的变更。

**开始时宣布：**“我正在使用 archiving skill 来完成这个变更的归档。”

## 检查清单

1. **验证完成状态** — 检查 `tasks.md` 中所有 Tasks 是否已勾选
2. **合并 Delta Specs** — 把 ADDED/MODIFIED/REMOVED 应用到主 `specs/specs/`
3. **移动到 archive** — `specs/changes/<name>/` → `specs/changes/archive/YYYY-MM-DD-<name>/`
4. **报告结果**

## 归档流程（The Archive Process）

### Step 1：验证完成状态

读取 `specs/changes/<change-name>/tasks.md`。检查所有任务是否都标记为 `[x]`。

- **全部完成：** 继续 Step 2。
- **仍有未完成任务：** 警告用户；如果用户确认，仍允许归档。

### Step 2：合并 Delta Specs

对 `specs/changes/<change-name>/specs/` 中的每个 delta spec 文件：

1. 找到对应的主规格：`specs/specs/<domain>/spec.md`
2. 应用 delta：
   - **ADDED Requirements** → 追加到主 spec 的 Requirements section 末尾
   - **MODIFIED Requirements** → 替换主 spec 中匹配的 Requirement
   - **REMOVED Requirements** → 删除主 spec 中匹配的 Requirement
3. 如果主 spec 尚不存在（greenfield），从 delta 创建它

### Step 3：移动到 Archive

把变更目录移动到带日期前缀的 archive 目录：

```
specs/changes/<name>/ → specs/changes/archive/YYYY-MM-DD-<name>/
```

**注意：** Agent 直接执行这个文件移动；它不是 git 操作。git commit 由用户随后处理。

归档中必须保留所有 artifacts：`proposal.md`、`specs/`、`design.md`、`tasks.md`。

### Step 4：报告

```markdown
✅ Change archived: [change-name]

**Specs merged:**
- specs/specs/[domain]/spec.md — [N] requirements added, [M] modified, [K] removed

**Archived to:**
- specs/changes/archive/YYYY-MM-DD-[change-name]/

Main specifications are now updated. Ready for the next change.
```

## 为什么归档重要

- **干净状态。** `specs/changes/` 只显示进行中的工作
- **审计轨迹。** Archive 保留完整上下文，不只是变更内容，还包括 proposal、design 和 tasks
- **规格演进。** Specs 会随着变更归档自然增长，逐步形成完整规格

## 铁律（Iron Laws）

- **绝不在未归档时删除 change folder。** Archive 保存每个变更背后的“为什么”。
- **没有用户确认，绝不合并 specs。**
- **始终保留 archive 中的所有 artifacts。** `proposal.md`、`design.md`、`tasks.md` 都必须保留。
