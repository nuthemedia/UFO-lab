# Clark Data

## Data Sources

- 初期MVPでは API や外部フィードを使わず、`data/clark/` の静的 TypeScript データを唯一の表示ソースにする
- 事件ごとの 3D モデルは既存の `public/models/saucers/kenneth-arnold.glb` `public/models/saucers/adamski.glb` `public/models/saucers/billy-meier.glb` を使う
- 事件ごとの動画は `/Users/juoz/Desktop/Videos/kenneth.MOV` `/Users/juoz/Desktop/Videos/adamski.MOV` `/Users/juoz/Desktop/Videos/meier.MOV` を元に、`public/clark/videos/` に web 用アセットとして配置する
- poster 画像は `public/clark/posters/` に置く
- ケネス・アーノルド展示の報道場面背景には、Wikimedia Commons の Public Domain 画像 `Kenneth Arnold.jpg` を `public/clark/images/kenneth-arnold-press.jpg` として配置する
- ケネス・アーノルドのトリビア背景には、権利安全な関連画像を `public/clark/images/kenneth-trivia-*.jpg` として配置する。権利確認できない表紙画像は使わず、必要に応じて本人写真を再利用する
- ユーザー提供のケネス・アーノルド関連資料画像は、トリビア拡大表示用として `public/clark/images/kenneth-philosophy-card.jpg` と `public/clark/images/kenneth-flying-saucer-booklet.jpg` に配置する

## Types And Shape

- `ClarkCaseRecord` を基本単位とし、トップカード表示情報と個別ページ表示情報を同じレコードで持つ
- `ClarkCaseRecord` は少なくとも以下を持つ
- `slug`
- `title`
- `subtitle`
- `yearLabel`
- `placeLabel`
- `summary`
- `tags`
- `heroVideo`
- `heroVideoMobile`
- `heroPoster`
- `modelPath`
- `whatHappened`
- `scrollScenes`
- `person`
- `whyItMatters`
- `believerView`
- `skepticView`
- `neutralSummary`
- `nextCaseSlug`
- `ClarkScrollScene` は `id` `eyebrow` `title` `body` `visualMode` と、必要に応じて `imageSrc` `videoSrc` `quote` を持つ
- `ClarkPersonBlock` は `name` `role` `bio` `testimony` `impact` を持つ
- 初期MVPでは CMS 用スキーマや永続ストレージ用スキーマは作らない

## Scripts

- 必須の専用 script はまだ持たない
- 動画正規化は実装作業中に `avconvert` を使って行う
- poster 生成は macOS 標準ツールで行う
- 将来的に更新頻度が高くなった場合のみ、`scripts/` 配下へ Clark 用アセット生成 script を追加する

## Environment Variables

- 初期MVPでは Clark 専用の環境変数は使わない
- 動画や 3D モデルが読み込めない場合は、poster 画像または静止ビジュアルと本文を表示して読了可能な状態を保つ
