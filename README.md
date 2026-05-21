# UFO-lab

UFO・UAPをテーマにしたWebサイト「UFOlab」のNext.jsプロジェクトです。

## UFOlab について

UFOlabは、UFO・UAPに関する情報や検証体験を、Webアプリとして段階的に提供していくプロジェクトです。

初期フェーズでは、断定的な主張ではなく「根拠に基づいた確認」を重視し、ユーザーが画像の来歴や加工可能性を理解できる体験の提供を目指します。

## First App: `ufo-image-checker`

- 技術名・URL名: `ufo-image-checker`
- ユーザー向け表示名: **Otsuki – UFO画像判定チェッカー**
- 対応ページ: `/ufo-image-checker`（Otsuki のページ）

### MVPの位置づけ

本MVPでは、**UFOそのものの正体判定は行いません**。

まずは、アップロード画像に対して以下の確認に絞ります。

- AI生成画像の可能性
- CG画像の可能性
- 加工画像の可能性
- メタデータの有無
- C2PA / Content Credentials の有無
- 再圧縮や編集の痕跡

仕様書は以下を参照してください。

- `docs/apps/ufo-image-checker-spec.md`

## Requirements

- Node.js 20 以上
- npm

## Getting Started

依存関係をインストールします。

```bash
npm install
