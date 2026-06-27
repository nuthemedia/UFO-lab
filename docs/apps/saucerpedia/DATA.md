# 空飛ぶ円盤辞典 - UFO Encyclopedia Data

## Data Sources

現在のMVPは外部APIや生成JSONを使わず、`data/saucerpedia/*.ts` のローカルTypeScriptデータを直接読み込みます。

- `data/saucerpedia/terms.ts`
- `data/saucerpedia/people.ts`
- `data/saucerpedia/events.ts`
- `data/saucerpedia/history.ts`
- `data/saucerpedia/misidentifications.ts`
- `data/saucerpedia/fakes.ts`
- `data/saucerpedia/resources.ts`
- `data/saucerpedia/motifs.ts`
- `data/saucerpedia/knowledge.ts`

## Types And Shape

各データファイルは、型定義、カテゴリまたは種別配列、項目配列を同じファイル内で export します。

`/saucerpedia` トップページと各カテゴリページは同じローカルデータを共有します。トップページは抜粋とカテゴリ導線だけを表示し、全件一覧はカテゴリページで扱います。

`/saucerpedia/search` は、`data/saucerpedia/knowledge.ts` の `saucerpediaEntities` と各データの概要情報を使うクライアント側横断検索です。DB、API、本格全文検索エンジンは使いません。

共通方針:

- `id`: UI選択に使う安定ID。
- `order`: 一覧表示の学習順。用語カードでは必須で、配列順ではなく `order` 昇順で表示する。
- `name`: 日本語表示名。
- `englishName`: 英語名、正式名、別名の表示に使う任意フィールド。
- `category` または `kind`: フィルターに使う分類。
- `summary`: 一覧カード用の短い説明。
- `quickRead`: 詳細カードの「30秒でわかる」本文。
- `tags` または `relatedTerms`: 一覧カードや関連表示に使う短いラベル。

関連項目の方針:

- 表示データ本体は当面ローカルTypeScript配列のまま管理する。
- `data/saucerpedia/knowledge.ts` が全カテゴリを `{ type, id }` で索引化する。
- `SaucerpediaEntityType`: `term`, `person`, `event`, `history`, `misidentification`, `fake`, `resource`, `motif`, `product`。
- `SaucerpediaRelation`: `{ type, id, label? }`。表示名、カテゴリ、URL、概要は `resolveSaucerpediaRelation` で解決する。
- 既存の `relatedTerms`, `relatedPeople`, `relatedEvents`, `relatedProducts` は、UIでは `getRelationsForEntity` を通じてIDベース関連へ正規化する。
- URLは個別詳細ページではなく、カテゴリページ上の選択状態へ接続する。例: `/saucerpedia/terms?item=uap`。
- 外部プロダクトは `product` relation として `kinichi`, `kean`, `clark`, `ruppelt`, `yusuke` を定義する。
- 検索結果と詳細内の関連カードは、このIDベース索引から表示名、カテゴリ、URL、概要を解決する。
- 「出典・参考資料」パネルは、初期版では関連 `resource` と `product` を表示する。正式な外部出典URLは今後 `sources` フィールドを追加して扱う。
- 形状はまだ Saucerpedia 内の独立カテゴリにしない。横断検索では `円盤型`, `球形`, `三角形` など最小限のローカル候補を表示し、詳細分類は Kinichi へ誘導する。
- ハイネック分類系の用語カード（NL、DD、RV、CE1〜CE3、S-P表）は、略称を `aliases` に持つ正式な `term` として管理する。J・アレン・ハイネック、近接遭遇、代表事件とは相互参照させ、表示名文字列は `knowledge.ts` の索引でIDへ解決する。

辞典別の主な型:

- `SaucerpediaTerm`: 用語。`translation`, `era`, `detail`, `relatedTerms`, `relatedPeople`, `relatedEvents`, `relatedProducts` を持てる。
- `SaucerpediaPerson`: 人物。`period`, `role`, `relatedTerms`, `relatedEvents`, `relatedPeople` を持てる。
- `SaucerpediaEvent`: 事件。`year`, `date`, `location`, `whatHappened`, `relatedPeople`, `relatedTerms`, `relatedShapes` を持てる。
- `SaucerpediaHistoryCard`: 歴史カード。`eraLabel`, `title`, `yearRange`, `summary`, `quickRead`, `milestones`, `relatedTerms`, `relatedEvents` を持つ。
- `SaucerpediaMisidentification`: 誤認例。`kind`, `whyItLooksLikeUfo`, `howToTell`, `commonAppearance`, `relatedTerms` を持つ。
- `SaucerpediaFake`: フェイク・確認方法。`kind`, `whyBelievable`, `howToCheck`, `relatedTerms` を持つ。
- `SaucerpediaResource`: 資料・機関。`kind`, `era`, `whatItDid`, `relatedPeople`, `relatedTerms` を持てる。
- `SaucerpediaMotif`: 体験モチーフ。`experienceContext`, `relatedEvents`, `relatedPeople`, `relatedTerms` を持てる。

将来の出典データ候補:

- `sources`: 正式な出典・参考資料。`type`, `title`, `publisher`, `year`, `url`, `note` などを想定する。
- `sources` を追加する場合も、捏造URLを入れず、確認済みの一次資料、報道、書籍、政府文書、研究資料だけを扱う。

## Scripts

現時点で saucerpedia 専用の生成スクリプトはありません。

確認に使う既存スクリプト:

- `npm run verify:saucerpedia-knowledge`: 全関連項目が実在する `{ type, id }` または定義済み product を指すことを確認する。
- `npm run build`: Next.jsビルドと型チェックの確認。
- `npm run dev`: ローカル表示確認用の開発サーバー。

## Environment Variables

現時点で saucerpedia 専用の環境変数はありません。

データはローカルTypeScriptモジュールから読み込むため、APIキーや外部サービス設定なしで表示できます。
