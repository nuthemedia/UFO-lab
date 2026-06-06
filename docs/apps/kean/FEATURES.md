# Kean Features

## Core Features

- Explain what UFO/UAP disclosure is.
- Show the modern disclosure timeline from 2017 onward.
- Present a "key UAP to know" index for Tic Tac, Gimbal, and GoFast.
- Provide individual UAP pages with explanation, cautions, sources, and official video links.
- Show a compact Tic Tac explanatory 3D model on the portal home as a small visual entry point; mobile can place it near the top, while desktop keeps it secondary to the reading guide.
- Link from the portal home to Ruppelt with the label `米国UFO機密開示情報を日本語で読む`.
- Present the main people involved by category.
- Open people index cards in a detail modal; keep individual person pages as direct SEO URLs.
- Filter the people index by tag query parameters.
- Use generated illustration portraits as the on-site image source for people cards and dialogs.
- Use the Tic Tac GLB model as an interactive explanatory visual on the Tic Tac page and as a smaller portal-home teaser.
- In the Tic Tac viewer, the initial scene rotates horizontally as a whole; once the user taps or drags, whole-scene rotation stops and drag controls only the UAP body.
- Keep confirmed facts, claims, and cautions visually separated.
- Provide SEO metadata, Kean-specific OG images, Twitter cards, and JSON-LD for the portal home, person detail pages, and UAP detail pages.

## User Flow

1. Start at `/kean`.
2. Read the basic explanation, then move into history or people.
3. Open UAP pages to inspect representative public videos and source-aware cautions.
4. Open people cards to inspect modal details, tags, and sources.
5. Use the navigation links to move between the main sections.

## States

- Missing illustration: show the placeholder instead of falling back to old photo assets in the UI.
- Modal open: lock background scroll and allow Escape to close.
- No sources: show a quiet empty note instead of breaking the layout.
- Tag filter with no matches: show a quiet empty note and a link back to the people index.
- UAP official video unavailable or unsupported in-browser: show the official source link instead of breaking the layout.
- Tic Tac model load failure: show a quiet fallback card in the model frame.

## Acceptance Criteria

- The people index, history cards, and detail modal all resolve the same generated portrait source for a given person.
- People index cards open the shared person detail modal; `/kean/people/[id]` remains available as a direct SEO URL.
- Person page tags use Japanese labels and link back to filtered people lists.
- No visible people image on Kean comes from the legacy photo set.
- The portrait audit script fails if a person is missing a generated illustration or its source path is wrong.
- `/kean/uap` lists Tic Tac, Gimbal, and GoFast and links to their detail pages.
- `/kean/uap/tic-tac` renders a nonblank interactive Three.js canvas when the model is available.
- Tic Tac model views show a visible, surface-shaded object rather than an empty grid or wire-only rendering.
- The portal-home Tic Tac model stays compact, does not push the reading guide too far down, and shows only a `Tic Tacページへ` link in its control area.
- `/kean`, `/kean/people/[id]`, and `/kean/uap/[id]` expose search-oriented Japanese titles, descriptions, OG images, and structured data without presenting unverified claims as facts.
