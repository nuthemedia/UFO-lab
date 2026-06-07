"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import {
  jacquesCards,
  jacquesConnections,
  type JacquesCard,
  type JacquesCategory,
  type JacquesConnection,
} from "@/data/jacques/mockData";

type CategoryFilter = {
  id: string;
  label: string;
  categories: JacquesCategory[] | null;
};

type VisibleConnection = JacquesConnection & {
  relatedCard: JacquesCard;
};

type RelatedConnectionGroup = {
  id: string;
  relatedCard: JacquesCard;
  connections: VisibleConnection[];
  sharedMotifs: string[];
};

const categoryFilters: CategoryFilter[] = [
  { id: "all", label: "すべて", categories: null },
  {
    id: "ufo-aerial",
    label: "UFO・空中現象",
    categories: ["ufo", "aerial_phenomenon"],
  },
  { id: "fairy", label: "妖精譚", categories: ["fairy_tale", "folklore"] },
  { id: "kamikakushi", label: "神隠し", categories: ["kamikakushi", "fairy_tale"] },
  { id: "religious", label: "宗教的幻視", categories: ["religious_vision"] },
  { id: "contactee", label: "コンタクティ", categories: ["contactee"] },
];

const categoryLabels: Record<JacquesCategory, string> = {
  ufo: "UFO事件",
  aerial_phenomenon: "空中現象",
  fairy_tale: "妖精譚",
  kamikakushi: "神隠し",
  religious_vision: "宗教的幻視",
  contactee: "コンタクティ",
  folklore: "民間伝承",
};

const categoryTone: Record<JacquesCategory, string> = {
  ufo: "from-emerald-400/35 via-slate-800 to-cyan-300/20",
  aerial_phenomenon: "from-cyan-300/30 via-slate-800 to-amber-300/20",
  fairy_tale: "from-lime-300/25 via-slate-800 to-rose-300/20",
  kamikakushi: "from-zinc-300/25 via-slate-800 to-lime-300/20",
  religious_vision: "from-amber-300/30 via-slate-800 to-sky-300/20",
  contactee: "from-teal-300/30 via-slate-800 to-amber-300/20",
  folklore: "from-stone-300/25 via-slate-800 to-cyan-300/20",
};

const visibleConnections = jacquesConnections.filter(
  (connection) =>
    connection.adoptionStatus === "adopt" &&
    connection.displayMode !== "hidden" &&
    connection.connectionShape !== "graph_only",
);

function findCard(cardId: string) {
  return jacquesCards.find((card) => card.id === cardId);
}

function getRelatedConnectionGroups(cardId: string): RelatedConnectionGroup[] {
  const groups = new Map<string, RelatedConnectionGroup>();

  visibleConnections.forEach((connection) => {
    if (connection.fromCardId !== cardId && connection.toCardId !== cardId) {
      return;
    }

    const relatedCardId =
      connection.fromCardId === cardId ? connection.toCardId : connection.fromCardId;
    const relatedCard = findCard(relatedCardId);

    if (!relatedCard) {
      return;
    }

    const visibleConnection = {
      ...connection,
      relatedCard,
    };
    const existingGroup =
      groups.get(relatedCardId) ??
      ({
        id: relatedCardId,
        relatedCard,
        connections: [],
        sharedMotifs: [],
      } satisfies RelatedConnectionGroup);

    existingGroup.connections.push(visibleConnection);
    existingGroup.sharedMotifs = Array.from(
      new Set([...existingGroup.sharedMotifs, ...connection.sharedMotifs]),
    );
    groups.set(relatedCardId, existingGroup);
  });

  return Array.from(groups.values());
}

function getMotifDelay(motif: string) {
  const total = Array.from(motif).reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return `-${((total % 9) * 0.18).toFixed(2)}s`;
}

function CategoryBadge({ category }: { category: JacquesCategory }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/7 px-2.5 py-1 text-xs font-black text-slate-200">
      {categoryLabels[category]}
    </span>
  );
}

function CardPlaceholder({ card }: { card: JacquesCard }) {
  return (
    <div
      className={`relative flex aspect-[4/3] min-h-28 items-end overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br p-3 ${categoryTone[card.category]}`}
    >
      {card.image ? (
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          src={card.image}
        />
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(255,255,255,0.28),transparent_30%),linear-gradient(180deg,transparent,rgba(0,0,0,0.48))]" />
      <div className="relative text-sm font-black leading-tight text-slate-50">
        {categoryLabels[card.category]}
      </div>
    </div>
  );
}

