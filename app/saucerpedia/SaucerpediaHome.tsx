"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { eventCategories, saucerpediaEvents } from "@/data/saucerpedia/events";
import type { SaucerpediaEvent } from "@/data/saucerpedia/events";
import { fakeKinds, saucerpediaFakes } from "@/data/saucerpedia/fakes";
import type { SaucerpediaFake } from "@/data/saucerpedia/fakes";
import { saucerpediaHistoryCards } from "@/data/saucerpedia/history";
import type { SaucerpediaHistoryCard } from "@/data/saucerpedia/history";
import {
  getRelationsForEntity,
  getSaucerpediaRelationLabel,
  resolveSaucerpediaRelation,
  saucerpediaEntities,
  type SaucerpediaEntityType,
  type SaucerpediaRelation,
} from "@/data/saucerpedia/knowledge";
import {
  misidentificationKinds,
  saucerpediaMisidentifications,
} from "@/data/saucerpedia/misidentifications";
import type { SaucerpediaMisidentification } from "@/data/saucerpedia/misidentifications";
import { motifCategories, saucerpediaMotifs } from "@/data/saucerpedia/motifs";
import type { SaucerpediaMotif } from "@/data/saucerpedia/motifs";
import { peopleFeatureCards, personCategories, saucerpediaPeople } from "@/data/saucerpedia/people";
import type { SaucerpediaPerson } from "@/data/saucerpedia/people";
import { resourceKinds, saucerpediaResources } from "@/data/saucerpedia/resources";
import type { SaucerpediaResource } from "@/data/saucerpedia/resources";
import { saucerpediaTerms, termCategories } from "@/data/saucerpedia/terms";
import type { SaucerpediaTerm } from "@/data/saucerpedia/terms";
import { DictionaryControls, FilterChips, SearchBar } from "./Controls";
import {
  EventDetailCard,
  FakeDetailCard,
  MisidentificationDetailCard,
  MotifDetailCard,
  OverlapCardStack,
  PersonDetailCard,
  ResourceDetailCard,
  SpecimenIllustration,
  TermDetailCard,
  type SpecimenKind,
} from "./DetailCards";
import {
  EventListCard,
  FakeListCard,
  getCardElementId,
  HistoryCard,
  MisidentificationListCard,
  MotifListCard,
  PersonListCard,
  ResourceListCard,
  TermListCard,
} from "./ListCards";
import { SaucerpediaBookStackHero } from "./SaucerpediaBookStackHero";
import { AppHeader, BottomNav, SideDrawer, type SaucerpediaView } from "./Shell";
import styles from "./saucerpedia.module.css";

const productLinks = [
  { name: "UFO形状辞典（KINICHI）", href: "/kinichi", label: "UFO形状・形体・3Dモデル" },
  { name: "現代UFO・UAPディスクロージャー入門（Kean）", href: "/kean", label: "現代UAP・関係人物・公開文脈" },
];

const shapeSearchItems = [
  {
    id: "disc",
    title: "円盤型",
    summary: "古典的な空飛ぶ円盤イメージを代表する形状。詳しい形状分類はKinichiで扱います。",
    tags: ["形状", "空飛ぶ円盤", "Kinichi"],
  },
  {
    id: "sphere",
    title: "球形",
    summary: "光球、球状物体、オーブ状の見え方を含む形状表現。誤認や観測条件とも関係します。",
    tags: ["形状", "光点", "誤認"],
  },
  {
    id: "triangle",
    title: "三角形",
    summary: "三角形UFOや編隊光として語られる形状。ベルギーUFOウェーブなどとも関連します。",
    tags: ["形状", "三角形UFO", "事件"],
  },
];

const searchTypeFilters = [
  "すべて",
  "用語",
  "事件",
  "人物",
  "資料",
  "形状",
  "誤認",
  "フェイク",
  "体験",
];

export type { SaucerpediaView } from "./Shell";

const directoryLinks = [
  { href: "/saucerpedia/terms", kicker: "Glossary", title: "UFO用語辞典", body: "基本語から現代UAPまで、意味と関連項目をカードで調べる。", count: `${saucerpediaTerms.length}` },
  { href: "/saucerpedia/people", kicker: "People", title: "UFO人物辞典", body: "研究者、目撃者、コンタクティ、現代UAP関係者を立場で読む。", count: `${saucerpediaPeople.length}` },
  { href: "/saucerpedia/events", kicker: "Cases", title: "UFO事件辞典", body: "古典UFOから現代UAP、日本UFO史まで代表事件をたどる。", count: `${saucerpediaEvents.length}` },
  { href: "/saucerpedia/history", kicker: "History", title: "UFOの歴史", body: "現代UFO以前から現代UAPまで、時代ごとの見取り図を読む。", count: `${saucerpediaHistoryCards.length}` },
  { href: "/saucerpedia/misidentifications", kicker: "IFO", title: "UFOと誤認", body: "天体、航空機、カメラ由来など、UFOに見えやすい対象を整理する。", count: `${saucerpediaMisidentifications.length}` },
  { href: "/saucerpedia/fakes", kicker: "Fake", title: "UFOとフェイク", body: "写真・動画を見るときの作為や確認観点を整理する。", count: `${saucerpediaFakes.length}` },
  { href: "/saucerpedia/resources", kicker: "Archives", title: "UFO資料・機関辞典", body: "政府調査、公開制度、民間団体、資料アーカイブを整理する。", count: `${saucerpediaResources.length}` },
  { href: "/saucerpedia/motifs", kicker: "Motifs", title: "UFO体験モチーフ辞典", body: "体験談に繰り返し出てくる要素を文化史の入口として読む。", count: `${saucerpediaMotifs.length}` },
];

const returnStateKey = "saucerpedia:return-target";

