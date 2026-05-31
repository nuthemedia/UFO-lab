# Keyhoe v0.5 MVP Spec

Keyhoe は、海外のUFO・UAPニュースを日本語で短時間確認するための軽量チェッカーです。
表示名は `Keyhoe v0.5`、補足コピーは `Keyhoe v0.5 - 海外UFO・UAPニュース日本語チェッカー` とする。

## Current Scope

- `/keyhoe` に当日分ニュースの表示UIを置く。
- `/keyhoe/about` に説明ページを置く。
- 表示データは `public/data/keyhoe-today.json` を使う。
- `scripts/build-keyhoe-today.mjs` でRSS / 公式フィードからローカル生成できる。
- ヒーロー、最終更新日時、3行サマリー、カテゴリ切り替え、ニュースカード、更新情報・フィードバック、Xシェア導線を確認する。
- カテゴリボタンは `すべて / 🇺🇸政府公式 / ニュース / ネットの話題` とする。
- OpenAI APIキーがある場合はAI要約・重要度判定を行い、ない場合は簡易フォールバックで生成する。
- OpenAI APIキーがある場合は、候補記事を最大30件AI採点し、日本語ヘッドライン・要約・重要度・3行サマリーを生成する。
- 今日の更新が少ないカテゴリは、直近の関連ニュース、公式資料、ネットの話題で補完する。公式は最大90日、ニュースとネットの話題は最大30日を目安にする。
- 公式カテゴリは、AARO / NASA UAP / war.gov / Defense.gov / ODNI / NARA / House Oversight / Senate Armed Services / Congress.gov を監視対象にする。トップページではなく、レポート、PDF、リリース、公聴会、公式書簡、公式資料ページをカード化する。
- ネットの話題カテゴリはReddit `r/UFOs` / `r/UAP` / `r/UFOB` を対象にする。Reddit OAuth envがある場合は公式API、ない場合はRSSフォールバックを試す。
- AI選定後も `official >= 1`、`news >= 6`、`buzz >= 5` を最低目安として補完し、件数ゼロのカテゴリを避ける。
- 公式カテゴリは同一ソース最大3件までを目安にし、単一公式サイトへの偏りを抑える。
- UIは初期12件を表示し、13件以上ある場合は `もっと見る` で最大30件まで表示する。
- カテゴリ切り替えはページ内の複数セクション表示ではなく、単一フィードの表示フィルタとして扱う。`すべて` は全カテゴリの記事を重要度順に並べる。
- OpenAIが失敗したfallback時も、カード主見出しと要約は日本語テンプレートで表示し、英語原題は `originalTitle` として補助表示に残す。
- fallback時も同一見出しの連続表示を避け、原題由来の補足で記事ごとの差分が分かる見出しにする。
- 要約は取得説明ではなく記事内容を表す。fallback時も `取得しました` や `記事として取得` のような文言は出さない。
- 生成時は記事ページのmeta description、JSON-LD、本文冒頭から軽量な本文ヒントを抽出し、OpenAI要約とfallback要約の材料にする。本文全文は公開JSONに保存しない。
- 常時表示の要約は `記事は「...」を中心に扱っています` のような分類文ではなく、具体的な内容文から始める。
- カード要約は一覧で内容を把握できる2文程度を目安にし、必要な場合は `要約` で `detailJa` の詳細要約を展開できる。
- `detailJa` は `summaryJa` の再掲や `この記事は...` の導入文ではなく、記事内容をより具体的に把握するための展開用要約として扱う。
- 今日の3行サマリーは取得状況ではなく、当日のニュース論点を表示する。取得件数、補完、未接続、AI判定などの運用説明は含めない。
- GitHub Actionsで1日1回 `public/data/keyhoe-today.json` を再生成し、差分がある場合だけコミットする。
- 更新時刻は毎朝7:00 JSTごろとし、OpenAIがタイムアウトした場合もfallback生成で更新を継続する。
- `/keyhoe` と `/keyhoe/about` はKeyhoe専用OG画像を使い、X投稿時のカード表示に対応する。

## Mock Data Shape

- `generatedAt`
- `overallSummary`
- `items`
  - `title`
  - `headlineJa`
  - `originalTitle`
  - `summaryJa`
  - `detailJa`
  - `sourceName`
  - `category`
  - `importanceScore`
  - `importanceLabel`
  - `whyItMattersJa`
  - `reliabilityLabel`
  - `cautionNote`
  - `originalUrl`
  - `freshnessLabel`
  - `collectionNote`
  - `aiScore`
  - `aiReason`
  - `tags`
  - `selectionMode`

## Data Build

```bash
npm run keyhoe:build
npm run keyhoe:build:dry
npm run keyhoe:build:mock
```

- `data/keyhoe/sources.json` に取得対象を定義する。
- `sourceMode` は `live-ai` / `live-fallback` / `mock` のいずれか。
- `OPENAI_API_KEY` がない場合も `live-fallback` としてローカル確認できる。
- `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` / `REDDIT_USER_AGENT` がある場合はReddit公式APIを使う。

## Local Check

Run the local Next.js server and open `/keyhoe`.

```bash
npm run dev
```

Use Responsively App with:

```text
http://localhost:3000/keyhoe
```
