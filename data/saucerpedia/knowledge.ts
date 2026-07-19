import { saucerpediaEvents } from "./events";
import { saucerpediaFakes } from "./fakes";
import { saucerpediaHistoryCards } from "./history";
import { saucerpediaMisidentifications } from "./misidentifications";
import { saucerpediaMotifs } from "./motifs";
import { saucerpediaPeople } from "./people";
import { saucerpediaResources } from "./resources";
import { saucerpediaTerms } from "./terms";

import type { SaucerpediaEntityType, SaucerpediaRelation, SaucerpediaRelationInput } from "./types";

export type { SaucerpediaEntityType, SaucerpediaRelation } from "./types";

export type ResolvedSaucerpediaRelation = SaucerpediaRelation & {
  title: string;
  eyebrow: string;
  href: string;
  summary?: string;
};

type SearchableEntity = {
  id: string;
  name?: string;
  title?: string;
  englishName?: string;
  aliases?: string[];
  summary?: string;
  quickRead?: string;
};

type EntityRecord = {
  type: SaucerpediaEntityType;
  id: string;
  title: string;
  eyebrow: string;
  href: string;
  summary?: string;
  aliases: string[];
};

const typeLabels: Record<SaucerpediaEntityType, string> = {
  term: "UFO用語",
  person: "UFO人物",
  event: "UFO事件",
  history: "UFO史",
  misidentification: "誤認",
  fake: "フェイク",
  resource: "資料・機関",
  motif: "体験モチーフ",
  product: "関連プロダクト",
};

const routeByType: Record<Exclude<SaucerpediaEntityType, "product">, string> = {
  term: "/saucerpedia/terms",
  person: "/saucerpedia/people",
  event: "/saucerpedia/events",
  history: "/saucerpedia/history",
  misidentification: "/saucerpedia/misidentifications",
  fake: "/saucerpedia/fakes",
  resource: "/saucerpedia/resources",
  motif: "/saucerpedia/motifs",
};

export const saucerpediaProducts: EntityRecord[] = [
  {
    type: "product",
    id: "kinichi",
    title: "UFO形状辞典（KINICHI）",
    eyebrow: typeLabels.product,
    href: "/kinichi",
    summary: "UFO形状・形体・3Dモデルの専門辞典。",
    aliases: ["KINICHI", "UFO形状辞典（KINICHI）", "UFO形状辞典（Kinichi）"],
  },
  {
    type: "product",
    id: "kean",
    title: "現代UFO・UAPディスクロージャー入門（Kean）",
    eyebrow: typeLabels.product,
    href: "/kean",
    summary: "現代UAP、関係人物、公開文脈の入口。",
    aliases: ["Kean", "現代UFO・UAPディスクロージャー入門（Kean）"],
  },
  {
    type: "product",
    id: "clark",
    title: "Clark",
    eyebrow: typeLabels.product,
    href: "/clark",
    summary: "古典UFO事件と事典的参照への入口。",
    aliases: ["Clark"],
  },
  {
    type: "product",
    id: "ruppelt",
    title: "Ruppelt",
    eyebrow: typeLabels.product,
    href: "/ruppelt",
    summary: "公開資料や政府文書を日本語で探す入口。",
    aliases: ["Ruppelt"],
  },
];

function relationHref(type: Exclude<SaucerpediaEntityType, "product">, id: string) {
  if (type === "history") {
    return `${routeByType.history}?item=${encodeURIComponent(id)}`;
  }
  return `${routeByType[type]}/${encodeURIComponent(id)}`;
}

function makeRecords(
  type: Exclude<SaucerpediaEntityType, "product">,
  items: SearchableEntity[],
): EntityRecord[] {
  return items.map((item) => {
    const title = item.name ?? item.title ?? item.id;
    return {
      type,
      id: item.id,
      title,
      eyebrow: typeLabels[type],
      href: relationHref(type, item.id),
      summary: item.summary ?? item.quickRead,
      aliases: [item.id, title, item.englishName, ...(item.aliases ?? [])].filter(Boolean) as string[],
    };
  });
}

