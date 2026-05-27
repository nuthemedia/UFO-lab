"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { HynekDashboardData } from "@/lib/hynekStore";

type UfoTypeId =
  | "evidence"
  | "cautious"
  | "romantic"
  | "witness"
  | "wonder"
  | "news"
  | "entertainment"
  | "contact";

type TraitId =
  | "evidence"
  | "cautious"
  | "romantic"
  | "witness"
  | "wonder"
  | "news"
  | "entertainment"
  | "contact";

type ScoreMap = Partial<Record<UfoTypeId, number>>;

type Choice = {
  id: string;
  label: string;
  scores: ScoreMap;
  traits: TraitId[];
};

type QuestionId =
  | "q1"
  | "q2"
  | "q3"
  | "q4"
  | "q5"
  | "q6"
  | "q7"
  | "q8"
  | "q9"
  | "q10"
  | "q11"
  | "q12"
  | "q13"
  | "q14"
  | "q15";

type StepId = "intro" | QuestionId | "age" | "gender" | "region" | "result";

type Question = {
  id: QuestionId;
  prompt: string;
  note?: string;
  options: Choice[];
  visibleWhen?: (answers: AnswersState) => boolean;
};

type AnswersState = {
  questions: Record<QuestionId, string>;
  age: string;
  gender: string;
  region: string;
};

type ResultProfile = {
  label: string;
  description: string;
  sampleShare: number;
  accent: string;
};

type CardAssets = {
  male: string;
  female: string;
};

const resultTypeOrder: UfoTypeId[] = [
  "witness",
  "contact",
  "news",
  "evidence",
  "wonder",
  "cautious",
  "romantic",
  "entertainment",
];

const traitLabels: Record<TraitId, string> = {
  evidence: "証拠に寄る",
  cautious: "慎重に保留する",
  romantic: "ロマンを残す",
  witness: "体験を重く見る",
  wonder: "未知を楽しむ",
  news: "ニュースを追う",
  entertainment: "エンタメとして見る",
  contact: "接触・メッセージに関心",
};

const resultProfiles: Record<UfoTypeId, ResultProfile> = {
  evidence: {
    label: "証拠重視UFOファン",
    description:
      "来歴、一次資料、編集痕跡を先に見に行くタイプです。話題の熱よりも、確認できる根拠の厚みを重視します。",
    sampleShare: 21,
    accent: "#3e6356",
  },
  cautious: {
    label: "慎重派UFOファン",
    description:
      "即断せず、判断保留をうまく使うタイプです。未知は否定しきらず、でも飛びつきすぎないバランス感があります。",
    sampleShare: 16,
    accent: "#66777a",
  },
  romantic: {
    label: "ロマン派UFOファン",
    description:
      "説明のつかない余白に、物語や宇宙的な気配を感じるタイプです。断定よりも、夢のある可能性を残して考えます。",
    sampleShare: 14,
    accent: "#7c6a3f",
  },
  witness: {
    label: "目撃体験重視派",
    description:
      "実際に見た人の感覚や現場の空気を大切にするタイプです。映像だけでは拾えない違和感も気にします。",
    sampleShare: 10,
    accent: "#5b6f8d",
  },
  wonder: {
    label: "不思議好きUFOファン",
    description:
      "説明不能なものに出会うと、まず面白さと余白を受け取るタイプです。結論を急がず、未知そのものを楽しみます。",
    sampleShare: 15,
    accent: "#4f7366",
  },
  news: {
    label: "ニュース追跡派",
    description:
      "政府発表、公開文書、追加会見などを追いかけるタイプです。話題の温度よりも、更新の速さに反応します。",
    sampleShare: 9,
    accent: "#436a82",
  },
  entertainment: {
    label: "エンタメUFOファン",
    description:
      "UFOをカルチャーや娯楽として楽しむタイプです。真偽の判定よりも、楽しみ方のバリエーションを大切にします。",
    sampleShare: 8,
    accent: "#8c6f4d",
  },
  contact: {
    label: "接触・メッセージ関心派",
    description:
      "コンタクティ、チャネリング、接触体験の話に感度があるタイプです。メッセージ性や対話の可能性に目が向きます。",
    sampleShare: 7,
    accent: "#6a6582",
  },
};

const resultCardAssets: Record<UfoTypeId, CardAssets> = {
  evidence: {
    male: "/hynek/evidence-male.png",
    female: "/hynek/evidence-female.png",
  },
  cautious: {
    male: "/hynek/cautious-male.png",
    female: "/hynek/cautious-female.png",
  },
  romantic: {
    male: "/hynek/romantic-male.png",
    female: "/hynek/romantic-female.png",
  },
  witness: {
    male: "/hynek/witness-male.png",
    female: "/hynek/witness-female.png",
  },
  wonder: {
    male: "/hynek/wonder-male.png",
    female: "/hynek/wonder-female.png",
  },
  news: {
    male: "/hynek/news-male.png",
    female: "/hynek/news-female.png",
  },
  entertainment: {
    male: "/hynek/entertainment-male.png",
    female: "/hynek/entertainment-female.png",
  },
  contact: {
    male: "/hynek/contact-male.png",
    female: "/hynek/contact-female.png",
  },
};

