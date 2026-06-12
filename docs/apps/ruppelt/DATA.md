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

- Japanese full-text translations are available for 133 records.
- Release 03 records are included in the lightweight index with Japanese source-field translations.
- Release 03 does not include Japanese full-text translations yet; do not add `data/shared/translations/ja/` files for Release 03 unless full-text translation work is explicitly requested.
- Records without full-text data should be described as `全文OCR未取得`, not as missing official source data.
- Machine translations must be labeled as machine translated and unreviewed unless review status says otherwise.
