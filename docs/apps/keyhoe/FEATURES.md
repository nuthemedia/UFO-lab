# Keyhoe Features

## Core Features

- Display daily overseas UFO/UAP items in Japanese.
- Filter by `すべて`, `🇺🇸政府公式`, `ニュース`, and `ネットの話題`.
- Switch feed order between `重要順` and `最新`.
- Apply `重要順` and `最新` within the selected category.
- Show source, freshness, importance, reliability/caution notes, summary, detail, and original URL.
- Provide X share and feedback/update guidance.
- Use Keyhoe-specific OG output for `/keyhoe` and `/keyhoe/about`.

## Content Rules

- Summaries must describe article content, not collection status.
- Avoid phrases like `取得しました` or `記事として取得` in user-facing summaries.
- Fallback output should still produce useful Japanese headlines and summaries.
- Today's three-line summary should describe the day's news points, not operational details.

## Acceptance Criteria

- No category is empty after normal generation.
- Official sources avoid over-weighting one site.
- Cards remain understandable when OpenAI is unavailable.

Detailed legacy spec: `docs/apps/keyhoe-mockup-spec.md`.
