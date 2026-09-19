# Jenny - UFO REPORT ANALYZER Features

## Core Features

- 100〜20,000文字のUFO目撃報告・調査報告を1件ずつ受け付ける。
- JevのChoice、Score、Booleanを使い、6件の主判定と14件の補助判定を1リクエストで評価する。
- 分析中は20件の項目名だけを同時表示し、応答後に実値を表示してから5つの結果ブロックへ切り替える。
- 結果はSP分類、近接遭遇分類、TRUE UFO度、証拠強度、フェイク兆候を日本語で表示する。
- 数値は水平バーで可視化し、自由文による解説や推論過程は生成しない。
- レポート本文と結果は保存せず、匿名利用者ごとの1日5回制限だけを記録する。

## Evaluation Set

質問セットIDは `jev-ufo-v1` とし、次の20件を固定する。

### 報告品質（4件）

1. `reliability`：P｜報告の確からしさ（主判定、Score）
2. `detailSpecificity`：記述の具体性（Score）
3. `spatiotemporalConsistency`：時空間的一貫性（Boolean）
4. `sourceTraceability`：情報源の追跡可能性（Score）

### 遭遇特徴（5件）

5. `strangeness`：S｜ストレンジネス（主判定、Score）
6. `closeEncounter`：CE1 / CE2 / CE3 / 非該当（主判定、Choice）
7. `proximity`：接近度（Score）
8. `physicalEffects`：物理・環境作用（Boolean）
9. `entityPresence`：存在者・搭乗者描写（Boolean）

### 代替説明（4件）

10. `trueUfo`：TRUE UFO度（主判定、Boolean）
11. `astronomicalExplanation`：天体説明の適合度（Boolean）
12. `humanAerialExplanation`：航空機・ドローン・気球説明の適合度（Boolean）
13. `atmosphericOpticalExplanation`：気象・光学・撮影機器説明の適合度（Boolean）

### 証拠（4件）

14. `evidenceStrength`：証拠強度（主判定、Score）
15. `independentWitnesses`：独立した複数目撃（Boolean）
16. `recordingSensorEvidence`：写真・映像・センサー証拠（Score）
17. `physicalDocumentaryEvidence`：物理痕跡・同時代資料（Score）

### フェイク兆候（3件）

18. `fakeIndicators`：フェイク兆候（主判定、Boolean）
19. `contradictions`：内部・時系列矛盾（Boolean）
20. `fabricationSignals`：創作・誇張・加工を疑う記述（Boolean）

5つの最終表示値はJevの主判定を直接使う。補助判定から独自ウェイトで再計算しない。SPはSとPの2問を1つの表示ブロックへまとめる。

## User Flow

1. ユーザーが本文を貼り付ける。100文字未満または20,000文字超では分析できない。
2. `Jevで20項目を分析`を押すと入力面がプレビューへ折りたたまれ、分析面へフォーカスが移る。
3. 応答待ち中は20項目の名称と活動状態だけを表示する。
4. Jev応答後、20件の実値を同時表示し、短い収束演出の後に5つの結果ブロックを表示する。
5. ユーザーは6つの主要指標を1項目ずつ開き、関連する下位判定と実値を確認できる。
6. ユーザーは同じ本文を再分析するか、入力を編集して別の分析を開始できる。

## States

- `idle`：分析待機中。数値や仮バーは表示しない。
- `invalid`：文字数条件を入力面で示し、APIを呼ばない。
- `submitting`：二重送信を止め、20項目を無数値で表示する。
- `revealing`：Jevから届いた20件の実値だけを同時に表示する。
- `success`：5つの結果ブロック、実測時間、残り回数を表示する。
- `success`内の詳細表示：S、P、近接遭遇分類、TRUE UFO度、証拠強度、フェイク兆候のうち1項目だけを展開する。新しい分析では閉じた状態へ戻す。
- `error`：本文を保持し、原因に応じた日本語メッセージと再試行操作を表示する。
- `editing`：結果を保持したまま入力面を再展開し、再分析開始時に古い結果を消す。

## Discoverability

- `/jenny`に絶対URLのcanonicalを設定し、検索エンジンへindexとfollowを許可する。
- 日本語のtitle、description、keywords、Open Graph、Xカードで、Jevによる20項目評価と5つの分析指標を説明する。
- Open GraphとXカードは同じ1200×630pxの共有画像を使用し、画像altを設定する。
- `WebApplication`構造化データへ名称、用途、言語、URL、提供者、無料利用、5つの分析指標を記述する。
- `/jenny`をサイトマップへ1件だけ掲載し、更新頻度をmonthly、priorityを0.8とする。英語版がないため言語alternateは設定しない。
- SEO文言と構造化データは画面本文へ追加せず、Jennyの表示文言を変更しない。

## Usage And Privacy

- 匿名利用者IDはHttpOnly Cookieに保存し、JSTの日付ごとの利用回数だけをVercel KVへ保存する。
- 有効な分析は1日5回まで。上限超過時はJevを呼ばない。
- 入力本文、分析結果、IPアドレスはアプリ側で永続化しない。
- AI GatewayにはDisallow Prompt Trainingを要求し、入力をモデル学習へ利用しない経路に限定する。
- Zero Data Retentionは要求しないため、外部サービス上での即時完全削除は保証しない。氏名、住所、連絡先などの個人情報を含む文章は入力しないよう案内する。

## Acceptance Criteria

- Jevへの1回の呼び出しに20問すべてが含まれる。
- S/Pは0.0〜10.0、CE適合度・TRUE UFO度・証拠強度・フェイク兆候は0〜100になる。
- CE適合度は選択されたChoiceの確率であり、TypeSafe固有confidenceではない。
- 応答前に架空の数値を表示せず、結果バーと表示値が一致する。
- 6つの主要指標がクリック、Enter、Spaceで開閉でき、対応する`microSignals`だけを表示する。
- 詳細は一度に1項目だけ開き、新しい分析時に閉じた状態へ戻る。
- 320px、390px、768px、1280pxで入力・分析・結果・再試行が利用できる。
- 本文はエラー時にも保持され、サーバーログやKVへ保存されない。
- キーボード操作、読み上げ通知、フォーカス移動、モーション低減が機能する。
