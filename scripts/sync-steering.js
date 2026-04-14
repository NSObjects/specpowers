#!/usr/bin/env node

/**
 * Sync skills to steering directory for Kiro Power.
 *
 * Converts skills/X/SKILL.md → steering/X.md
 * Converts skills/X/other.md → steering/X--other.md
 * Converts skills/X/subdir/file.md → steering/X--subdir--file.md
 *
 * The specpowers-workflow.md steering file is preserved (not overwritten).
 * Generated files include a marker comment so they can be identified and cleaned.
 */

import { readdirSync, readFileSync, writeFileSync, unlinkSync, statSync, existsSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(__filename, '../..');
const SKILLS_DIR = join(ROOT, 'skills');
const STEERING_DIR = join(ROOT, 'steering');
const MARKER = '<!-- generated from skills/ by sync-steering.js -->';
const PRESERVE = new Set(['specpowers-workflow.md']);

function main() {
  if (!existsSync(STEERING_DIR)) {
    mkdirSync(STEERING_DIR, { recursive: true });
  }

  // Clean previously generated files
  for (const file of readdirSync(STEERING_DIR)) {
    if (PRESERVE.has(file)) continue;
    const filePath = join(STEERING_DIR, file);
    if (!statSync(filePath).isFile()) continue;
    try {
      const content = readFileSync(filePath, 'utf-8');
      if (content.startsWith(MARKER)) {
        unlinkSync(filePath);
      }
    } catch { /* ignore */ }
  }

  const skillDirs = readdirSync(SKILLS_DIR).filter((name) => {
    const skillPath = join(SKILLS_DIR, name);
    return statSync(skillPath).isDirectory() && existsSync(join(skillPath, 'SKILL.md'));
  });

  let count = 0;

  for (const skillName of skillDirs) {
    const skillDir = join(SKILLS_DIR, skillName);
    const entries = readdirSync(skillDir);

    // Process .md files in skill root
    for (const file of entries) {
      const filePath = join(skillDir, file);
      if (!file.endsWith('.md') || !statSync(filePath).isFile()) continue;

      const content = readFileSync(filePath, 'utf-8');
      const targetName = file === 'SKILL.md'
        ? `${skillName}.md`
        : `${skillName}--${file}`;

      writeFileSync(join(STEERING_DIR, targetName), `${MARKER}\n${content}`, 'utf-8');
      count++;
    }

    // Process subdirectories (e.g. skills/using-skills/references/)
    for (const entry of entries) {
      const entryPath = join(skillDir, entry);
      if (!statSync(entryPath).isDirectory()) continue;

      const subFiles = readdirSync(entryPath).filter(
        (f) => f.endsWith('.md') && statSync(join(entryPath, f)).isFile()
      );

      for (const file of subFiles) {
        const content = readFileSync(join(entryPath, file), 'utf-8');
        const targetName = `${skillName}--${entry}--${file}`;
        writeFileSync(join(STEERING_DIR, targetName), `${MARKER}\n${content}`, 'utf-8');
        count++;
      }
    }
  }

  console.log(`Synced ${count} files from skills/ to steering/`);
}

main();
