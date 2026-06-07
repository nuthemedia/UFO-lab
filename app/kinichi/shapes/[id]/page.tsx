import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  cautionText,
  getRelatedCraft,
  getRelatedNuforc,
  getShapeById,
  productLinks,
  shapeEntries,
} from "@/data/kinichi/catalog";
import { siteConfig } from "@/lib/site";
import { KinichiViewer, ShapeSilhouette } from "../../KinichiViewer";
import styles from "../../kinichi.module.css";
import { kinichiShareImage } from "../../metadata";

type ShapePageProps = {
  params: Promise<{ id: string }> | { id: string };
  searchParams?: Promise<{ from?: string | string[] }> | { from?: string | string[] };
};

type KinichiFrom = "shapes" | "craft" | "nuforc";

function normalizeFrom(value: string | string[] | undefined): KinichiFrom | undefined {
  const from = Array.isArray(value) ? value[0] : value;
  return from === "shapes" || from === "craft" || from === "nuforc" ? from : undefined;
}

function getBackLink(from: KinichiFrom | undefined) {
  if (from === "shapes") {
    return { href: "/kinichi#shapes", label: "UFO形体カードへ戻る" };
  }
  if (from === "craft") {
    return { href: "/kinichi#craft", label: "有名UFOモデルへ戻る" };
  }
  if (from === "nuforc") {
    return { href: "/kinichi#nuforc", label: "目撃データ分類へ戻る" };
  }
  return { href: "/kinichi", label: "Kinichiトップへ" };
}

function withFrom(href: string, from: KinichiFrom | undefined) {
  return from ? `${href}?from=${from}` : href;
}

export function generateStaticParams() {
  return shapeEntries.map((shape) => ({ id: shape.id }));
}

export async function generateMetadata({ params }: ShapePageProps): Promise<Metadata> {
  const { id } = await Promise.resolve(params);
  const shape = getShapeById(id);

  if (!shape) {
    return {
      title: "形体が見つかりません | Kinichi",
    };
  }

  const title = `${shape.nameJa} | Kinichi UFO形体事典`;
  const description = `${shape.nameJa}（${shape.nameEn}）の特徴、代表事件、誤認候補、関連NUFORC分類を見る。`;

  return {
    title,
    description,
    alternates: {
      canonical: `/kinichi/shapes/${shape.id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: `/kinichi/shapes/${shape.id}`,
      siteName: siteConfig.shortName,
      locale: "ja_JP",
      images: [
        {
          url: kinichiShareImage,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [kinichiShareImage],
    },
    other: {
      "twitter:image:alt": title,
    },
  };
}

export default async function KinichiShapePage({ params, searchParams }: ShapePageProps) {
  const { id } = await Promise.resolve(params);
  const resolvedSearchParams = searchParams ? await Promise.resolve(searchParams) : {};
  const from = normalizeFrom(resolvedSearchParams.from);
  const backLink = getBackLink(from);
  const shape = getShapeById(id);

  if (!shape) {
    notFound();
  }

  const relatedCraft = getRelatedCraft(shape.id);
  const relatedNuforc = getRelatedNuforc(shape.id);
  const viewerTarget = {
    id: shape.id,
    label: shape.nameJa,
    modelKind: "procedural" as const,
    proceduralType: shape.proceduralType,
  };

  return (
    <main className={styles.page}>
      <section className={styles.detailPage}>
        <div className={styles.detailHero}>
          <KinichiViewer fallbackType={shape.proceduralType} target={viewerTarget} />
          <div className={styles.detailPanel}>
            <div className={styles.detailLinkRow}>
              <Link className={styles.backLink} href="/kinichi">
                Kinichiトップへ
              </Link>
              {backLink.href !== "/kinichi" ? (
                <Link className={styles.backLink} href={backLink.href}>
                  {backLink.label}
                </Link>
              ) : null}
            </div>
            <p className={styles.sectionKicker}>形体詳細</p>
            <h1>
              {shape.nameJa}
              <span>{shape.nameEn}</span>
            </h1>
            <p>{shape.shortDescription}</p>
            <div className={styles.tags}>
              {shape.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <section className={styles.detailGrid} aria-label={`${shape.nameJa}の詳細`}>
          <article>
            <h2>視覚的特徴</h2>
            <ul>
              {shape.features.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <h2>代表事件</h2>
            <ul>
              {shape.representativeCases.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <h2>よくある誤認候補</h2>
            <ul>
              {shape.misidentifications.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <h2>NUFORC分類</h2>
            <ul>
              {(relatedNuforc.length ? relatedNuforc.map((item) => `${item.nameJa}（${item.name}） / ${item.sightingCount.toLocaleString()}件`) : shape.nuforcShapeIds).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        {relatedCraft.length ? (
          <section className={styles.section} aria-label="関連する有名UFOモデル">
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionKicker}>関連モデル</p>
                <h2>この形体に近い有名UFOモデル</h2>
              </div>
            </div>
            <div className={styles.craftGallery}>
              {relatedCraft.map((craft) => (
                <Link className={styles.craftCard} href={withFrom(`/kinichi/craft/${craft.id}`, from)} key={craft.id}>
                  <ShapeSilhouette className={styles.craftSilhouette} type={shape.proceduralType} />
                  <span>{craft.year}</span>
                  <strong>{craft.nameJa}</strong>
                  <em>{craft.relatedPerson}</em>
                  <p>{craft.shortDescription}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className={styles.relatedBand} aria-label="関連するUFO Lab Tokyoアプリ">
          <div>
            <p className={styles.sectionKicker}>次に調べる</p>
            <h2>関連するUFO Lab Tokyoアプリ</h2>
          </div>
          <div className={styles.productLinks}>
            {productLinks.map((product) => (
              <Link href={product.href} key={product.href}>
                <strong>{product.label}</strong>
                <span>{product.body}</span>
              </Link>
            ))}
          </div>
        </section>

        <aside className={styles.disclaimer}>{cautionText}</aside>
      </section>
    </main>
  );
}
