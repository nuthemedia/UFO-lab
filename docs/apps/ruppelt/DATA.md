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

- Japanese full-text translations are available for 174 records, including 41 Release 03 records.
- Release 03 records are included in the lightweight index with Japanese source-field translations.
- Release 03 includes Japanese full-text translations for 41 OCR-backed records. The remaining 11 OCR-backed giant records are intentionally kept as OCR-search-only / summary-first records rather than full Japanese translations.
- Records without full-text data should be described as `全文OCR未取得`, not as missing official source data.
- Machine translations must be labeled as machine translated and unreviewed unless review status says otherwise.

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
