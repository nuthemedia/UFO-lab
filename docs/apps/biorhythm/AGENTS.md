# バイオリズムマシン AGENTS.md

When working on バイオリズムマシン, read these files before implementation:

1. `docs/apps/biorhythm/PROJECT.md`
2. `docs/apps/biorhythm/DESIGN.md`
3. `docs/apps/biorhythm/FEATURES.md`
4. `docs/apps/biorhythm/DATA.md`

Likely implementation paths:

- `app/experiments/biorhythm/`
- `data/biorhythm/`
- `public/data/`
- `components/`
- `lib/`

Keep changes focused on the requested app. Do not reorganize other app docs or migrate legacy specs unless explicitly requested.

Before changing behavior not covered by the docs, update the relevant バイオリズムマシン doc first or ask for clarification.

Verification:

- `curl -I http://127.0.0.1:3000/experiments/biorhythm`
- Add app-specific build, data, or API checks here once they exist.

Use `npm run dev` first if the local server is not already running.
