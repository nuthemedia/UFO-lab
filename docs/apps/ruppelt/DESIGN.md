# Ruppelt Design

Ruppelt should feel like a calm document browser, not a military terminal or conspiracy site.

Design priorities:

- Mobile-first reading and scanning.
- Light background, restrained borders, compact controls.
- Cards for record browsing.
- Carousel as the default exploration mode, list as the comparison mode.
- Full text opens in a viewer, not inside the card.

For long Japanese full-text translations, use a focused viewer with tabs and a scrollable reading area. Avoid embedding a PDF viewer in the MVP.

The main record browser is the place to find and compare material. `/ruppelt/videos` is a separate place to watch official PURSUE videos:

- Keep exactly one active video player on screen and never autoplay it.
- On mobile, prioritize the 16:9 player, readable metadata, and 44px or larger previous/list/next controls.
- Keep swipe navigation outside the embedded player so DVIDS playback controls remain reliable.
- Use a bottom sheet for the mobile video list and a persistent side list on desktop.
- Load thumbnails in the list, never additional video iframes.
