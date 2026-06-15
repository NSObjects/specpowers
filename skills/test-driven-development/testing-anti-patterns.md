# Testing Anti-Patterns（测试反模式）

**加载时机：** 写或修改测试、添加 mocks、添加 test utilities，或想向 production code 添加 test-only methods 时加载。

**与 TDD skill 的关系：** 这是 `test-driven-development` skill 的独立配套 reference，不应被合并丢失。TDD 流程在写 RED test 前必须先完成 `rules-common → rules-{language}`，然后在涉及测试实现细节、mock、fixture、cleanup 时加载本文件。

## Overview（概览）

Tests must verify real behavior, not mock behavior. Mocks are a means to isolate, not the thing being tested.

**核心原则：** Test what the code does, not what the mocks do.

严格 TDD 会显著降低这些反模式出现的概率；但只要开始写 mock 或 test utilities，仍必须显式检查本文件。

## Required Loading Order（必要加载顺序）

```
1. Load rules-common.
2. Use rules-common to determine and load rules-{language}.
3. Load this file before writing/changing tests, mocks, fixtures, or test cleanup.
4. Write the RED test only after the gates above are satisfied.
```

如果这个顺序被破坏，停止并重写相关 test。不要把已经写出的违规 test 当作 reference 继续改。

## The Iron Laws（铁律）

```
1. NEVER test mock behavior.
2. NEVER add test-only methods to production classes.
3. NEVER mock without understanding dependencies.
4. NEVER use incomplete mocks when real data shape matters.
5. NEVER call implementation complete before tests verify behavior.
```

## Anti-Pattern 1: Testing Mock Behavior（测试 mock 行为）

**Violation（违规）：**

```typescript
// ❌ BAD: Testing that the mock exists
test('renders sidebar', () => {
  render(<Page />);
  expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
});
```

**Why this is wrong（为什么错）：**

- 验证的是 mock 存在，而不是 component behavior。
- Mock 存在时 test pass，mock 移除时 test fail。
- 对真实 behavior 没有任何证明力。

**Ask yourself（自问）：** “Are we testing the behavior of a mock?”

**Fix（修正）：**

```typescript
// ✅ GOOD: Test real component or don't mock it
test('renders sidebar', () => {
  render(<Page />);  // Don't mock sidebar
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});

// OR if sidebar must be mocked for isolation:
// Don't assert on the mock. Test Page's behavior with sidebar present.
```

### Gate Function（门禁函数）

```
BEFORE asserting on any mock element:
  Ask: "Am I testing real component behavior or just mock existence?"

  IF testing mock existence:
    STOP - Delete the assertion or unmock the component.

  Test real behavior instead.
```

## Anti-Pattern 2: Test-Only Methods in Production（production 中的测试专用方法）

**Violation（违规）：**

```typescript
// ❌ BAD: destroy() only used in tests
class Session {
  async destroy() {  // Looks like production API!
    await this._workspaceManager?.destroyWorkspace(this.id);
    // ... cleanup
  }
}

// In tests
afterEach(() => session.destroy());
```

**Why this is wrong（为什么错）：**

- Production class 被 test-only code 污染。
- 如果 production 误调用，可能危险。
- 违反 YAGNI 和 separation of concerns。
- 混淆 object lifecycle 与 entity/resource lifecycle。

**Fix（修正）：**

```typescript
// ✅ GOOD: Test utilities handle test cleanup
// Session has no destroy() - it's stateless in production

// In test-utils/
export async function cleanupSession(session: Session) {
  const workspace = session.getWorkspaceInfo();
  if (workspace) {
    await workspaceManager.destroyWorkspace(workspace.id);
  }
}

// In tests
afterEach(() => cleanupSession(session));
```

### Gate Function（门禁函数）

```
BEFORE adding any method to a production class:
  Ask: "Is this only used by tests?"

  IF yes:
    STOP - Don't add it.
    Put it in test utilities instead.

  Ask: "Does this class own this resource's lifecycle?"

  IF no:
    STOP - Wrong class for this method.
```

## Anti-Pattern 3: Mocking Without Understanding（没理解依赖就 mock）

**Violation（违规）：**

```typescript
// ❌ BAD: Mock breaks test logic
test('detects duplicate server', () => {
  // Mock prevents config write that test depends on!
  vi.mock('ToolCatalog', () => ({
    discoverAndCacheTools: vi.fn().mockResolvedValue(undefined)
  }));

  await addServer(config);
  await addServer(config);  // Should throw - but won't!
});
```

**Why this is wrong（为什么错）：**

- 被 mock 的 method 有 test 依赖的 side effect，例如写 config。
- 为了 “保险” 过度 mock，破坏实际 behavior。
- Test 可能因为错误原因通过，或以神秘方式失败。

**Fix（修正）：**

```typescript
// ✅ GOOD: Mock at correct level
test('detects duplicate server', () => {
  // Mock the slow part, preserve behavior test needs
  vi.mock('MCPServerManager'); // Just mock slow server startup

  await addServer(config);  // Config written
  await addServer(config);  // Duplicate detected ✓
});
```

### Gate Function（门禁函数）

