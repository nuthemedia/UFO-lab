# Drake AGENTS.md

When working on Drake, read these files before implementation:

1. `docs/apps/drake/PROJECT.md`
2. `docs/apps/drake/DESIGN.md`
3. `docs/apps/drake/FEATURES.md`
4. `docs/apps/drake/DATA.md`

Likely implementation paths:

- `app/drake/`
- `data/drake/`
- `public/data/`
- `components/`
- `lib/`

Keep changes focused on the requested app. Do not reorganize other app docs or migrate legacy specs unless explicitly requested.

Before changing behavior not covered by the docs, update the relevant Drake doc first or ask for clarification.

Verification:

- `curl -I http://127.0.0.1:3000/drake`
- Add app-specific build, data, or API checks here once they exist.

Use `npm run dev` first if the local server is not already running.
