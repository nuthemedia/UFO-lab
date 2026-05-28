"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { aggregateHynekSubmissions, filterHynekSubmissions, HYNEK_PREFECTURES, type HynekDashboardFilterMode } from "@/lib/hynekDashboardData";
import type { HynekDashboardData, HynekSubmission } from "@/lib/hynekStore";

type TabId = "overview" | "types" | "belief" | "sightings" | "contact" | "region";
type FilterId = HynekDashboardFilterMode;

type BarItem = {
  id?: string;
  label: string;
  value: number;
  detail?: string;
};

type TypeItem = BarItem & {
  image: string;
};

const tabs: { id: TabId; label: string }[] = [
  { id: "overview", label: "全体" },
  { id: "types", label: "タイプ" },
  { id: "belief", label: "宇宙人観" },
  { id: "sightings", label: "UFO目撃" },
  { id: "contact", label: "接触" },
  { id: "region", label: "地域" },
];

const filters: { id: FilterId; label: string; note: string }[] = [
  { id: "all", label: "みんな", note: "全回答で集計" },
  { id: "witness", label: "目撃した人", note: "目撃回答だけで集計" },
  { id: "age", label: "年代で見る", note: "年代を選んで集計" },
  { id: "region", label: "地域で見る", note: "地域を選んで集計" },
];

const typeRanking: TypeItem[] = [
  { id: "romantic", label: "ロマン派UFOファン", value: 0, detail: "未知現象や宇宙的な余白に反応", image: "/hynek/romantic-male.png" },
  { id: "cautious", label: "慎重派UFOファン", value: 0, detail: "判断保留と検証を大切にする", image: "/hynek/cautious-male.png" },
  { id: "news", label: "ニュース追跡派", value: 0, detail: "政府発表やUAPニュースに敏感", image: "/hynek/news-male.png" },
  { id: "evidence", label: "証拠重視UFOファン", value: 0, detail: "出典、映像、一次資料を確認", image: "/hynek/evidence-male.png" },
  { id: "wonder", label: "不思議好きUFOファン", value: 0, detail: "文化・心理・超常の広がりも楽しむ", image: "/hynek/wonder-male.png" },
  { id: "witness", label: "目撃体験重視派", value: 0, detail: "本人や目撃者の体験を重く見る", image: "/hynek/witness-male.png" },
  { id: "entertainment", label: "エンタメUFOファン", value: 0, detail: "SFや都市伝説として楽しむ", image: "/hynek/entertainment-male.png" },
  { id: "contact", label: "接触・メッセージ関心派", value: 0, detail: "コンタクトやメッセージ性に関心", image: "/hynek/contact-male.png" },
];

const beliefSteps: BarItem[] = [
  { id: "q3-exist", label: "宇宙人は存在すると思う", value: 0, detail: "存在しても不思議ではないを含む" },
  { id: "q4-visit", label: "宇宙人は地球に来ていると思う", value: 0, detail: "一部は本当かもしれないを含む" },
  { id: "q2-ship", label: "UFOは宇宙人の乗り物だと思う", value: 0, detail: "最も近い正体として選択" },
  { id: "q6-secret", label: "政府は何か隠していると思う", value: 0, detail: "重大情報/何かは隠していそうの合計" },
];

const identityRanking: BarItem[] = [
  { id: "unknown", label: "まだ説明できない未知現象", value: 0 },
  { id: "secret", label: "軍や政府の秘密技術", value: 0 },
  { id: "ship", label: "宇宙人の乗り物", value: 0 },
  { id: "misread", label: "誤認や自然現象", value: 0 },
  { id: "psych", label: "心理・文化・超常現象", value: 0 },
  { id: "fake", label: "AI画像やフェイク", value: 0 },
  { id: "angel", label: "悪魔か天使？", value: 0 },
];

