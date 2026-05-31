# Keyhoe Data

## Data Sources

- `data/keyhoe/sources.json`: configured official, news, and online discussion sources.
- `public/data/keyhoe-today.json`: generated feed consumed by the UI.
- Reddit sources: `r/UFOs`, `r/UAP`, and `r/UFOB`.

## Generated Feed

The feed includes:

- `generatedAt`
- `overallSummary`
- `items`

Important item fields include `headlineJa`, `originalTitle`, `summaryJa`, `detailJa`, `sourceName`, `category`, `importanceScore`, `importanceLabel`, `whyItMattersJa`, `reliabilityLabel`, `cautionNote`, `originalUrl`, `freshnessLabel`, `tags`, and `selectionMode`.

## Scripts

- `npm run keyhoe:build`: generate `public/data/keyhoe-today.json`.
- `npm run keyhoe:build:dry`: print generated JSON without writing the file.
- `npm run keyhoe:build:mock`: restore development mock data.

## Environment Variables

- `OPENAI_API_KEY`: enables AI scoring, Japanese headlines, summaries, and importance generation.
- `OPENAI_KEYHOE_MODEL`: optional model override.
- `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USER_AGENT`: enable Reddit official API access.

Without OpenAI, Keyhoe uses Japanese fallback generation. Without Reddit OAuth, it tries RSS fallback.

Detailed legacy spec: `docs/apps/keyhoe-mockup-spec.md`.
