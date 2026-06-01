# Jacques AGENTS.md

When working on Jacques, read these files before implementation:

1. `docs/apps/jacques/PROJECT.md`
2. `docs/apps/jacques/DESIGN.md`
3. `docs/apps/jacques/FEATURES.md`
4. `docs/apps/jacques/DATA.md`

Likely implementation paths:

- `app/jacques/`
- `data/jacques/`
- `public/data/`
- `components/`
- `lib/`

Keep changes focused on the requested app. Do not reorganize other app docs or migrate legacy specs unless explicitly requested.

Before changing behavior not covered by the docs, update the relevant Jacques doc first or ask for clarification.

Verification:

- `curl -I http://127.0.0.1:3000/jacques`
- Add app-specific build, data, or API checks here once they exist.

Use `npm run dev` first if the local server is not already running.
