# Ohtsuki MVP 仕様

> この文書は初期MVPのメモです。現行の仕様は [docs/apps/ohtsuki-ai-image-checker-spec.md](../apps/ohtsuki-ai-image-checker-spec.md) を参照してください。

## 名称

- プロダクト名: Ohtsuki v0.5
- 表示名: Ohtsuki v0.5 – UFO画像AI判定チェッカー

## 目的

Ohtsuki v0.5 は、UFO画像がAI生成・AI加工画像である可能性を確認するためのMVPメモです。

現行実装では、強い証拠の自前検出、撮影年の補助判定、Sightengine による詳細判定、簡易判定へのフォールバックを含みます。

## 初期ページ

- `/ohtsuki`: Ohtsuki v0.5 のメインページ
- `/ufo-image-checker`: 旧URLからの互換導線

## MVPで扱う判定観点

- AI生成画像の可能性
- AI加工・合成の可能性
- メタデータ確認
- 画像ファイル内の強い生成AI痕跡
- 撮影年とされる年の補助判定
- 画像内の不自然な境界、影、反射
- 判定不能なケースの明示

## 初期スコープ外

- 確定的な真贋判定
- UFOそのものの実在判定
- 新しい外部AI API の追加
- アカウント機能
- 画像の永続保存
