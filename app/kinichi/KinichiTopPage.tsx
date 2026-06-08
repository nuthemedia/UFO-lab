"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { famousCraft, filters, nuforcShapes, shapeEntries } from "@/data/kinichi/catalog";
import type { ProceduralType, ViewerTarget } from "@/data/kinichi/catalog";
import { KinichiViewer, ShapeSilhouette, preloadKinichiGlbModel } from "./KinichiViewer";
import styles from "./kinichi.module.css";

type KinichiTab = "shapes" | "craft" | "nuforc";

type FeaturedModel = {
  id: string;
  label: string;
  subLabel: string;
  description: string;
  href: string;
  fallbackType: ProceduralType | string;
  target: ViewerTarget;
};

type ModelCarouselItem = {
  id: string;
  label: string;
  href: string;
  fallbackType: ProceduralType | string;
  target: ViewerTarget;
  preloadPath?: string;
};

const tabs: Array<{ id: KinichiTab; label: string; count: number }> = [
  { id: "shapes", label: "UFO形体", count: shapeEntries.length },
  { id: "craft", label: "有名モデル", count: famousCraft.length },
  { id: "nuforc", label: "目撃データ分類", count: nuforcShapes.length },
];

function matchesFilter(tags: string[], selectedFilter: string) {
  return selectedFilter === "すべて" || tags.includes(selectedFilter);
}

function getFeaturedModels(): FeaturedModel[] {
  const shapeModels = shapeEntries.map((shape) => ({
    id: `shape-${shape.id}`,
    label: shape.nameJa,
    subLabel: `UFO形体 / ${shape.nameEn}`,
    description: shape.shortDescription,
    href: `/kinichi/shapes/${shape.id}?from=shapes`,
    fallbackType: shape.proceduralType,
    target: {
      id: shape.id,
      label: shape.nameJa,
      modelKind: "procedural" as const,
      proceduralType: shape.proceduralType,
    },
  }));

  const craftModels = famousCraft.map((craft) => {
    const relatedShape = shapeEntries.find((shape) => shape.id === craft.shapeId);
    const proceduralType = relatedShape?.proceduralType ?? "disk";
    return {
      id: `craft-${craft.id}`,
      label: craft.nameJa,
      subLabel: "モデル例 / 有名UFOモデル",
      description: craft.shortDescription,
      href: `/kinichi/craft/${craft.id}?from=craft`,
      fallbackType: proceduralType,
      target: {
        id: craft.id,
        label: craft.nameJa,
        modelKind: "procedural" as const,
        proceduralType,
      },
    };
  });

  return [...shapeModels, ...craftModels];
}

function getCarouselItems(activeTab: KinichiTab): ModelCarouselItem[] {
  if (activeTab === "craft") {
    return famousCraft.map((craft) => {
      const relatedShape = shapeEntries.find((shape) => shape.id === craft.shapeId);
      const proceduralType = relatedShape?.proceduralType ?? "disk";

      return {
        id: craft.id,
        label: craft.nameJa,
        href: `/kinichi/craft/${craft.id}?from=craft`,
        fallbackType: proceduralType,
        preloadPath: craft.id === "tic-tac-craft" ? undefined : craft.modelPath,
        target: {
          id: craft.id,
          label: craft.nameJa,
          modelKind: "procedural" as const,
          proceduralType,
        },
      };
    });
  }

  if (activeTab === "nuforc") {
    return nuforcShapes.flatMap((item) => {
      const relatedShape = shapeEntries.find((shape) => item.relatedShapeIds.includes(shape.id));
      if (!relatedShape) {
        return [];
      }

      return [
        {
          id: item.id,
          label: item.nameJa,
          href: `/kinichi/shapes/${relatedShape.id}?from=nuforc`,
          fallbackType: relatedShape.proceduralType,
          target: {
            id: relatedShape.id,
            label: item.nameJa,
            modelKind: "procedural" as const,
            proceduralType: relatedShape.proceduralType,
          },
        },
      ];
    });
  }

  return shapeEntries.map((shape) => ({
    id: shape.id,
    label: shape.nameJa,
    href: `/kinichi/shapes/${shape.id}?from=shapes`,
    fallbackType: shape.proceduralType,
    target: {
      id: shape.id,
      label: shape.nameJa,
      modelKind: "procedural" as const,
      proceduralType: shape.proceduralType,
    },
  }));
}

function KinichiCardPreview({ fallbackType, target }: { fallbackType: ProceduralType | string; target: ViewerTarget }) {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const node = previewRef.current;
    if (!node) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: "360px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={previewRef}>
      {shouldRender ? (
        <KinichiViewer fallbackType={fallbackType} preview target={target} />
      ) : (
        <div className={styles.cardPreviewPlaceholder} aria-hidden="true">
          <ShapeSilhouette className={styles.cardPreviewSilhouette} type={fallbackType} />
        </div>
      )}
    </div>
  );
}