function MotifList({
  motifs,
  highlightedMotifs,
  glowAll = false,
  shouldReduceMotion = false,
}: {
  motifs: string[];
  highlightedMotifs?: Set<string>;
  glowAll?: boolean;
  shouldReduceMotion?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {motifs.map((motif) => {
        const isGlowing = glowAll || highlightedMotifs?.has(motif);

        if (isGlowing) {
          return (
            <motion.span
              className="jacques-motif-glow rounded-full border border-amber-200/45 bg-amber-300/22 px-2.5 py-1 text-xs font-black text-amber-50"
              key={motif}
              style={{
                animationDelay: shouldReduceMotion ? undefined : getMotifDelay(motif),
              }}
            >
              {motif}
            </motion.span>
          );
        }

        return (
          <span
            className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-xs font-bold text-slate-300"
            key={motif}
          >
            {motif}
          </span>
        );
      })}
    </div>
  );
}

function SelectorCard({
  card,
  onSelect,
  shouldReduceMotion,
}: {
  card: JacquesCard;
  onSelect: () => void;
  shouldReduceMotion: boolean;
}) {
  return (
    <motion.button
      className="min-w-[260px] max-w-[260px] scroll-ml-5 rounded-lg border border-white/10 bg-slate-950/82 p-3 text-left shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition hover:border-emerald-200/45 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-200/60 sm:min-w-[300px] sm:max-w-[300px]"
      data-card-id={card.id}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 }}
      onClick={onSelect}
      type="button"
    >
      <CardPlaceholder card={card} />
      <div className="mt-3 flex flex-wrap gap-2">
        <CategoryBadge category={card.category} />
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-xs font-black text-slate-300">
          {card.yearLabel}
        </span>
      </div>
      <h2 className="mt-3 text-lg font-black leading-snug text-slate-50">{card.displayTitle}</h2>
      <p className="mt-1 text-xs font-bold text-slate-400">{card.locationLabel}</p>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">{card.shortSummary}</p>
      <div className="mt-3">
        <MotifList motifs={card.motifs.slice(0, 3)} />
      </div>
    </motion.button>
  );
}

