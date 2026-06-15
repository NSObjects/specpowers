import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');
const skillId = 'log-guided-debugging';
const skillDir = `skills/${skillId}`;
const skillPath = `${skillDir}/SKILL.md`;

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function assertIncludesAll(content, expected, context) {
  for (const text of expected) {
    assert.ok(content.includes(text), `${context} should include "${text}"`);
  }
}

test('log-guided-debugging skill exposes evidence-first real issue workflow', () => {
  const content = read(skillPath);
  const descriptionMatch = content.match(/^---\n[\s\S]*?description:\s*(.+)\n---/m);

  assert.ok(descriptionMatch, `${skillPath} should have description frontmatter`);
  const description = descriptionMatch[1].trim().replace(/^"(.*)"$/, '$1');

  assert.match(content, /^name: log-guided-debugging$/m);
  assert.match(description, /生产问题/);
  assert.match(description, /真实 bug/);
  assert.match(description, /运行时证据/);
  assert.match(description, /SLS/i);
  assert.match(description, /云日志/);
  assert.match(description, /MCP 工具/);
  assert.match(description, /普通测试套件不能直接复现/);
  assert.match(description, /不要用于/);
  assert.match(description, /纯功能开发/);
  assert.match(description, /明显本地修复/);

  assertIncludesAll(
    content,
    [
      '没有代码路径，就没有根因。',
      '没有运行时证据，就不要修复。',
      '没有等价验证产物，就不要收尾。',
      '不要从测试开始。',
      '不要从补丁开始。',
      '先定位相关代码路径。',
      '只修复已确认或证据最充分的原因。',
      '不要因为测试通过就声称真实问题已修复。',
    ],
    skillPath,
  );

  assertIncludesAll(
    content,
    [
      '阶段 0：发现证据来源',
      '阶段 1：定位相关代码',
      '阶段 2：建立候选原因',
      '阶段 3：查询日志和运行时证据',
      '阶段 4：证据不足时添加目标化观测',
      '阶段 5：确认因果链',
      '阶段 6：只修复已确认原因',
      '阶段 7：根因明确后添加回归防护',
      '阶段 8：用真实失败模式验证',
      '最终回复格式',
    ],
    skillPath,
  );

  assertIncludesAll(
    content,
    [
      '用户可见症状',
      '入口点',
      '调用方 / handler / consumer / job / command / component',
      '核心逻辑',
      '数据/状态层',
      '外部依赖',
      '状态迁移',
      '配置 / feature flags',
      '已有日志/trace/metric',
      '外部证据来源',
      '可用的 SLS/MCP 证据',
      '缺失的观测',
      '可能涉及的文件',
    ],
    '代码路径图',
  );

  assertIncludesAll(
    content,
    [
      '假设',
      '为什么这段代码可能导致症状',
      '能确认它的证据',
      '能排除它的证据',
      '要检查的证据来源',
      '已有证据',
      '缺失证据',
      '状态：open / rejected / confirmed',
    ],
    '候选原因台账',
  );

  assertIncludesAll(
    content,
    [
      '观察到的症状',
      '触发输入/动作/状态/事件',
      '相关代码路径',
      '来自日志/SLS/traces/metrics/data/config 的运行时证据',
      '被违反的假设或不变量',
      '根因或证据最充分的原因',
      '拟采取的干预',
      '预期可观测变化',
    ],
    '因果链',
  );

  assert.doesNotMatch(content, /No code path, no root cause\.|Phase 0: Discover Evidence Sources|Final Response Format/);
});

test('log-guided-debugging skill defines observability, regression, and reporting gates', () => {
  const content = read(skillPath);

  assertIncludesAll(
    content,
    [
      '已配置的 MCP servers',
      'Alibaba Cloud SLS / Log Service MCP 工具',
      '不要假设日志一定是本地文件。',
      '不要假设所有证据都在仓库里。',
      '不要假设 SLS 可用，除非 MCP 工具、配置或文档证明它可用。',
      '不要编造 MCP 工具名或查询语法。',
      '最小权限、只读证据查询',
      '时间窗口',
      '环境',
      '服务/应用名',
      'region/cluster/namespace',
      'request_id / trace_id / correlation_id',
      '部署或版本窗口',
      '它验证哪个假设',
      '放置位置',
      '包含哪些关联字段',
      '如何帮助确认或排除原因',
      '噪声、成本、性能、隐私或敏感数据风险',
      '仓库已有观测框架',
      '是否能在 SLS 或已配置观测后端中查询',
      'request_id',
      'trace_id',
      'correlation_id',
      'duration_ms',
      'dependency',
      'error_type',
      'passwords',
      'tokens',
      'AccessKeys',
      'authorization headers',
      'payment data',
      'raw sensitive request bodies',
      '"here"',
      '"debug"',
      '"error happened"',
    ],
    'observability gate',
  );

  assertIncludesAll(
    content,
    [
      '单元测试',
      '集成测试',
      'replay fixture',
      '契约测试',
      '数据不变量查询',
      '监控告警',
      '保存为诊断检查的 SLS query',
      '手动复现清单',
      '录制的 request/response replay',
      '负载/性能 smoke check',
    ],
    'regression guard examples',
  );

  assertIncludesAll(
    content,
    [
      '- 问题分类：',
      '- 已发现的证据来源：',
      '- 已使用的 SLS/MCP 证据：',
      '- 已定位的代码路径：',
      '- 已考虑的候选原因：',
      '- 已使用的证据：',
      '- 缺失证据：',
      '- 已添加的观测：',
      '- 根因 / 证据最充分的因果链：',
      '- 修复摘要：',
      '- 回归防护：',
      '- 已执行验证：',
      '- 生产验证计划：',
      '- 发布后要运行的 SLS/log 查询：',
      '- 发布 / 回滚说明：',
      '- 剩余未知项：',
      '- 变更文件：',
    ],
    'final response format',
  );
});

