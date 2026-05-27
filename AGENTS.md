# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 5. Project Preparation Before Implementation

- Do not jump straight into implementation for a new app, a large feature addition, a large UI change, a routing change, a data structure change, API integration, or any change that affects brand or product direction.
- First review the relevant `README.md` and `docs/`.
- If needed, create or update the specification, work rules, or task breakdown file before coding.
- Then implement in small task-sized steps.
- Do not use preparation as a reason to rewrite broadly or add unnecessary specifications.

## 6. Default Task Execution Rule

- Unless the user explicitly names a different task, work on the first unfinished task in `docs/codex/next-tasks.md`.
- Do not read all of `docs/` every time; only read the documents directly related to the current task.
- Before implementation, provide a short plan.
- The plan must include the documents read, the task to execute, the files you expect to change, and the files you will not change.
- Implement only one small task per work session.
- If the first unfinished task is too large, do not implement it; break it into smaller tasks in `next-tasks.md` and stop.

## 7. Documentation Maintenance

- Treat documentation updates as part of the definition of done.
- If you change product behavior, routes, UI structure, app names, display labels, environment variables, user-facing copy, feature scope, API behavior, setup steps, build steps, data structures, or data sources, always check whether `README.md` or `docs/` needs an update.
- If needed, update documentation with the smallest possible diff.
- If not needed, report `Documentation update not needed`.
- If implementation and documentation disagree, do not silently force one side to match the other; report the mismatch.
- Do not rewrite README files or docs wholesale.

## 8. Required Final Report Format

At the end of every task, always report in the following format:

- Plan:
  - Summary of the work performed
- Changed files:
  - List of files changed
- Verification:
  - Commands used to verify
  - If verification could not be run, the reason
- Documentation:
  - `Documentation updated: [files]`
  - or `Documentation update needed but not included because: [reason]`
  - or `Documentation update not needed`
- Task queue:
  - `Updated: [files]`
  - or `Update not needed because: [reason]`
- Notes:
  - Any remaining issues, decisions deferred, or open questions

## Git / Deployment Rules

- Do not push directly to `main`.
- Always create a `feature/...` branch for changes.
- Push changes to the feature branch.
- Create a Pull Request after changes are complete.
- Use Vercel Preview Deployment for review.
- Do not merge into `main` or trigger production deployment without explicit user approval.
## 9. Task Queue Maintenance

- If the current task comes from `docs/codex/next-tasks.md`, update that file before marking the work complete.
- Mark completed tasks as checked.
- If a task is only partially complete, leave it unchecked and add a short note about what remains.
- If you discover additional follow-up work during implementation, add it as a small unchecked task.
- Do not mark a task complete until the requested change, verification, and documentation check are all finished.
- Include whether the task queue was updated in the final report.
