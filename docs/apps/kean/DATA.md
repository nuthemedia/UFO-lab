# Kean Data

## Data Sources

- `data/kean/people.ts`: canonical people records.
- `data/kean/labels.ts`: Japanese display labels for categories, beginner tiers, and tags.
- `data/kean/timeline.ts`: disclosure history timeline records.
- `data/kean/uap.ts`: key UAP records for Tic Tac, Gimbal, and GoFast.
- `data/kean/guide.ts`: beginner explanation and portal copy.
- `lib/keanPortrait.ts`: generated portrait asset helper.
- `public/kean/images/people/illustrations/{personId}.png`: canonical generated portrait illustrations.
- `app/kean/portrait/[personId]/route.ts`: legacy generated portrait endpoint that redirects to the canonical PNG.
- `public/kean/models/tictac/tic_tac_uap_ufo_with_warp_bubble.glb`: local Tic Tac explanatory model.

## Types And Shape

- `Person` includes `id`, `name`, `jaName`, `illustration`, optional legacy `portrait`, category, beginner tier, summary text, facts, claims, cautions, related events/people, tags, search queries, and sources.
- `Person.tags` remains stable tag keys; UI labels are resolved through `data/kean/labels.ts`.
- `TimelineEvent` includes `id`, chapter fields, visual theme, year label, title, image, summary text, what happened, importance, caution, related people, and sources.
- `RelatedPersonRef` uses `{ personId, relationToEvent }`.
- `ImageAsset` stores `src`, `alt`, `caption`, `credit`, `license`, `sourceUrl`, and `sourceName`.
- `KeanUapRecord` stores id, display names, summary, explanation sections, official video URL, sources, and optional model metadata.
- Person SEO metadata uses `jaName`, `name`, `aliases`, `tags`, `searchQueries`, category labels, and generated illustration paths.
- UAP SEO metadata uses `keanUapRecords`, including display names, short summaries, official video URLs, and source links.

## Scripts

- `npm run kean:verify-portraits`: checks that every person has a generated portrait asset with the expected `/kean/images/people/illustrations/{personId}.png` source and file.

## Environment Variables

- Kean does not require app-specific environment variables.
