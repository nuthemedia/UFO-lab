# Jenny - UFO REPORT ANALYZER AGENTS.md

When working on Jenny - UFO REPORT ANALYZER, read these files before implementation:

1. `docs/apps/jenny/PROJECT.md`
2. `docs/apps/jenny/DESIGN.md`
3. `docs/apps/jenny/FEATURES.md`
4. `docs/apps/jenny/DATA.md`

Likely implementation paths:

- `app/jenny/`
- `data/jenny/`
- `public/data/`
- `components/`
- `lib/`

Keep changes focused on the requested app. Do not reorganize other app docs or migrate legacy specs unless explicitly requested.

Before changing behavior not covered by the docs, update the relevant Jenny - UFO REPORT ANALYZER doc first or ask for clarification.

Verification:

- `curl -I http://127.0.0.1:3000/jenny`
- `npm run test:jenny`
- `npm run build`
- 実API確認はAI Gatewayキーのある環境で行い、入力本文をログへ出さない。

Use `npm run dev` first if the local server is not already running.
