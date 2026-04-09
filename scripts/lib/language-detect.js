import path from 'node:path';

/** Map of file extensions to rules-{language} skill names. */
const EXT_TO_SKILL = new Map([
  // TypeScript
  ['.ts', 'rules-typescript'],
  ['.tsx', 'rules-typescript'],
  ['.mts', 'rules-typescript'],
  ['.cts', 'rules-typescript'],
  // Python
  ['.py', 'rules-python'],
  ['.pyw', 'rules-python'],
  ['.pyi', 'rules-python'],
  // Go
  ['.go', 'rules-golang'],
  // Rust
  ['.rs', 'rules-rust'],
  // Java
  ['.java', 'rules-java'],
  // Kotlin
  ['.kt', 'rules-kotlin'],
  ['.kts', 'rules-kotlin'],
  // C++
  ['.cpp', 'rules-cpp'],
  ['.cc', 'rules-cpp'],
  ['.cxx', 'rules-cpp'],
  ['.hpp', 'rules-cpp'],
  ['.h', 'rules-cpp'],
  // Swift
  ['.swift', 'rules-swift'],
  // PHP
  ['.php', 'rules-php'],
  // Perl
  ['.pl', 'rules-perl'],
  ['.pm', 'rules-perl'],
  ['.t', 'rules-perl'],
  // C#
  ['.cs', 'rules-csharp'],
  // Dart
  ['.dart', 'rules-dart'],
]);

/**
 * Detect languages from a list of file paths and return corresponding skill names.
 * @param {string[]} fileList - Array of file paths
 * @returns {string[]} Deduplicated, sorted array of `rules-{language}` skill names
 */
export function detectLanguages(fileList) {
  if (!Array.isArray(fileList) || fileList.length === 0) return [];

  const skills = new Set();
  for (const filePath of fileList) {
    const ext = path.extname(filePath).toLowerCase();
    const skill = EXT_TO_SKILL.get(ext);
    if (skill) skills.add(skill);
  }
  return [...skills].sort();
}

export { EXT_TO_SKILL };