test('log-guided-debugging skill references are present and stack agnostic', () => {
  const content = read(skillPath);
  const requiredReferences = [
    'evidence-sources.md',
    'mcp-observability.md',
    'observability.md',
    'production-bug-patterns.md',
    'root-cause-ledger.md',
    'verification-artifacts.md',
    'stack-adaptation.md',
  ];

  for (const reference of requiredReferences) {
    const referencePath = `${skillDir}/references/${reference}`;
    assert.ok(fs.existsSync(path.join(repoRoot, referencePath)), `${referencePath} should exist`);
    assert.ok(content.includes(`references/${reference}`), `${skillPath} should link ${reference}`);
  }

  const stackAdaptation = read(`${skillDir}/references/stack-adaptation.md`);
  assertIncludesAll(
    stackAdaptation,
    [
      'AGENTS.md',
      'README',
      'CONTRIBUTING',
      'docs',
      'CI 配置',
      'Makefile / Taskfile / package 或构建文件',
      'scripts',
      '现有测试',
      '现有 logging/tracing/metrics 调用点',
      '已配置的 MCP servers 和可用 MCP tools',
      '可用时检查 Alibaba Cloud SLS / Log Service MCP 工具',
      '部署/配置文件',
      'runbooks',
      '不要编造命令。',
      '不要编造 logging API。',
      '不要编造 MCP 工具名。',
      '不要引入新的观测框架',
      '不要假设只有后端架构。',
      '不要假设只有前端架构。',
      '根据真实仓库适配 skill。',
    ],
    'stack adaptation reference',
  );

  const combinedReferences = requiredReferences
    .map((reference) => read(`${skillDir}/references/${reference}`))
    .join('\n');
  assert.doesNotMatch(combinedReferences, /\bgo test\b|\bnpm test\b|\bpytest\b|\bcargo test\b/i);

  assertIncludesAll(
    read(`${skillDir}/references/evidence-sources.md`),
    [
      '本地日志',
      '云日志',
      'Alibaba Cloud SLS / Log Service',
      'MCP 工具',
      'traces',
      'metrics',
      'APM',
      '错误上报',
      '仪表盘',
      '请求样本',
      '配置状态',
      '部署历史',
      '数据状态',
      '浏览器/客户端证据',
      'runbooks',
    ],
    'evidence sources reference',
  );

  assertIncludesAll(
    read(`${skillDir}/references/mcp-observability.md`),
    [
      '发现可用 MCP 工具',
      '检查工具名和 schema',
      '不要编造工具名',
      '只读、窄范围、有时间边界的查询',
      '关联 ID 和安全的业务 ID',
      '保护密钥和个人数据',
      '总结证据，不要倾倒敏感日志',
      '每个查询确认或排除哪个假设',
      '如果 SLS MCP 可用，使用它获取云日志证据',
    ],
    'MCP observability reference',
  );
});

test('log-guided-debugging is installable and mentioned in repository guidance', () => {
  const manifest = readJson('manifests/install-modules.json');
  const manifestPaths = manifest.modules.flatMap((module) => module.paths);

  assert.ok(manifestPaths.includes(skillDir), `install manifest should include ${skillDir}`);

  const foundation = manifest.modules.find((module) => module.id === 'foundation');
  assert.ok(foundation, 'foundation module should exist');
  assert.ok(
    foundation.paths.includes(skillDir),
    `foundation module should include ${skillDir} for default installation`,
  );

  const agents = read('AGENTS.md');
  assertIncludesAll(
    agents,
    [
      '## 调试真实问题',
      '`log-guided-debugging`',
      '从代码路径发现和运行时证据开始。',
      '日志可能来自本地文件、云日志、通过 MCP 使用的 Alibaba Cloud SLS、traces、metrics、APM、错误上报或其他观测工具。',
      '不要把普通测试套件当成第一份或唯一的正确性证据。',
      '已配置的 MCP servers',
      '生产问题',
      '用户可见错误行为',
      '数据不一致',
      '集成失败',
      '配置问题',
      'flaky 行为',
      '回归',
      '性能问题',
    ],
    'AGENTS.md',
  );

  const openaiYaml = read(`${skillDir}/agents/openai.yaml`);
  assertIncludesAll(
    openaiYaml,
    [
      'display_name: "日志引导调试"',
      'short_description: "用运行时证据调试真实问题"',
      'default_prompt: "使用 $log-guided-debugging 从代码路径和运行时证据调查这个生产问题。"',
    ],
    'agents/openai.yaml',
  );
});
