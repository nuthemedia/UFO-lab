# 空飛ぶ円盤辞典 - UFO Encyclopedia AGENTS.md

When working on 空飛ぶ円盤辞典 - UFO Encyclopedia, read these files before implementation:

1. `docs/apps/saucerpedia/PRODUCT.md`
2. `docs/apps/saucerpedia/PROJECT.md`
3. `docs/apps/saucerpedia/DESIGN.md`
4. `docs/apps/saucerpedia/FEATURE.md`
5. `docs/apps/saucerpedia/TERM_CARD.md`
6. `docs/apps/saucerpedia/PERSON_CARD.md`
7. `docs/apps/saucerpedia/EVENT_CARD.md`
8. `docs/apps/saucerpedia/MISIDENTIFICATION_CARD.md`
9. `docs/apps/saucerpedia/FAKE_CARD.md`
10. `docs/apps/saucerpedia/RESOURCE_CARD.md`
11. `docs/apps/saucerpedia/MOTIF_CARD.md`
12. `docs/apps/saucerpedia/HISTORY_CARD.md`
13. `docs/apps/saucerpedia/FEATURES.md`
14. `docs/apps/saucerpedia/DATA.md`

Likely implementation paths:

- `app/saucerpedia/`
- `app/saucerpedia/{terms,people,events,history,misidentifications,fakes,resources,motifs,search}/`
- `data/saucerpedia/`
- `data/saucerpedia/knowledge.ts`
- `public/data/`
- `components/`
- `lib/`

Keep changes focused on the requested app. Do not reorganize other app docs or migrate legacy specs unless explicitly requested.

Before changing behavior not covered by the docs, update the relevant 空飛ぶ円盤辞典 - UFO Encyclopedia doc first or ask for clarification.

Verification:

- `curl -I http://127.0.0.1:3000/saucerpedia`
- `npm run verify:saucerpedia-knowledge`
- `npm run build`

Use `npm run dev` first if the local server is not already running.