const entityTypeToView: Partial<Record<SaucerpediaEntityType, SaucerpediaView>> = {
  event: "events",
  fake: "fakes",
  history: "history",
  misidentification: "misidentifications",
  motif: "motifs",
  person: "people",
  resource: "resources",
  term: "terms",
};

const searchFilterByType: Record<SaucerpediaEntityType | "shape", string> = {
  event: "事件",
  fake: "フェイク",
  history: "すべて",
  misidentification: "誤認",
  motif: "体験",
  person: "人物",
  product: "すべて",
  resource: "資料",
  shape: "形状",
  term: "用語",
};


function isPrimarySearchType(type: SaucerpediaEntityType) {
  return ["term", "event", "person", "resource", "misidentification", "fake", "motif"].includes(type);
}

function getEntityKey(type: SaucerpediaEntityType, id: string) {
  return `${type}-${id}`;
}

function scrollToDetail(behavior: ScrollBehavior = "smooth") {
  const detail = document.getElementById("selected-detail");
  if (!detail) {
    return;
  }
  detail.scrollIntoView({ behavior, block: "start" });
  detail.focus({ preventScroll: true });
}

function scrollBackToCard(element: HTMLElement) {
  element.scrollIntoView({ behavior: "smooth", block: "center" });
  element.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
}

function storeReturnTarget(type: SaucerpediaEntityType, id: string) {
  sessionStorage.setItem(
    returnStateKey,
    JSON.stringify({
      elementId: getCardElementId(type, id),
      href: `${window.location.pathname}${window.location.search}`,
      y: window.scrollY,
    }),
  );
}