```
BEFORE mocking any method:
  STOP - Don't mock yet.

  1. Ask: "What side effects does the real method have?"
  2. Ask: "Does this test depend on any of those side effects?"
  3. Ask: "Do I fully understand what this test needs?"

  IF the test depends on side effects:
    Mock at a lower level: the actual slow/external operation.
    OR use a fake/test double that preserves necessary behavior.
    DO NOT mock the high-level method the test depends on.

  IF unsure what test depends on:
    Run the test with real implementation FIRST.
    Observe what actually needs to happen.
    THEN add minimal mocking at the right level.

  Red flags:
    - "I'll mock this to be safe."
    - "This might be slow, better mock it."
    - Mocking without understanding the dependency chain.
```

## Anti-Pattern 4: Incomplete Mocks（不完整 mock）

**Violation（违规）：**

```typescript
// ❌ BAD: Partial mock - only fields you think you need
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' }
  // Missing: metadata that downstream code uses
};

// Later: breaks when code accesses response.metadata.requestId
```

**Why this is wrong（为什么错）：**

- Partial mocks hide structural assumptions。
- Downstream code may depend on fields you omitted。
- Tests pass but integration fails。
- 产生 false confidence。

**Iron Rule（铁律）：** Mock the complete data structure as it exists in reality, not just fields your immediate test uses.

**Fix（修正）：**

```typescript
// ✅ GOOD: Mirror real API completeness
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' },
  metadata: { requestId: 'req-789', timestamp: 1234567890 }
  // Include all fields the real API returns and downstream code may consume
};
```

### Gate Function（门禁函数）

```
BEFORE creating mock responses:
  Check: "What fields does the real API response contain?"

  Actions:
    1. Examine actual API response from docs/examples/fixtures.
    2. Include all fields the system may consume downstream.
    3. Verify the mock matches the real response schema closely enough.

  Critical:
    If you're creating a mock, you must understand the entire structure.
    Partial mocks fail silently when code depends on omitted fields.

  If uncertain: Include all documented fields or use a real fixture.
```

## Anti-Pattern 5: Integration Tests as Afterthought（把集成测试当事后补充）

**Violation（违规）：**

```text
✅ Implementation complete
❌ No tests written
"Ready for testing"
```

**Why this is wrong（为什么错）：**

- Testing 是 implementation 的一部分，不是 optional follow-up。
- TDD 本应捕捉这个问题。
- 没有测试不能声称 complete。

**Fix（修正）：**

```text
TDD cycle:
1. Load rules-common.
2. Load rules-{language} according to rules-common.
3. Write failing test.
4. Implement to pass.
5. Refactor while green.
6. THEN claim complete.
```

## When Mocks Become Too Complex（mock 过度复杂时）

**Warning signs（警告信号）：**

- Mock setup longer than test logic。
- Mocking everything to make test pass。
- Mocks missing methods real components have。
- Test breaks when mock changes。
- Test can’t explain user-visible behavior。
- Mock data shape drifts from real API。

**Ask yourself:** “Do we need to be using a mock here?”

通常 integration tests with real components、in-memory fake、test container、fixture 或更低层 mock 会更简单、更可信。

## TDD Prevents These Anti-Patterns（TDD 如何预防这些反模式）

TDD helps because:

1. **Write test first** → Forces you to think about what you're actually testing。
2. **Watch it fail** → Confirms the test tests real behavior, not mocks。
3. **Minimal implementation** → Prevents test-only methods from creeping into production。
4. **Real dependencies first** → You see what the test actually needs before mocking。
5. **Language rules first** → Test style follows project conventions instead of ad-hoc habits。

If you're testing mock behavior, you violated TDD: you added mocks without proving the test fails against real behavior first.

## Quick Reference（速查）

| Anti-Pattern | Fix |
|--------------|-----|
| Assert on mock elements | Test real component or unmock it |
| Test-only methods in production | Move to test utilities |
| Mock without understanding | Understand dependencies first, mock minimally |
| Incomplete mocks | Mirror real API completely or use real fixture |
| Tests as afterthought | TDD - tests first |
| Over-complex mocks | Prefer integration test, fake, fixture, or lower-level mock |
| Skipping language rules | `rules-common` → `rules-{language}` before RED |

## Red Flags（风险信号）

- Assertion checks for `*-mock` test IDs。
- Methods only called in test files。
- Mock setup is >50% of test。
- Test fails when you remove mock but production behavior remains unchanged。
- Can't explain why mock is needed。
- Mocking "just to be safe"。
- Partial mock made from memory。
- Test written before loading `rules-common` and `rules-{language}`。
- “Implementation complete, ready for testing”。

## Final Gate（最终门禁）

```
Before accepting a test:
  - Does it follow rules-common?
  - Does it follow rules-{language}?
  - Does it verify real behavior?
  - Did it fail for the expected reason before implementation?
  - Are mocks minimal, understood, and structurally faithful?
  - Are test-only concerns outside production code?

If any answer is no: fix the test before writing/accepting production code.
```

## The Bottom Line（底线）

**Mocks are tools to isolate, not things to test.**

If TDD reveals you're testing mock behavior, you've gone wrong.

Fix: test real behavior, use the right language rules, and question why the mock exists at all.
