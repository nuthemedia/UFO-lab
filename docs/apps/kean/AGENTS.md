# Kean AGENTS.md

When working on Kean, read these files before implementation:

1. `docs/apps/kean/PROJECT.md`
2. `docs/apps/kean/DESIGN.md`
3. `docs/apps/kean/FEATURES.md`
4. `docs/apps/kean/DATA.md`

Kean work usually touches `/kean`, `/kean/about`, `/kean/history`, `/kean/people`, `data/kean/*`, `lib/keanPortrait.ts`, or `app/kean/portrait/[personId]/route.ts`.

Keep changes surgical. Do not rewrite unrelated UFO Lab Tokyo pages, shared docs, or legacy photo assets unless the current task explicitly requires it.

Before changing Kean behavior that is not covered by the docs, update the relevant Kean doc first or ask for clarification.

Verification:

- `npm run kean:verify-portraits`
- `npm run build`
- `curl -I http://127.0.0.1:3000/kean/people`

Use `npm run dev` first if the local server is not already running.
