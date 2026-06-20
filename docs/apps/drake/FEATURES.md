# Drake Features

## Overall Flow

スマホ向けのステップ式 UI とする。Intro は導入画面として扱い、操作ステップは Drake Equation から Result までの 5 ステップとする。

1. Intro
2. Drake Equation
3. Science Comparison
4. Visit Filter
5. UFO Evidence / Bayesian Update
6. Result

各画面は「1 画面 = 1 つの問い」を原則とする。

## 0. Intro

### Purpose

ユーザーに、アプリ全体の問いを短く伝える。

### Display

タイトル:

Drake

サブタイトル:

宇宙人はいるのか、地球に来ているのか

説明:

1. 宇宙人は存在するか？
2. 存在するとして、地球に来ているか？
3. UFO はその証拠になるか？

補助表示:

- ドレイクの方程式とベイズ推論の式を、星空上の薄い数式リボンとして表示する
- `Drakeとは？` を表示し、タップで説明シートを開く

### Interaction

- 「はじめる」ボタンで Drake Equation へ進む
- 上向き矢印と上スワイプでも Drake Equation へ進める
- UFO LAB TOKYO の下に `Xで共有` の小さなピルボタンを置く
- `Drakeとは？` の説明シートは、閉じるボタン、背景タップ、Escape キーで閉じられる
- `Drakeとは？` の説明シートには、ドレイクの方程式で存在可能性と地球来訪の事前確率を考え、UFO証拠の強さでベイズ推論に基づき事後確率へ更新する流れを表示する

## 1. Drake Equation

### Purpose

ドレイクの式を使って、天の川銀河に知的文明がどれくらいありそうかを考える。

### MVP Inputs

初期 MVP では、初心者向けに 4 つのスライダーに簡略化する。

1. 惑星を持つ星の割合
2. 生命の生まれる確率
3. 知性をもつ進化の確率
4. 通信可能な文明として続く見込み

詳細モードでは、将来的に以下の 7 項目に展開できるようにする。

- R*: 星が生まれる速さ
- fp: 惑星を持つ星の割合
- ne: 生命に適した惑星の数
- fl: 生命が生まれる確率
- fi: 知的生命になる確率
- fc: 通信文明になる確率
- L: 文明が続く年数

### Output

- 推定される文明数 N
- 生命が存在しうる候補の多さ
- 知性体が存在しうる候補の多さ
- 文明の光の多さ

### UI

- 画面最上部に `Step 1 / 5` の細い進行バーを表示する
- 問いと主要メトリクスは星空上の小型 Glassmorphism HUD に表示する
- 1 つ目の入力では、上部 HUD に `惑星を持つ恒星` と `推定される惑星` を表示する。`推定される惑星` は平均 `1.6個/恒星` の簡略仮定で出す
- 2 つ目の入力では、上部 HUD に `生命が存在しうる惑星` を候補数として表示する
- 3 つ目の入力では、上部 HUD に `知性体が存在しうる惑星` を候補数として表示する
- 4 つ目の入力では、上部 HUD に `通信可能な文明` と `通信可能な文明として続く見込み` を表示し、ここで初めて推定される文明数 N を見せる
- Drake Equation の途中段階では `存在可能性` という最終指標を表示しない
- `通信可能な文明として続く見込み` は、標準ドレイク式の `fc` と `L` をまとめた MVP 簡略パラメータとして扱う。UI ではスライダー値をパーセントではなく年数として表示する
- 入力は 1 項目ずつ下部の小型パネルに表示する
- `i` は画面説明、`?` は各スライダーの説明をポップアップ表示する
- `i` には星色の意味も表示する
- `i` には、標準のドレイク式では `fp` と `ne` を分けるが、MVPでは `ne` を独立スライダーにしていないことを明記する

### UI Linkage

スライダーを動かすと、WebGL 星空がリアルタイムで変化する。

- 生命が増えると、緑の星が増える
- 知性への進化を下げると、緑の星の中から青い星が減る
- 通信可能な文明として続く見込みを上げると、金色の星が増える
- 星色の意味は `白=通常`, `緑=生命が存在しうる惑星`, `青=知性体が存在しうる惑星`, `金=通信可能な文明`, `白く強い光/赤み=来訪候補・UFO証拠更新` として扱う

## 2. Science Comparison

### Purpose

ユーザーの設定を、現在の科学的知見と比較して見せる。

### Expression Policy

正解/不正解として表示しない。

表示するのは以下の分類。