function getTermText(term: SaucerpediaTerm) {
  return [
    term.name,
    term.englishName,
    term.translation,
    term.category,
    term.summary,
    term.quickRead,
    term.detail,
    ...(term.aliases ?? []),
    ...term.tags,
    ...(term.relatedTerms ?? []),
    ...(term.relatedPeople ?? []),
    ...(term.relatedEvents ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function byLearningOrder(a: SaucerpediaTerm, b: SaucerpediaTerm) {
  return a.order - b.order;
}

function getPersonText(person: SaucerpediaPerson) {
  return [
    person.name,
    person.englishName,
    person.period,
    person.role,
    person.category,
    person.summary,
    person.quickRead,
    ...person.tags,
    ...(person.relatedTerms ?? []),
    ...(person.relatedEvents ?? []),
    ...(person.relatedPeople ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getEventText(event: SaucerpediaEvent) {
  return [
    event.name,
    event.englishName,
    event.date,
    event.year,
    event.location,
    event.category,
    event.summary,
    event.quickRead,
    event.whatHappened,
    ...event.tags,
    ...(event.relatedPeople ?? []),
    ...(event.relatedTerms ?? []),
    ...(event.relatedShapes ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getMisidentificationText(item: SaucerpediaMisidentification) {
  return [
    item.name,
    item.englishName,
    item.category,
    item.kind,
    item.summary,
    item.quickRead,
    item.whyItLooksLikeUfo,
    ...(item.aliases ?? []),
    ...item.howToTell,
    ...item.commonAppearance,
    ...item.relatedTerms.map(getSaucerpediaRelationLabel),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getFakeText(item: SaucerpediaFake) {
  return [
    item.name,
    item.englishName,
    item.category,
    item.kind,
    item.summary,
    item.quickRead,
    item.whyBelievable,
    ...(item.aliases ?? []),
    ...item.howToCheck,
    ...item.relatedTerms.map(getSaucerpediaRelationLabel),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getResourceText(item: SaucerpediaResource) {
  return [
    item.name,
    item.englishName,
    item.kind,
    item.era,
    item.summary,
    item.quickRead,
    item.whatItDid,
    ...(item.aliases ?? []),
    ...(item.relatedPeople ?? []),
    ...item.relatedTerms,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getMotifText(item: SaucerpediaMotif) {
  return [
    item.name,
    item.englishName,
    item.category,
    item.summary,
    item.experienceContext,
    ...(item.relatedEvents ?? []),
    ...(item.relatedPeople ?? []),
    ...item.relatedTerms,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}



type SearchResult = {
  id: string;
  type: SaucerpediaEntityType | "shape";
  title: string;
  eyebrow: string;
  href: string;
  summary?: string;
  tags: string[];
  haystack: string;
  relation?: SaucerpediaRelation;
};

function SearchResultCard({ item }: { item: SearchResult }) {
  return (
    <Link className={styles.searchResultCard} href={item.href}>
      <div>
        <span>{item.eyebrow}</span>
        <strong>{item.title}</strong>
        {item.summary ? <p>{item.summary}</p> : null}
      </div>
      <OverlapCardStack items={item.relation ? getRelationsForEntity(item.relation.type, item.relation.id) : undefined} labels={item.type === "shape" ? item.tags : undefined} />
      <small>{item.tags.slice(0, 4).join(" / ")}</small>
    </Link>
  );
}


export function SaucerpediaHome({ view = "home" }: { view?: SaucerpediaView }) {
  const [selectedEventCategory, setSelectedEventCategory] = useState("すべて");
  const [selectedEventId, setSelectedEventId] = useState("kenneth-arnold-sighting");
  const [selectedFakeId, setSelectedFakeId] = useState("model-ufo");
  const [selectedFakeKind, setSelectedFakeKind] = useState("すべて");
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [selectedMisidentificationKind, setSelectedMisidentificationKind] = useState("すべて");
  const [selectedMisidentificationId, setSelectedMisidentificationId] = useState("venus");
  const [selectedMotifCategory, setSelectedMotifCategory] = useState("すべて");
  const [selectedMotifId, setSelectedMotifId] = useState("anomalous-light");
  const [selectedPersonCategory, setSelectedPersonCategory] = useState("すべて");
  const [selectedPersonId, setSelectedPersonId] = useState("kenneth-arnold");
  const [selectedResourceId, setSelectedResourceId] = useState("project-blue-book");
  const [selectedResourceKind, setSelectedResourceKind] = useState("すべて");
  const [selectedTermId, setSelectedTermId] = useState("ufo");
  const [eventQuery, setEventQuery] = useState("");
  const [fakeQuery, setFakeQuery] = useState("");
  const [misidentificationQuery, setMisidentificationQuery] = useState("");
  const [motifQuery, setMotifQuery] = useState("");
  const [personQuery, setPersonQuery] = useState("");
  const [query, setQuery] = useState("");
  const [resourceQuery, setResourceQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("すべて");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDetailKey, setActiveDetailKey] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [, startTransition] = useTransition();
  const deferredEventQuery = useDeferredValue(eventQuery);
  const deferredFakeQuery = useDeferredValue(fakeQuery);
  const deferredMisidentificationQuery = useDeferredValue(misidentificationQuery);
  const deferredMotifQuery = useDeferredValue(motifQuery);
  const deferredQuery = useDeferredValue(query);
  const deferredPersonQuery = useDeferredValue(personQuery);
  const deferredResourceQuery = useDeferredValue(resourceQuery);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    const itemId = new URLSearchParams(window.location.search).get("item");
    if (!itemId) {
      return;
    }

    startTransition(() => {
      if (view === "terms") {
        const item = saucerpediaTerms.find((term) => term.id === itemId);
        if (item) {
          setSelectedTermId(item.id);
          setSelectedCategory(item.category);
          setQuery("");
          setActiveDetailKey(getEntityKey("term", item.id));
        }
      }

      if (view === "people") {
        const item = saucerpediaPeople.find((person) => person.id === itemId);
        if (item) {
          setSelectedPersonId(item.id);
          setSelectedPersonCategory(item.category);
          setPersonQuery("");
          setActiveDetailKey(getEntityKey("person", item.id));
        }
      }

      if (view === "events") {
        const item = saucerpediaEvents.find((event) => event.id === itemId);
        if (item) {
          setSelectedEventId(item.id);
          setSelectedEventCategory(item.category);
          setEventQuery("");
          setActiveDetailKey(getEntityKey("event", item.id));
        }
      }

      if (view === "misidentifications") {
        const item = saucerpediaMisidentifications.find((entry) => entry.id === itemId);
        if (item) {
          setSelectedMisidentificationId(item.id);
          setSelectedMisidentificationKind(item.kind);
          setMisidentificationQuery("");
          setActiveDetailKey(getEntityKey("misidentification", item.id));
        }
      }

      if (view === "fakes") {
        const item = saucerpediaFakes.find((entry) => entry.id === itemId);
        if (item) {
          setSelectedFakeId(item.id);
          setSelectedFakeKind(item.kind);
          setFakeQuery("");
          setActiveDetailKey(getEntityKey("fake", item.id));
        }
      }

      if (view === "resources") {
        const item = saucerpediaResources.find((entry) => entry.id === itemId);
        if (item) {
          setSelectedResourceId(item.id);
          setSelectedResourceKind(item.kind);
          setResourceQuery("");
          setActiveDetailKey(getEntityKey("resource", item.id));
        }
      }

      if (view === "motifs") {
        const item = saucerpediaMotifs.find((entry) => entry.id === itemId);
        if (item) {
          setSelectedMotifId(item.id);
          setSelectedMotifCategory(item.category);
          setMotifQuery("");
          setActiveDetailKey(getEntityKey("motif", item.id));
        }
      }
    });
  }, [view, startTransition]);

  const selectedEvent = saucerpediaEvents.find((event) => event.id === selectedEventId) ?? saucerpediaEvents[0];
  const selectedFake = saucerpediaFakes.find((item) => item.id === selectedFakeId) ?? saucerpediaFakes[0];
  const selectedTerm = saucerpediaTerms.find((term) => term.id === selectedTermId) ?? saucerpediaTerms[0];
  const selectedMisidentification =
    saucerpediaMisidentifications.find((item) => item.id === selectedMisidentificationId) ??
    saucerpediaMisidentifications[0];
  const selectedMotif = saucerpediaMotifs.find((item) => item.id === selectedMotifId) ?? saucerpediaMotifs[0];
  const selectedPerson =
    saucerpediaPeople.find((person) => person.id === selectedPersonId) ?? saucerpediaPeople[0];
  const selectedResource =
    saucerpediaResources.find((item) => item.id === selectedResourceId) ?? saucerpediaResources[0];
  const searchResults = useMemo<SearchResult[]>(() => {
    const entityResults = saucerpediaEntities
      .filter((entity) => isPrimarySearchType(entity.type))
      .map((entity) => ({
        id: `${entity.type}-${entity.id}`,
        type: entity.type,
        title: entity.title,
        eyebrow: entity.eyebrow,
        href: entity.href,
        summary: entity.summary,
        tags: [entity.eyebrow, ...entity.aliases.slice(0, 3)],
        haystack: [entity.title, entity.eyebrow, entity.summary, ...entity.aliases].filter(Boolean).join(" ").toLowerCase(),
        relation: { type: entity.type, id: entity.id },
      }));
    const shapeResults = shapeSearchItems.map((item) => ({
      id: `shape-${item.id}`,
      type: "shape" as const,
      title: item.title,
      eyebrow: "UFO形状",
      href: "/kinichi",
      summary: item.summary,
      tags: item.tags,
      haystack: [item.title, item.summary, ...item.tags].join(" ").toLowerCase(),
    }));
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

    return [...entityResults, ...shapeResults]
      .filter((item) => searchFilter === "すべて" || searchFilterByType[item.type] === searchFilter)
      .filter((item) => !normalizedQuery || item.haystack.includes(normalizedQuery))
      .slice(0, 48);
  }, [deferredSearchQuery, searchFilter]);

  const filteredTerms = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    return saucerpediaTerms.filter((term) => {
      const matchesCategory = selectedCategory === "すべて" || term.category === selectedCategory;
      const matchesQuery = !normalizedQuery || getTermText(term).includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    }).sort(byLearningOrder);
  }, [deferredQuery, selectedCategory]);

  const filteredPeople = useMemo(() => {
    const normalizedQuery = deferredPersonQuery.trim().toLowerCase();
    return saucerpediaPeople.filter((person) => {
      const matchesCategory = selectedPersonCategory === "すべて" || person.category === selectedPersonCategory;
      const matchesQuery = !normalizedQuery || getPersonText(person).includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [deferredPersonQuery, selectedPersonCategory]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = deferredEventQuery.trim().toLowerCase();
    return saucerpediaEvents.filter((event) => {
      const matchesCategory = selectedEventCategory === "すべて" || event.category === selectedEventCategory;
      const matchesQuery = !normalizedQuery || getEventText(event).includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [deferredEventQuery, selectedEventCategory]);

  const filteredMisidentifications = useMemo(() => {
    const normalizedQuery = deferredMisidentificationQuery.trim().toLowerCase();
    return saucerpediaMisidentifications.filter((item) => {
      const matchesKind = selectedMisidentificationKind === "すべて" || item.kind === selectedMisidentificationKind;
      const matchesQuery = !normalizedQuery || getMisidentificationText(item).includes(normalizedQuery);
      return matchesKind && matchesQuery;
    });
  }, [deferredMisidentificationQuery, selectedMisidentificationKind]);

  const filteredFakes = useMemo(() => {
    const normalizedQuery = deferredFakeQuery.trim().toLowerCase();
    return saucerpediaFakes.filter((item) => {
      const matchesKind = selectedFakeKind === "すべて" || item.kind === selectedFakeKind;
      const matchesQuery = !normalizedQuery || getFakeText(item).includes(normalizedQuery);
      return matchesKind && matchesQuery;
    });
  }, [deferredFakeQuery, selectedFakeKind]);

  const filteredResources = useMemo(() => {
    const normalizedQuery = deferredResourceQuery.trim().toLowerCase();
    return saucerpediaResources.filter((item) => {
      const matchesKind = selectedResourceKind === "すべて" || item.kind === selectedResourceKind;
      const matchesQuery = !normalizedQuery || getResourceText(item).includes(normalizedQuery);
      return matchesKind && matchesQuery;
    });
  }, [deferredResourceQuery, selectedResourceKind]);

  const filteredMotifs = useMemo(() => {
    const normalizedQuery = deferredMotifQuery.trim().toLowerCase();
    return saucerpediaMotifs.filter((item) => {
      const matchesCategory = selectedMotifCategory === "すべて" || item.category === selectedMotifCategory;
      const matchesQuery = !normalizedQuery || getMotifText(item).includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [deferredMotifQuery, selectedMotifCategory]);

  const handleCategoryChange = (category: string) => {
    startTransition(() => {
      setSelectedCategory(category);
      const nextTerm = saucerpediaTerms
        .filter((term) => category === "すべて" || term.category === category)
        .sort(byLearningOrder)[0];
      if (nextTerm) {
        setSelectedTermId(nextTerm.id);
      }
    });
  };

  const handlePersonCategoryChange = (category: string) => {
    startTransition(() => {
      setSelectedPersonCategory(category);
      const nextPerson = saucerpediaPeople.find((person) => category === "すべて" || person.category === category);
      if (nextPerson) {
        setSelectedPersonId(nextPerson.id);
      }
    });
  };

  const handleEventCategoryChange = (category: string) => {
    startTransition(() => {
      setSelectedEventCategory(category);
      const nextEvent = saucerpediaEvents.find((event) => category === "すべて" || event.category === category);
      if (nextEvent) {
        setSelectedEventId(nextEvent.id);
      }
    });
  };

  const handleMisidentificationKindChange = (kind: string) => {
    startTransition(() => {
      setSelectedMisidentificationKind(kind);
      const nextItem = saucerpediaMisidentifications.find((item) => kind === "すべて" || item.kind === kind);
      if (nextItem) {
        setSelectedMisidentificationId(nextItem.id);
      }
    });
  };

  const handleFakeKindChange = (kind: string) => {
    startTransition(() => {
      setSelectedFakeKind(kind);
      const nextItem = saucerpediaFakes.find((item) => kind === "すべて" || item.kind === kind);
      if (nextItem) {
        setSelectedFakeId(nextItem.id);
      }
    });
  };

  const handleResourceKindChange = (kind: string) => {
    startTransition(() => {
      setSelectedResourceKind(kind);
      const nextItem = saucerpediaResources.find((item) => kind === "すべて" || item.kind === kind);
      if (nextItem) {
        setSelectedResourceId(nextItem.id);
      }
    });
  };

  const handleMotifCategoryChange = (category: string) => {
    startTransition(() => {
      setSelectedMotifCategory(category);
      const nextItem = saucerpediaMotifs.find((item) => category === "すべて" || item.category === category);
      if (nextItem) {
        setSelectedMotifId(nextItem.id);
      }
    });
  };

  const selectItemByRelation = (relation: SaucerpediaRelation) => {
    if (relation.type === "term") {
      const item = saucerpediaTerms.find((term) => term.id === relation.id);
      if (item) {
        setSelectedTermId(item.id);
        setSelectedCategory(item.category);
        setQuery("");
        return true;
      }
    }

    if (relation.type === "person") {
      const item = saucerpediaPeople.find((person) => person.id === relation.id);
      if (item) {
        setSelectedPersonId(item.id);
        setSelectedPersonCategory(item.category);
        setPersonQuery("");
        return true;
      }
    }

    if (relation.type === "event") {
      const item = saucerpediaEvents.find((event) => event.id === relation.id);
      if (item) {
        setSelectedEventId(item.id);
        setSelectedEventCategory(item.category);
        setEventQuery("");
        return true;
      }
    }

    if (relation.type === "misidentification") {
      const item = saucerpediaMisidentifications.find((entry) => entry.id === relation.id);
      if (item) {
        setSelectedMisidentificationId(item.id);
        setSelectedMisidentificationKind(item.kind);
        setMisidentificationQuery("");
        return true;
      }
    }

    if (relation.type === "fake") {
      const item = saucerpediaFakes.find((entry) => entry.id === relation.id);
      if (item) {
        setSelectedFakeId(item.id);
        setSelectedFakeKind(item.kind);
        setFakeQuery("");
        return true;
      }
    }

    if (relation.type === "resource") {
      const item = saucerpediaResources.find((entry) => entry.id === relation.id);
      if (item) {
        setSelectedResourceId(item.id);
        setSelectedResourceKind(item.kind);
        setResourceQuery("");
        return true;
      }
    }

    if (relation.type === "motif") {
      const item = saucerpediaMotifs.find((entry) => entry.id === relation.id);
      if (item) {
        setSelectedMotifId(item.id);
        setSelectedMotifCategory(item.category);
        setMotifQuery("");
        return true;
      }
    }

    return false;
  };

  const openDetailFromList = (relation: SaucerpediaRelation) => {
    storeReturnTarget(relation.type, relation.id);
    setActiveDetailKey(getEntityKey(relation.type, relation.id));
    startTransition(() => {
      selectItemByRelation(relation);
    });
    window.history.replaceState(null, "", `${window.location.pathname}?item=${relation.id}`);
    window.setTimeout(() => scrollToDetail(), 120);
  };

  const openRelationDetail = (relation: SaucerpediaRelation) => {
    const nextView = entityTypeToView[relation.type];
    if (!nextView || relation.type === "product") {
      return;
    }

    const resolved = resolveSaucerpediaRelation(relation);
    if (!resolved) {
      return;
    }

    const currentType = Object.entries(entityTypeToView).find(([, mappedView]) => mappedView === view)?.[0] as
      | SaucerpediaEntityType
      | undefined;
    const currentId =
      view === "terms" ? selectedTerm.id :
      view === "people" ? selectedPerson.id :
      view === "events" ? selectedEvent.id :
      view === "misidentifications" ? selectedMisidentification.id :
      view === "fakes" ? selectedFake.id :
      view === "resources" ? selectedResource.id :
      view === "motifs" ? selectedMotif.id :
      undefined;
    if (currentType && currentId) {
      storeReturnTarget(currentType, currentId);
    }

    if (nextView === view) {
      setActiveDetailKey(getEntityKey(relation.type, relation.id));
      startTransition(() => {
        selectItemByRelation(relation);
      });
      window.history.replaceState(null, "", `${window.location.pathname}?item=${relation.id}#selected-detail`);
      window.setTimeout(() => scrollToDetail(), 120);
      return;
    }

    window.location.assign(resolved.href);
  };

  const returnToList = () => {
    setActiveDetailKey(null);
    const fallback = document.querySelector<HTMLElement>("[data-selected-card='true']");
    const saved = sessionStorage.getItem(returnStateKey);
    if (!saved) {
      if (fallback) {
        scrollBackToCard(fallback);
      }
      return;
    }

    try {
      const target = JSON.parse(saved) as { elementId?: string; href?: string; y?: number };
      const targetPath = target.href ? new URL(target.href, window.location.origin).pathname : window.location.pathname;
      if (targetPath !== window.location.pathname) {
        const hash = target.elementId ? `#${target.elementId}` : "";
        window.location.assign(`${target.href}${hash}`);
        return;
      }

      const element = target.elementId ? document.getElementById(target.elementId) : null;
      if (element) {
        scrollBackToCard(element);
        return;
      }

      window.scrollTo({ behavior: "smooth", top: target.y ?? 0 });
    } catch {
      if (fallback) {
        scrollBackToCard(fallback);
      }
    }
  };

  useEffect(() => {
    if (window.location.hash === "#selected-detail") {
      window.setTimeout(() => scrollToDetail("auto"), 0);
    }
  }, [
    selectedEvent.id,
    selectedFake.id,
    selectedMisidentification.id,
    selectedMotif.id,
    selectedPerson.id,
    selectedResource.id,
    selectedTerm.id,
  ]);

  const directoryNav = (
    <nav className={styles.directoryNav} aria-label="saucerpediaカテゴリ">
      <Link
        aria-current={view === "home" ? "page" : undefined}
        className={view === "home" ? styles.activeDirectoryLink : undefined}
        href="/saucerpedia"
      >
        トップ
      </Link>
      {directoryLinks.map((item) => (
        <Link
          aria-current={item.href.endsWith(`/${view}`) ? "page" : undefined}
          className={item.href.endsWith(`/${view}`) ? styles.activeDirectoryLink : undefined}
          href={item.href}
          key={item.href}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );

  const pageHeader = (eyebrow: string, title: string, body: string, kind: SpecimenKind) => (
    <section className={styles.categoryHero}>
      <div>
        <p className={styles.kicker}>{eyebrow}</p>
        <h1>{title}</h1>
        <p>{body}</p>
      </div>
      <SpecimenIllustration kind={kind} size="hero" />
      {directoryNav}
    </section>
  );

  const specializedGuideSection = (
    <section className={styles.specializedGuideSection} aria-labelledby="saucerpedia-specialized-guides">
      <div className={styles.productGuideHeader}>
        <p className={styles.kicker}>Specialized Guides</p>
        <h3 id="saucerpedia-specialized-guides">専門ガイド</h3>
      </div>
      <div className={styles.productGuideGrid}>
        {productLinks.map((product) => (
          <Link className={styles.productDirectoryCard} href={product.href} key={product.name}>
            <span>UFO Lab Tokyo</span>
            <strong>{product.name}</strong>
            <p>{product.label}</p>
            <small>specialized guide</small>
          </Link>
        ))}
      </div>
    </section>
  );

  const categorySectionClassName = `${styles.glossarySection} ${view !== "home" ? styles.categoryViewSection : ""}`;
  const detailLayoutClassName = `${styles.glossaryLayout} ${activeDetailKey ? styles.detailOpenLayout : ""}`;
  const detailGridClassName = `${styles.termGrid} ${activeDetailKey ? styles.detailOpenGrid : ""}`;
  const detailRailClassName = `${styles.detailRail} ${activeDetailKey ? styles.expandedDetailRail : ""}`;

  const termsSection = (
    <section className={categorySectionClassName} id="glossary">
      <div className={styles.sectionHeader}>
        <p className={styles.kicker}>UFO Glossary</p>
        <h2>UFO用語辞典</h2>
        <p>基本語から現代UAPまで、意味をすぐつかみ、関連項目へ進めるカード辞典です。</p>
      </div>

      <DictionaryControls
        categories={["すべて", ...termCategories]}
        categoryAriaLabel="カテゴリ"
        onCategoryChange={handleCategoryChange}
        onQueryChange={setQuery}
        placeholder="UAP、MIB、FOIA、グレイ..."
        query={query}
        selectedCategory={selectedCategory}
      />

      <div className={detailLayoutClassName}>
        <div className={detailGridClassName} aria-label="用語カード一覧">
          {filteredTerms.map((term) => (
            <TermListCard
              isDetailSource={activeDetailKey === getEntityKey("term", term.id)}
              isSelected={selectedTerm.id === term.id}
              key={term.id}
              onOpenDetail={() => openDetailFromList({ type: "term", id: term.id })}
              onSelect={() => setSelectedTermId(term.id)}
              term={term}
            />
          ))}
        </div>

        <div className={detailRailClassName} id="selected-detail" tabIndex={-1} key={activeDetailKey ?? selectedTerm.id} aria-live="polite">
          <TermDetailCard onOpenRelation={openRelationDetail} onReturn={returnToList} term={selectedTerm} />
        </div>
      </div>
    </section>
  );

  const peopleSection = (
    <section className={categorySectionClassName} id="people">
      <div className={styles.sectionHeader}>
        <p className={styles.kicker}>UFO People</p>
        <h2>UFO人物辞典</h2>
        <p>人物を英雄化・断罪せず、UFO / UAP 史の中での立場、時代、関連用語をカードで整理します。</p>
      </div>

      <div className={styles.featureStrip}>
        {peopleFeatureCards.map((feature) => (
          <article className={styles.featureCard} key={feature.id}>
            <span>{feature.category}</span>
            <h3>{feature.title}</h3>
            <p>{feature.summary}</p>
            <div className={styles.featurePeople}>
              {feature.people.map((featurePerson) => (
                <div key={featurePerson.name}>
                  <strong>{featurePerson.name}</strong>
                  <small>{featurePerson.note}</small>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      <DictionaryControls
        categories={["すべて", ...personCategories]}
        categoryAriaLabel="人物カテゴリ"
        onCategoryChange={handlePersonCategoryChange}
        onQueryChange={setPersonQuery}
        placeholder="ハイネック、ベンダー、ヴァレ、グラッシュ..."
        query={personQuery}
        selectedCategory={selectedPersonCategory}
      />

      <div className={detailLayoutClassName}>
        <div className={detailGridClassName} aria-label="人物カード一覧">
          {filteredPeople.map((person) => (
            <PersonListCard
              isDetailSource={activeDetailKey === getEntityKey("person", person.id)}
              isSelected={selectedPerson.id === person.id}
              key={person.id}
              onOpenDetail={() => openDetailFromList({ type: "person", id: person.id })}
              onSelect={() => setSelectedPersonId(person.id)}
              person={person}
            />
          ))}
        </div>

        <div className={detailRailClassName} id="selected-detail" tabIndex={-1} key={activeDetailKey ?? selectedPerson.id} aria-live="polite">
          <PersonDetailCard onOpenRelation={openRelationDetail} onReturn={returnToList} person={selectedPerson} />
        </div>
      </div>
    </section>
  );

  const eventsSection = (
    <section className={categorySectionClassName} id="events">
      <div className={styles.sectionHeader}>
        <p className={styles.kicker}>UFO Cases</p>
        <h2>UFO事件辞典</h2>
        <p>古典UFOから現代UAP、日本UFO史まで、代表事件を時代・場所・関連項目でたどります。</p>
      </div>

      <DictionaryControls
        categories={["すべて", ...eventCategories]}
        categoryAriaLabel="事件カテゴリ"
        onCategoryChange={handleEventCategoryChange}
        onQueryChange={setEventQuery}
        placeholder="ロズウェル、Tic Tac、甲府、フェニックス..."
        query={eventQuery}
        selectedCategory={selectedEventCategory}
      />

      <div className={detailLayoutClassName}>
        <div className={detailGridClassName} aria-label="事件カード一覧">
          {filteredEvents.map((event) => (
            <EventListCard
              event={event}
              isDetailSource={activeDetailKey === getEntityKey("event", event.id)}
              isSelected={selectedEvent.id === event.id}
              key={event.id}
              onOpenDetail={() => openDetailFromList({ type: "event", id: event.id })}
              onSelect={() => setSelectedEventId(event.id)}
            />
          ))}
        </div>

        <div className={detailRailClassName} id="selected-detail" tabIndex={-1} key={activeDetailKey ?? selectedEvent.id} aria-live="polite">
          <EventDetailCard event={selectedEvent} onOpenRelation={openRelationDetail} onReturn={returnToList} />
        </div>
      </div>
    </section>
  );

  const historySection = (
    <section className={styles.historySection} id="history">
      <div className={styles.sectionHeader}>
        <p className={styles.kicker}>UFO History Cards</p>
        <h2>UFOの歴史カード</h2>
        <p>現代UFO以前の空の怪異から現代UAPまで、時代ごとの見取り図をカードでざっくりたどります。</p>
      </div>
      <div className={styles.historyGrid}>
        {saucerpediaHistoryCards.map((card) => (
          <HistoryCard card={card} key={card.id} />
        ))}
      </div>
    </section>
  );

  const misidentificationsSection = (
    <section className={categorySectionClassName} id="misidentifications">
      <div className={styles.sectionHeader}>
        <p className={styles.kicker}>UFO & IFO</p>
        <h2>UFOと誤認</h2>
        <p>UFOに見えやすい天体・航空機・生物・カメラ由来・錯覚を、見分けるポイントと一緒に整理します。</p>
      </div>

      <DictionaryControls
        categories={["すべて", ...misidentificationKinds]}
        categoryAriaLabel="誤認の種類"
        onCategoryChange={handleMisidentificationKindChange}
        onQueryChange={setMisidentificationQuery}
        placeholder="金星、スターリンク、レンズフレア、鳥..."
        query={misidentificationQuery}
        selectedCategory={selectedMisidentificationKind}
      />

      <div className={detailLayoutClassName}>
        <div className={detailGridClassName} aria-label="UFOと誤認カード一覧">
          {filteredMisidentifications.map((item) => (
            <MisidentificationListCard
              isDetailSource={activeDetailKey === getEntityKey("misidentification", item.id)}
              isSelected={selectedMisidentification.id === item.id}
              item={item}
              key={item.id}
              onOpenDetail={() => openDetailFromList({ type: "misidentification", id: item.id })}
              onSelect={() => setSelectedMisidentificationId(item.id)}
            />
          ))}
        </div>

        <div className={detailRailClassName} id="selected-detail" tabIndex={-1} key={activeDetailKey ?? selectedMisidentification.id} aria-live="polite">
          <MisidentificationDetailCard item={selectedMisidentification} onOpenRelation={openRelationDetail} onReturn={returnToList} />
        </div>
      </div>
    </section>
  );

  const fakesSection = (
    <section className={categorySectionClassName} id="fakes">
      <div className={styles.sectionHeader}>
        <p className={styles.kicker}>UFO & Fake</p>
        <h2>UFOとフェイク</h2>
        <p>模型、撮影トリック、CG、AI生成、初出確認など、UFO写真・動画を見るときの確認観点を整理します。</p>
      </div>

      <DictionaryControls
        categories={["すべて", ...fakeKinds]}
        categoryAriaLabel="フェイクの種類"
        onCategoryChange={handleFakeKindChange}
        onQueryChange={setFakeQuery}
        placeholder="模型UFO、CGI、AI生成、EXIF..."
        query={fakeQuery}
        selectedCategory={selectedFakeKind}
      />

      <div className={detailLayoutClassName}>
        <div className={detailGridClassName} aria-label="UFOとフェイクカード一覧">
          {filteredFakes.map((item) => (
            <FakeListCard
              isDetailSource={activeDetailKey === getEntityKey("fake", item.id)}
              isSelected={selectedFake.id === item.id}
              item={item}
              key={item.id}
              onOpenDetail={() => openDetailFromList({ type: "fake", id: item.id })}
              onSelect={() => setSelectedFakeId(item.id)}
            />
          ))}
        </div>

        <div className={detailRailClassName} id="selected-detail" tabIndex={-1} key={activeDetailKey ?? selectedFake.id} aria-live="polite">
          <FakeDetailCard item={selectedFake} onOpenRelation={openRelationDetail} onReturn={returnToList} />
        </div>
      </div>
    </section>
  );

  const resourcesSection = (
    <section className={categorySectionClassName} id="resources">
      <div className={styles.sectionHeader}>
        <p className={styles.kicker}>UFO Archives & Organizations</p>
        <h2>UFO資料・機関辞典</h2>
        <p>政府調査、公開制度、民間団体、報告受付組織を、役割と関連人物・用語からたどります。</p>
      </div>

      <DictionaryControls
        categories={["すべて", ...resourceKinds]}
        categoryAriaLabel="資料・機関の種別"
        onCategoryChange={handleResourceKindChange}
        onQueryChange={setResourceQuery}
        placeholder="ブルーブック、AARO、FOIA、NICAP..."
        query={resourceQuery}
        selectedCategory={selectedResourceKind}
      />

      <div className={detailLayoutClassName}>
        <div className={detailGridClassName} aria-label="UFO資料・機関カード一覧">
          {filteredResources.map((item) => (
            <ResourceListCard
              isDetailSource={activeDetailKey === getEntityKey("resource", item.id)}
              isSelected={selectedResource.id === item.id}
              item={item}
              key={item.id}
              onOpenDetail={() => openDetailFromList({ type: "resource", id: item.id })}
              onSelect={() => setSelectedResourceId(item.id)}
            />
          ))}
        </div>

        <div className={detailRailClassName} id="selected-detail" tabIndex={-1} key={activeDetailKey ?? selectedResource.id} aria-live="polite">
          <ResourceDetailCard item={selectedResource} onOpenRelation={openRelationDetail} onReturn={returnToList} />
        </div>
      </div>
    </section>
  );

  const motifsSection = (
    <section className={categorySectionClassName} id="motifs">
      <div className={styles.sectionHeader}>
        <p className={styles.kicker}>UFO Experience Motifs</p>
        <h2>UFO体験モチーフ辞典</h2>
        <p>目撃、接近、コンタクト、アブダクション、ハイストレンジネスに繰り返し出てくる体験要素を整理します。</p>
      </div>

      <DictionaryControls
        categories={["すべて", ...motifCategories]}
        categoryAriaLabel="体験モチーフカテゴリ"
        onCategoryChange={handleMotifCategoryChange}
        onQueryChange={setMotifQuery}
        placeholder="異常な光、欠落時間、MIB、浮遊感..."
        query={motifQuery}
        selectedCategory={selectedMotifCategory}
      />

      <div className={detailLayoutClassName}>
        <div className={detailGridClassName} aria-label="UFO体験モチーフカード一覧">
          {filteredMotifs.map((item) => (
            <MotifListCard
              isDetailSource={activeDetailKey === getEntityKey("motif", item.id)}
              isSelected={selectedMotif.id === item.id}
              item={item}
              key={item.id}
              onOpenDetail={() => openDetailFromList({ type: "motif", id: item.id })}
              onSelect={() => setSelectedMotifId(item.id)}
            />
          ))}
        </div>

        <div className={detailRailClassName} id="selected-detail" tabIndex={-1} key={activeDetailKey ?? selectedMotif.id} aria-live="polite">
          <MotifDetailCard item={selectedMotif} onOpenRelation={openRelationDetail} onReturn={returnToList} />
        </div>
      </div>
    </section>
  );

  const searchSection = (
    <section className={categorySectionClassName} id="search">
      <div className={styles.sectionHeader}>
        <p className={styles.kicker}>Saucerpedia Search</p>
        <h2>横断検索</h2>
        <p>用語、事件、人物、資料、誤認、フェイク、体験モチーフをまとめて探せます。</p>
      </div>

      <div className={styles.controls}>
        <SearchBar
          label="辞典全体を探す"
          onChange={setSearchQuery}
          placeholder="UAP、ロズウェル、ハイネック、AARO..."
          value={searchQuery}
        />
        <FilterChips items={searchTypeFilters} onChange={setSearchFilter} value={searchFilter} />
      </div>

      <div className={styles.searchResultsHeader}>
        <strong>{searchResults.length}件</strong>
        <span>{searchFilter === "すべて" ? "すべてのカテゴリ" : searchFilter}</span>
      </div>
      <div className={styles.searchResultGrid} aria-label="検索結果">
        {searchResults.map((item) => (
          <SearchResultCard item={item} key={item.id} />
        ))}
      </div>
    </section>
  );

  const viewToneClass =
    view === "people" ? styles.viewIndigo :
    view === "events" ? styles.viewAmber :
    view === "history" ? styles.viewCobalt :
    view === "misidentifications" ? styles.viewMoss :
    view === "fakes" ? styles.viewRose :
    view === "resources" ? styles.viewCyan :
    view === "motifs" ? styles.viewPlum :
    styles.viewTeal;

  const pageShell = (content: ReactNode) => (
    <main className={`${styles.page} ${styles.pageWithMobileNav} ${viewToneClass}`}>
      <AppHeader onMenuOpen={() => setIsDrawerOpen(true)} view={view} />
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      {content}
      <BottomNav view={view} />
    </main>
  );

  if (view === "home") {
    return pageShell(
      <>
        <SaucerpediaBookStackHero items={directoryLinks} />
        {specializedGuideSection}
      </>
    );
  }

  if (view === "terms") {
    return pageShell(
      <>
        {pageHeader("Saucerpedia Glossary", "UFO用語辞典", "基本語から現代UAPまで、意味をすぐつかみ、関連項目へ進めるカード辞典です。", "term")}
        {termsSection}
      </>
    );
  }

  if (view === "people") {
    return pageShell(
      <>
        {pageHeader("Saucerpedia People", "UFO人物辞典", "UFO / UAP 史に関わる人物を、立場、時代、関連用語から整理します。", "person")}
        {peopleSection}
      </>
    );
  }

  if (view === "events") {
    return pageShell(
      <>
        {pageHeader("Saucerpedia Cases", "UFO事件辞典", "古典UFOから現代UAP、日本UFO史まで、代表事件をカードでたどります。", "event")}
        {eventsSection}
      </>
    );
  }

  if (view === "history") {
    return pageShell(
      <>
        {pageHeader("Saucerpedia History", "UFOの歴史カード", "現代UFO以前の空の怪異から現代UAPまで、時代ごとの見取り図を読みます。", "history")}
        {historySection}
      </>
    );
  }

  if (view === "misidentifications") {
    return pageShell(
      <>
        {pageHeader("Saucerpedia IFO", "UFOと誤認", "UFOに見えやすい対象と見分けるポイントを整理します。", "misidentification")}
        {misidentificationsSection}
      </>
    );
  }

  if (view === "fakes") {
    return pageShell(
      <>
        {pageHeader("Saucerpedia Fake", "UFOとフェイク", "UFO写真・動画を見るときの作為や確認観点を整理します。", "fake")}
        {fakesSection}
      </>
    );
  }

  if (view === "resources") {
    return pageShell(
      <>
        {pageHeader("Saucerpedia Archives", "UFO資料・機関辞典", "政府調査、公開制度、民間団体、資料アーカイブを役割から整理します。", "resource")}
        {resourcesSection}
      </>
    );
  }

  if (view === "motifs") {
    return pageShell(
      <>
        {pageHeader("Saucerpedia Motifs", "UFO体験モチーフ辞典", "UFO体験談に繰り返し出てくる要素を、文化史と調査上の入口として整理します。", "motif")}
        {motifsSection}
      </>
    );
  }

  if (view === "search") {
    return pageShell(
      <>
        {pageHeader("Saucerpedia Search", "検索", "UFO / UAP の用語、人物、事件、資料を横断して探します。", "term")}
        {searchSection}
      </>
    );
  }

  return null;
}
