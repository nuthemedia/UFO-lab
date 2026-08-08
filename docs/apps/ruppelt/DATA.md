# Ruppelt Data

Ruppelt keeps official source metadata separate from Japanese helper data.

Data rules:

- `data/pursue/pursue-records.json` is the lightweight card index.
- `source` contains only war.gov CSV-derived fields.
- Japanese translations of source fields live under `ja`.
- Full OCR, full-text translation, summaries, and source provenance are shared assets, not Ruppelt-only data.
- Shared Japanese full-text translations live under `data/shared/translations/ja/`.
- Shared OCR and provenance are read from `data/shared/pursue-document-bundles.json`.

Current translation state:

- Japanese full-text translations are available for 203 records, including 41 Release 03 records, 12 Release 04 records, and 17 Release 05 records.
- Release 03 records are included in the lightweight index with Japanese source-field translations.
- Release 03 includes Japanese full-text translations for 41 OCR-backed records. The remaining 11 OCR-backed giant records are intentionally kept as OCR-search-only / summary-first records rather than full Japanese translations.
- Records without full-text data should be described as `全文OCR未取得`, not as missing official source data.
- Machine translations must be labeled as machine translated and unreviewed unless review status says otherwise.
- Japanese full-text assets must contain document text only. Do not store model preambles, translation instructions, requests for missing input, or standalone labels such as `日本語訳` in `fullTextJa`.
- Preserve document structure that belongs to the source, including page markers, redaction markers, classification labels, names, dates, file numbers, and explicit OCR uncertainty.
- Audit translation completeness against the source OCR. A record with fewer than 8 Japanese characters per 100 source Latin letters is a conservative retranslation candidate and must not be treated as a completed Japanese full-text translation without review.

Release 03 OCR candidate source:

- `abigailhaddad/ufo-releases` publishes `data/text/<id>.txt` OCR/extracted text for many war.gov UFO records.
- Release 03 maps by title / official URL, not by numeric id, because upstream numbering differs from Ruppelt ids.
- Current audit result: 72 Release 03 records map to upstream records; 52 have upstream OCR text and 20 do not.
- The upstream repository has no declared GitHub license. Do not commit upstream OCR full text unless permission/license status is explicitly accepted.
- Use `scripts/audit-release03-ocr-source.mjs` for coverage checks and `scripts/audit-release03-prior-disclosure-candidates.mjs` for first-disclosure review candidates.
- If OCR is accepted or regenerated from official files, store it in `data/shared/pursue-document-bundles.json` with source provenance, then generate Japanese full-text translations under `data/shared/translations/ja/`.

Release 03 large-document policy:

- Do not machine-translate very large OCR documents by default.
- `scripts/generate-release03-ja-translations.mjs` skips OCR texts over 250,000 characters unless `--include-large` is explicitly passed.
- Giant records should use English OCR search, Japanese summaries, and search-hit/local excerpt translation rather than full-document Japanese translation.

Release 03 public-disclosure review:

- Release 03 prior-disclosure data is generated with `scripts/build-release03-prior-disclosures.mjs`.
- The script writes `data/pursue/prior-disclosures.json` and a review trail at `data/pursue/release03-prior-disclosure-audit.json`.
- Existing classification/audit datasets were checked first. No Release 03 equivalent of the Release 01 external audit was found in the checked sources.
- `abigailhaddad/ufo-releases` is used as metadata/OCR support only; it is not a prior-disclosure classification source.
- Release 03 classifications are therefore Ruppelt provisional review data, not an external audit import.
- The Release 03 provisional counts are `初公開 34`, `既に公開済み 29`, and `一部公開済み 9`.
- Historical CIA/NASA/FBI/Project Blue Book style records should use archive/catalog evidence with medium confidence unless an exact prior file match is confirmed.
- Recent FBI/AARO/DOW event packages should avoid overclaiming: use low confidence when no prior same-file publication is found.
- Keep `known_case_new_file` out of Release 03 UI data unless the product spec explicitly brings that label back.

Release 04 metadata:

- Release 04 was published on July 10, 2026 and adds 40 records: 14 PDFs, 19 videos, 3 images, and 4 audio records.
- The official source is `https://www.war.gov/Portals/1/Interactive/2026/UFO/uap-data.csv?release=4` and the official release page is `https://www.war.gov/UFO/release/04/`.
- war.gov may return an HTML access-denied page to command-line clients. `scripts/import-pursue-release.mjs` rejects HTML responses; use a browser-downloaded CSV with `--input` when needed.
- Release 04 source metadata was checked against all 40 records shown by the official release page. The machine-readable mirror at `abigailhaddad/ufo-releases` was used only to transport matching CSV fields when direct CLI download was blocked.
- Release 04 includes Japanese translations of the official title, release, agency, location, type, and description fields.
- Release 04 initially shipped without full text. It now adds OCR, Japanese full-text translations, summaries, and shared document bundles for 12 PDF records; 28 media/OCR-missing records remain metadata-search-only.
- Release 04 public-disclosure status is initially unreviewed and is shown as `未判定`.

Release 04 OCR and translation:

