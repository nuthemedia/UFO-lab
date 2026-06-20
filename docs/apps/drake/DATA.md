# Drake Data

## Data Sources

Drake MVP は外部 API や実在 UFO 事件データを使わない。

入力定義、証拠カード、初期値はローカル定数として `data/drake/defaults.ts` に持つ。数理計算は `lib/drakeMath.ts` に集約する。

## Types And Shape

### Drake Inputs

ユーザーが Drake Equation 画面で調整する 4 つの前提。

- `planetAbundance`: 惑星を持つ星の割合
- `lifeChance`: 生命の生まれる確率
- `intelligenceChance`: 知性をもつ進化の確率
- `civilizationLifetime`: 通信可能な文明として続く見込み

すべて `0..1` の範囲で扱い、計算前に clamp する。`civilizationLifetime` は標準ドレイク式の `fc` と `L` をまとめた MVP 簡略パラメータである。UI では約 100 年から約 100,000 年の年数として表示するが、内部計算では正規化値を使う。

### Visit Inputs

ユーザーが Visit Filter 画面で調整する 5 つの来訪条件。

- `sameEra`: 人類と同じ時代に存在している確率
- `discoveredEarth`: 地球を発見している確率
- `travelCapability`: 恒星間移動または探査機送付が可能な確率
- `motivation`: 地球に来る動機がある確率
- `observable`: 人類に観測される確率

すべて `0..1` の範囲で扱い、存在可能性に掛け合わせて UFO 証拠を見る前の来訪確率を出す。

### Evidence Cards

UFO 証拠カードは以下の表示情報と likelihood プリセットを持つ。

- `id`
- `label`
- `description`
- `signal`
- `strengthLabel`
- `likelihoodIfVisit`
- `likelihoodIfNoVisit`

MVP ではユーザーは likelihood を直接編集せず、証拠カードを複数選択する。選択されたカードの likelihood ratio を掛け合わせ、Visit Filter の出力を prior として posterior を計算する。

## Derived Outputs

### Drake Estimate

```text
lifeSignal = planetAbundance * lifeChance
intelligenceSignal = lifeSignal * intelligenceChance
civilizationSignal = intelligenceSignal * civilizationLifetime
N = communicationCivilizationCount
existenceProbability = 1 - exp(-N)
```

`existenceProbability` は「あなたの前提では、少なくとも 1 つの知的文明が存在する可能性」として扱う。

### Drake Sample Counts

Drake Equation の途中段階では、最終的な存在可能性ではなく、1000 億個の星を仮の母数にしたサンプル実数を表示する。

```text
planetHostingStarCount = 100_000_000_000 * planetAbundance
estimatedPlanetCount = planetHostingStarCount * 1.6
lifeBearingPlanetCount = estimatedPlanetCount * lifeChance
intelligencePlanetCount = lifeBearingPlanetCount * intelligenceChance
communicationCivilizationCount = intelligencePlanetCount * civilizationLifetimeFactor
```

`lifeBearingPlanetCount` は `生命が存在しうる惑星`、`intelligencePlanetCount` は `知性体が存在しうる惑星` として表示する。どちらも生命や知性体の確認数ではなく、ユーザー前提を 1000 億恒星サンプルに当てはめた候補表示である。
`civilizationLifetimeFactor` は `0.000001` から `0.001` の範囲で、スライダー値を対数的に変換した表示用係数である。`civilizationLifetime` の段階では `communicationCivilizationCount` を `通信可能な文明` として表示する。
`estimatedPlanetCount` は厳密な観測値ではなく、平均 `1.6個/恒星` を使った表示用の簡略値である。

### Visit Probability

```text
priorVisitProbability =
  existenceProbability
  * sameEra
  * discoveredEarth
  * travelCapability
  * motivation
  * observable
```

これは UFO 証拠を見る前の来訪確率、つまり事前確率として表示する。

星空表示では、低確率でも変化を視認できるように `priorVisitProbability` から可視化用シグナルを作る。数値表示には実確率を使い、可視化用シグナルはサンプル表示としてのみ使う。
来訪候補の星空表示では、実確率ではなく来訪フィルター積から作る可視化用シグナルを使う。
UI ではこの可視化用シグナルを `来訪候補ライト` として、`ほぼ見えない / わずか / 増えている` の定性ラベルで表示する。
Result のズーム演出では、赤/白の星の画面位置は実際の宇宙空間上の位置ではなく、サンプル可視化上の来訪候補・UFO証拠更新の星群の重心として扱う。Result では星群として視認できるように可視化専用の下限を使うが、数値表示やベイズ計算には反映しない。

### Bayesian Update

```text
likelihoodRatio = likelihoodIfVisit / likelihoodIfNoVisit
priorOdds = prior / (1 - prior)
posteriorOdds = priorOdds * combinedLikelihoodRatio
posterior = posteriorOdds / (1 + posteriorOdds)
```

未選択時は `combinedLikelihoodRatio = 1`、`posterior = prior` とする。
UI では合成 likelihood ratio を倍率だけでなく、以下の定性ラベルで表示する。

- `LR >= 5`: 大きく更新
- `2 <= LR < 5`: 強く更新
- `1.2 <= LR < 2`: 少し更新
- `0.8 < LR < 1.2`: ほぼ変わらない
- `LR <= 0.8`: 弱める

## SEO Data

`/drake` は静的 metadata、FAQPage JSON-LD、OpenGraph/Twitter 画像を持つ。画面に表示される下部 SEO 説明セクションは持たない。

- title は `ドレイクの方程式`, `宇宙人の存在確率`, `UFO証拠` を含める
- description は `ベイズ推論`, `地球来訪の事前確率`, `UFO証拠による更新` を含める
- FAQPage JSON-LD は、ドレイクの方程式、地球来訪、UFO証拠、ベイズ推論、確率表示の注意を扱う
- `/drake/opengraph-image` は、星空、地球ホライズン、`Drake`、サブタイトル、`UFO Lab Tokyo` を入れたリンク投稿用画像を生成する

## Scripts

- `npm run test:drake`: `lib/drakeMath.test.ts` の数理テストを実行する。
- `npm run build`: `/drake` を含む Next.js build を確認する。

## Environment Variables

Drake MVP 専用の環境変数はない。