const ageOptions = ["10代", "20代", "30代", "40代", "50代", "60代以上", "回答しない"];
const genderOptions = ["男性", "女性", "回答しない"];

const prefectures = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

function score(map: ScoreMap): ScoreMap {
  return map;
}

function trait(...traits: TraitId[]) {
  return traits;
}

const questions: Question[] = [
  {
    id: "q1",
    prompt: "UFOという言葉を見かけると？",
    options: [
      { id: "react", label: "つい反応してしまう", scores: score({ romantic: 2, wonder: 1 }), traits: trait("romantic", "wonder") },
      { id: "curious", label: "本物か気になる", scores: score({ romantic: 1, cautious: 1 }), traits: trait("romantic", "cautious") },
      { id: "check", label: "証拠を確認したくなる", scores: score({ evidence: 2, cautious: 1 }), traits: trait("evidence", "cautious") },
      { id: "play", label: "エンタメとして楽しむ", scores: score({ entertainment: 3 }), traits: trait("entertainment") },
      { id: "doubt", label: "正直かなり疑っている", scores: score({ cautious: 2, evidence: 1 }), traits: trait("cautious", "evidence") },
    ],
  },
  {
    id: "q2",
    prompt: "UFO / UAPの正体として一番近いと思うのは？",
    options: [
      { id: "ship", label: "宇宙人の乗り物", scores: score({ romantic: 2, contact: 1 }), traits: trait("romantic", "contact") },
      { id: "angel", label: "悪魔か天使？", scores: score({ wonder: 2, contact: 1 }), traits: trait("wonder", "contact") },
      { id: "secret", label: "軍や政府の秘密技術", scores: score({ news: 2, cautious: 1 }), traits: trait("news", "cautious") },
      { id: "misread", label: "誤認や自然現象", scores: score({ cautious: 2, evidence: 1 }), traits: trait("cautious", "evidence") },
      { id: "fake", label: "AI画像やフェイク", scores: score({ evidence: 2, cautious: 2 }), traits: trait("evidence", "cautious") },
      { id: "psych", label: "心理・文化・超常現象", scores: score({ wonder: 3 }), traits: trait("wonder") },
      { id: "unknown", label: "まだ説明できない未知現象", scores: score({ romantic: 1, wonder: 2 }), traits: trait("romantic", "wonder") },
    ],
  },
  {
    id: "q3",
    prompt: "宇宙人について今のあなたに近いのは？",
    options: [
      { id: "certain", label: "必ず存在する", scores: score({ romantic: 2, contact: 1 }), traits: trait("romantic", "contact") },
      { id: "likely", label: "星はたくさんあるから存在しても不思議ではない", scores: score({ romantic: 1, cautious: 1 }), traits: trait("romantic", "cautious") },
      { id: "unsure", label: "わからない", scores: score({ cautious: 1 }), traits: trait("cautious") },
      { id: "nope", label: "いるはずがない", scores: score({ cautious: 3 }), traits: trait("cautious") },
    ],
  },
  {
    id: "q4",
    prompt: "「宇宙人は地球に来ている」という話については？",
    options: [
      { id: "already", label: "もう来ていると思う", scores: score({ contact: 2, romantic: 2 }), traits: trait("contact", "romantic") },
      { id: "maybe", label: "一部は本当かもしれない", scores: score({ romantic: 1, cautious: 1 }), traits: trait("romantic", "cautious") },
      { id: "unsure", label: "わからない", scores: score({ cautious: 1 }), traits: trait("cautious") },
      { id: "doubt", label: "かなり疑っている", scores: score({ cautious: 3, evidence: 1 }), traits: trait("cautious", "evidence") },
      { id: "sci-fi", label: "SFとしては好き", scores: score({ entertainment: 3 }), traits: trait("entertainment") },
    ],
  },
  {
    id: "q5",
    prompt: "UFO映像を見たとき、あなたはまずどうする？",
    options: [
      { id: "maybe-real", label: "「本物かも」と思う", scores: score({ romantic: 2 }), traits: trait("romantic") },
      { id: "source", label: "出典を確認したくなる", scores: score({ evidence: 3 }), traits: trait("evidence") },
      { id: "ai", label: "AIやフェイクを疑う", scores: score({ evidence: 2, cautious: 2 }), traits: trait("evidence", "cautious") },
      { id: "joke", label: "ネタとして楽しむ", scores: score({ entertainment: 3 }), traits: trait("entertainment") },
    ],
  },
  {
    id: "q6",
    prompt: "アメリカ政府や軍のUFO情報について、あなたに近い感覚は？",
    options: [
      { id: "hide", label: "政府は重大な情報を隠している", scores: score({ news: 2, romantic: 1 }), traits: trait("news", "romantic") },
      { id: "some", label: "何かは隠していそう", scores: score({ news: 2, cautious: 1 }), traits: trait("news", "cautious") },
      { id: "messy", label: "情報整理が追いついていないだけだと思う", scores: score({ cautious: 2, evidence: 1 }), traits: trait("cautious", "evidence") },
      { id: "nothing", label: "大きな秘密はないと思う", scores: score({ cautious: 2 }), traits: trait("cautious") },
      { id: "overblown", label: "そもそも騒ぎすぎだと思う", scores: score({ cautious: 3 }), traits: trait("cautious") },
    ],
  },
  {
    id: "q7",
    prompt: "UFOを考えるとき、一番大事にしたいのは？",
    options: [
      { id: "witness", label: "目撃者の体験", scores: score({ witness: 3 }), traits: trait("witness") },
      { id: "photo", label: "写真や動画", scores: score({ evidence: 2 }), traits: trait("evidence") },
      { id: "docs", label: "公文書や一次資料", scores: score({ evidence: 2, news: 2 }), traits: trait("evidence", "news") },
      { id: "science", label: "科学的な検証", scores: score({ evidence: 2, cautious: 2 }), traits: trait("evidence", "cautious") },
      { id: "romance", label: "不思議さやロマン", scores: score({ romantic: 3 }), traits: trait("romantic") },
      { id: "culture", label: "人間心理や文化との関係", scores: score({ wonder: 3 }), traits: trait("wonder") },
    ],
  },
  {
    id: "q8",
    prompt: "アブダクション体験談を聞くと？",
    options: [
      { id: "real", label: "本当に起きた話もあると思う", scores: score({ contact: 2, witness: 1 }), traits: trait("contact", "witness") },
      { id: "unk", label: "一部は説明できないと思う", scores: score({ wonder: 1, cautious: 1 }), traits: trait("wonder", "cautious") },
      { id: "culture", label: "心理・文化現象として興味深い", scores: score({ wonder: 3 }), traits: trait("wonder") },
      { id: "false", label: "作り話や誤認が多いと思う", scores: score({ cautious: 2, evidence: 1 }), traits: trait("cautious", "evidence") },
      { id: "what", label: "アブダクションって何？", scores: score({ entertainment: 1 }), traits: trait("entertainment") },
    ],
  },
  {
    id: "q9",
    prompt: "コンタクティについて、あなたに近いのは？",
    options: [
      { id: "what", label: "コンタクティって何？", scores: score({ entertainment: 1 }), traits: trait("entertainment") },
      { id: "heard", label: "名前くらいは聞いたことがある", scores: score({ romantic: 1 }), traits: trait("romantic") },
      { id: "fun", label: "面白いけど半信半疑", scores: score({ wonder: 1, cautious: 1 }), traits: trait("wonder", "cautious") },
      { id: "believe", label: "本当に接触している人もいると思う", scores: score({ contact: 3, romantic: 1 }), traits: trait("contact", "romantic") },
      { id: "me", label: "私がコンタクティだ！", scores: score({ contact: 5 }), traits: trait("contact") },
      { id: "pass", label: "答えたくない", scores: score({}), traits: trait() },
    ],
  },
  {
    id: "q10",
    prompt: "宇宙人チャネリングについて、あなたは？",
    options: [
      { id: "important", label: "宇宙からの重要なメッセージだと思う", scores: score({ contact: 4 }), traits: trait("contact") },
      { id: "interesting", label: "一部は興味深い", scores: score({ contact: 2, wonder: 1 }), traits: trait("contact", "wonder") },
      { id: "culture", label: "文化現象として面白い", scores: score({ wonder: 3 }), traits: trait("wonder") },
      { id: "doubt", label: "かなり疑っている", scores: score({ cautious: 2, evidence: 1 }), traits: trait("cautious", "evidence") },
      { id: "what", label: "チャネリングって何？", scores: score({ entertainment: 1 }), traits: trait("entertainment") },
    ],
  },
  {
    id: "q11",
    prompt: "UFOらしきものを見たことは？",
    options: [
      { id: "certain", label: "はっきりある", scores: score({ witness: 5 }), traits: trait("witness") },
      { id: "maybe", label: "たぶんある", scores: score({ witness: 3 }), traits: trait("witness") },
      { id: "no", label: "ない", scores: score({}), traits: trait() },
      { id: "unsure", label: "わからない", scores: score({ wonder: 1 }), traits: trait("wonder") },
      { id: "pass", label: "答えたくない", scores: score({}), traits: trait() },
    ],
  },
  {
    id: "q12",
    prompt: "その体験でUFOへの考え方は変わった？",
    note: "Q11で「はっきりある」「たぶんある」を選んだ場合のみ表示します。",
    visibleWhen: (answers) => ["certain", "maybe"].includes(answers.questions.q11),
    options: [
      { id: "big", label: "かなり変わった", scores: score({ witness: 4 }), traits: trait("witness") },
      { id: "little", label: "少し変わった", scores: score({ witness: 2 }), traits: trait("witness") },
      { id: "same", label: "特に変わらなかった", scores: score({ cautious: 1 }), traits: trait("cautious") },
      { id: "open", label: "まだ整理できていない", scores: score({ wonder: 1, witness: 1 }), traits: trait("wonder", "witness") },
    ],
  },
  {
    id: "q13",
    prompt: "そのとき見えたものに近いのは？",
    note: "Q11で「はっきりある」「たぶんある」を選んだ場合のみ表示します。",
    visibleWhen: (answers) => ["certain", "maybe"].includes(answers.questions.q11),
    options: [
      { id: "light", label: "光", scores: score({ witness: 1 }), traits: trait("witness") },
      { id: "disc", label: "円盤", scores: score({ romantic: 1, witness: 1 }), traits: trait("romantic", "witness") },
      { id: "triangle", label: "三角形", scores: score({ news: 1, witness: 1 }), traits: trait("news", "witness") },
      { id: "sphere", label: "球体", scores: score({ wonder: 1, witness: 1 }), traits: trait("wonder", "witness") },
      { id: "cigar", label: "葉巻型", scores: score({ romantic: 1, witness: 1 }), traits: trait("romantic", "witness") },
      { id: "formation", label: "編隊", scores: score({ witness: 1 }), traits: trait("witness") },
      { id: "speed", label: "高速移動", scores: score({ witness: 1 }), traits: trait("witness") },
      { id: "vanish", label: "突然消えた", scores: score({ wonder: 1, witness: 1 }), traits: trait("wonder", "witness") },
      { id: "other", label: "どれにもあてはまらない", scores: score({ witness: 1 }), traits: trait("witness") },
    ],
  },
  {
    id: "q14",
    prompt: "今のあなたに近いのは？",
    options: [
      { id: "very-real", label: "UFOはかなり本物だと思っている", scores: score({ romantic: 3 }), traits: trait("romantic") },
      { id: "cases", label: "本当のケースもあると思う", scores: score({ cautious: 1, romantic: 1 }), traits: trait("cautious", "romantic") },
      { id: "culture", label: "不思議な文化現象として興味がある", scores: score({ wonder: 3 }), traits: trait("wonder") },
      { id: "doubt", label: "まず疑って考えたい", scores: score({ cautious: 3, evidence: 1 }), traits: trait("cautious", "evidence") },
      { id: "fun", label: "エンタメとして楽しむのが好き", scores: score({ entertainment: 3 }), traits: trait("entertainment") },
    ],
  },
  {
    id: "q15",
    prompt: "最近のUAPニュースについて、あなたは？",
    options: [
      { id: "hearings", label: "議会証言や政府発表を追っている", scores: score({ news: 4, evidence: 1 }), traits: trait("news", "evidence") },
      { id: "headline", label: "見出しを見かけると気になる", scores: score({ news: 2 }), traits: trait("news") },
      { id: "somewhat", label: "よくわからないが少し気になる", scores: score({ romantic: 1 }), traits: trait("romantic") },
      { id: "not-following", label: "あまり追っていない", scores: score({}), traits: trait() },
      { id: "classic", label: "ニュースより昔のUFO話の方が好き", scores: score({ romantic: 1, wonder: 1 }), traits: trait("romantic", "wonder") },
    ],
  },
];

