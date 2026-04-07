---
name: archiving
description: "Use when all tasks are complete and the user wants to finalize a change. Merges Delta Specs into main specs and archives the change folder."
---

# Archiving Changes

Finalize a completed change by merging its Delta Specs into the main specifications and archiving the change for history.

**Announce at start:** "I'm using the archiving skill to finalize this change."

## Checklist

1. **Verify completion** — check all Tasks in tasks.md are checked
2. **Merge Delta Specs** — apply ADDED/MODIFIED/REMOVED to main `specs/specs/`
3. **Move to archive** — `specs/changes/<name>/` → `specs/changes/archive/YYYY-MM-DD-<name>/`
4. **Report results**

## The Archive Process

### Step 1: Verify Completion

Read `specs/changes/<change-name>/tasks.md`. Check if all tasks are marked `[x]`.

- **All complete:** Proceed to Step 2.
- **Incomplete tasks:** Warn the user but allow archiving if they confirm.

### Step 2: Merge Delta Specs

For each delta spec file in `specs/changes/<change-name>/specs/`:

1. Find the corresponding main spec in `specs/specs/<domain>/spec.md`
2. Apply the delta:
   - **ADDED Requirements** → Append to end of main spec's Requirements section
   - **MODIFIED Requirements** → Replace the matching Requirement in main spec
   - **REMOVED Requirements** → Delete the matching Requirement from main spec
3. If main spec doesn't exist yet (greenfield), create it from the delta

### Step 3: Move to Archive

```bash
# Move change folder to archive with date prefix
specs/changes/<name>/ → specs/changes/archive/YYYY-MM-DD-<name>/
```

Preserve ALL artifacts in the archive: proposal.md, specs/, design.md, tasks.md.

### Step 4: Report

```markdown
✅ Change archived: [change-name]

**Specs merged:**
- specs/specs/[domain]/spec.md — [N] requirements added, [M] modified, [K] removed

**Archived to:**
- specs/changes/archive/YYYY-MM-DD-[change-name]/

Main specifications are now updated. Ready for the next change.
```

## Why Archive Matters

- **Clean state.** `specs/changes/` shows only work in progress
- **Audit trail.** Archive preserves the full context — not just what changed, but the proposal, design, and tasks
- **Spec evolution.** Specs grow organically as changes are archived, building comprehensive specifications over time

## Iron Laws

- **NEVER delete a change folder without archiving.** The archive preserves the "why" behind every change.
- **NEVER merge specs without the user's confirmation.**
- **Always preserve all artifacts in the archive.** proposal.md, design.md, tasks.md — all of them.
