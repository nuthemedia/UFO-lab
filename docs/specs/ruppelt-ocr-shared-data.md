# Ruppelt OCR and Shared Translation Data

Ruppelt uses the official war.gov PURSUE PDF URLs as the canonical source. OCR, translations, and summaries are auxiliary data for search and reading support.

## Data Layout

- `data/pursue/pursue-records.json` remains the lightweight card index. Do not store OCR full text or Japanese full translations here.
- `data/shared/pursue-documents/[documentId].json` stores shared document metadata keyed by stable PURSUE document id.
- `data/shared/ocr/[documentId].json` stores English OCR text and OCR provenance.
- `data/shared/translations/ja/[documentId].json` stores Japanese translation and Japanese/English summaries.
- `data/shared/search/description-index.json` is the lightweight description search index.
- `data/shared/search/fulltext-index.json` is the fulltext search index and should be loaded only when fulltext search is used.

## Source Policy

- Primary OCR source for the MVP is `zexiro/uap-disclosure-archive`, using committed files under `raw/text`.
- Additional OCR source is `BPSAI/pursue-index`, using committed `data/altered-ocr/**/pages.jsonl` files when they match Ruppelt records and improve coverage or text length.
- `AlexZhangji/ufo-pursue-open-atlas` is a valid auxiliary source because it is published under CC0 1.0.
- `DenisSergeevitch/UFO-USA` may be used for development comparison, but because the license is not clearly declared in the repository, do not store its full text in production data.
- Store OCR repository, file path, GitHub URL, raw URL, fetched timestamp, and license note with every imported OCR file.

## Review Status

- OCR imported from GitHub starts as `ocr_imported_unverified`.
- Records without a matched OCR source still receive a shared document metadata file and use `missing` for OCR status.
- Machine-generated or manually drafted MVP Japanese text starts as `machine_translation`.
- Summaries created for MVP start as `summary_generated`.
- Use `reviewed` only after human review.

## Current Coverage

- `data/shared/pursue-documents` covers all PURSUE records in the Ruppelt index.
- OCR files are stored when a matching approved OCR source exists. Current sources are `zexiro/uap-disclosure-archive` and `BPSAI/pursue-index`.
- Japanese full translations and summaries are stored only for generated or reviewed samples. Do not create placeholder Japanese text that is not an actual translation.
- Fulltext search includes records with English OCR text or Japanese full translation text. Records without OCR remain available through description search and metadata tabs.

## Full Japanese Translation Generation

- `scripts/generate-pursue-ja-translations.mjs` keeps the small checked-in sample mode by default.
- Use `node scripts/generate-pursue-ja-translations.mjs --all` only when `OPENAI_API_KEY` is set.
- The full run writes machine translations to `data/shared/translations/ja/[documentId].json` and marks them as `machine_translation` / `summary_generated` / `unreviewed`.
- Do not mark any machine generated translation as reviewed without human review.

## Product Boundary

The shared data under `data/shared` is product-neutral. Do not include Ruppelt-only UI labels or copy in shared translation files. Hoover, Aldrin, and future UFO Lab Tokyo products should be able to reuse the same `documentId`, official PDF URL, OCR, translation, and summary records.