export const saucerpediaEntities: EntityRecord[] = [
  ...makeRecords("term", saucerpediaTerms),
  ...makeRecords("person", saucerpediaPeople),
  ...makeRecords("event", saucerpediaEvents),
  ...makeRecords("history", saucerpediaHistoryCards),
  ...makeRecords("misidentification", saucerpediaMisidentifications),
  ...makeRecords("fake", saucerpediaFakes),
  ...makeRecords("resource", saucerpediaResources),
  ...makeRecords("motif", saucerpediaMotifs),
  ...saucerpediaProducts,
];

export const saucerpediaEntityByKey = new Map(
  saucerpediaEntities.map((entity) => [`${entity.type}:${entity.id}`, entity]),
);

const aliasMap = new Map<string, SaucerpediaRelation>();

function normalizeLabel(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[・／]/g, "/")
    .replace(/[–—〜]/g, "-");
}

for (const entity of saucerpediaEntities) {
  for (const alias of entity.aliases) {
    aliasMap.set(`${entity.type}:${normalizeLabel(alias)}`, { type: entity.type, id: entity.id });
  }
}

const manualAliases: Array<[string, SaucerpediaRelation]> = [
  ["Tic Tac事件", { type: "event", id: "tic-tac" }],
  ["エドワード・ルッペルト", { type: "person", id: "edward-ruppelt" }],
  ["謎の飛行船ウェーブ", { type: "event", id: "airship-wave-1897" }],
  ["ベルギーUFOウェーブ", { type: "event", id: "belgian-wave" }],
  ["フェニックス・ライト", { type: "event", id: "phoenix-lights" }],
  ["近接遭遇", { type: "term", id: "close-encounter" }],
  ["ディスクロージャー", { type: "term", id: "disclosure" }],
  ["CBA", { type: "term", id: "cba" }],
  ["日本UFO史", { type: "term", id: "japanese-ufo-history" }],
  ["資料", { type: "term", id: "source-material" }],
  ["政府調査", { type: "term", id: "government-investigation" }],
  ["政府・軍", { type: "term", id: "government-and-military" }],
  ["CIA", { type: "term", id: "cia" }],
  ["NASA", { type: "term", id: "nasa" }],
  ["UFO研究", { type: "term", id: "ufo-research" }],
  ["目撃報告", { type: "term", id: "sighting-report" }],
  ["航空安全", { type: "term", id: "aviation-safety" }],
  ["民間団体", { type: "term", id: "civilian-organization" }],
  ["公開資料", { type: "resource", id: "public-documents" }],
  ["公開文書", { type: "resource", id: "public-documents" }],
  ["機密解除", { type: "resource", id: "declassification" }],
  ["Black Vault", { type: "resource", id: "black-vault" }],
  ["プロジェクト・サイン", { type: "resource", id: "project-sign" }],
  ["プロジェクト・グラッジ", { type: "resource", id: "project-grudge" }],
  ["プロジェクト・ブルーブック", { type: "term", id: "project-blue-book" }],
  ["ロズウェル事件", { type: "event", id: "roswell" }],
  ["金星人", { type: "term", id: "space-brothers" }],
  ["搭乗者", { type: "term", id: "contactee" }],
  ["平和思想", { type: "term", id: "space-brothers" }],
  ["催眠回帰", { type: "term", id: "missing-time" }],
  ["体験", { type: "term", id: "high-strangeness" }],
  ["現実感", { type: "term", id: "high-strangeness" }],
  ["恐怖感", { type: "term", id: "high-strangeness" }],
  ["UFO神話", { type: "term", id: "high-strangeness" }],
  ["民間伝承", { type: "term", id: "high-strangeness" }],
  ["三角形UFO", { type: "event", id: "belgian-wave" }],
  ["人工衛星", { type: "misidentification", id: "satellite" }],
  ["レンズフレア", { type: "misidentification", id: "lens-flare" }],
  ["パララックス", { type: "misidentification", id: "parallax" }],
  ["記憶の断片", { type: "motif", id: "memory-fragments" }],
  ["身体が動かない", { type: "motif", id: "paralysis" }],
  ["浮遊感", { type: "motif", id: "floating-sensation" }],
  ["寝室訪問", { type: "motif", id: "bedroom-visitation" }],
  ["光の中に入る", { type: "motif", id: "entering-light" }],
  ["トリックスター的振る舞い", { type: "motif", id: "trickster-behavior" }],
  ["現代UAP", { type: "term", id: "uap" }],
  ["Kean", { type: "product", id: "kean" }],
  ["Ruppelt", { type: "product", id: "ruppelt" }],
];