- 科学的にかなり分かっている
- ある程度分かっている
- まだほぼ未知
- あなたの仮定に大きく依存

### Display Examples

惑星の多さ:
あなたの設定は慎重寄りです。
現在の観測では、惑星はかなり一般的だと考えられています。

生命の生まれやすさ:
この値はまだほぼ未知です。
地球以外の生命サンプルがないため、あなたの仮定に大きく依存します。

知性への進化:
非常に不確実な項目です。
生命が存在しても、必ず知的生命になるとは限りません。

### UI

- `Step 2 / 5` として表示する
- 比較カードは Glassmorphism のカードとして、上から順に軽く登場する
- カードは星空を覆ってよい前面表示とし、各カードに `あなたの設定: 慎重寄り / 中間 / 楽観寄り` を表示する
- カードは上部 HUD の直下から始める
- 各カードには、なぜその判断なのかを短く補足する
- `戻る / 次へ` はカード一覧の下部に固定し、カードが長くても画面内で操作できるようにする

## 3. Visit Filter

### Purpose

宇宙人が存在することと、地球に来ていることを分けて考える。

### Inputs

ユーザーは以下をスライダーで調整する。

1. 人類と同じ時代に存在している確率
2. 地球を発見している確率
3. 恒星間移動または探査機送付が可能な確率
4. 地球に来る動機がある確率
5. 人類に観測される確率

### Output

- UFO 証拠を見る前の来訪確率
- 来訪候補の星の数または光の強さ

### Message

宇宙人が存在することと、地球に来ていることは別の問いです。

### UI

- `Step 3 / 5` として表示する
- Drake Equation と同様に、上部小型 HUD と 1 項目ずつの下部スライダーで構成する
- `i` では存在可能性と来訪可能性が別の問いであることを説明する
- 上部 HUD には、実確率とは別に `来訪候補ライト` を表示する。これは赤/白い星の見え方を説明する定性ラベルであり、実際の星数や確率そのものではない
- 来訪可能性の数値表示は実確率を使うが、星空では低確率でも変化が見えるように来訪フィルター積から作る可視化用シグナルへ変換する

## 4. UFO Evidence / Bayesian Update

### Purpose

UFO 証拠を見たあと、宇宙人来訪説の確率がどれくらい更新されるかを見せる。

### Main Copy

この証拠で、考えはどれくらい変わる？

### Inputs

証拠カード:

- 目撃証言
- 複数の目撃者
- 写真・映像
- 赤外線映像
- レーダー記録
- 複数センサー
- 物証
- 独立機関による検証

### Evidence Card Defaults

各証拠カードには以下の初期値を持たせる。

- likelihoodIfVisit
- likelihoodIfNoVisit

MVP では likelihood はプリセット値として保持し、ユーザーは証拠カードを複数選択する。通常の証拠は弱〜中程度の更新にとどめ、物証や独立検証だけを比較的強い更新として扱う。

### Calculation

```text
prior = Visit Filter の出力
likelihoodRatio = likelihoodIfVisit / likelihoodIfNoVisit
priorOdds = prior / (1 - prior)
posteriorOdds = priorOdds * likelihoodRatio
posterior = posteriorOdds / (1 + posteriorOdds)
```

### Output

- 証拠を見る前の来訪確率
- 証拠の強さ
- 証拠を見た後の来訪確率
- コメント

### UI

- `Step 4 / 5` として表示する
- 証拠カードは星空上に薄く重なるコンパクトカードとして表示する
- 複数選択時はカードごとの likelihood ratio を掛け合わせる
- 上部 HUD の `証拠の強さ` は `ほぼ変わらない / 少し更新 / 強く更新 / 大きく更新` などの言葉を主表示にし、尤度比は補助表示にする
- `i` では UFO が未確認であることと宇宙人由来であることは別だと説明する
- 証拠カード横スクロール領域とステップ移動導線は分離し、`戻る / 結果へ` は常に操作できるようにする

### Comment Example

この証拠は来訪説を少し強めます。
ただし、宇宙人でなくても起きやすい証拠なので、決定打ではありません。

## 5. Result

### Purpose

ユーザーの前提と証拠評価に基づく推論結果をまとめる。

### Display

- 少なくとも 1 つの文明が存在する可能性
- 宇宙人が地球に来ている可能性
- UFO 証拠による更新後の可能性
- 証拠の強さ
- 総合コメント
- 「あなたの銀河」ビジュアル
- 星色の意味
- 3つの予測として、通信可能な文明存在の予測、地球来訪の予測、証拠確認後の来訪予測を表示する

