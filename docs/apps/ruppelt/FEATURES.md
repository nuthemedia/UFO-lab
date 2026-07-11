# Ruppelt Features

Current core features:

- Record search.
- Release, agency, type, and public-status filtering.
- Carousel and list views.
- Saved records via localStorage.
- Public-disclosure status chips and detail panel.
- Japanese title and description display.
- A dedicated `/ruppelt/videos` viewer for official PURSUE videos.

Japanese full-text feature direction:

- Show a `日本語全文` action on cards when a shared translation exists.
- Show `全文未対応` when full-text OCR / translation is unavailable.
- Open a mobile-friendly viewer with `要約`, `日本語全文`, `英語OCR`, and `出典` tabs.
- Keep the default search as `資料説明`.
- Add a separate `全文` search mode for records with full-text data.

Video viewer:

- Show one DVIDS player at a time without autoplay.
- Navigate with previous/next controls, swipe outside the player, or a searchable video list.
- Filter by release, agency, public-disclosure status, and saved records.
- Share and restore `id`, `q`, `release`, `agency`, `status`, and `saved` URL state.
- Share `ruppelt.savedRecordIds` with the main record browser.
- Keep an always-visible link to the official DVIDS page as the playback fallback.
