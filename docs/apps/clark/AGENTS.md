# Clark AGENTS.md

When working on Clark, read these files before implementation:

1. `docs/apps/clark/PROJECT.md`
2. `docs/apps/clark/DESIGN.md`
3. `docs/apps/clark/FEATURES.md`
4. `docs/apps/clark/DATA.md`

Likely implementation paths:

- `app/clark/`
- `data/clark/`
- `public/data/`
- `components/`
- `lib/`

Keep changes focused on the requested app. Do not reorganize other app docs or migrate legacy specs unless explicitly requested.

Before changing behavior not covered by the docs, update the relevant Clark doc first or ask for clarification.

Verification:

- `curl -I http://127.0.0.1:3000/clark`
- Add app-specific build, data, or API checks here once they exist.

Use `npm run dev` first if the local server is not already running.