function SelectedCard({
  card,
  isExpanded,
  onToggle,
  highlightedMotifs,
  shouldReduceMotion,
}: {
  card: JacquesCard;
  isExpanded: boolean;
  onToggle: () => void;
  highlightedMotifs: Set<string>;
  shouldReduceMotion: boolean;
}) {
  const wikiLinks = card.wikiLinks ?? [];

  return (
    <motion.article
      aria-expanded={isExpanded}
      className="mx-auto w-full max-w-3xl cursor-pointer rounded-lg border border-emerald-200/20 bg-slate-950/88 p-4 shadow-[0_0_40px_rgba(16,185,129,0.10)] outline-none transition hover:border-emerald-100/35 hover:bg-slate-950 focus:ring-2 focus:ring-emerald-100/70 md:p-5"
      initial={{ opacity: 0, scale: 0.98, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
      role="button"
      tabIndex={0}
      transition={{ duration: 0.22 }}
    >
      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <CardPlaceholder card={card} />
        <div>
          <div className="flex flex-wrap gap-2">
            <CategoryBadge category={card.category} />
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-xs font-black text-slate-300">
              {card.yearLabel}
            </span>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-xs font-black text-slate-300">
              {card.locationLabel}
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-black leading-tight text-slate-50">
            {card.displayTitle}
          </h2>
          <p className="mt-3 line-clamp-3 max-w-3xl text-sm leading-7 text-slate-300 sm:line-clamp-none">
            {card.shortSummary}
          </p>
          <div className="mt-4">
            <MotifList
              motifs={card.motifs}
              highlightedMotifs={highlightedMotifs}
              shouldReduceMotion={shouldReduceMotion}
            />
          </div>
          <p className="mt-3 text-xs font-black text-emerald-100">
            {isExpanded ? "タップして閉じる" : "タップして詳細を見る"}
          </p>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            className="mt-4 grid gap-3 border-t border-white/10 pt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          >
            <p className="text-sm leading-7 text-slate-300">{card.description}</p>
            {wikiLinks.length > 0 ? (
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <p className="text-xs font-black text-slate-200">関連Wiki</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {wikiLinks.map((link) => (
                    <a
                      className="rounded-full border border-emerald-200/25 bg-emerald-300/10 px-3 py-1.5 text-xs font-black text-emerald-100 transition hover:border-emerald-100 hover:bg-emerald-300/20"
                      href={link.url}
                      key={link.url}
                      onClick={(event) => event.stopPropagation()}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

function ConnectionLines({
  count,
  shouldReduceMotion,
}: {
  count: number;
  shouldReduceMotion: boolean;
}) {
  if (count <= 0) {
    return null;
  }

  const endpoints =
    count === 1
      ? [50]
      : Array.from({ length: count }, (_, index) => 12 + (76 / (count - 1)) * index);

  return (
    <motion.svg
      aria-hidden="true"
      className="mx-auto -my-2 h-[4.5rem] w-full max-w-5xl overflow-visible sm:h-28"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      {endpoints.map((x, index) => (
        <motion.path
          animate={{ pathLength: 1, opacity: 1 }}
          d={count === 1 ? "M 50 0 L 50 100" : `M 50 0 C 50 34, ${x} 42, ${x} 100`}
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          key={`${x}-${index}`}
          stroke={index % 2 === 0 ? "rgba(110, 231, 183, 0.62)" : "rgba(251, 191, 36, 0.58)"}
          strokeLinecap="round"
          strokeWidth="0.85"
          transition={{ duration: shouldReduceMotion ? 0 : 0.42, delay: index * 0.04 }}
        />
      ))}
    </motion.svg>
  );
}

function ConnectionCard({
  group,
  isExpanded,
  onSelect,
  shouldReduceMotion,
}: {
  group: RelatedConnectionGroup;
  isExpanded: boolean;
  onSelect: () => void;
  shouldReduceMotion: boolean;
}) {
  const wikiLinks = group.relatedCard.wikiLinks ?? [];
  const faithContextNotes = Array.from(
    new Set(
      group.connections
        .map((connection) => connection.faithContextNote)
        .filter((note): note is string => Boolean(note)),
    ),
  );

  return (
    <motion.article
      aria-expanded={isExpanded}
      role="button"
      tabIndex={0}
      animate={{
        borderColor: isExpanded ? "rgba(251, 191, 36, 0.5)" : "rgba(255, 255, 255, 0.1)",
        opacity: 1,
        y: 0,
      }}
      className="cursor-pointer rounded-lg border bg-slate-950/86 p-3 text-left shadow-[0_14px_32px_rgba(0,0,0,0.30)] transition hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-200/60 sm:p-4"
      initial={{ opacity: 0, y: 14 }}
      exit={{ opacity: 0, y: 10 }}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <CardPlaceholder card={group.relatedCard} />
      <h3 className="mt-3 text-lg font-black leading-snug text-slate-50">
        {group.relatedCard.displayTitle}
      </h3>
      <div className="mt-1 grid gap-1">
        {group.connections.map((connection) => (
          <p className="text-sm font-black text-amber-100" key={connection.id}>
            {connection.connectionTitle}
          </p>
        ))}
      </div>
      <div className="mt-3">
        <MotifList motifs={group.sharedMotifs} glowAll shouldReduceMotion={shouldReduceMotion} />
      </div>

      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            className="mt-4 grid gap-3 border-t border-white/10 pt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rounded-md border border-white/10 bg-white/5 p-3">
              <p className="text-xs font-black text-slate-200">事件・伝承の概要</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                {group.relatedCard.description}
              </p>
            </div>
            <div className="grid gap-3 rounded-md border border-amber-200/15 bg-amber-300/8 p-3">
              <p className="text-xs font-black text-amber-100">つながりの理由</p>
              {group.connections.map((connection) => (
                <div className="grid gap-2" key={connection.id}>
                  <p className="text-sm font-black leading-7 text-amber-100">
                    {connection.connectionTitle}
                  </p>
                  <p className="text-sm leading-7 text-slate-300">{connection.uiPoint}</p>
                  <p className="text-sm leading-7 text-slate-300">
                    {connection.connectionSummary}
                  </p>
                </div>
              ))}
            </div>
            {faithContextNotes.map((note) => (
              <div className="rounded-md border border-cyan-200/20 bg-cyan-300/10 p-3" key={note}>
                <p className="text-xs font-black text-cyan-100">信仰的文脈への注記</p>
                <p className="mt-1 text-sm leading-6 text-cyan-50">{note}</p>
              </div>
            ))}
            {wikiLinks.length > 0 ? (
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <p className="text-xs font-black text-slate-200">関連Wiki</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {wikiLinks.map((link) => (
                    <a
                      className="rounded-full border border-emerald-200/25 bg-emerald-300/10 px-3 py-1.5 text-xs font-black text-emerald-100 transition hover:border-emerald-100 hover:bg-emerald-300/20"
                      href={link.url}
                      key={link.url}
                      onClick={(event) => event.stopPropagation()}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
            <p className="rounded-md border border-emerald-200/20 bg-emerald-300/10 p-3 text-sm font-black leading-7 text-emerald-50">
              それらは本当に別々の現象なのだろうか？
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

export default function JacquesPage() {
  const selectorRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const explorerRef = useRef<HTMLDivElement>(null);
  const carouselScrollRef = useRef(0);
  const selectedCarouselScrollRef = useRef(0);
  const selectedCarouselCardIdRef = useRef<string | null>(null);
  const shouldRestoreCarouselRef = useRef(false);
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedCardExpanded, setSelectedCardExpanded] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  const activeFilter =
    categoryFilters.find((filter) => filter.id === selectedCategory) ?? categoryFilters[0];
  const filteredCards = activeFilter.categories
    ? jacquesCards.filter((card) => activeFilter.categories?.includes(card.category))
    : jacquesCards;
  const selectedCard = selectedCardId ? findCard(selectedCardId) : undefined;
  const relatedConnectionGroups = selectedCard ? getRelatedConnectionGroups(selectedCard.id) : [];
  const highlightedMotifs = new Set(
    relatedConnectionGroups.flatMap((group) => group.sharedMotifs),
  );

  function handleSelectCard(cardId: string) {
    if (carouselRef.current) {
      carouselScrollRef.current = carouselRef.current.scrollLeft;
    }
    selectedCarouselScrollRef.current = carouselScrollRef.current;
    selectedCarouselCardIdRef.current = cardId;
    setSelectedCardId(cardId);
    setSelectedCardExpanded(false);
    setSelectedConnectionId(null);
    window.setTimeout(() => {
      explorerRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
    }, 80);
  }

  function handleChooseAnother() {
    const savedScrollLeft = selectedCarouselScrollRef.current;
    const restoreCarouselScroll = () => {
      if (carouselRef.current) {
        carouselRef.current.scrollLeft = savedScrollLeft;
        const selectedCardButton = selectedCarouselCardIdRef.current
          ? carouselRef.current.querySelector<HTMLElement>(
              `[data-card-id="${selectedCarouselCardIdRef.current}"]`,
            )
          : null;

        selectedCardButton?.scrollIntoView({
          block: "nearest",
          inline: "center",
        });
      }
    };

    shouldRestoreCarouselRef.current = true;
    setSelectedCardId(null);
    setSelectedCardExpanded(false);
    setSelectedConnectionId(null);
    window.setTimeout(() => {
      selectorRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
      restoreCarouselScroll();
      window.setTimeout(restoreCarouselScroll, shouldReduceMotion ? 0 : 620);
    }, shouldReduceMotion ? 40 : 280);
  }

  function handleCarouselRef(node: HTMLDivElement | null) {
    carouselRef.current = node;

    if (node && shouldRestoreCarouselRef.current) {
      const savedScrollLeft = selectedCarouselScrollRef.current;

      node.scrollLeft = savedScrollLeft;
      window.requestAnimationFrame(() => {
        node.scrollLeft = savedScrollLeft;
      });
      shouldRestoreCarouselRef.current = false;
    }
  }

  function handleSelectConnection(connectionId: string) {
    setSelectedConnectionId((current) => (current === connectionId ? null : connectionId));
  }

  function handleCarouselScroll(direction: "prev" | "next") {
    const scrollAmount = direction === "next" ? 340 : -340;

    carouselRef.current?.scrollBy({
      left: scrollAmount,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  }

  return (
    <main className="min-h-screen bg-[#050706] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.16),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(251,191,36,0.11),transparent_26%),linear-gradient(180deg,#07100d,#050706_44%,#030404)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-7 sm:px-7 lg:px-8">
        <header className="border-b border-white/10 pb-6">
          <p className="text-sm font-black text-emerald-200">Jacques v0.5</p>
          <h1 className="mt-2 whitespace-nowrap !text-[clamp(1.18rem,5vw,3.75rem)] font-black !leading-tight text-slate-50">
            異なる怪異の同じ構造を可視化する
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
            UFO、妖精、神隠し、宗教的幻視。それらは本当に別々の現象なのだろうか？
          </p>
        </header>

        <AnimatePresence mode="wait">
          {!selectedCard ? (
            <motion.section
              aria-label="カード選択"
              className="grid min-w-0 gap-4"
              exit={{
                opacity: 0,
                scale: shouldReduceMotion ? 1 : 0.985,
                y: shouldReduceMotion ? 0 : -12,
              }}
              key="selector"
              ref={selectorRef}
              transition={{ duration: shouldReduceMotion ? 0 : 0.22 }}
            >
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categoryFilters.map((filter) => {
                  const isActive = filter.id === selectedCategory;

                  return (
                    <button
                      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-amber-200/60 ${
                        isActive
                          ? "bg-emerald-200 text-slate-950 shadow-[0_0_24px_rgba(110,231,183,0.24)]"
                          : "border border-white/10 bg-white/6 text-slate-300 hover:border-emerald-200/30 hover:text-slate-50"
                      }`}
                      key={filter.id}
                      onClick={() => setSelectedCategory(filter.id)}
                      type="button"
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              <div className="relative min-w-0">
                <button
                  aria-label="前のカードを見る"
                  className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-100/35 bg-slate-950/90 text-xl font-black text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.18)] transition hover:border-emerald-100 hover:bg-emerald-300 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-100/80 sm:flex"
                  onClick={() => handleCarouselScroll("prev")}
                  type="button"
                >
                  ←
                </button>
                <div
                  className="-mx-5 flex max-w-full gap-3 overflow-x-auto px-5 pb-4 sm:-mx-7 sm:px-16"
                  onScroll={(event) => {
                    carouselScrollRef.current = event.currentTarget.scrollLeft;
                  }}
                  ref={handleCarouselRef}
                >
                  {filteredCards.map((card) => (
                    <SelectorCard
                      card={card}
                      key={card.id}
                      onSelect={() => handleSelectCard(card.id)}
                      shouldReduceMotion={shouldReduceMotion}
                    />
                  ))}
                </div>
                <button
                  aria-label="次のカードを見る"
                  className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-100/35 bg-slate-950/90 text-xl font-black text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.18)] transition hover:border-emerald-100 hover:bg-emerald-300 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-100/80 sm:flex"
                  onClick={() => handleCarouselScroll("next")}
                  type="button"
                >
                  →
                </button>
              </div>
            </motion.section>
          ) : (
            <motion.section
              className="grid gap-2"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
              key="explorer"
              ref={explorerRef}
              transition={{ duration: shouldReduceMotion ? 0 : 0.22 }}
            >
              <div className="mb-3 flex justify-end">
                <button
                  className="rounded-full border border-emerald-100/70 bg-emerald-300 px-5 py-2.5 text-sm font-black text-slate-950 shadow-[0_0_26px_rgba(110,231,183,0.28)] transition hover:border-emerald-50 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100/80"
                  onClick={handleChooseAnother}
                  type="button"
                >
                  ← カードを選び直す
                </button>
              </div>

              <SelectedCard
                card={selectedCard}
                highlightedMotifs={highlightedMotifs}
                isExpanded={selectedCardExpanded}
                onToggle={() => setSelectedCardExpanded((current) => !current)}
                shouldReduceMotion={shouldReduceMotion}
              />
              <ConnectionLines
                count={relatedConnectionGroups.length}
                shouldReduceMotion={shouldReduceMotion}
              />

              {relatedConnectionGroups.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/15 bg-slate-950/80 p-5 text-sm text-slate-300">
                  このカードには、まだ表示対象の採用接続がありません。
                </div>
              ) : (
                <div
                  className={
                    relatedConnectionGroups.length === 1
                      ? "mx-auto grid w-full max-w-[300px] gap-2 sm:max-w-[320px] sm:gap-3"
                      : "grid gap-2 sm:gap-3 md:grid-cols-2 xl:grid-cols-3"
                  }
                >
                  <AnimatePresence>
                    {relatedConnectionGroups.map((group) => (
                      <ConnectionCard
                        group={group}
                        isExpanded={selectedConnectionId === group.id}
                        key={group.id}
                        onSelect={() => handleSelectConnection(group.id)}
                        shouldReduceMotion={shouldReduceMotion}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
              <div className="mt-5 flex justify-center">
                <button
                  className="rounded-full border border-emerald-100/70 bg-emerald-300 px-5 py-2.5 text-sm font-black text-slate-950 shadow-[0_0_26px_rgba(110,231,183,0.28)] transition hover:border-emerald-50 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100/80"
                  onClick={handleChooseAnother}
                  type="button"
                >
                  ← カードを選び直す
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <footer className="border-t border-white/10 pt-7 text-center">
          <a
            className="text-sm font-black tracking-[0.28em] text-emerald-100 transition hover:text-emerald-200"
            href="/"
          >
            UFO Lab Tokyo
          </a>
          <p className="mt-2 text-xs font-bold text-slate-600">© 2026 UFO Lab Tokyo</p>
        </footer>
      </div>
    </main>
  );
}
