import fs from 'node:fs';
import path from 'node:path';

/**
 * Marker files → detected language(s).
 * Order matters: checked sequentially, multiple can match.
 */
const MARKER_FILES = [
  { file: 'package.json', language: 'javascript' },
  { file: 'pyproject.toml', language: 'python' },
  { file: 'go.mod', language: 'go' },
  { file: 'Cargo.toml', language: 'rust' },
  { file: 'pom.xml', language: 'java' },
  { file: 'build.gradle', language: 'java' },
  { file: 'build.gradle.kts', language: 'kotlin' },
];

/**
 * Lock files → Node.js package manager.
 * Checked in priority order (most specific first).
 */
const NODE_PM_LOCK_FILES = [
  { file: 'bun.lockb', pm: 'bun' },
  { file: 'pnpm-lock.yaml', pm: 'pnpm' },
  { file: 'yarn.lock', pm: 'yarn' },
  { file: 'package-lock.json', pm: 'npm' },
];

/**
 * Stage definitions per language.
 * Each stage maps to a command template. `{pm}` is replaced with the detected
 * package manager for Node.js projects.
 */
const LANGUAGE_STAGES = {
  javascript: {
    build: { cmd: '{pm} run build' },
    types: { cmd: 'tsc --noEmit' },
    lint: { cmd: 'eslint .' },
    test: { cmd: '{pm} test' },
    security: { cmd: '{pm} audit' },
  },
  python: {
    build: { cmd: 'python -m py_compile' },
    types: { cmd: 'pyright' },
    lint: { cmd: 'ruff check .' },
    test: { cmd: 'pytest' },
    security: { cmd: 'pip-audit' },
  },
  go: {
    build: { cmd: 'go build ./...' },
    types: { cmd: null, skip: 'covered by build' },
    lint: { cmd: 'golangci-lint run' },
    test: { cmd: 'go test ./...' },
    security: { cmd: 'govulncheck ./...' },
  },
  rust: {
    build: { cmd: 'cargo build' },
    types: { cmd: null, skip: 'covered by build' },
    lint: { cmd: 'cargo clippy' },
    test: { cmd: 'cargo test' },
    security: { cmd: 'cargo audit' },
  },
  java: {
    build: { cmd: 'mvn compile' },
    types: { cmd: null, skip: 'covered by build' },
    lint: { cmd: 'mvn checkstyle:check' },
    test: { cmd: 'mvn test' },
    security: { cmd: null, skip: 'tool not installed' },
  },
  kotlin: {
    build: { cmd: 'gradle build' },
    types: { cmd: null, skip: 'covered by build' },
    lint: { cmd: 'ktlint' },
    test: { cmd: 'gradle test' },
    security: { cmd: null, skip: 'tool not installed' },
  },
};

/**
 * Detect the Node.js package manager from lock files.
 * @param {string} projectRoot
 * @returns {string} Package manager name ('npm' | 'pnpm' | 'yarn' | 'bun'), defaults to 'npm'
 */
function detectNodePackageManager(projectRoot) {
  for (const { file, pm } of NODE_PM_LOCK_FILES) {
    if (fs.existsSync(path.join(projectRoot, file))) {
      return pm;
    }
  }
  return 'npm';
}

/**
 * Build the stages object for a language, substituting the package manager
 * into command templates where needed.
 * @param {string} language
 * @param {string|null} packageManager
 * @returns {Record<string, { command: string|null, skip?: string }>}
 */
function buildStages(language, packageManager) {
  const template = LANGUAGE_STAGES[language];
  if (!template) return {};

  const stages = {};
  for (const [stage, def] of Object.entries(template)) {
    if (def.cmd === null) {
      stages[stage] = { command: null, skip: def.skip };
    } else {
      const command = packageManager
        ? def.cmd.replace(/\{pm\}/g, packageManager)
        : def.cmd;
      stages[stage] = { command };
    }
  }
  return stages;
}

/**
 * Detect the project's toolchain from marker files at the given root.
 *
 * @param {string} projectRoot - Absolute or relative path to the project root
 * @returns {{
 *   languages: string[],
 *   packageManager: string|null,
 *   stages: Record<string, { command: string|null, skip?: string }>
 * }}
 */
export function detectToolchain(projectRoot) {
  const languages = [];

  for (const { file, language } of MARKER_FILES) {
    if (fs.existsSync(path.join(projectRoot, file))) {
      if (!languages.includes(language)) {
        languages.push(language);
      }
    }
  }

  // Detect Node.js package manager only when JavaScript is detected
  const packageManager = languages.includes('javascript')
    ? detectNodePackageManager(projectRoot)
    : null;

  // Merge stages from all detected languages.
  // If multiple languages define the same stage name, the first detected wins.
  const stages = {};
  for (const lang of languages) {
    const langStages = buildStages(lang, packageManager);
    for (const [stage, def] of Object.entries(langStages)) {
      if (!(stage in stages)) {
        stages[stage] = def;
      }
    }
  }

  return { languages, packageManager, stages };
}

export { MARKER_FILES, NODE_PM_LOCK_FILES, LANGUAGE_STAGES };
