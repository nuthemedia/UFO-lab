# Keyhoe AGENTS.md

When working on Keyhoe, read these files before implementation:

1. `docs/apps/keyhoe/PROJECT.md`
2. `docs/apps/keyhoe/DESIGN.md`
3. `docs/apps/keyhoe/FEATURES.md`
4. `docs/apps/keyhoe/DATA.md`
5. `docs/apps/keyhoe-mockup-spec.md`

Keyhoe work usually touches `/keyhoe`, `/keyhoe/about`, `public/data/keyhoe-today.json`, `data/keyhoe/sources.json`, `scripts/build-keyhoe-today.mjs`, or `.github/workflows/keyhoe-daily.yml`.

Keep changes focused on the requested correction. Do not reorganize other app docs or migrate legacy specs unless explicitly requested.

Before changing behavior not covered by the docs, update the relevant Keyhoe doc first or ask for clarification.

Verification:

- `npm run keyhoe:build:dry`
- `curl -I http://127.0.0.1:3000/keyhoe`
- `curl -I http://127.0.0.1:3000/keyhoe/about`

Use `npm run dev` first if the local server is not already running.
