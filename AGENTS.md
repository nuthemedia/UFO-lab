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

## 5. App Documentation Workflow

Before implementing app-specific work, identify the target app slug.

- Read `docs/apps/{app-slug}/AGENTS.md` before changing app behavior, UI, data, routes, or operations.
- If `docs/apps/{app-slug}/AGENTS.md` does not exist, stop and report that planning docs need to be created first.
- Do not use `docs/apps/_template/` as an app specification. It is only a scaffold for planning docs.
- During planning, create or update `PROJECT.md`, `DESIGN.md`, `FEATURES.md`, and `DATA.md` for the target app.
- During mock or implementation work, follow the target app docs and avoid adding behavior that is not documented there.
- If implementation requires a product, UI, feature, data, API, or operational decision not covered by the app docs, update the relevant doc first or ask for clarification.
- Keep changes surgical: do not reorganize unrelated app docs, legacy specs, or shared data unless the current task explicitly requires it.

## 6. Production Route Protection

When making a new public site, app, route, or experiment live on Vercel:

- Do not run raw `vercel deploy --prod`. Use `npm run deploy:prod`.
- Treat local direct Vercel deploys as incomplete if route files are uncommitted or untracked.
- Ensure the route and its required data/assets/docs are committed to `main` before considering it safe from automated redeploys.
- Add the route's required files to `scripts/verify-production-routes.mjs`.
- `npm run deploy:prod` must pass from a clean, up-to-date `origin/main` checkout linked to the canonical `ufo-lab` Vercel project.
- Do not deploy from an old feature worktree or temporary worktree if it is missing any public route that already exists on production.
- If Keyhoe daily updates or any automated workflow can trigger production redeploys, verify that the workflow runs `npm run verify:production-routes` before committing/pushing generated data.

## 7. Quality Gates

CI (`.github/workflows/ci.yml`) runs on every push/PR to `main`: production route verification, search-index freshness check, `npm run lint`, and `next build`. All must pass.

- Run `npm run lint` before committing. ESLint uses the flat config in `eslint.config.mjs`.
- `react-hooks/set-state-in-effect` and `react-hooks/refs` are downgraded to warnings until the large client components (RuppeltBrowser, Kinichi viewers, OhtsukiChecker, Hynek mockups) are split. Do not add new violations.
- `data/shared/search/fulltext-index.json` is generated from the pursue bundles and Japanese translations. After changing `data/shared/pursue-document-bundles.json`, `data/pursue/pursue-records.json`, or `data/shared/translations/ja/`, regenerate it with `node scripts/build-pursue-search-index.mjs` and commit the result — otherwise `npm run verify:search-index` fails CI.
- Use `next/image` for local static images instead of `<img>`. Local image URLs with query strings must be allowed in `images.localPatterns` in `next.config.mjs`. Kean's `ImageAsset` carries optional `width`/`height` for intrinsic sizing.
- Compress images before adding them to `public/`: photos as JPEG at display-appropriate resolution, illustrations as palette PNG. Nothing in `public/` should exceed roughly 1.5MB without a stated reason.
