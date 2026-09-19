# Jenny - UFO REPORT ANALYZER Data

## Data Sources

- ユーザーが貼り付けるUFO目撃報告・調査報告の本文。
- Vercel AI Gateway経由の `typesafe-ai/jev` 評価結果。
- `data/jenny/calibration-cases.json` の校正用ケース。公開利用者の入力は追加しない。
- Vercel KVの日次匿名利用回数。本文・結果・IPアドレスは保存しない。

## API

`POST /api/jenny/analyze`

Request:

```ts
type JennyAnalysisRequest = {
  reportText: string;
};
```

前後空白を除いた本文は100〜20,000文字とする。

Success response:

```ts
type JennyAnalysisResponse = {
  schemaVersion: "jenny-1";
  questionSetVersion: "jev-ufo-v1";
  questionCount: 20;
  durationMs: number;
  microSignals: Array<{
    id: string;
    group: "report" | "encounter" | "alternatives" | "evidence" | "fake";
    label: string;
    value: number;
    max: number;
    tone: "ice" | "sage" | "amber";
  }>;
  summary: {
    strangeness: number;
    reliability: number;
    closeEncounter: {
      code: "CE1" | "CE2" | "CE3" | "NONE";
      labelJa: string;
      fit: number;
    };
    trueUfo: number;
    evidenceStrength: number;
    fakeIndicators: number;
  };
  quota: {
    remainingToday: number;
    resetsAt: string;
  };
};
```

Error response:

```ts
type JennyErrorResponse = {
  error: string;
  code: "INVALID_INPUT" | "INPUT_TOO_LONG" | "DAILY_LIMIT" | "INVALID_JEV_RESPONSE" | "SERVICE_UNAVAILABLE";
  quota?: { remainingToday: number; resetsAt: string };
};
```

HTTP statusは入力不正400、長文413、日次上限429、不正なJev応答502、キー・KV・外部サービス利用不能503とする。

## Types And Shape

- 6段階Scoreは `score / 5` で正規化する。S/Pは10倍して小数1桁、証拠強度は100倍して整数にする。
- 補助Scoreは段階数の最大indexで割り、0〜100の整数にする。
- Booleanは `probability * 100` を整数にする。
- Choiceは選択された候補のprobabilityを0〜100の整数にする。分布がない場合は不正応答とする。
- すべて有限値かつ所定範囲であることを検証し、暗黙の欠損補完は行わない。

Quota record:

- Cookie：`jenny_user_id`。ランダムUUID、HttpOnly、SameSite=Lax、本番のみSecure。
- KV key：`jenny:quota:v1:{JST日付}:{匿名ID}`。
- Value：その日に予約された分析回数。
- TTL：次のJST午前0時を過ぎるまで。
- 上限：5回。プロバイダー失敗時は予約を戻す。

## Scripts

- `npm run test:jenny`：質問数、型、値変換、校正ケース数を検証する。
- `npm run build`：型検査を含む本番ビルドを行う。
- 実JevスモークテストはAI Gatewayキーのある環境だけで手動実行し、CIでは外部APIを呼ばない。

## Environment Variables

- `AI_GATEWAY_API_KEY`：Jenny専用のプロジェクトスコープAI Gatewayキー。未設定時は503。
- `KV_REST_API_URL` / `KV_REST_API_TOKEN`：本番の日次制限に必須。未設定または障害時は本番で503。
- ローカル開発ではKV未設定時だけ、プロセス内メモリの回数管理を使用できる。

Gateway側で月額10 USDのハード予算を設定する。これはコードではなくVercel管理画面で設定する運用条件とする。

AI Gatewayへの要求は `disallowPromptTraining: true` とする。アプリ側では本文と結果を永続化しないが、Zero Data Retentionは要求しないため、外部サービス上での即時完全削除は保証しない。