for (const [label, relation] of manualAliases) {
  aliasMap.set(`any:${normalizeLabel(label)}`, relation);
}

function resolveLegacyLabel(
  label: string,
  preferredTypes: SaucerpediaEntityType[],
): SaucerpediaRelation | undefined {
  const normalized = normalizeLabel(label);
  for (const type of preferredTypes) {
    const exact = aliasMap.get(`${type}:${normalized}`);
    if (exact) {
      return exact;
    }
  }

  const manual = aliasMap.get(`any:${normalized}`);
  if (manual) {
    return manual;
  }

  for (const type of preferredTypes) {
    const match = saucerpediaEntities.find(
      (entity) => entity.type === type && entity.aliases.some((alias) => normalizeLabel(alias) === normalized),
    );
    if (match) {
      return { type: match.type, id: match.id };
    }
  }

  return undefined;
}

function compactRelations(relations: SaucerpediaRelation[]) {
  const seen = new Set<string>();
  return relations.filter((relation) => {
    const key = `${relation.type}:${relation.id}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function fromLabels(labels: SaucerpediaRelationInput[] | undefined, preferredTypes: SaucerpediaEntityType[]) {
  return (labels ?? []).map((entry) => {
    if (typeof entry !== "string") {
      return entry;
    }
    return resolveLegacyLabel(entry, preferredTypes) ?? { type: "term" as const, id: entry, label: entry };
  });
}

export function getRelationsForEntity(type: SaucerpediaEntityType, id: string): SaucerpediaRelation[] {
  if (type === "term") {
    const item = saucerpediaTerms.find((term) => term.id === id);
    return compactRelations([
      ...fromLabels(item?.relatedTerms, ["term", "resource", "misidentification", "fake", "motif"]),
      ...fromLabels(item?.relatedPeople, ["person"]),
      ...fromLabels(item?.relatedEvents, ["event", "resource"]),
      ...(item?.relatedProducts ?? []).map((product) => {
        const productId = product.href.replace("/", "");
        return { type: "product" as const, id: productId, label: product.name };
      }),
    ]);
  }

  if (type === "person") {
    const item = saucerpediaPeople.find((person) => person.id === id);
    return compactRelations([
      ...fromLabels(item?.relatedTerms, ["term", "resource", "misidentification", "fake", "motif", "product"]),
      ...fromLabels(item?.relatedEvents, ["event", "resource"]),
      ...fromLabels(item?.relatedPeople, ["person"]),
    ]);
  }

  if (type === "event") {
    const item = saucerpediaEvents.find((event) => event.id === id);
    return compactRelations([
      ...fromLabels(item?.relatedPeople, ["person"]),
      ...fromLabels(item?.relatedTerms, ["term", "resource", "misidentification", "fake", "motif", "product"]),
    ]);
  }

  if (type === "history") {
    const item = saucerpediaHistoryCards.find((card) => card.id === id);
    return compactRelations([
      ...fromLabels(item?.relatedTerms, ["term", "resource", "misidentification", "fake", "motif", "product", "event"]),
      ...fromLabels(item?.relatedEvents, ["event", "resource"]),
    ]);
  }

  if (type === "misidentification") {
    const item = saucerpediaMisidentifications.find((entry) => entry.id === id);
    return compactRelations(fromLabels(item?.relatedTerms, ["term", "misidentification", "event", "resource"]));
  }

  if (type === "fake") {
    const item = saucerpediaFakes.find((entry) => entry.id === id);
    return compactRelations(fromLabels(item?.relatedTerms, ["fake", "term", "misidentification", "event", "resource"]));
  }

  if (type === "resource") {
    const item = saucerpediaResources.find((entry) => entry.id === id);
    return compactRelations([
      ...fromLabels(item?.relatedPeople, ["person"]),
      ...fromLabels(item?.relatedTerms, ["term", "resource", "event", "product"]),
    ]);
  }

  if (type === "motif") {
    const item = saucerpediaMotifs.find((entry) => entry.id === id);
    return compactRelations([
      ...fromLabels(item?.relatedEvents, ["event"]),
      ...fromLabels(item?.relatedPeople, ["person"]),
      ...fromLabels(item?.relatedTerms, ["term", "motif", "resource", "misidentification", "fake", "event"]),
    ]);
  }

  return [];
}

export function resolveSaucerpediaRelation(
  relation: SaucerpediaRelation,
): ResolvedSaucerpediaRelation | undefined {
  const entity = saucerpediaEntityByKey.get(`${relation.type}:${relation.id}`);
  if (!entity) {
    return undefined;
  }

  return {
    ...relation,
    title: relation.label ?? entity.title,
    eyebrow: entity.eyebrow,
    href: entity.href,
    summary: entity.summary,
  };
}

export function getSaucerpediaRelationLabel(relation: SaucerpediaRelation) {
  return relation.label ?? saucerpediaEntityByKey.get(`${relation.type}:${relation.id}`)?.title ?? relation.id;
}

export function validateSaucerpediaKnowledge() {
  const errors: string[] = [];

  for (const entity of saucerpediaEntities) {
    for (const relation of getRelationsForEntity(entity.type, entity.id)) {
      if (!resolveSaucerpediaRelation(relation)) {
        errors.push(`${entity.type}:${entity.id} -> ${relation.type}:${relation.id}${relation.label ? ` (${relation.label})` : ""}`);
      }
    }
  }

  // ID移行済みファイルは文字列レガシー表記へ戻さない。
  const migratedSets: Array<[SaucerpediaEntityType, Array<{ id: string; relatedTerms: unknown[] }>]> = [
    ["misidentification", saucerpediaMisidentifications],
    ["fake", saucerpediaFakes],
  ];
  for (const [type, items] of migratedSets) {
    for (const item of items) {
      for (const relation of item.relatedTerms) {
        if (typeof relation === "string") {
          errors.push(`${type}:${item.id} uses legacy string relation "${relation}" (use { type, id })`);
        }
      }
    }
  }

  // 出典URLは実在確認済みの https のみ許可する。
  const sourcedSets: Array<[SaucerpediaEntityType, Array<{ id: string; sources?: Array<{ label?: string; url?: string }> }>]> = [
    ["term", saucerpediaTerms],
    ["person", saucerpediaPeople],
    ["event", saucerpediaEvents],
    ["history", saucerpediaHistoryCards],
    ["misidentification", saucerpediaMisidentifications],
    ["fake", saucerpediaFakes],
    ["resource", saucerpediaResources],
    ["motif", saucerpediaMotifs],
  ];
  for (const [type, items] of sourcedSets) {
    for (const item of items) {
      for (const source of item.sources ?? []) {
        if (!source.label) {
          errors.push(`${type}:${item.id} source is missing label`);
        }
        if (!source.url?.startsWith("https://")) {
          errors.push(`${type}:${item.id} source url must be https: ${source.url}`);
        }
      }
    }
  }

  return errors;
}
