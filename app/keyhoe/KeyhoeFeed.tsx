"use client";

import { useEffect, useRef, useState } from "react";

type KeyhoeCategory = "all" | "official" | "news" | "buzz";

type KeyhoeItem = {
  id: string;
  title: string;
  headlineJa?: string;
  originalTitle?: string;
  summaryJa: string;
  detailJa?: string;
  sourceName: string;
  category: Exclude<KeyhoeCategory, "all">;
  categoryLabel: string;
  importanceScore: number;
  importanceLabel: "重要" | "通常" | "要注意";
  whyItMattersJa: string;
  reliabilityLabel: string;
  cautionNote: string;
  originalUrl: string;
  publishedAt: string;
  freshnessLabel?: "今日" | "最近の更新" | "最近の公式更新" | "公式資料" | "最近の話題";
  collectionNote?: string;
  aiScore?: number;
  aiReason?: string;
  tags?: string[];
  selectionMode?: "ai" | "fallback";
};

export type KeyhoeFeedProps = {
  generatedAt: string;
  summary: string[];
  categories: Array<{ id: KeyhoeCategory; label: string }>;
  items: KeyhoeItem[];
};

function shareUrl(text: string, url: string) {
  return `https://twitter.com/intent/tweet?${new URLSearchParams({ text, url })}`;
}

function importanceClass(label: KeyhoeItem["importanceLabel"]) {
  if (label === "重要") {
    return "is-high";
  }

  if (label === "要注意") {
    return "is-watch";
  }

  return "is-normal";
}

function emptyCategoryMessage(category: KeyhoeCategory) {
  if (category === "official") {
    return "公式ソースで新規カード化できる更新はありません。AARO / NASA / war.gov は更新監視対象として確認しています。";
  }

  if (category === "buzz") {
    return "Reddit取得は未接続です。ネットの話題は公式API接続後に表示します。";
  }

  return "このカテゴリで表示できるニュースはありません。";
}