const attributeOptions = {
  age: ageOptions,
  gender: genderOptions,
} as const;

const initialAnswers = (): AnswersState => ({
  questions: {
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
    q6: "",
    q7: "",
    q8: "",
    q9: "",
    q10: "",
    q11: "",
    q12: "",
    q13: "",
    q14: "",
    q15: "",
  },
  age: "",
  gender: "",
  region: "",
});

function isBranchVisible(answers: AnswersState) {
  return ["certain", "maybe"].includes(answers.questions.q11);
}

function getFlow(answers: AnswersState) {
  const flow: StepId[] = [
    "intro",
    "q1",
    "q2",
    "q3",
    "q4",
    "q5",
    "q6",
    "q7",
    "q8",
    "q9",
    "q10",
    "q11",
  ];

  if (isBranchVisible(answers)) {
    flow.push("q12", "q13");
  }

  flow.push("q14", "q15", "age", "gender", "region", "result");
  return flow;
}

function getQuestionById(questionId: QuestionId) {
  return questions.find((question) => question.id === questionId) as Question;
}

function formatQuestionNumber(questionId: QuestionId) {
  const index = questions.findIndex((question) => question.id === questionId);
  return index >= 0 ? `Q${index + 1}` : "";
}

function calculateResults(answers: AnswersState) {
  const scores: Record<UfoTypeId, number> = {
    evidence: 0,
    cautious: 0,
    romantic: 0,
    witness: 0,
    wonder: 0,
    news: 0,
    entertainment: 0,
    contact: 0,
  };
  const traitCounts: Record<TraitId, number> = {
    evidence: 0,
    cautious: 0,
    romantic: 0,
    witness: 0,
    wonder: 0,
    news: 0,
    entertainment: 0,
    contact: 0,
  };

  for (const question of questions) {
    if (question.visibleWhen && !question.visibleWhen(answers)) {
      continue;
    }

    const selected = answers.questions[question.id];
    if (!selected) {
      continue;
    }

    const choice = question.options.find((option) => option.id === selected);
    if (!choice) {
      continue;
    }

    for (const [typeId, value] of Object.entries(choice.scores) as [UfoTypeId, number][]) {
      scores[typeId] += value;
    }

    for (const currentTrait of choice.traits) {
      traitCounts[currentTrait] += 1;
    }
  }

  const resultType = resultTypeOrder.reduce((currentBest, candidate) => {
    if (scores[candidate] > scores[currentBest]) {
      return candidate;
    }

    if (scores[candidate] === scores[currentBest]) {
      return resultTypeOrder.indexOf(candidate) < resultTypeOrder.indexOf(currentBest)
        ? candidate
        : currentBest;
    }

    return currentBest;
  });

  const profile = resultProfiles[resultType];
  const totalScore = Object.values(scores).reduce((sum, value) => sum + value, 0);

  const topTraits = Object.entries(traitCounts)
    .filter(([, value]) => value > 0)
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }

      return resultTypeOrder.indexOf(a[0] as UfoTypeId) - resultTypeOrder.indexOf(b[0] as UfoTypeId);
    })
    .slice(0, 3)
    .map(([traitId, value]) => ({
      id: traitId as TraitId,
      label: traitLabels[traitId as TraitId],
      value,
    }));

  return {
    resultType,
    profile,
    totalScore,
    scores,
    topTraits,
  };
}

