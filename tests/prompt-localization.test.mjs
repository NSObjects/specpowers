import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');
const promptsRoot = path.join(repoRoot, 'skills');
const skillsRoot = path.join(repoRoot, 'skills');

function findFiles(dir, predicate) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findFiles(fullPath, predicate));
      continue;
    }

    if (entry.isFile() && predicate(entry.name)) {
      files.push(path.relative(repoRoot, fullPath));
    }
  }

  return files.sort();
}

const englishInstructionPatterns = [
  /\bUse this template\b/,
  /\bYou are\b/,
  /\bYour job\b/,
  /\bDo not\b/,
  /\bYou must not\b/,
  /\bBefore reviewing\b/,
  /\bBefore returning\b/,
  /\bIf key evidence is missing\b/,
  /\bReturn (?:PASS|APPROVED|NEEDS_CHANGES|NEEDS_CONTEXT|NEEDS_USER_DECISION|DONE)\b/,
  /^#+\s+(?:Inputs|Allowed Tools|Operating Rules|Review Process|Output Format|Report Format|Constraints|Process|Review Checklist|Severity Definitions)\b[^\u4E00-\u9FFF]*$/m,
];

function removeFencedBlocks(content) {
  return content.replace(/```[\s\S]*?```/g, '');
}

test('agent prompt templates are localized to Simplified Chinese natural language', () => {
  const promptFiles = findFiles(promptsRoot, (name) => name.endsWith('-prompt.md'));
  assert.ok(promptFiles.length > 0, 'expected prompt templates under skills/');

  for (const relativePath of promptFiles) {
    const content = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

    assert.match(content, /[\u4E00-\u9FFF]/u, `${relativePath} should contain Chinese prompt text`);

    const prose = removeFencedBlocks(content);
    const headings = prose
      .split('\n')
      .filter((line) => /^#{1,6}\s+/.test(line));

    for (const heading of headings) {
      assert.match(heading, /[\u4E00-\u9FFF]/u, `${relativePath} heading should be localized: ${heading}`);
    }

    for (const pattern of englishInstructionPatterns) {
      assert.doesNotMatch(prose, pattern, `${relativePath} should not retain English instruction prose`);
    }
  }
});

test('skill instruction files are localized to Simplified Chinese natural language', () => {
  const skillFiles = findFiles(skillsRoot, (name) => name === 'SKILL.md');
  assert.ok(skillFiles.length > 0, 'expected SKILL.md files under skills/');

  for (const relativePath of skillFiles) {
    const content = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

    assert.match(content, /[\u4E00-\u9FFF]/u, `${relativePath} should contain Chinese skill text`);

    const body = removeFencedBlocks(content.replace(/^---[\s\S]*?---\n/u, ''));
    const headings = body
      .split('\n')
      .filter((line) => /^#{1,6}\s+/.test(line));

    for (const heading of headings) {
      assert.match(heading, /[\u4E00-\u9FFF]/u, `${relativePath} heading should be localized: ${heading}`);
    }

    for (const pattern of englishInstructionPatterns) {
      assert.doesNotMatch(body, pattern, `${relativePath} should not retain English instruction prose`);
    }
  }
});
