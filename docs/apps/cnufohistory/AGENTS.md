# 中国UFO史年表 AGENTS.md

When working on 中国UFO史年表, read these files before implementation:

1. `docs/apps/cnufohistory/PROJECT.md`
2. `docs/apps/cnufohistory/DESIGN.md`
3. `docs/apps/cnufohistory/FEATURES.md`
4. `docs/apps/cnufohistory/DATA.md`

Likely implementation paths:

- `app/cnufohistory/`
- `data/cnufohistory/`
- `public/data/`
- `components/`
- `lib/`

Keep changes focused on the requested app. Do not reorganize other app docs or migrate legacy specs unless explicitly requested.

Before changing behavior not covered by the docs, update the relevant 中国UFO史年表 doc first or ask for clarification.

Verification:

- `curl -I http://127.0.0.1:3000/cnufohistory`
- Add app-specific build, data, or API checks here once they exist.

Use `npm run dev` first if the local server is not already running.
