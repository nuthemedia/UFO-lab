# UFO Lab Tokyo

「東京UFO研究室 / UFO Research Lab Tokyo」のブランドサイトと、
UFO画像AI判定チェッカー β「Ohtsuki」を実装する Next.js プロジェクトです。

## Brand

- 正式名称: 東京UFO研究室
- 英語名称: UFO Research Lab Tokyo
- 短縮名・ロゴ名: UFO Lab Tokyo
- タグライン: UFOはまだ解明されていないが確かに実在する現象である

## UFO Lab Tokyo について

UFO Lab Tokyo は、UFO・UAPに関する情報や検証体験を、Webアプリとして段階的に提供していくプロジェクトです。

初期フェーズでは、断定的な主張ではなく「根拠に基づいた確認」を重視し、ユーザーが画像の来歴や加工可能性を理解できる体験の提供を目指します。

## First App: Ohtsuki

- プロダクト名: `Ohtsuki`
- 表示名: **Ohtsuki - UFO画像AI判定チェッカー β**
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

- `docs/specs/brand-site.md`
- `docs/specs/ohtsuki-mvp.md`

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

## Scripts

- `npm run dev`: 開発サーバーを起動
- `npm run build`: 本番ビルドを作成
- `npm run start`: 本番サーバーを起動

## Pages

- `/`: 東京UFO研究室のブランドサイト
- `/ohtsuki`: Ohtsuki - UFO画像AI判定チェッカー β
- `/ufo-image-checker`: 旧URL互換。`/ohtsuki` にリダイレクト