function ProgressBar({
  currentIndex,
  total,
  label,
}: {
  currentIndex: number;
  total: number;
  label: string;
}) {
  const progress = total > 0 ? (currentIndex / total) * 100 : 0;
  const displayIndex = Math.min(currentIndex, total);

  return (
    <div className="hynek-progress" aria-label="診断の進行状況">
      <div className="hynek-progress-row">
        <span>{label}</span>
        <strong>
          {displayIndex} / {total}
        </strong>
      </div>
      <div className="hynek-progress-track" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function ChoiceGrid({
  question,
  selected,
  onSelect,
}: {
  question: Question;
  selected: string;
  onSelect: (choiceId: string) => void;
}) {
  return (
    <div className="hynek-option-grid" role="listbox" aria-label={question.prompt}>
      {question.options.map((option) => {
        const isSelected = selected === option.id;

        return (
          <button
            key={option.id}
            className={`hynek-option-card${isSelected ? " is-selected" : ""}`}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(option.id)}
          >
            <span className="hynek-option-marker" aria-hidden="true" />
            <span className="hynek-option-body">
              <strong>{option.label}</strong>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function AttributeSelect({
  label,
  value,
  onChange,
  children,
  note,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  note?: string;
}) {
  return (
    <label className="hynek-field">
      <span className="hynek-field-label">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
      {note ? <span className="hynek-field-note">{note}</span> : null}
    </label>
  );
}

function ResultBars({
  items,
  highlightId,
}: {
  items: { id: UfoTypeId; label: string; value: number; accent: string }[];
  highlightId: UfoTypeId;
}) {
  return (
    <div className="hynek-bar-list" aria-label="全体の傾向">
      {items.map((item) => {
        const isHighlight = item.id === highlightId;

        return (
          <div className={`hynek-bar-row${isHighlight ? " is-highlight" : ""}`} key={item.id}>
            <div className="hynek-bar-label">
              <strong>{item.label}</strong>
              <span>{item.value}%</span>
            </div>
            <div className="hynek-bar-track" aria-hidden="true">
              <span style={{ width: `${item.value}%`, background: item.accent }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function percentOfCount(count: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((count / total) * 100);
}

function ShareCard({
  profile,
  sharePercent,
  age,
  gender,
  region,
  resultType,
}: {
  profile: ResultProfile;
  sharePercent: number;
  age: string;
  gender: string;
  region: string;
  resultType: UfoTypeId;
}) {
  const imageSrc = gender === "女性" ? resultCardAssets[resultType].female : resultCardAssets[resultType].male;
  const genderLabel = gender === "女性" ? "女性版カード" : "男性版カード";

  return (
    <section className="hynek-share-card" aria-label="シェア画像風カード" style={{ borderColor: profile.accent }}>
      <span className="hynek-share-badge">SHARE</span>
      <p className="hynek-share-eyebrow">Hynek - UFOファンタイプ診断</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hynek-share-image" src={imageSrc} alt={`${profile.label}の${genderLabel}`} />
      <h3>{profile.label}</h3>
      <p className="hynek-share-copy">{profile.description}</p>
      <div className="hynek-share-meta">
        <span>全体の{sharePercent}%に近い</span>
        <span>{age || "年代未回答"}</span>
        <span>{gender || "性別未回答"}</span>
        <span>{region || "居住地域未回答"}</span>
      </div>
    </section>
  );
}

export function HynekFanTypeMockup() {
  const [currentStep, setCurrentStep] = useState<StepId>("intro");
  const [answers, setAnswers] = useState<AnswersState>(initialAnswers);
  const [dashboardData, setDashboardData] = useState<HynekDashboardData | null>(null);
  const submittedSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const flow = useMemo(() => getFlow(answers), [answers]);
  const currentIndex = flow.indexOf(currentStep);
  const currentVisibleStep = currentIndex >= 0 ? flow[currentIndex] : "intro";
  const result = calculateResults(answers);
  const resultImageSrc = answers.gender === "女性"
    ? resultCardAssets[result.resultType].female
    : resultCardAssets[result.resultType].male;
  const resultImageAlt = `${result.profile.label}${answers.gender === "女性" ? "女性版" : "男性版"}カード`;
  const totalResponses = dashboardData?.counts.totalResponses || 0;
  const typeCount = dashboardData?.counts.typeCounts[result.resultType] || 0;
  const currentShare = totalResponses > 0 ? Math.round((typeCount / totalResponses) * 100) : 0;
  const shareText = `Hynek v1 - UFOファンタイプ診断の結果は「${result.profile.label}」でした。`;
  const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent("https://ufolab.tokyo/hynek")}`;
  const currentQuestion =
    currentVisibleStep !== "intro" &&
    currentVisibleStep !== "age" &&
    currentVisibleStep !== "gender" &&
    currentVisibleStep !== "region" &&
    currentVisibleStep !== "result"
      ? getQuestionById(currentVisibleStep as QuestionId)
      : null;

  const canGoBack = currentIndex > 0;
  const isQuestionStep = Boolean(currentQuestion);
  const isAttributeStep = currentVisibleStep === "age" || currentVisibleStep === "gender" || currentVisibleStep === "region";
  const activeStepLabel = (() => {
    if (currentVisibleStep === "intro") {
      return "診断を開始";
    }

    if (currentVisibleStep === "result") {
      return "結果";
    }

    if (currentVisibleStep === "age") {
      return "属性 1 / 3";
    }

    if (currentVisibleStep === "gender") {
      return "属性 2 / 3";
    }

    if (currentVisibleStep === "region") {
      return "属性 3 / 3";
    }

    if (currentQuestion) {
      return `${formatQuestionNumber(currentQuestion.id)} / ${questions.length}`;
    }

    return "Hynek";
  })();

  function startDiagnosis() {
    setCurrentStep("q1");
  }

  function restartDiagnosis() {
    setAnswers(initialAnswers());
    setDashboardData(null);
    submittedSignatureRef.current = null;
    setCurrentStep("intro");
  }

  function goBack() {
    if (!canGoBack) {
      return;
    }

    setCurrentStep(flow[currentIndex - 1]);
  }

  function goNext() {
    if (currentIndex < 0) {
      return;
    }

    const nextStep = flow[currentIndex + 1];
    if (nextStep) {
      setCurrentStep(nextStep);
    }
  }

  function selectQuestionAnswer(questionId: QuestionId, choiceId: string) {
    setAnswers((current) => ({
      ...current,
      questions: {
        ...current.questions,
        [questionId]: choiceId,
      },
    }));
  }

  function currentQuestionSelectedValue() {
    return currentQuestion ? answers.questions[currentQuestion.id] : "";
  }

  function currentAttributeSelectedValue() {
    if (currentVisibleStep === "age") {
      return answers.age;
    }

    if (currentVisibleStep === "gender") {
      return answers.gender;
    }

    if (currentVisibleStep === "region") {
      return answers.region;
    }

    return "";
  }

  function setAttributeValue(value: string) {
    setAnswers((current) => {
      if (currentVisibleStep === "age") {
        return { ...current, age: value };
      }

      if (currentVisibleStep === "gender") {
        return { ...current, gender: value };
      }

      if (currentVisibleStep === "region") {
        return { ...current, region: value };
      }

      return current;
    });
  }

  useEffect(() => {
    if (currentVisibleStep !== "result") {
      return;
    }

    const signature = JSON.stringify({
      resultType: result.resultType,
      totalScore: result.totalScore,
      answers,
    });

    if (submittedSignatureRef.current === signature) {
      return;
    }

    submittedSignatureRef.current = signature;

    const controller = new AbortController();

    async function submitResult() {
      try {
        const response = await fetch("/api/hynek", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resultType: result.resultType,
            totalScore: result.totalScore,
            answers,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { dashboard?: HynekDashboardData };
        if (payload.dashboard) {
          setDashboardData(payload.dashboard);
        }
      } catch {
        // live集計が失敗しても診断自体は継続する
      }
    }

    submitResult();

    return () => controller.abort();
  }, [answers, currentVisibleStep, result.resultType, result.totalScore]);

  const canAdvance =
    currentVisibleStep === "intro"
      ? true
      : isQuestionStep
        ? Boolean(currentQuestionSelectedValue())
        : isAttributeStep
          ? Boolean(currentAttributeSelectedValue())
          : true;

  return (
    <>
      <article className="hynek-panel">
        <ProgressBar currentIndex={Math.max(currentIndex, 0)} total={Math.max(flow.length - 1, 1)} label={activeStepLabel} />

        {currentVisibleStep === "intro" ? (
          <section className="hynek-stage hynek-stage-intro" aria-labelledby="hynek-start-heading">
            <div className="hynek-start-copy">
              <p className="hynek-label">参加型コンテンツ</p>
              <h2 id="hynek-start-heading">あなたはどんなUFOファン？</h2>
              <p>
                質問に答えてあなたのUFOファンタイプを診断しましょう。
                <Link href="/hynek/dashboard">「日本のUFO観ダッシュボード」</Link>で全体の傾向も確認できます。
              </p>
            </div>

            <p className="hynek-disclaimer">
              任意回答による非科学的集計です。UFO・宇宙人・アブダクションの事実認定は行いません。
            </p>

            <div className="hynek-actions hynek-actions-intro">
              <button className="hynek-primary" type="button" onClick={startDiagnosis}>
                診断を始める
              </button>
              <Link className="hynek-secondary" href="/hynek/dashboard">
                みんなの回答を見る
              </Link>
            </div>

            <div className="hynek-intro-image-frame" aria-label="Hynek トップ画像">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="hynek-intro-image"
                src="/hynek-top.png"
                alt="夜空に浮かぶUFOを見上げる子どもたちのイラスト"
              />
            </div>
          </section>
        ) : currentVisibleStep === "result" ? (
          <section className="hynek-stage hynek-stage-result" aria-labelledby="hynek-result-heading">
            <div className="hynek-result-header">
              <p className="hynek-label">診断結果</p>
              <h2 id="hynek-result-heading">{result.profile.label}</h2>
              <p className="hynek-result-copy">{result.profile.description}</p>
            </div>

            <div className="hynek-result-grid">
              <section className="hynek-result-card" aria-label="あなたのタイプ" style={{ borderColor: result.profile.accent }}>
                <span className="hynek-card-label">あなたのUFOウォッチャータイプ</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="hynek-result-image" src={resultImageSrc} alt={resultImageAlt} style={{ borderColor: result.profile.accent }} />
                <strong>{result.profile.label}</strong>
                <p>{result.profile.description}</p>
                <div className="hynek-result-percent">
                  <span>あなたは全体の</span>
                  <strong>{currentShare}%</strong>
                  <span>に近いです</span>
                </div>
              </section>

              <section className="hynek-result-card" aria-label="回答傾向">
                <span className="hynek-card-label">回答傾向</span>
                <div className="hynek-trait-list">
                  {result.topTraits.map((traitItem) => (
                    <span key={traitItem.id} className="hynek-trait-pill">
                      {traitItem.label}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            <section className="hynek-sample-block" aria-labelledby="hynek-sample-heading">
              <div className="hynek-section-heading">
                <p className="hynek-label" id="hynek-sample-heading">
                  全体データ
                </p>
                <h3>みんなの傾向</h3>
              </div>
              {dashboardData ? (
                <ResultBars
                  items={[
                    { id: "evidence", label: "証拠重視UFOファン", value: percentOfCount(dashboardData.counts.typeCounts.evidence, totalResponses), accent: resultProfiles.evidence.accent },
                    { id: "cautious", label: "慎重派UFOファン", value: percentOfCount(dashboardData.counts.typeCounts.cautious, totalResponses), accent: resultProfiles.cautious.accent },
                    { id: "romantic", label: "ロマン派UFOファン", value: percentOfCount(dashboardData.counts.typeCounts.romantic, totalResponses), accent: resultProfiles.romantic.accent },
                    { id: "witness", label: "目撃体験重視派", value: percentOfCount(dashboardData.counts.typeCounts.witness, totalResponses), accent: resultProfiles.witness.accent },
                    { id: "wonder", label: "不思議好きUFOファン", value: percentOfCount(dashboardData.counts.typeCounts.wonder, totalResponses), accent: resultProfiles.wonder.accent },
                    { id: "news", label: "ニュース追跡派", value: percentOfCount(dashboardData.counts.typeCounts.news, totalResponses), accent: resultProfiles.news.accent },
                    { id: "entertainment", label: "エンタメUFOファン", value: percentOfCount(dashboardData.counts.typeCounts.entertainment, totalResponses), accent: resultProfiles.entertainment.accent },
                    { id: "contact", label: "接触・メッセージ関心派", value: percentOfCount(dashboardData.counts.typeCounts.contact, totalResponses), accent: resultProfiles.contact.accent },
                  ]}
                  highlightId={result.resultType}
                />
              ) : (
                <p className="hynek-result-note">集計を読み込んでいます。</p>
              )}
            </section>

            <div className="hynek-share-grid">
              <ShareCard
                profile={result.profile}
                sharePercent={currentShare}
                age={answers.age}
                gender={answers.gender}
                region={answers.region}
                resultType={result.resultType}
              />

              <section className="hynek-mini-summary" aria-label="回答の要約">
                <p className="hynek-label">回答の要約</p>
                <div className="hynek-summary-list">
                  <div>
                    <span>年代</span>
                    <strong>{answers.age || "未回答"}</strong>
                  </div>
                  <div>
                    <span>性別</span>
                    <strong>{answers.gender || "未回答"}</strong>
                  </div>
                  <div>
                    <span>居住地域</span>
                    <strong>{answers.region || "未回答"}</strong>
                  </div>
                  <div>
                    <span>今回のスコア合計</span>
                    <strong>{result.totalScore}</strong>
                  </div>
                </div>
                <p className="hynek-result-note">
                  再診断はボタンでいつでもやり直せます。
                </p>
              </section>
            </div>

            <p className="hynek-disclaimer">
              任意回答による非科学的集計です。UFO・宇宙人・アブダクションの事実認定ではありません。
            </p>

            <div className="hynek-actions hynek-actions-result">
              <Link className="hynek-primary" href="/hynek/dashboard">
                みんなのUFO観を見る
              </Link>
              <a
                className="hynek-secondary hynek-share-action"
                href={shareUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="診断結果をXでシェア"
              >
                <span className="hynek-share-action-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                    <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z" />
                  </svg>
                </span>
                診断結果をXでシェア
              </a>
              <button className="hynek-secondary" type="button" onClick={restartDiagnosis}>
                もう一度診断する
              </button>
            </div>
          </section>
        ) : currentQuestion ? (
          <section className="hynek-stage" aria-labelledby={`hynek-${currentQuestion.id}`}>
            <div className="hynek-question-head">
              <p className="hynek-label">{formatQuestionNumber(currentQuestion.id)}</p>
              <h2 id={`hynek-${currentQuestion.id}`}>{currentQuestion.prompt}</h2>
              {currentQuestion.note ? <p className="hynek-question-note">{currentQuestion.note}</p> : null}
            </div>

            <ChoiceGrid
              question={currentQuestion}
              selected={currentQuestionSelectedValue()}
              onSelect={(choiceId) => selectQuestionAnswer(currentQuestion.id, choiceId)}
            />

            <div className="hynek-actions">
              <button className="hynek-secondary" type="button" onClick={goBack} disabled={!canGoBack}>
                戻る
              </button>
              <button className="hynek-primary" type="button" onClick={goNext} disabled={!canAdvance}>
                次へ
              </button>
            </div>
          </section>
        ) : currentVisibleStep === "age" || currentVisibleStep === "gender" || currentVisibleStep === "region" ? (
          <section className="hynek-stage" aria-labelledby={`hynek-${currentVisibleStep}`}>
            <div className="hynek-question-head">
              <p className="hynek-label">属性入力</p>
              <h2 id={`hynek-${currentVisibleStep}`}>
                {currentVisibleStep === "age"
                  ? "年代"
                  : currentVisibleStep === "gender"
                    ? "性別（任意）"
                    : "居住地域"}
              </h2>
              <p className="hynek-question-note">
                {currentVisibleStep === "age"
                  ? "年代を選んでください。"
                  : currentVisibleStep === "gender"
                    ? "「回答しない」は無回答として扱います。"
                    : "都道府県、海外、回答しないから選べます。"}
              </p>
            </div>

            <div className="hynek-form-grid">
              {currentVisibleStep === "age" ? (
                <AttributeSelect label="年代" value={answers.age} onChange={(value) => setAttributeValue(value)}>
                  <option value="">年代を選んでください</option>
                  {attributeOptions.age.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </AttributeSelect>
              ) : null}

              {currentVisibleStep === "gender" ? (
                <AttributeSelect label="性別（任意）" value={answers.gender} onChange={(value) => setAttributeValue(value)}>
                  <option value="">性別を選んでください</option>
                  {attributeOptions.gender.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </AttributeSelect>
              ) : null}

              {currentVisibleStep === "region" ? (
                <AttributeSelect label="居住地域" value={answers.region} onChange={(value) => setAttributeValue(value)}>
                  <option value="">居住地域を選んでください</option>
                  <optgroup label="都道府県">
                    {prefectures.map((prefecture) => (
                      <option key={prefecture} value={prefecture}>
                        {prefecture}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="その他">
                    <option value="海外">海外</option>
                    <option value="回答しない">回答しない</option>
                  </optgroup>
                </AttributeSelect>
              ) : null}
            </div>

            <div className="hynek-actions">
              <button className="hynek-secondary" type="button" onClick={goBack} disabled={!canGoBack}>
                戻る
              </button>
              <button className="hynek-primary" type="button" onClick={goNext} disabled={!canAdvance}>
                次へ
              </button>
            </div>
          </section>
        ) : null}
      </article>
      {currentVisibleStep === "intro" ? (
        <section className="brand-feedback-card hynek-update-card" aria-labelledby="hynek-update-heading">
          <p className="brand-feedback-label" id="hynek-update-heading">
            更新情報・フィードバック
          </p>
          <div className="brand-feedback-copy">
            <p>今後も新しいアプリを追加していきます。</p>
            <p>更新情報はXで発信しているので、ぜひフォローしてください。</p>
          </div>
          <a
            className="brand-feedback-action"
            href="https://x.com/UFOLabTokyo"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Xをフォロー"
            title="Xをフォロー"
          >
            <span className="brand-feedback-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z" />
              </svg>
            </span>
          </a>
        </section>
      ) : null}
    </>
  );
}
