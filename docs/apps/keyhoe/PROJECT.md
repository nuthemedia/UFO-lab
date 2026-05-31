# Keyhoe Project

Keyhoe v0.5 is a lightweight Japanese checker for overseas UFO and UAP news.

## Audience

- Japanese readers who want to quickly understand English-language UFO/UAP news.
- Readers who want official updates, media reports, and online discussion separated by category.

## MVP Scope

- `/keyhoe` shows the current feed from `public/data/keyhoe-today.json`.
- `/keyhoe/about` explains what Keyhoe does and how to read it.
- The app presents Japanese headlines, summaries, importance, source labels, and links back to originals.
- The feed can be generated locally with `scripts/build-keyhoe-today.mjs`.

## Out Of Scope

- User accounts.
- User submissions.
- Paid features.
- Treating AI-generated summaries as primary sources.

Detailed legacy spec: `docs/apps/keyhoe-mockup-spec.md`.