### Result Copy Example

あなたの前提では、生命が存在しうる候補は多めに表示されました。
そこから知性体が存在しうる候補、通信可能な文明、地球に届く可能性へと別々に絞られました。

今回の UFO 証拠は、来訪説を少し強めますが、決定的な更新にはなっていません。

### Interaction

- 前提を変えてもう一度
- X で共有する
- 最初に戻る
- 結果を見る / 銀河に戻る

Result は `Step 5 / 5` として表示する。初期状態では結果パネルを出さず、「あなたの銀河」の星空を先に見せる。`結果を見る` で 3 つの予測を展開し、`銀河に戻る` で星空鑑賞に戻る。
Result パネルは上部 HUD の直下から始める。右端の折れ線グラフは使わず、カード内に `生命→知性→文明`, `文明→来訪`, `見る前→見た後` の短い流れを表示する。3つの予測カードは、知性体=青、来訪=白/赤、証拠後=赤のトーンで区別する。
Result の星空は Intro と同様に瞬き、来訪候補・UFO証拠更新を表す赤/白の星域へゆっくり寄っていく。`prefers-reduced-motion` ではこのズーム演出を抑える。

## SEO

`/drake` は、検索用 metadata、FAQPage JSON-LD、Drake 専用 OpenGraph/Twitter 画像を持つ。画面下部に表示される SEO 説明セクションは置かない。

- 主な検索語は `ドレイクの方程式`, `宇宙人はいるのか`, `宇宙人 存在 確率`, `地球外生命体`, `UFO 証拠`, `ベイズ推論` とする
- 関連語として `SETI`, `フェルミのパラドックス`, `グレートフィルター`, `系外惑星`, `ハビタブルゾーン`, `バイオシグネチャー`, `テクノシグネチャー` を自然文で扱う
- FAQPage JSON-LD を使い、ドレイクの方程式、地球来訪、UFO証拠、ベイズ推論、確率表示の注意を短く説明する

## Math Utilities

以下の関数を実装する。

### calculateDrakeN

簡略化されたドレイク式から、中間シグナルと文明数 N を返す。

```text
lifeSignal = planetAbundance * lifeChance
intelligenceSignal = lifeSignal * intelligenceChance
civilizationSignal = intelligenceSignal * civilizationLifetime
N = communicationCivilizationCount
existenceProbability = 1 - exp(-N)
```

`communicationCivilizationCount` は `知性体が存在しうる惑星` から、通信可能になる割合 `fc` と文明が続く長さ `L` をまとめた表示用係数で絞って出す。

`existenceProbability` は「あなたの前提では、少なくとも 1 つの知的文明が存在する可能性」として Result や Visit Filter の前提に使う。Drake Equation の途中段階では表示しない。科学的な最終確率ではない。

### calculateVisitProbability

存在確率と来訪フィルターから、UFO 証拠を見る前の来訪確率、つまり事前確率を返す。

```text
priorVisitProbability =
  existenceProbability
  * sameEra
  * discoveredEarth
  * travelCapability
  * motivation
  * observable
```

### bayesianUpdate

prior, likelihoodIfVisit, likelihoodIfNoVisit を受け取り、posterior を返す。

複数証拠では、選択された証拠カードごとの likelihood ratio を掛け合わせる。未選択時は `posterior = prior` とする。

### clampProbability

0 から 1 の範囲に値を収める。

## Non-Functional Requirements

- スマホ優先
- 日本語 UI
- 確率は断定ではなく、ユーザーの仮定として表示する
- WebGL 星空は軽量にする
- WebGL 非対応時は静的背景にフォールバックする
- prefers-reduced-motion に対応する
- math utility にはテストを書く

## Acceptance Criteria

- Intro から Result まで、ステップ式に進める
- Intro からは上スワイプでも Drake Equation へ進める
- 操作ステップは `Step 1 / 5` から `Step 5 / 5` として表示される
- 各画面は「1 画面 = 1 つの問い」として読める
- Drake Equation の 4 つの MVP スライダーが文明数 N と星空表示に反映される
- Science Comparison はユーザー設定を正解/不正解として扱わない
- Visit Filter は存在確率と来訪確率を分けて表示する
- Bayesian Update は prior と証拠カードの likelihood から posterior を計算する
- Result は「あなたの前提では」などの表現方針に従って表示する
- WebGL 非対応時と prefers-reduced-motion 有効時でも主要情報を読める
- math utility のテストがある
