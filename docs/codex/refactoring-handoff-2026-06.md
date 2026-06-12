# リファクタリング引き継ぎ(2026-06-11〜12 実施分)

Claude Code による全体リファクタリングの引き継ぎ。対象コミット: `220e420`〜`ae8e012`(main、デプロイ済み・CI green)。新しい規約はすべて root `AGENTS.md` §7 に反映済みなので、本文書は「何が・なぜ変わったか」と「保留事項」の記録。

## 1. 変わったこと

### 品質ゲート(Phase 1)
- ESLint 導入(`eslint.config.mjs`、flat config)。`npm run lint`。
- CI 追加: `.github/workflows/ci.yml` が push/PR で「ルート検証 → 検索インデックス鮮度 → lint → build」を実行。
- `react-hooks/set-state-in-effect` と `react-hooks/refs` は既存違反(計16件)があるため **warn に降格中**。新規違反は追加しないこと。既存分を解消したら `eslint.config.mjs` の降格設定を外す。
- 未使用だった `playwright` を devDependencies から削除。

### 画像(Phase 2)
- `public/` の85ファイルを一括圧縮(236MB→53MB)。写真=mozjpeg、イラスト=パレットPNG。
- `public/models/saucers/adamski-textures/`(25MB)は未参照のため削除。GLB はテクスチャ内蔵。
- kean / jacques のローカル静的画像を `next/image` に移行。`data/kean/types.ts` の `ImageAsset` に任意の `width`/`height` を追加。kean 図版の `?v=` クエリは `next.config.mjs` の `images.localPatterns` で許可。
- **未移行(意図的)**: OhtsukiChecker(blob URL)、RuppeltBrowser のサムネイル(外部URL、`remotePatterns` 設定が必要)、Hynek 2コンポーネント、OG画像(`ImageResponse` 内は `<img>` が正しい)。

### データ層(Phase 3)
- `scripts/build-pursue-search-index.mjs` に `--check` モード追加(`npm run verify:search-index`)。コミット済み `fulltext-index.json` と再生成結果を `generatedAt` 除外で比較し、不一致なら exit 1。**pursue の bundles / records / 翻訳を変えたら必ず再生成してコミット**(しないと CI が落ちる)。
- `app/api/ruppelt/document/[recordId]/route.ts`: bundles(10.5MB)+ records(1.1MB)をモジュールスコープでキャッシュ(`fulltext-search` ルートと同じパターン)。読込失敗時はキャッシュ破棄でリトライ可。

### コード構造(Phase 4)
- **配置規約を統一**: app 固有コンポーネントは `app/{slug}/` に同居(keyhoe/kinichi 方式)。`components/` は共有の `Site*` / `Brand*` のみ。**新しいコンポーネントもこの規約に従うこと。移動時は `scripts/verify-production-routes.mjs` のパスリスト更新を忘れない**(忘れて一度 CI を壊した: `ae8e012` で修正)。
- **OG画像**: 共通ブロックを `lib/og.tsx`(`OgFrame` / `OgBrand` / `OgFooter` / `ogSize` / `ogContentType`)に抽出。kean / keyhoe / kinichi / kean-uap が使用。people/[id] と biorhythm は完全カスタムのため定数のみ共有。新しい OG 画像はこのブロックで組むこと。
- **RuppeltBrowser 分割**: 1,797行 → `app/ruppelt/RuppeltBrowser.tsx`(メイン、821行)+ `app/ruppelt/browser/` の6モジュール(types / search / helpers / RecordCard / DocumentDetailPanel / PriorDisclosurePanel)。逐語移動で挙動変更なし。

### ドキュメント
- `CLAUDE.md` 新設(AGENTS.md への参照)。`AGENTS.md` に §7 Quality Gates を追加。
- §5 に軽量ティア追加: `app/experiments/` 配下は `AGENTS.md` + `PROJECT.md` の2ファイルでよい。

## 2. 保留・見送り(理由つき)

| 項目 | 状態 | 理由・条件 |
|---|---|---|
| `scripts/build-keyhoe-today.mjs` の分割 | **見送り** | 119関数を依存分析した結果、層またぎ呼び出し63箇所+逆方向依存ありで、きれいな分割面が無い。毎日無人実行される本番パイプラインで、OpenAI 有効経路はローカル検証不能。やるなら依存整理から設計する独立タスクとして。 |
| `data/shared/search/description-index.json`(0.85MB) | **要判断** | どこからも参照されていない死蔵データ。削除可否はオーナー判断待ち。 |
| Hynek の `*Mockup` 命名整理 | **ブロック中** | `docs/apps/hynek/` の planning docs が存在しない。§5 により docs 作成が先。 |
| react-hooks 警告16件の解消 | **未着手** | RuppeltBrowser 分割済みでファイル単位で直せる状態。解消後に warn 降格を外す。 |
| git 履歴の旧画像 blob | **放置可** | clone サイズには旧 9.9MB 画像等が残る。履歴書き換えは破壊的なので、困るまで触らない。 |

## 3. 検証済み事項(再検証不要)

- 全コミットで lint(0エラー)/ tsc / build(126ページ)/ CI green を確認。
- 画像圧縮は代表サンプルを目視確認。OG 画像は before/after をレンダリング比較で同一確認。
- Ruppelt はローカルブラウザ実機(カード222枚・検索+URL同期・詳細パネル5タブ・公開状況パネル)と本番 API(`fulltext-search`、`document/[recordId]`)で動作確認。
- 本番(ufolab.tokyo)へ自動デプロイ済み。`capitol.jpg` 173KB 配信、`/_next/image` 配信を確認。
