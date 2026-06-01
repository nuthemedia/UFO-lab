# Jacques Data

## Data Sources

- 編集上の参照元: `/Users/juoz/Desktop/Jacques-research-work/phase0a2-vallee-research-notes.md`
- v0.5 モックでは Markdown を実行時に読まず、採用候補を `data/jacques/mockData.ts` に静的転記する。
- Wikipedia などの補助情報は背景確認として扱い、ヴァレ本文の完全代替としては表示しない。
- カード画像は `public/images/jacques/` に保存し、`image` には `/images/jacques/{cardId}.png` 形式の公開パスを持たせる。

## Types And Shape

`JacquesCard` はカード表示に必要な最小情報を持つ。

- `id`
- `title`
- `displayTitle`
- `category`
- `yearLabel`
- `locationLabel`
- `cultureArea`
- `shortSummary`
- `description`
- `motifs`
- `image`
- `valleeRelation`
- `certaintyLevel`
- `wikiLinks`

`JacquesConnection` は `connections` 配列として管理する。カード側に `linkedCardIds` は持たせない。

- `id`
- `fromCardId`
- `toCardId`
- `connectionTitle`
- `connectionSummary`
- `adoptionStatus`
- `relationBasis`
- `cautionLevel`
- `displayMode`
- `connectionShape`
- `sharedMotifs`
- `uiPoint`
- `skepticNote`
- `faithContextNote`
- `needsVerification`

表示対象は `adoptionStatus: adopt`、`displayMode !== hidden`、`connectionShape !== graph_only` の接続だけにする。

## Scripts

現時点では Jacques 専用のデータ生成スクリプトはない。モック確認は `npm run build` とローカル `/jacques` 表示で行う。

## Environment Variables

Jacques v0.5 モックでは環境変数を使わない。