export function KeyhoeFeed({ summary, categories, items, generatedAt }: KeyhoeFeedProps) {
  const feedRef = useRef<HTMLDivElement | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<KeyhoeCategory>("all");
  const initialVisibleCount = 12;
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const generatedLabel = formatter.format(new Date(generatedAt));
  const categoryItems =
    activeCategory === "all" ? items : items.filter((item) => item.category === activeCategory);
  const activeCategoryLabel = categories.find((category) => category.id === activeCategory)?.label ?? "すべて";
  const isExpanded = expandedCategories[activeCategory];
  const visibleItems = isExpanded ? categoryItems : categoryItems.slice(0, initialVisibleCount);
  const hasMoreItems = categoryItems.length > visibleItems.length;

  useEffect(() => {
    const root = feedRef.current;
    if (!root) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const summaryItems = Array.from(root.querySelectorAll<HTMLElement>("[data-keyhoe-summary-item]"));
    const feedHeads = Array.from(root.querySelectorAll<HTMLElement>("[data-keyhoe-feed-head]"));
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-keyhoe-card]"));

    const visibleClass = "is-active";

    summaryItems.forEach((item) => {
      if (item.getBoundingClientRect().top < window.innerHeight * 0.82) {
        item.classList.add(visibleClass);
      }
    });

    feedHeads.forEach((head) => {
      if (head.getBoundingClientRect().top < window.innerHeight * 0.9) {
        head.classList.add(visibleClass);
      }
    });

    const summaryObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle(visibleClass, entry.isIntersecting);
        });
      },
      {
        threshold: 0.45,
      },
    );

    const headObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle(visibleClass, entry.isIntersecting);
        });
      },
      {
        threshold: 0.4,
      },
    );

    let activeCard: HTMLElement | null = null;
    let frameId = 0;

    const updateActiveCard = () => {
      const visibleCards = cards
        .map((card) => {
          const rect = card.getBoundingClientRect();
          const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
          const cardCenter = rect.top + rect.height / 2;
          const viewportCenter = window.innerHeight / 2;

          return {
            card,
            distance: Math.abs(cardCenter - viewportCenter),
            ratio: visibleHeight / rect.height,
          };
        })
        .filter((candidate) => candidate.ratio > 0)
        .sort((left, right) => left.distance - right.distance);

      const nextActive = visibleCards[0]?.card ?? null;

      if (!nextActive || nextActive === activeCard) {
        return;
      }

      activeCard?.classList.remove(visibleClass);
      nextActive.classList.add(visibleClass);
      activeCard = nextActive;
    };

    const scheduleActiveCardUpdate = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateActiveCard();
      });
    };

    const cardObserver = new IntersectionObserver(
      () => {
        scheduleActiveCardUpdate();
      },
      {
        rootMargin: "-18% 0px -42% 0px",
        threshold: [0.38, 0.48, 0.58, 0.68],
      },
    );

    summaryItems.forEach((item) => summaryObserver.observe(item));
    feedHeads.forEach((head) => headObserver.observe(head));
    cards.forEach((card) => cardObserver.observe(card));

    window.addEventListener("scroll", scheduleActiveCardUpdate, { passive: true });
    window.addEventListener("resize", scheduleActiveCardUpdate);
    updateActiveCard();

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", scheduleActiveCardUpdate);
      window.removeEventListener("resize", scheduleActiveCardUpdate);
      summaryObserver.disconnect();
      headObserver.disconnect();
      cardObserver.disconnect();
    };
  }, [activeCategory, expandedCategories]);

  return (
    <div className="keyhoe-feed-root" ref={feedRef}>
      <section className="keyhoe-summary" aria-labelledby="keyhoe-summary-heading">
        <p className="keyhoe-section-label" id="keyhoe-summary-heading">
          今日の3行サマリー
        </p>
        <ol>
          {summary.map((line) => (
            <li data-keyhoe-summary-item key={line}>
              {line}
            </li>
          ))}
        </ol>
      </section>

      <nav className="keyhoe-tabs" aria-label="カテゴリ切り替え">
        {categories.map((category) => (
          <button
            aria-current={activeCategory === category.id ? "true" : undefined}
            className={activeCategory === category.id ? "is-active" : undefined}
            key={category.id}
            type="button"
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </nav>

      {items.length === 0 ? (
        <section className="keyhoe-empty" aria-label="取得結果なし">
          <h2>現在表示できるニュースはありません</h2>
          <p>
            取得対象のRSSやRedditが一時的に応答していない可能性があります。時間をおいて再取得してください。
          </p>
        </section>
      ) : null}

      <section className="keyhoe-feed" aria-labelledby="keyhoe-feed-heading">
        <div className="keyhoe-feed-head" data-keyhoe-feed-head>
          <h2 id="keyhoe-feed-heading">{activeCategoryLabel}</h2>
          <span>
            {categoryItems.length}件
            <em className="keyhoe-feed-updated">・{generatedLabel} 更新</em>
          </span>
        </div>

        <div className="keyhoe-card-list">
          {categoryItems.length ? (
            <>
              {visibleItems.map((item) => {
                const originalTitle = item.originalTitle && item.originalTitle !== item.title ? item.originalTitle : "";
                const itemShareText = `Keyhoe: ${item.title}\n${item.summaryJa}`;
                const isDetailExpanded = expandedDetails[item.id];

                return (
                  <article className="keyhoe-card" data-keyhoe-card key={`${activeCategory}-${item.id}`}>
                    <div className="keyhoe-card-top">
                      <span className={`keyhoe-importance ${importanceClass(item.importanceLabel)}`}>
                        {item.importanceLabel}
                      </span>
                      <span>{item.categoryLabel}</span>
                      {item.freshnessLabel ? <span>{item.freshnessLabel}</span> : null}
                      {typeof item.aiScore === "number" ? <span>AI {item.aiScore.toFixed(1)}</span> : null}
                    </div>
                    <h3>{item.headlineJa || item.title}</h3>
                    {originalTitle ? <p className="keyhoe-original-title">原題：{originalTitle}</p> : null}
                    <p className="keyhoe-card-summary">{item.summaryJa}</p>
                    {item.detailJa ? (
                      <div className="keyhoe-card-detail-block">
                        {isDetailExpanded ? <p className="keyhoe-card-detail">{item.detailJa}</p> : null}
                        <button
                          aria-expanded={isDetailExpanded ? "true" : "false"}
                          className="keyhoe-detail-button"
                          type="button"
                          onClick={() =>
                            setExpandedDetails((current) => ({
                              ...current,
                              [item.id]: !current[item.id],
                            }))
                          }
                        >
                          {isDetailExpanded ? "閉じる" : "要約"}
                        </button>
                      </div>
                    ) : null}
                    <dl className="keyhoe-card-meta">
                      <div>
                        <dt>なぜ重要か</dt>
                        <dd>{item.whyItMattersJa}</dd>
                      </div>
                      <div>
                        <dt>出典</dt>
                        <dd>{item.sourceName}</dd>
                      </div>
                      <div>
                        <dt>信頼度</dt>
                        <dd>{item.reliabilityLabel}</dd>
                      </div>
                    </dl>
                    {item.cautionNote ? <p className="keyhoe-caution">{item.cautionNote}</p> : null}
                    {item.collectionNote ? <p className="keyhoe-collection-note">{item.collectionNote}</p> : null}
                    <div className="keyhoe-card-actions">
                      <a href={item.originalUrl} target="_blank" rel="noreferrer noopener">
                        元記事を読む
                      </a>
                      <a
                        href={shareUrl(itemShareText, item.originalUrl)}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        Xでシェア
                      </a>
                    </div>
                  </article>
                );
              })}
              {hasMoreItems ? (
                <button
                  className="keyhoe-more-button"
                  type="button"
                  onClick={() =>
                    setExpandedCategories((current) => ({
                      ...current,
                      [activeCategory]: true,
                    }))
                  }
                >
                  もっと見る
                </button>
              ) : null}
            </>
          ) : (
            <div className="keyhoe-category-empty">{emptyCategoryMessage(activeCategory)}</div>
          )}
        </div>
      </section>
    </div>
  );
}
