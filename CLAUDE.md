# CLAUDE.md

This project's rules live in **[AGENTS.md](AGENTS.md)**. Follow it in full:

- Sections 1–4: behavioral guidelines (Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution).
- Section 5: App Documentation Workflow — before app-specific work, read `docs/apps/{app-slug}/AGENTS.md` (and `PROJECT.md` / `DESIGN.md` / `FEATURES.md` / `DATA.md`). If those docs don't exist, stop and report.
- Section 6: Production Route Protection — never run raw `vercel deploy --prod`; use `npm run deploy:prod`. Routes/data/assets must be committed to `main` before going live.
- Section 7: Quality Gates — CI runs route verification, search-index freshness, lint, and build. Regenerate `fulltext-index.json` after changing pursue data; use `next/image` and compress assets before adding them.

This is a single Next.js app. Each folder under `app/` is a route, not a separate app — its per-route rules live in `docs/apps/{slug}/`, not in a per-folder CLAUDE.md.
