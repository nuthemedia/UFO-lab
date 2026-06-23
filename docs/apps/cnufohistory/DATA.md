# 中国UFO史年表 Data

## Current Data File

- Timeline data lives in `data/cnufohistory/timeline.ts`.
- UI code must read the structured data instead of keeping timeline seed records inline.
- Low-confidence or source-conflicted items may remain in the timeline, but `confidence`, `sourceStatus`, item `note`, and source `note` are internal editorial metadata and must not be shown in the reader UI.

## Stable IDs

- Timeline item IDs use `cn-ufo-{yyyyMMdd-or-yyyy}-{slug}`.
- Context/background items use `ctx-{yyyyMMdd}-{slug}`.
- IDs are stable references for future source review, linking, and per-item expansion.
- Do not rename an existing ID for copy edits. Add a new item only when the historical event itself changes.

## Date Shape

Each item has:

- `date.start`: sortable ISO-like date string.
- `date.end`: optional end date.
- `date.precision`: `day`, `month`, `year`, `approx`, or `conflicted`.
- `date.display`: Japanese display string.
- `date.dateCandidates`: optional conflicting candidate dates.

Use `precision: "conflicted"` when sources disagree. For the 1978 People's Daily item, keep `dateCandidates: ["1978-11-13", "1978-11-30"]` until a primary page image or official URL confirms the date.

## Categories

Data categories:

- `world-context`
- `media`
- `organization`
- `magazine`
- `sighting`
- `case`
- `conference`
- `qigong-context`
- `internet`
- `film`

The UI maps these to reader-facing filters: `背景`, `研究会`, `事件`, `雑誌`, `カルチャー`.

## Confidence And Source Status

`confidence` values:

- `high`: broadly supported by the checked sources.
- `medium`: useful enough to display, but still mostly secondary-source based.
- `low`: keep as an internal editorial signal for future source review.

`sourceStatus` values:

- `verified`: primary or authoritative source checked.
- `secondary-only`: currently supported by secondary/reference sources.
- `needs-primary`: needs primary source or direct article confirmation.
- `conflicted`: source disagreement exists and must be tracked in internal notes.

## Source Rules

- Each source entry has `label`, optional `url`, `type`, and optional `note`.
- Reader UI displays only linked source labels. Source type and source notes stay internal.
- Prefer primary sources for dates, names, original article titles, conference names, and circulation figures.
- Use careful wording for unverified events: `報告された`, `紹介された`, `資料では〜とされる`.
- Do not present a UFO case as factually proven. The app records cultural and historical circulation, not truth claims.
- Do not put internal editorial language such as `〜として扱う`, `確認中`, `物証は弱い`, or source-review reminders in reader-facing `body` copy.

## Visual Rules

- Timeline items may have an optional `visual` object with `src`, `alt`, and `visualType`.
- Initial visuals use `visualType: "line-illustration"` and are original reader-support illustrations.
- Visuals are monochrome line drawings, not evidence photos. They should make the event context understandable without labels, captions, signatures, or credit text.
- Reader UI displays only the visual itself. Editorial source, confidence, and production metadata stay separate.
- Store generated visual assets under `/public/cnufohistory/visuals/`.
- Do not reproduce magazine covers, film posters, news photos, or social media images directly unless reuse rights are separately verified.

## Review Notes

- `1980年5月` is treated as the rename to `中国UFO研究協会`; `中国UFO研究会` is separated into the 1983 second congress item.
- `『宇宙探索編集部』` is split into 2021 film-festival premiere and 2023 China theatrical release.
- Items such as the Qian Xuesen letter, qigong affiliation, Falun Gong context, 2011 internet sighting wave, and 2023 Xinhua article remain low-confidence or primary-source-needed until individually verified.

## Scripts

- No dedicated data generation script yet.
- For now, use TypeScript build plus a simple duplicate-ID check before shipping data changes.

## Environment Variables

- None.
