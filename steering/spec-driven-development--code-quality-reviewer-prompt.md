<!-- generated from skills/ by sync-steering.js -->
# Code Quality Reviewer Prompt Template

Use this template when dispatching a code quality reviewer subagent.

**Purpose:** Verify implementation is well-built (clean, tested, maintainable)

**Only dispatch after spec compliance review passes.**

```
Agent tool (specpowers:code-reviewer subagent):
  Use the code-reviewer subagent prompt at ../requesting-code-review/code-reviewer-prompt.md

  Before reviewing, load `specpowers:rules-common` as the universal review baseline,
  then load `specpowers:rules-{language}` for the project's primary language
  (e.g., rules-golang, rules-typescript, rules-python) so language-specific conventions
  layer on top during review.

  WHAT_WAS_IMPLEMENTED: [from implementer's report]
  SPEC_SCENARIOS: [GIVEN/WHEN/THEN scenarios from the spec that this task covers]
  BASE_SHA: [commit before task]
  HEAD_SHA: [current commit]
  DESCRIPTION: [task summary]
```

**In addition to standard code quality concerns, the reviewer should check:**
- Does each file have one clear responsibility with a well-defined interface?
- Are units decomposed so they can be understood and tested independently?
- Is the implementation following the file structure from the plan?
- Did this implementation create new files that are already large, or significantly grow existing files? (Don't flag pre-existing file sizes — focus on what this change contributed.)

**Code reviewer returns:** Strengths, Issues (Critical/Important/Minor), Assessment