const sightingStats: BarItem[] = [
  { id: "certain", label: "はっきりある", value: 0 },
  { id: "maybe", label: "たぶんある", value: 0 },
  { id: "no", label: "ない", value: 0 },
  { id: "unsure", label: "わからない", value: 0 },
  { id: "pass", label: "答えたくない", value: 0 },
];

const sightingTypeRanking: BarItem[] = [
  { id: "light", label: "光タイプ", value: 0, detail: "点光源や発光体として見えたもの" },
  { id: "vanish", label: "消失タイプ", value: 0, detail: "突然消えた、見失ったもの" },
  { id: "speed", label: "高速移動タイプ", value: 0, detail: "速度や軌道が印象に残ったもの" },
  { id: "sphere", label: "球体タイプ", value: 0, detail: "丸い形として認識されたもの" },
  { id: "triangle", label: "三角形タイプ", value: 0, detail: "三角形や複数光点として見えたもの" },
  { id: "disc", label: "円盤タイプ", value: 0, detail: "古典的な円盤形として見えたもの" },
  { id: "cigar", label: "葉巻型タイプ", value: 0, detail: "細長い形として見えたもの" },
  { id: "formation", label: "編隊タイプ", value: 0, detail: "複数の光や物体が並んだもの" },
  { id: "other", label: "その他", value: 0, detail: "どれにもあてはまらないもの" },
];