- `abigailhaddad/ufo-releases` maps all 40 Release 04 records and currently provides OCR/extracted text for 12 of the 14 PDF records (about 650,000 source characters).
- Use `scripts/audit-release04-ocr-source.mjs` to verify coverage and `scripts/import-release04-ocr-from-abigail.mjs` to import accepted OCR with provenance.
- The repository license is not declared. Release 04 OCR is stored only under the user's existing explicit acceptance, with `unverified_accepted` provenance; the official war.gov file remains the source of truth.
- DOW-UAP-D095 and DOW-UAP-D096 currently have no upstream OCR text. Attempt extraction from browser-downloaded official PDFs; otherwise retain `全文OCR未取得`.
- Images and videos remain metadata-search-only. Audio is added to full-text search only when a trustworthy existing transcript is found; this workflow does not create new AI transcriptions.
- OCR-backed Release 04 documents may receive machine-generated Japanese full-text translations and summaries. Run `scripts/generate-release03-ja-translations.mjs --release-id release_04`; the legacy filename is retained for compatibility, but the script now accepts an explicit release id.
- For large OCR documents, `--chunk-chars 24000` may be used to reduce API round trips while keeping each source/translation pair within the model context.
- Keep translations marked machine-generated and unreviewed.

Release 04 public-disclosure review:

- Search existing classification datasets before applying Ruppelt review. No Release 04 equivalent of the Release 01 external audit was found in the checked sources.
- Generate the provisional review with `scripts/build-release04-prior-disclosures.mjs`; the audit trail is stored in `data/pursue/release04-prior-disclosure-audit.json`.
- Historical documents use archive/catalog matches with medium confidence. NASA images and audio use `partial` when the source mission material is public but the exact PURSUE package is not fully matched.
- Recent DOW sensor videos and recent incident reports use `first_time_public` only with low confidence when no prior same-file publication is found.
- All Release 04 classifications remain `manualReviewRequired: true` and must expose evidence links in the detail panel.

Release 05 metadata:

- Release 05 was published on August 7, 2026 and adds 41 records: 22 PDFs, 16 videos, and 3 images. The complete index grows from 334 to 375 records and the video viewer grows from 104 to 120 records.
- The official source is `https://www.war.gov/Portals/1/Interactive/2026/UFO/uap-data.csv?release=5`; the official page is `https://www.war.gov/UFO/?releaseDate=Release+05&release=05`.
- When war.gov blocks command-line CSV downloads, the machine-readable mirror at `abigailhaddad/ufo-releases` may transport the matching official fields only after all 41 titles and official URLs are checked against the official page.
- Release 05 includes Japanese translations of the official title, release, agency, location, type, and description fields. It does not add independent tags, summaries, or interpretive metadata to the card index.

Release 05 OCR and translation:

- `abigailhaddad/ufo-releases` maps all 41 Release 05 records and provides OCR/extracted text for 17 PDF records. The remaining 24 image/video/OCR-missing records stay metadata-search-only.
- Release 05 OCR is stored under the user's existing acceptance of the undeclared upstream license, with `unverified_accepted` provenance and the official war.gov file retained as the source of truth.
- Use `scripts/audit-pursue-release-ocr-source.mjs --release-id release_05` for coverage checks and `scripts/import-pursue-release-ocr-from-abigail.mjs --release-id release_05 --accept-unverified-license` for the accepted import.
- Normalize pathological horizontal whitespace before search indexing and machine translation. Preserve page markers, redaction markers, names, dates, document numbers, and OCR uncertainty.
- The 17 normalized OCR texts have machine-generated Japanese full-text translations and Japanese/English summaries under the existing 250,000-character processing limit. They remain marked machine-generated and unreviewed.
- Do not place OCR or Japanese full text in `data/pursue/pursue-records.json`; read it through shared bundles and document APIs.
- Audit all Japanese full-text translations against their source OCR. A Japanese-character count below 8% of the source Latin-character count, or an AI input request/process response, requires retranslation.
- Save retranslation output only after it passes the quality check; otherwise preserve the existing file and report the failure.
- Remove translation headings and model process notes from the readable body while preserving page markers, redactions, classification labels, `REDACTED`, `ILLEGIBLE`, and explicit OCR uncertainty.
- Store the reproducible audit in `data/pursue/pursue-translation-quality-audit.json`.

Release 05 public-disclosure review:

- Search for an existing Release 05 classification dataset before applying Ruppelt review. If no equivalent of the Release 01 external audit exists, classify all 41 records as provisional Ruppelt review data.
- Use direct archive or catalog links when available. A generic search page alone is not sufficient evidence for `previously_public` or `partial`.
- Use low confidence for `first_time_public` and choose `unknown` when a same-file publication history cannot be assessed reliably.
- Keep every Release 05 provisional classification `manualReviewRequired: true` and expose its evidence links in the detail panel.
- Generate the provisional review with `scripts/build-release05-prior-disclosures.mjs`; keep the audit trail in `data/pursue/release05-prior-disclosure-audit.json`.

Future release import:

- Add the release definition to `scripts/import-pursue-release.mjs`, `scripts/build-pursue-index.mjs`, and `lib/pursue.ts` before importing a new release.
- Run the importer with explicit `--release-id`, `--release-date`, and either the official `--url` or a browser-downloaded `--input` file.
- Rebuild the lightweight index and search index, then verify that older record ids and shared full-text assets are unchanged.