export function KinichiTopPage() {
  const featuredModels = useMemo(() => getFeaturedModels(), []);
  const initialFeaturedModel = featuredModels.find((model) => model.id === "craft-tic-tac-craft") ?? featuredModels[0];
  const [activeTab, setActiveTab] = useState<KinichiTab>("shapes");
  const [selectedFilter, setSelectedFilter] = useState("すべて");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const syncTabFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "shapes" || hash === "craft" || hash === "nuforc") {
        setActiveTab(hash);
      }
    };

    syncTabFromHash();
    window.addEventListener("hashchange", syncTabFromHash);
    return () => window.removeEventListener("hashchange", syncTabFromHash);
  }, []);

  const filteredShapes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return shapeEntries.filter((shape) => {
      const searchable = [
        shape.nameJa,
        shape.nameEn,
        shape.shortDescription,
        ...shape.representativeCases,
        ...shape.nuforcShapeIds,
        ...shape.tags,
      ]
        .join(" ")
        .toLowerCase();
      return matchesFilter(shape.tags, selectedFilter) && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [query, selectedFilter]);

  const carouselItems = useMemo(() => getCarouselItems(activeTab), [activeTab]);

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-label="Kinichi">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>UFO Lab Tokyo / 形体事典</p>
          <h1>Kinichi</h1>
          <div className={styles.heroTitles}>
            <span>UFO形体事典</span>
            <span>UFO Shape Atlas</span>
          </div>
          <p className={styles.heroLead}>目撃された“かたち”から、事件と時代をたどる。</p>
          <p className={styles.heroBody}>
            円盤、球体、葉巻型、三角形、Tic Tac。報告に現れる形体を３Dモデルと線画シルエットで確認。代表事件や目撃データ分類も掲載
          </p>
          <nav className={styles.topNav} aria-label="Kinichiの主要セクション">
            <a aria-label="UFO形体カードへ移動" href="#shapes" onClick={() => setActiveTab("shapes")}>
              代表形体
            </a>
            <a aria-label="有名モデルへ移動" href="#craft" onClick={() => setActiveTab("craft")}>
              有名モデル
            </a>
            <a aria-label="目撃データ分類へ移動" href="#nuforc" onClick={() => setActiveTab("nuforc")}>
              目撃データ分類
            </a>
          </nav>
        </div>

        <Link className={styles.featuredModelCard} href={initialFeaturedModel.href}>
          <KinichiViewer fallbackType={initialFeaturedModel.fallbackType} preview target={initialFeaturedModel.target} />
          <div className={styles.featuredModelCopy}>
            <span>{initialFeaturedModel.subLabel}</span>
            <strong>{initialFeaturedModel.label}</strong>
            <p>{initialFeaturedModel.description}</p>
            <em>詳細ページを見る</em>
          </div>
        </Link>
      </section>

      <section className={styles.section} id="shapes" aria-label="Kinichi一覧">
        <span className={styles.anchorTarget} id="craft" />
        <span className={styles.anchorTarget} id="nuforc" />
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionKicker}>一覧を切り替える</p>
            <h2>{activeTab === "shapes" ? "UFO形体カード" : activeTab === "craft" ? "有名UFOモデル" : "目撃データ分類"}</h2>
          </div>
          {activeTab === "shapes" ? (
            <div className={styles.searchPanel}>
              <input
                aria-label="形体検索"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="形体名・事件名・分類で検索"
                type="search"
                value={query}
              />
            </div>
          ) : null}
        </div>

        <div className={styles.tabs} aria-label="Kinichi一覧タブ" role="tablist">
          {tabs.map((tab) => (
            <button
              aria-selected={activeTab === tab.id}
              className={activeTab === tab.id ? styles.activeTab : undefined}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
              <span>{tab.count}</span>
            </button>
          ))}
        </div>

        <div className={styles.modelCarousel} aria-label={`${tabs.find((tab) => tab.id === activeTab)?.label ?? "モデル"}のプレビュー`}>
          {carouselItems.map((item) => (
            <Link
              aria-label={`${item.label}の詳細を見る`}
              className={styles.modelCarouselItem}
              href={item.href}
              key={item.id}
              onFocus={() => {
                if (item.preloadPath) {
                  preloadKinichiGlbModel(item.preloadPath);
                }
              }}
              onPointerEnter={() => {
                if (item.preloadPath) {
                  preloadKinichiGlbModel(item.preloadPath);
                }
              }}
            >
              <div className={styles.cardPreviewPlaceholder} aria-hidden="true">
                <ShapeSilhouette className={styles.cardPreviewSilhouette} type={item.fallbackType} />
              </div>
            </Link>
          ))}
        </div>

        {activeTab === "shapes" ? (
          <>
            <div className={styles.filters} aria-label="形体フィルター">
              {filters.map((filter) => (
                <button
                  className={selectedFilter === filter ? styles.activeFilter : undefined}
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  type="button"
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className={styles.shapeGrid} role="tabpanel">
              {filteredShapes.map((shape) => (
                <Link className={styles.shapeCard} href={`/kinichi/shapes/${shape.id}?from=shapes`} key={shape.id}>
                  <KinichiCardPreview
                    fallbackType={shape.proceduralType}
                    target={{
                      id: shape.id,
                      label: shape.nameJa,
                      modelKind: "procedural",
                      proceduralType: shape.proceduralType,
                    }}
                  />
                  <div className={styles.cardHeader}>
                    <span>{shape.nameEn}</span>
                    <strong>{shape.nameJa}</strong>
                  </div>
                  <p>{shape.shortDescription}</p>
                  <span className={styles.cardAction}>詳細ページを見る</span>
                  <div className={styles.cardMeta}>
                    <span>3D表示</span>
                    <span>{shape.representativeCases.length}件の代表事件</span>
                    <span>{shape.nuforcShapeIds.join(" / ")}</span>
                  </div>
                  <div className={styles.tags}>
                    {shape.tags.slice(0, 3).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : null}

        {activeTab === "craft" ? (
          <div className={styles.craftGallery} role="tabpanel">
            {famousCraft.map((craft) => {
              const relatedShape = shapeEntries.find((shape) => shape.id === craft.shapeId);
              const preloadPath = craft.id === "tic-tac-craft" ? undefined : craft.modelPath;
              return (
                <Link
                  className={styles.craftCard}
                  href={`/kinichi/craft/${craft.id}?from=craft`}
                  key={craft.id}
                  onFocus={() => {
                    if (preloadPath) {
                      preloadKinichiGlbModel(preloadPath);
                    }
                  }}
                  onPointerEnter={() => {
                    if (preloadPath) {
                      preloadKinichiGlbModel(preloadPath);
                    }
                  }}
                >
                  <KinichiCardPreview
                    fallbackType={relatedShape?.proceduralType ?? "disk"}
                    target={{
                      id: craft.id,
                      label: craft.nameJa,
                      modelKind: "procedural",
                      proceduralType: relatedShape?.proceduralType ?? "disk",
                    }}
                  />
                  <span>{craft.year}</span>
                  <strong>{craft.nameJa}</strong>
                  <em>{craft.relatedPerson}</em>
                  <p>{craft.shortDescription}</p>
                  <span className={styles.cardAction}>詳細ページを見る</span>
                </Link>
              );
            })}
          </div>
        ) : null}

        {activeTab === "nuforc" ? (
          <div className={styles.nuforcGrid} role="tabpanel">
            {nuforcShapes.map((item) => {
              const relatedShape = shapeEntries.find((shape) => item.relatedShapeIds.includes(shape.id));
              return (
                <article className={styles.nuforcRow} key={item.id}>
                  <ShapeSilhouette className={styles.nuforcSilhouette} type={relatedShape?.proceduralType ?? item.id} />
                  <div className={styles.nuforcNameBlock}>
                    <strong>{item.nameJa}</strong>
                    <span>{item.name}</span>
                  </div>
                  <span className={styles.nuforcSource}>{item.sourceLabel}</span>
                  <p>{item.sightingCount.toLocaleString()}件</p>
                  {relatedShape ? <Link href={`/kinichi/shapes/${relatedShape.id}?from=nuforc`}>{relatedShape.nameJa}</Link> : <span>関連未設定</span>}
                  <small>更新日 {item.lastUpdated}</small>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className={styles.sectionSummary} aria-label="Kinichiの構成">
        <a href="#shapes" onClick={() => setActiveTab("shapes")}>
          <strong>UFO形体</strong>
          <span>{shapeEntries.length}種類</span>
          <p>形として語られる代表的なUFO分類を3Dと線画で確認します。</p>
        </a>
        <a href="#craft" onClick={() => setActiveTab("craft")}>
          <strong>有名モデル</strong>
          <span>{famousCraft.length}件</span>
          <p>Tic Tacを含む、事件や人物に結びついた個別モデルを見ます。</p>
        </a>
        <a href="#nuforc" onClick={() => setActiveTab("nuforc")}>
          <strong>目撃データ分類</strong>
          <span>{nuforcShapes.length}分類</span>
          <p>NUFORC上の分類名と目撃数を、対応する形体へつなぎます。</p>
        </a>
      </section>

      <aside className={styles.disclaimer}>
        この分類は目撃証言・報告データ上の便宜的な分類であり、同じ形状が同一の物体や同一現象を意味するものではありません。掲載する3Dモデルは概念モデルです。
      </aside>

      <footer className={styles.brandFooter}>
        <a href="https://ufolab.tokyo">UFO Lab Tokyo</a>
        <small>© 2026 UFO Lab Tokyo</small>
        <a href="https://x.com/UFOLabTokyo">Xで更新を見る</a>
      </footer>
    </main>
  );
}