const sightingPrefectures: BarItem[] = [
  { id: "北海道", label: "北海道", value: 0, detail: "目撃回答 0件" },
  { id: "青森県", label: "青森県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "岩手県", label: "岩手県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "宮城県", label: "宮城県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "秋田県", label: "秋田県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "山形県", label: "山形県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "福島県", label: "福島県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "茨城県", label: "茨城県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "栃木県", label: "栃木県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "群馬県", label: "群馬県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "埼玉県", label: "埼玉県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "千葉県", label: "千葉県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "東京都", label: "東京都", value: 0, detail: "目撃回答 0件" },
  { id: "神奈川県", label: "神奈川県", value: 0, detail: "目撃回答 0件" },
  { id: "新潟県", label: "新潟県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "富山県", label: "富山県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "石川県", label: "石川県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "福井県", label: "福井県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "山梨県", label: "山梨県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "長野県", label: "長野県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "岐阜県", label: "岐阜県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "静岡県", label: "静岡県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "愛知県", label: "愛知県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "三重県", label: "三重県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "滋賀県", label: "滋賀県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "京都府", label: "京都府", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "大阪府", label: "大阪府", value: 0, detail: "目撃回答 0件" },
  { id: "兵庫県", label: "兵庫県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "奈良県", label: "奈良県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "和歌山県", label: "和歌山県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "鳥取県", label: "鳥取県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "島根県", label: "島根県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "岡山県", label: "岡山県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "広島県", label: "広島県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "山口県", label: "山口県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "徳島県", label: "徳島県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "香川県", label: "香川県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "愛媛県", label: "愛媛県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "高知県", label: "高知県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "福岡県", label: "福岡県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "佐賀県", label: "佐賀県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "長崎県", label: "長崎県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "熊本県", label: "熊本県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "大分県", label: "大分県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "宮崎県", label: "宮崎県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "鹿児島県", label: "鹿児島県", value: 0, detail: "目撃回答 0件 / 少数回答" },
  { id: "沖縄県", label: "沖縄県", value: 0, detail: "目撃回答 0件 / 少数回答" },
];

const contactStats: BarItem[] = [
  { id: "q8-real", label: "アブダクションに本当の話もあると思う", value: 0 },
  { id: "q9-what", label: "コンタクティを知らない", value: 0 },
  { id: "q9-believe", label: "接触している人もいると思う", value: 0 },
  { id: "q9-me", label: "私がコンタクティだ！", value: 0 },
  { id: "q10-important", label: "チャネリングを重要なメッセージと見る", value: 0 },
  { id: "q10-culture", label: "文化現象として面白い", value: 0 },
];

const regionRanking: BarItem[] = [
  { id: "東京都", label: "東京都", value: 0, detail: "回答数 0" },
  { id: "神奈川県", label: "神奈川県", value: 0, detail: "回答数 0" },
  { id: "大阪府", label: "大阪府", value: 0, detail: "回答数 0" },
  { id: "北海道", label: "北海道", value: 0, detail: "回答数 0" },
  { id: "福岡県", label: "福岡県", value: 0, detail: "回答数 0" },
  { id: "千葉県", label: "千葉県", value: 0, detail: "回答数 0" },
  { id: "埼玉県", label: "埼玉県", value: 0, detail: "回答数 0" },
  { id: "愛知県", label: "愛知県", value: 0, detail: "回答数 0" },
  { id: "兵庫県", label: "兵庫県", value: 0, detail: "回答数 0" },
  { id: "京都府", label: "京都府", value: 0, detail: "回答数 0" },
  { id: "沖縄県", label: "沖縄県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "宮城県", label: "宮城県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "静岡県", label: "静岡県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "長野県", label: "長野県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "広島県", label: "広島県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "新潟県", label: "新潟県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "茨城県", label: "茨城県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "栃木県", label: "栃木県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "群馬県", label: "群馬県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "岐阜県", label: "岐阜県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "三重県", label: "三重県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "岡山県", label: "岡山県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "熊本県", label: "熊本県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "青森県", label: "青森県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "岩手県", label: "岩手県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "秋田県", label: "秋田県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "山形県", label: "山形県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "福島県", label: "福島県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "富山県", label: "富山県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "石川県", label: "石川県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "福井県", label: "福井県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "山梨県", label: "山梨県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "滋賀県", label: "滋賀県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "奈良県", label: "奈良県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "和歌山県", label: "和歌山県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "鳥取県", label: "鳥取県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "島根県", label: "島根県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "山口県", label: "山口県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "徳島県", label: "徳島県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "香川県", label: "香川県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "愛媛県", label: "愛媛県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "高知県", label: "高知県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "佐賀県", label: "佐賀県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "長崎県", label: "長崎県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "大分県", label: "大分県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "宮崎県", label: "宮崎県", value: 0, detail: "回答数 0 / 少数回答" },
  { id: "鹿児島県", label: "鹿児島県", value: 0, detail: "回答数 0 / 少数回答" },
];

const ageComparison: BarItem[] = [
  { id: "age-10-20", label: "10-20代: UFO=宇宙人説", value: 0 },
  { id: "age-30-40", label: "30-40代: UFO=宇宙人説", value: 0 },
  { id: "age-50-plus", label: "50代以上: UFO=宇宙人説", value: 0 },
  { id: "witness-yes", label: "目撃経験あり: 宇宙人来訪説", value: 0 },
  { id: "witness-no", label: "目撃経験なし: 宇宙人来訪説", value: 0 },
];

const ageFilterOptions = ["10代", "20代", "30代", "40代", "50代", "60代以上", "回答しない"];
const regionFilterOptions = [...HYNEK_PREFECTURES, "海外", "回答しない"];

function percentOf(count: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((count / total) * 100);
}

function countFor(map: Record<string, number>, key?: string) {
  return key ? map[key] || 0 : 0;
}

function countMany(map: Record<string, number>, keys: string[]) {
  return keys.reduce((sum, key) => sum + countFor(map, key), 0);
}

function BarList({ items }: { items: BarItem[] }) {
  return (
    <div className="hynek-dashboard-bars">
      {items.map((item) => {
        const value = item.value;

        return (
          <div className="hynek-dashboard-bar-row" key={item.label}>
            <div className="hynek-dashboard-bar-label">
              <strong>{item.label}</strong>
              <span>{value}%</span>
            </div>
            <div className="hynek-dashboard-bar-track" aria-hidden="true">
              <span style={{ width: `${value}%` }} />
            </div>
            {item.detail ? <p>{item.detail}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

function ExpandableBarList({
  items,
  initialCount = 6,
}: {
  items: BarItem[];
  initialCount?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleItems = isExpanded ? items : items.slice(0, initialCount);
  const canExpand = items.length > initialCount;

  return (
    <>
      <BarList items={visibleItems} />
      {canExpand ? (
        <button className="hynek-dashboard-more" type="button" onClick={() => setIsExpanded((current) => !current)}>
          {isExpanded ? "閉じる" : "続きを見る"}
        </button>
      ) : null}
    </>
  );
}

function SectionHeading({ label, title, copy }: { label: string; title: string; copy: string }) {
  return (
    <div className="hynek-dashboard-section-heading">
      <p className="hynek-label">{label}</p>
      <h2>{title}</h2>
      <p>{copy}</p>
    </div>
  );
}

function TypeRanking({ data }: { data: HynekDashboardData }) {
  const items = [...typeRanking]
    .map((item) => ({
      ...item,
      value: percentOf(countFor(data.counts.typeCounts, item.id), data.counts.totalResponses),
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <section className="hynek-dashboard-card hynek-dashboard-wide" aria-labelledby="hynek-dashboard-types">
      <SectionHeading
        label="タイプ"
        title="みんなは何タイプ？"
        copy="タイプ別のランキングです。"
      />
      <div className="hynek-type-ranking" id="hynek-dashboard-types">
        {items.map((item, index) => {
          return (
            <article className="hynek-type-rank-card" key={item.label}>
              <span className="hynek-type-rank-number">{index + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt="" aria-hidden="true" />
              <div>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </div>
              <span className="hynek-type-rank-percent">{item.value}%</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SummaryRing({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: number;
  detail: string;
  accent: string;
}) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <article className="hynek-dashboard-ring-card">
      <svg className="hynek-dashboard-ring" viewBox="0 0 120 120" role="img" aria-label={`${label} ${value}%`}>
        <circle className="hynek-dashboard-ring-track" cx="60" cy="60" r="46" />
        <circle
          className="hynek-dashboard-ring-value"
          cx="60"
          cy="60"
          r="46"
          pathLength="100"
          strokeDasharray={`${clampedValue} ${100 - clampedValue}`}
          stroke={accent}
        />
        <text x="60" y="66" textAnchor="middle">
          {value}%
        </text>
      </svg>
      <span>{label}</span>
      <p>{detail}</p>
    </article>
  );
}

function SummaryCards({ data }: { data: HynekDashboardData }) {
  const total = data.counts.totalResponses;
  const topTypeId = data.summary.topTypeId;
  const topTypeLabel =
    topTypeId === "evidence"
      ? "証拠重視UFOファン"
      : topTypeId === "cautious"
        ? "慎重派UFOファン"
        : topTypeId === "romantic"
          ? "ロマン派UFOファン"
          : topTypeId === "witness"
            ? "目撃体験重視派"
            : topTypeId === "wonder"
              ? "不思議好きUFOファン"
              : topTypeId === "news"
                ? "ニュース追跡派"
                : topTypeId === "entertainment"
                  ? "エンタメUFOファン"
                  : topTypeId === "contact"
                    ? "接触・メッセージ関心派"
                    : "まだ集計がありません";

  return (
    <section className="hynek-dashboard-summary-grid" aria-label="サマリー">
      <article>
        <span>回答数</span>
        <strong>{total}</strong>
        <p>{total > 0 ? "実回答のライブ集計です。" : "まだ回答はありません。"}</p>
      </article>
      <article>
        <span>一番多い診断タイプ</span>
        <strong>{topTypeLabel}</strong>
        <p>タイプ分布の先頭に表示しています。</p>
      </article>
      <SummaryRing
        label="UFOを見たことがある割合"
        value={data.summary.sightingRate}
        detail="はっきりある・たぶんあるの合計です。"
        accent="#3e6356"
      />
      <SummaryRing
        label="政府は何か隠していると思う"
        value={data.summary.secretRate}
        detail="政府・軍情報への感覚を集計しています。"
        accent="#9a7f49"
      />
    </section>
  );
}

function RegionRanking({ data }: { data: HynekDashboardData }) {
  const items = regionRanking
    .map((item) => ({
      ...item,
      value: percentOf(countFor(data.counts.regionCounts, item.id), data.counts.totalResponses),
      detail: data.counts.regionCounts[item.id || ""] ? `回答数 ${data.counts.regionCounts[item.id || ""]}` : item.detail,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <section className="hynek-dashboard-card hynek-dashboard-wide">
      <SectionHeading
        label="地域"
        title="回答者数都道府県ランキング"
        copy="回答者数が多い都道府県をランキングで表示します。"
      />
      <ExpandableBarList items={items} initialCount={10} />
      <p className="hynek-map-note">
        この集計は本サイト利用者の任意回答に基づく非科学的な集計です。回答数が少ない都道府県は参考値として表示しています。
      </p>
    </section>
  );
}

function SightingPrefectureMap({ data }: { data: HynekDashboardData }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const items = sightingPrefectures
    .map((item) => ({
      ...item,
      value: percentOf(countFor(data.counts.witnessRegionCounts, item.id), data.counts.totalResponses),
      detail: data.counts.witnessRegionCounts[item.id || ""] ? `目撃回答 ${data.counts.witnessRegionCounts[item.id || ""]}件` : item.detail,
    }))
    .sort((a, b) => b.value - a.value);
  const visibleItems = isExpanded ? items : items.slice(0, 6);

  return (
    <section className="hynek-dashboard-card hynek-dashboard-wide">
      <SectionHeading
        label="UFO目撃"
        title="UFOを見た県のマップ"
        copy="目撃経験あり回答の居住地域を都道府県別に見たマップ風カードです。"
      />
      <div className="hynek-region-grid">
        {visibleItems.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}%</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
      <button className="hynek-dashboard-more" type="button" onClick={() => setIsExpanded((current) => !current)}>
        {isExpanded ? "閉じる" : "全県を表示"}
      </button>
      <p className="hynek-map-note">
        この集計は本サイト利用者の任意回答に基づく非科学的な集計です。回答数が少ない地域は参考値として表示しています。
      </p>
    </section>
  );
}

function OverviewPanel({ data }: { data: HynekDashboardData }) {
  return (
    <>
      <SummaryCards data={data} />
      <TypeRanking data={data} />
      <section className="hynek-dashboard-card">
        <SectionHeading label="宇宙人観" title="宇宙人観" copy="宇宙人はUFOに乗って地球に来てる？" />
        <BarList
          items={[
            {
              ...beliefSteps[0],
              value: percentOf(countMany(data.counts.q3Counts, ["certain", "likely"]), data.counts.totalResponses),
            },
            {
              ...beliefSteps[1],
              value: percentOf(countMany(data.counts.q4Counts, ["already", "maybe"]), data.counts.totalResponses),
            },
            {
              ...beliefSteps[2],
              value: percentOf(countFor(data.counts.q2Counts, "ship"), data.counts.totalResponses),
            },
            {
              ...beliefSteps[3],
              value: percentOf(countMany(data.counts.q6Counts, ["hide", "some"]), data.counts.totalResponses),
            },
          ]}
        />
      </section>
      <section className="hynek-dashboard-card">
        <SectionHeading label="UFOの正体" title="UFOってなに？" copy="UFOってなに？" />
        <BarList
          items={identityRanking.map((item) => ({
            ...item,
            value: percentOf(countFor(data.counts.q2Counts, item.id), data.counts.totalResponses),
          }))}
        />
      </section>
      <section className="hynek-dashboard-card">
        <SectionHeading label="UFO目撃" title="目撃経験" copy="見たことがある・ない・わからないの分布です。" />
        <BarList
          items={sightingStats.map((item) => ({
            ...item,
            value: percentOf(countFor(data.counts.q11Counts, item.id), data.counts.totalResponses),
          }))}
        />
      </section>
      <RegionRanking data={data} />
    </>
  );
}

function TabPanel({ activeTab, data }: { activeTab: TabId; data: HynekDashboardData }) {
  if (activeTab === "types") {
    return <TypeRanking data={data} />;
  }

  if (activeTab === "belief") {
    return (
      <>
        <section className="hynek-dashboard-card">
          <SectionHeading label="宇宙人観" title="宇宙人観" copy="宇宙人はUFOに乗って地球に来てる？" />
          <BarList
            items={[
              {
                ...beliefSteps[0],
                value: percentOf(countMany(data.counts.q3Counts, ["certain", "likely"]), data.counts.totalResponses),
              },
              {
                ...beliefSteps[1],
                value: percentOf(countMany(data.counts.q4Counts, ["already", "maybe"]), data.counts.totalResponses),
              },
              {
                ...beliefSteps[2],
                value: percentOf(countFor(data.counts.q2Counts, "ship"), data.counts.totalResponses),
              },
              {
                ...beliefSteps[3],
                value: percentOf(countMany(data.counts.q6Counts, ["hide", "some"]), data.counts.totalResponses),
              },
            ]}
          />
        </section>
        <section className="hynek-dashboard-card">
          <SectionHeading label="UFOの正体" title="UFOってなに？" copy="UFOってなに？" />
          <BarList
            items={identityRanking.map((item) => ({
              ...item,
              value: percentOf(countFor(data.counts.q2Counts, item.id), data.counts.totalResponses),
            }))}
          />
        </section>
      </>
    );
  }

  if (activeTab === "sightings") {
    return (
      <>
        <section className="hynek-dashboard-card">
          <SectionHeading label="UFO目撃" title="UFOらしきものを見たことは？" copy="体験の有無を回答別に表示します。" />
          <BarList
            items={sightingStats.map((item) => ({
              ...item,
              value: percentOf(countFor(data.counts.q11Counts, item.id), data.counts.totalResponses),
            }))}
          />
        </section>
        <section className="hynek-dashboard-card">
          <SectionHeading label="タイプ" title="UFOのタイプ集計" copy="見えたものに近い形や動きの集計です。" />
          <ExpandableBarList
            items={sightingTypeRanking.map((item) => ({
              ...item,
              value: percentOf(countFor(data.counts.q13Counts, item.id), data.counts.totalResponses),
            }))}
            initialCount={6}
          />
        </section>
        <SightingPrefectureMap data={data} />
      </>
    );
  }

  if (activeTab === "contact") {
    return (
      <section className="hynek-dashboard-card hynek-dashboard-wide">
        <SectionHeading
          label="接触"
          title="アブダクション・コンタクティ・チャネリング"
          copy="強いテーマなので、見世物化しないよう全体割合を中心に表示します。"
        />
        <BarList
          items={contactStats.map((item) => {
            const value =
              item.id === "q8-real"
                ? countFor(data.counts.q8Counts, "real")
                : item.id === "q9-what"
                  ? countFor(data.counts.q9Counts, "what")
                  : item.id === "q9-believe"
                    ? countFor(data.counts.q9Counts, "believe")
                    : item.id === "q9-me"
                      ? countFor(data.counts.q9Counts, "me")
                      : item.id === "q10-important"
                        ? countFor(data.counts.q10Counts, "important")
                        : countFor(data.counts.q10Counts, "culture");

            return {
              ...item,
              value: percentOf(value, data.counts.totalResponses),
            };
          })}
        />
      </section>
    );
  }

  if (activeTab === "region") {
    return (
      <>
        <RegionRanking data={data} />
        <section className="hynek-dashboard-card hynek-dashboard-wide">
          <SectionHeading label="比較" title="属性別比較" copy="年代、地域、目撃経験による違いを入口カードとして表示します。" />
          <BarList
            items={ageComparison.map((item) => ({
              ...item,
              value:
                item.id === "age-10-20"
                  ? percentOf(countMany(data.counts.ageCounts, ["10代", "20代"]), data.counts.totalResponses)
                  : item.id === "age-30-40"
                    ? percentOf(countMany(data.counts.ageCounts, ["30代", "40代"]), data.counts.totalResponses)
                    : item.id === "age-50-plus"
                      ? percentOf(countMany(data.counts.ageCounts, ["50代以上"]), data.counts.totalResponses)
                      : item.id === "witness-yes"
                      ? percentOf(countMany(data.counts.q11Counts, ["certain", "maybe"]), data.counts.totalResponses)
                        : percentOf(countMany(data.counts.q11Counts, ["no", "unsure", "pass"]), data.counts.totalResponses),
            }))}
          />
        </section>
      </>
    );
  }

  return <OverviewPanel data={data} />;
}

export function HynekDashboardMockup({ submissions }: { submissions: HynekSubmission[] }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const activeFilterNote = useMemo(() => {
    const note = filters.find((filter) => filter.id === activeFilter)?.note ?? "";

    if (activeFilter === "age") {
      return selectedAge ? `${note} / ${selectedAge}で表示` : "年代を選んでください。";
    }

    if (activeFilter === "region") {
      return selectedRegion ? `${note} / ${selectedRegion}で表示` : "地域を選んでください。";
    }

    return note;
  }, [activeFilter, selectedAge, selectedRegion]);

  const filteredSubmissions = useMemo(
    () => filterHynekSubmissions(submissions, { mode: activeFilter, age: selectedAge, region: selectedRegion }),
    [activeFilter, selectedAge, selectedRegion, submissions],
  );
  const filteredData = useMemo(() => aggregateHynekSubmissions(filteredSubmissions), [filteredSubmissions]);

  const ageOptions = useMemo(() => ageFilterOptions, []);
  const regionOptions = useMemo(() => regionFilterOptions, []);
  const visibleFilters = useMemo(
    () => filters.filter((filter) => !(filter.id === "region" && selectedRegion)),
    [selectedRegion],
  );

  return (
    <div className="hynek-dashboard">
      <section className="hynek-dashboard-toolbar" aria-label="表示切り替え">
        <div className="hynek-dashboard-tabs" role="tablist" aria-label="ダッシュボードのタブ">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={activeTab === tab.id ? "is-active" : ""}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="hynek-dashboard-filter-row" aria-label="フィルター">
          {visibleFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={activeFilter === filter.id ? "is-active" : ""}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        {activeFilter === "age" ? (
          <label className="hynek-field hynek-dashboard-filter-select">
            <span className="hynek-field-label">年代を選ぶ</span>
            <select value={selectedAge} onChange={(event) => setSelectedAge(event.target.value)}>
              <option value="">年代を選んでください</option>
              {ageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {activeFilter === "region" ? (
          <label className="hynek-field hynek-dashboard-filter-select">
            <span className="hynek-field-label">地域を選ぶ</span>
            <select value={selectedRegion} onChange={(event) => setSelectedRegion(event.target.value)}>
              <option value="">地域を選んでください</option>
              {regionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <p>{activeFilterNote}</p>
      </section>

      <div className="hynek-dashboard-grid">
        <TabPanel activeTab={activeTab} data={filteredData} />
      </div>

      <section className="hynek-dashboard-card hynek-dashboard-cta">
        <div>
          <p className="hynek-label">参加する</p>
          <h2>あなたも診断に参加する</h2>
          <p>診断後には、自分のタイプとみんなの傾向を見比べられます。</p>
        </div>
        <Link className="hynek-primary" href="/hynek">
          UFOファン診断をする
        </Link>
      </section>

      <p className="hynek-dashboard-disclaimer">
        この集計は本サイト利用者の任意回答に基づく非科学的な集計です。UFO・宇宙人・アブダクションの事実認定ではありません。
      </p>
    </div>
  );
}
