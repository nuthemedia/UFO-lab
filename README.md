# UFO Lab Tokyo

「東京UFO研究室 / UFO Research Lab Tokyo」のブランドサイトと、UFO・UAPに関する複数のWebアプリをまとめて提供する Next.js プロジェクトです。

UFO Lab Tokyo は、UFO・UAP現象を冷静に観察、記録、検証するためのプロジェクトです。断定的な主張よりも、確認可能な根拠、資料、比較、追加検証を重視します。

## Brand

- 正式名称: 東京UFO研究室
- 英語名称: UFO Research Lab Tokyo
- 短縮名・ロゴ名: UFO Lab Tokyo
- タグライン: UFOはまだ解明されていないが確かに実在する現象である

## Apps

現在の公開面は以下です。

- `/`: 日本語ブランドサイト
- `/en`: 英語ブランドサイト
- `/ruppelt`: Ruppelt v1.1 - PURSUE日本語インデックス
- `/ruppelt/lp`: Ruppelt LP - アメリカ政府UAP・UFO機密解除資料を日本語で検索
- `/kean`: Kean - UFO・UAPディスクロージャー入門ポータル
- `/kean/about`: Keanについて
- `/kean/history`: Kean - ディスクロージャー年表
- `/kean/people`: Kean - 主要人物
- `/keyhoe`: Keyhoe v0.5 - 海外UFO・UAPニュース日本語チェッカー
- `/keyhoe/about`: Keyhoeについて
- `/ohtsuki`: Ohtsuki v0.5 - UFO画像AI判定チェッカー
- `/hynek`: Hynek - UFOファンタイプ診断
- `/hynek/dashboard`: Hynek - 日本のUFO観ダッシュボード
- `/ufo-image-checker`: 旧URL互換。`/ohtsuki` にリダイレクト

## Requirements

- Node.js 20 以上
- npm

## Getting Started

依存関係をインストールします。

```bash
npm install
```

開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで以下を開きます。

```text
http://127.0.0.1:3000/
```

主要ページの確認例:

- `http://127.0.0.1:3000/keyhoe`
- `http://127.0.0.1:3000/ohtsuki`
- `http://127.0.0.1:3000/hynek`
- `http://127.0.0.1:3000/hynek/dashboard`

## Environment Variables

ローカル開発では `.env.local` を使います。

```bash
SIGHTENGINE_API_USER=your_sightengine_user
SIGHTENGINE_API_SECRET=your_sightengine_secret
OHTSUKI_DEVELOPER_TOKEN=local-dev
HYNEK_ADMIN_TOKEN=local-hynek-admin-token
OPENAI_API_KEY=your_openai_api_key
OPENAI_KEYHOE_MODEL=gpt-5-mini
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=web:keyhoe:v0.5 (by UFO Lab Tokyo)
```

Vercel では以下を Project Settings の Environment Variables に設定します。

- `SIGHTENGINE_API_USER`
- `SIGHTENGINE_API_SECRET`

`OHTSUKI_DEVELOPER_TOKEN` はローカルの管理者モード専用です。Vercel には設定しません。

Hynek の匿名ライブ集計を本番で永続化するには、Vercel 側で以下のストレージ環境変数が必要です。

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `HYNEK_ADMIN_TOKEN`

これらがない環境では、Hynek はローカル開発用の一時ストアにフォールバックします。

`HYNEK_ADMIN_TOKEN` は `/api/hynek/admin/*` の診断・復旧APIを保護するための値です。APIは件数とエラー種別のみを返し、回答本文や個人を識別できる値は返しません。

`SIGHTENGINE_API_USER` と `SIGHTENGINE_API_SECRET` がない場合、Ohtsuki は簡易判定にフォールバックします。

`OPENAI_API_KEY` がない場合、Keyhoe の実データ生成はAI要約なしの日本語テンプレートfallbackで動きます。`REDDIT_CLIENT_ID` と `REDDIT_CLIENT_SECRET` がある場合、Keyhoe はReddit公式APIで `r/UFOs` / `r/UAP` / `r/UFOB` を取得します。未設定の場合はRSSフォールバックを試します。

## Scripts

- `npm run dev`: 開発サーバーを起動
- `npm run build`: 本番ビルドを作成
- `npm run start`: 本番サーバーを起動
- `npm run keyhoe:build`: RSS / 公式フィードから `public/data/keyhoe-today.json` を生成
- `npm run keyhoe:build:dry`: Keyhoe JSONを標準出力に出し、ファイルは変更しない
- `npm run keyhoe:build:mock`: Keyhoe JSONを開発用モックに戻す

## Data And Operations

Keyhoe の日次更新は GitHub Actions で毎朝7:00 JSTごろに `public/data/keyhoe-today.json` を再生成し、差分がある場合だけコミットします。GitHub Secrets には `OPENAI_API_KEY` と、必要に応じて Reddit 関連 env を設定します。

Ohtsuki は `SIGHTENGINE_API_USER` と `SIGHTENGINE_API_SECRET` がある場合に外部判定APIを使い、未設定時は簡易判定で動作します。

Hynek は匿名 cookie を使って初回回答のみ集計し、`/hynek/dashboard` で集計結果を表示します。

## Docs And Codex Workflow

Codex で実装する場合は、まずルートの `AGENTS.md` を読みます。

アプリごとの企画・実装では、今後 `docs/apps/{app-slug}/AGENTS.md` を入口にし、必要に応じて以下のドキュメントを作成または更新します。

- `PROJECT.md`: アプリの目的、対象ユーザー、MVP範囲
- `DESIGN.md`: UI方針、画面構成、演出
- `FEATURES.md`: 機能仕様、ユーザーフロー、状態
- `DATA.md`: CSV、JSON、型、API、外部データ

`docs/apps/_template/` はテンプレート専用です。実装時の仕様として扱わず、対象アプリの `docs/apps/{app-slug}/AGENTS.md` がない場合は、先に企画ドキュメントを作成してから実装に進みます。

既存の単発仕様書は `docs/apps/*.md`、ブランド仕様は `docs/brand/`、共通仕様は `docs/specs/` にあります。既存ドキュメントは一括移動せず、触るアプリから段階的に新構成へ整理します。

## API

- `/api/ohtsuki/analyze`: Ohtsuki の判定API
- `/api/hynek`: Hynek の匿名集計API
- `/api/hynek/admin/diagnostics`: Hynek KV の管理診断API。`x-hynek-admin-token` が必要
- `/api/hynek/admin/repair`: Hynek KV の管理復旧API。`x-hynek-admin-token` が必要。既定では dry run
