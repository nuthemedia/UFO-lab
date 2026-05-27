# UFO Lab Tokyo

「東京UFO研究室 / UFO Research Lab Tokyo」のブランドサイト、
Ruppelt v1.5、Kean、Ohtsuki v0.5 をまとめて提供する Next.js プロジェクトです。

## Brand

- 正式名称: 東京UFO研究室
- 英語名称: UFO Research Lab Tokyo
- 短縮名・ロゴ名: UFO Lab Tokyo
- タグライン: UFOはまだ解明されていないが確かに実在する現象である

## UFO Lab Tokyo について

UFO Lab Tokyo は、UFO・UAPに関する情報や検証体験を、Webアプリとして段階的に提供していくプロジェクトです。

初期フェーズでは、断定的な主張ではなく「根拠に基づいた確認」を重視し、ユーザーが画像の来歴や加工可能性を理解できる体験の提供を目指します。

このリポジトリでは、ブランドサイトを東京UFO研究室全体の入口として扱い、個別アプリをその活動の一部として整理します。現在の公開面は、日本語・英語のブランドサイト、PURSUE日本語インデックスの Ruppelt、ディスクロージャー人物地図の Kean、UFO画像AI判定チェッカーの Ohtsuki v0.5、匿名ライブ集計つきの UFOファンタイプ診断 Hynek v1 です。

## First App: Ohtsuki v0.5

- プロダクト名: `Ohtsuki v0.5`
- 表示名: **Ohtsuki v0.5 - UFO画像AI判定チェッカー**
- ユーザー向け名称: **Ohtsuki v0.5 – UFO画像AI判定チェッカー**
- URL名・技術名: `ohtsuki`
- 対応ページ: `/ohtsuki`
- 旧URL互換: `/ufo-image-checker` は `/ohtsuki` にリダイレクト

### MVPの位置づけ

本MVPでは、**UFOそのものの正体判定は行いません**。

まずは、アップロード画像に対して以下の確認に絞ります。

- AI生成画像の可能性
- AI加工・合成の可能性
- メタデータ確認
- 画像内の不自然な境界、影、反射
- 判定不能なケースの明示

仕様書は以下を参照してください。

- `docs/brand/ufo-lab-tokyo-brand.md`
- `docs/apps/ohtsuki-ai-image-checker-spec.md`
- `docs/specs/brand-site.md`
- `docs/specs/ruppelt-prior-disclosure.md`
- `docs/specs/ruppelt-ocr-shared-data.md`

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

ブラウザで以下のURLを開きます。

- `http://localhost:3000/`
- `http://localhost:3000/ohtsuki`
- `http://localhost:3000/hynek`
- `http://localhost:3000/hynek/dashboard`

## Environment Variables

ローカル開発では `.env.local` を使います。`OHTSUKI_DEVELOPER_TOKEN` はローカルの管理者モード専用です。

```bash
SIGHTENGINE_API_USER=your_sightengine_user
SIGHTENGINE_API_SECRET=your_sightengine_secret
OHTSUKI_DEVELOPER_TOKEN=local-dev
```

Vercel では以下を Project Settings の Environment Variables に設定します。

- `SIGHTENGINE_API_USER`
- `SIGHTENGINE_API_SECRET`

`OHTSUKI_DEVELOPER_TOKEN` は Vercel には設定しません。管理者モードは local host でのみ表示され、API も local request でしか受け付けません。

`SIGHTENGINE_API_USER` と `SIGHTENGINE_API_SECRET` がない場合、Ohtsuki は簡易判定にフォールバックします。

## Scripts

- `npm run dev`: 開発サーバーを起動
- `npm run build`: 本番ビルドを作成
- `npm run start`: 本番サーバーを起動

## Pages

- `/`: 東京UFO研究室のブランドサイト
- `/en`: 英語版ブランドサイト
- `/ruppelt`: Ruppelt v1.5 - PURSUE日本語インデックス
- `/kean`: Kean - ディスクロージャー人物地図
- `/ohtsuki`: Ohtsuki v0.5 - UFO画像AI判定チェッカー
- `/hynek`: Hynek - UFOファンタイプ診断
- `/hynek/dashboard`: Hynek - 日本のUFO観ダッシュボード（匿名ライブ集計）
- `/ufo-image-checker`: 旧URL互換。`/ohtsuki` にリダイレクト

## API

- `/api/ohtsuki/analyze`: Ohtsuki の判定API
- `/api/ruppelt/shared-data`: Ruppelt の共有データAPI
