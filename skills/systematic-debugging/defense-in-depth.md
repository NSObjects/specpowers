# 纵深防御校验（Defense-in-Depth Validation）

## 概览

当 bug 由无效数据引起时，只在一个位置加校验看起来已经足够。但单点校验很容易被其他代码路径、重构、mock、测试工具或未来改动绕过。

**核心原则：** 数据经过的每一层都要做适合该层职责的校验，让同类 bug 在结构上不可能再次发生。

## 为什么需要多层校验

单点校验的目标是：“这个入口暂时修好了。”

纵深防御的目标是：“即使未来出现不同入口、不同调用路径或不同 mock，坏值也无法到达危险操作。”

不同层捕获不同问题：

- 入口校验捕获明显无效输入；
- 业务逻辑校验捕获上下文不合法；
- 环境防护阻止特定环境中的危险副作用；
- 调试观测在其他层失效时提供取证线索。

## 四层模型

### 第 1 层：入口校验

**目的：** 在 API 边界拒绝明显无效的输入。

```typescript
function createProject(name: string, workingDirectory: string) {
  if (!workingDirectory || workingDirectory.trim() === '') {
    throw new Error('workingDirectory cannot be empty');
  }
  if (!existsSync(workingDirectory)) {
    throw new Error(`workingDirectory does not exist: ${workingDirectory}`);
  }
  if (!statSync(workingDirectory).isDirectory()) {
    throw new Error(`workingDirectory is not a directory: ${workingDirectory}`);
  }

  // 继续执行
}
```

入口校验应该检查：

- 必填值是否存在；
- 字符串是否为空或全空白；
- 路径是否存在；
- 类型和格式是否符合要求；
- 调用方是否有权限；
- 错误信息是否能指出调用方传错了什么。

### 第 2 层：业务逻辑校验

**目的：** 确认数据在当前操作语义下是合理的。

```typescript
function initializeWorkspace(projectDir: string, sessionId: string) {
  if (!projectDir || projectDir.trim() === '') {
    throw new Error('projectDir required for workspace initialization');
  }
  if (!sessionId) {
    throw new Error('sessionId required for workspace initialization');
  }

  // 继续执行
}
```

业务逻辑校验应该检查：

- 该值是否适用于当前操作；
- 生命周期是否正确；
- 状态机是否处于允许状态；
- 相关对象是否已经初始化；
- mock 或测试替身是否绕过了入口校验。

### 第 3 层：环境防护

**目的：** 在特定环境中阻止危险操作，例如测试环境、CI、生产环境或只读目录。

```typescript
async function gitInit(directory: string) {
  // 测试环境中，禁止在临时目录外执行 git init
  if (process.env.NODE_ENV === 'test') {
    const normalized = normalize(resolve(directory));
    const tempRoot = normalize(resolve(tmpdir()));

    if (!normalized.startsWith(tempRoot)) {
      throw new Error(
        `Refusing git init outside temp dir during tests: ${directory}`
      );
    }
  }

  // 继续执行
}
```

环境防护适合防止：

- 测试污染源码目录；
- CI 中访问本地开发机路径；
- 生产环境执行破坏性调试操作；
- 在错误区域创建文件、写数据库或调用外部服务；
- 由于平台差异导致路径、权限、时区或 shell 行为错误。

### 第 4 层：调试观测

**目的：** 在危险操作前捕获上下文，方便未来取证。

```typescript
async function gitInit(directory: string) {
  const stack = new Error().stack;
  logger.debug('About to git init', {
    directory,
    cwd: process.cwd(),
    nodeEnv: process.env.NODE_ENV,
    stack,
  });

  // 继续执行
}
```

调试观测应该包含：

- 关键输入值；
- 当前工作目录；
- 环境信息；
- 调用栈；
- 相关配置开关；
- 不包含 secret、token、密码或个人隐私。

## 应用流程

找到根因后，按以下步骤添加纵深防御：

1. **追踪数据流**：坏值从哪里产生？经过哪些函数、对象、队列、配置或外部边界？
2. **绘制检查点**：列出每个可以阻止坏值继续传播的位置。
3. **按职责加校验**：入口层检查输入合法性；业务层检查语义；环境层阻止危险副作用；观测层记录上下文。
4. **测试每一层**：尝试绕过第 1 层，确认第 2 层能拦截；尝试错误环境，确认环境防护能拦截。
5. **保持错误信息清晰**：错误应指出缺失值、非法状态或危险操作，而不是抛出模糊异常。

## 检查点清单

| 层级 | 应该回答的问题 | 常见实现 |
|---|---|---|
| 入口校验 | 调用方传入的值是否合法？ | 参数校验、schema、路径存在性检查 |
| 业务逻辑校验 | 在当前操作中这个值是否有意义？ | 状态机检查、生命周期检查、前置条件检查 |
| 环境防护 | 这个操作在当前环境中是否安全？ | `NODE_ENV` guard、目录白名单、只读保护 |
| 调试观测 | 如果以后再失败，能否定位来源？ | 结构化日志、stack trace、关键上下文 |

## 示例：空 `projectDir`

Bug：空 `projectDir` 导致 `git init` 在源码目录执行。

**数据流：**

1. 测试 setup 产生空字符串；
2. `Project.create(name, '')` 接收空目录；
3. `WorkspaceManager.createWorkspace('')` 继续传递空值；
4. `git init` 因空 `cwd` 落到 `process.cwd()`。

**添加的四层防御：**

- 第 1 层：`Project.create()` 校验目录非空、存在、可写。
- 第 2 层：`WorkspaceManager` 校验 `projectDir` 非空。
- 第 3 层：测试环境中 `WorktreeManager` 拒绝在临时目录外执行 `git init`。
- 第 4 层：`git init` 前记录 stack trace。

**结果：** 即使未来某条路径绕过入口校验，后续层仍会阻止危险操作，并留下足够证据定位来源。

## 关键洞察

四层防御不是重复劳动，而是针对不同失败模式的保护：

- 不同入口可能绕过入口校验；
- mock 可能绕过真实业务逻辑；
- 平台差异可能让路径或权限行为变化；
- 环境防护能阻止最危险的副作用；
- 调试观测能在未知路径出现时帮助追踪。

不要停在一个校验点。坏值经过哪里，就在哪里设置符合职责的防线。

## 反模式

避免以下做法：

- 只在最外层校验，然后假设内部永远安全；
- 只在最深层校验，导致错误信息离调用方太远；
- 在所有层复制完全相同的校验，而不是按职责校验；
- 错误信息只写 “invalid input”，没有上下文；
- 校验中吞掉错误并继续执行；
- 记录敏感信息来换取调试便利。

## 完成标准

纵深防御完成时，应该满足：

- 根因已在源头修复；
- 数据流上的关键层都有合适校验；
- 最危险的副作用被环境防护阻止；
- 未来再出现类似坏值时，错误会尽早、清晰、可诊断地失败；
- 测试覆盖至少一个绕过上层校验的场景。
