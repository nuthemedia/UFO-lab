import type { Experimental_EvaluationQuestion } from "ai";

export const JENNY_QUESTION_SET_VERSION = "jev-ufo-v1" as const;

const SIX_LEVEL_SCALE = [
  "0｜該当する情報や根拠がない",
  "1｜ごく弱い、または情報が著しく不足している",
  "2｜弱いが、限定的な根拠がある",
  "3｜中程度で、肯定・否定の材料が混在する",
  "4｜強く、複数の具体的根拠がある",
  "5｜非常に強く、明確で一貫した根拠がある",
] as const;

export const JENNY_QUESTIONS = {
  reliability: {
    type: "score",
    instructions:
      "報告者への好悪やUFOらしさではなく、文章に記載された観察条件、具体性、整合性、情報源から、この報告を事実記録として検討できる確からしさを評価してください。",
    criteria: [
      "根拠となる観察情報がほぼなく、検討不能",
      "情報が断片的で、重大な欠落または曖昧さがある",
      "最低限の状況は分かるが、確認に必要な情報が不足",
      "具体的な情報があり概ね整合するが、弱点も残る",
      "観察条件と記述が具体的かつ整合し、情報源も比較的明確",
      "独立検討に耐えるほど具体的・一貫しており、情報源と記録条件が明確",
    ],
  },
  detailSpecificity: {
    type: "score",
    instructions: "日時、場所、距離、継続時間、方向、形状、動きなど、検討可能な具体情報の充実度を評価してください。",
    criteria: SIX_LEVEL_SCALE,
  },
  spatiotemporalConsistency: {
    type: "boolean",
    instructions: "報告内の時刻、順序、距離、位置、移動の記述は相互に整合していますか。",
    criteria: {
      true: "明確な矛盾がなく、時空間の記述が整合している",
      false: "重大な矛盾がある、または整合性を評価できる情報がない",
    },
  },
  sourceTraceability: {
    type: "score",
    instructions: "一次証言、記録日時、作成者、引用元など、情報源を追跡できる度合いを評価してください。",
    criteria: SIX_LEVEL_SCALE,
  },
  strangeness: {
    type: "score",
    instructions:
      "単なる珍しさではなく、記載された形状、運動、作用、状況が通常の航空・天文・気象・光学現象からどれほど逸脱しているかを評価してください。証拠の強さや報告者の信用性とは分けてください。",
    criteria: [
      "通常現象として自然で、異常性がない",
      "やや珍しいが、通常現象で容易に説明できる",
      "一部に異常な印象があるが、既知現象の範囲内",
      "複数の異常特徴があり、単純な説明では不足する",
      "既知現象から大きく逸脱する具体的特徴がある",
      "複数の強い異常特徴が同時にあり、通常の枠組みでは極めて説明困難",
    ],
  },
  closeEncounter: {
    type: "choice",
    instructions:
      "ハイネックの近接遭遇分類として最も適合するものを選んでください。近距離である根拠がなければnoneを選んでください。",
    criteria: {
      CE1: "近距離で異常物体を観察したが、物理的作用や存在者の報告はない",
      CE2: "近距離遭遇に加え、車両・電気・地面・植物・人体などへの物理的または生理的作用が報告される",
      CE3: "近距離遭遇に加え、存在者・搭乗者・人型などの目撃が報告される",
      none: "遠距離の光点、近距離の根拠不足、またはCE1〜CE3に該当しない",
    },
  },
  proximity: {
    type: "score",
    instructions: "本文から読み取れる目撃者と現象の接近度を評価してください。距離が不明な場合は低くしてください。",
    criteria: [
      "距離不明、または遠距離",
      "数km以上とみられる",
      "数百m〜数km程度",
      "おおむね150m以内と判断できる",
    ],
  },
  physicalEffects: {
    type: "boolean",
    instructions: "車両、電気機器、地面、植物、動物、人体などへの物理的・生理的作用が具体的に報告されていますか。",
    criteria: {
      true: "具体的な作用が記載されている",
      false: "作用がない、曖昧、または記載されていない",
    },
  },
  entityPresence: {
    type: "boolean",
    instructions: "物体とは別に、存在者、搭乗者、人型、生物の目撃が具体的に報告されていますか。",
    criteria: {
      true: "存在者や搭乗者の具体的な目撃がある",
      false: "存在者の報告がない、または曖昧な印象だけである",
    },
  },
  trueUfo: {
    type: "boolean",
    instructions:
      "本文内の情報だけを使い、天体、航空機、ドローン、気球、気象、光学、撮影機器、誤認などを検討した後も、説明困難な報告として残りますか。これは異星人起源の確率ではありません。",
    criteria: {
      true: "具体的な異常特徴があり、主要な通常説明を検討しても説明困難性が残る",
      false: "通常・既知現象で十分説明できる、または情報不足で説明困難とは判断できない",
    },
  },
  astronomicalExplanation: {
    type: "boolean",
    instructions: "星、惑星、月、流星、人工衛星などの天体・宇宙活動で説明できる可能性がありますか。",
    criteria: { true: "天体説明と整合する", false: "天体説明と整合しにくい" },
  },
  humanAerialExplanation: {
    type: "boolean",
    instructions: "航空機、ヘリコプター、ドローン、気球、灯籠などの人工飛翔物で説明できる可能性がありますか。",
    criteria: { true: "人工飛翔物の説明と整合する", false: "人工飛翔物の説明と整合しにくい" },
  },
  atmosphericOpticalExplanation: {
    type: "boolean",
    instructions: "雲、雷、反射、蜃気楼、レンズフレア、手ぶれ、圧縮などの気象・光学・撮影要因で説明できる可能性がありますか。",
    criteria: { true: "気象・光学・撮影要因と整合する", false: "それらの説明と整合しにくい" },
  },
  evidenceStrength: {
    type: "score",
    instructions:
      "報告のもっともらしさとは分けて、独立証言、写真、映像、レーダー、物理痕跡、同時代資料など、主張を外部から裏付ける証拠の量と質を評価してください。",
    criteria: [
      "単独の文章だけで、外部の裏付けがない",
      "補助的な主張はあるが、独立確認できない",
      "限定的な追加証言または低品質な記録がある",
      "複数の裏付けがあるが、独立性または品質に弱点がある",
      "独立証言や記録・センサー・物理資料の強い組み合わせがある",
      "複数種類の高品質で独立した証拠が相互に整合する",
    ],
  },
  independentWitnesses: {
    type: "boolean",
    instructions: "互いの影響を受けずに確認された複数目撃者または独立証言がありますか。",
    criteria: { true: "独立した複数の証言がある", false: "単独証言、独立性不明、または記載なし" },
  },
  recordingSensorEvidence: {
    type: "score",
    instructions: "写真、映像、音声、レーダー、計測器などの記録証拠の有無と品質を評価してください。",
    criteria: ["記録なし", "存在の主張だけ、または検証困難", "限定的・低品質な記録", "複数または高品質で検討可能な記録"],
  },
  physicalDocumentaryEvidence: {
    type: "score",
    instructions: "物理痕跡、公式記録、新聞、日誌、同時代文書などの有無と検討可能性を評価してください。",
    criteria: ["資料なし", "存在の主張だけ、または出典不明", "限定的だが追跡可能な資料", "複数の具体的で検証可能な資料"],
  },
  fakeIndicators: {
    type: "boolean",
    instructions:
      "文章内部の矛盾、不自然な時系列、既知情報との作為的な一致、創作・誇張・加工を示唆する特徴がありますか。真偽や報告者の意図を断定せず、文章から検出できる兆候だけを評価してください。",
    criteria: {
      true: "フェイク、創作、誇張、加工を疑う具体的な兆候がある",
      false: "そのような兆候がない、または文章だけでは検出できない",
    },
  },
  contradictions: {
    type: "boolean",
    instructions: "文章内部に、同時に成立しにくい記述や時系列・距離・位置の明確な矛盾がありますか。",
    criteria: { true: "具体的な矛盾がある", false: "明確な矛盾はない" },
  },
  fabricationSignals: {
    type: "boolean",
    instructions: "創作、誇張、転載改変、画像・記録の加工を疑う具体的な言語的兆候がありますか。",
    criteria: { true: "具体的な作為の兆候がある", false: "具体的な作為の兆候はない" },
  },
} as const satisfies Record<string, Experimental_EvaluationQuestion>;

export type JennyQuestionId = keyof typeof JENNY_QUESTIONS;
