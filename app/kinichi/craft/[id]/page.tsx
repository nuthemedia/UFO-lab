import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cautionText, famousCraft, getCraftById, getShapeById, productLinks } from "@/data/kinichi/catalog";
import { siteConfig } from "@/lib/site";
import { KinichiViewer, ShapeSilhouette } from "../../KinichiViewer";
import styles from "../../kinichi.module.css";

const kinichiOgImage = "/kinichi/opengraph-image";

type CraftPageProps = {
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
  return famousCraft.map((craft) => ({ id: craft.id }));
}

export async function generateMetadata({ params }: CraftPageProps): Promise<Metadata> {
  const { id } = await Promise.resolve(params);
  const craft = getCraftById(id);

  if (!craft) {
    return {
      title: "モデルが見つかりません | Kinichi",
    };
  }

  const title = `${craft.nameJa} | Kinichi 有名UFOモデル`;
  const description = `${craft.nameJa}（${craft.nameEn}）の3Dモデル、関連人物、関連事件、形体分類を見る。`;

  return {
    title,
    description,
    alternates: {
      canonical: `/kinichi/craft/${craft.id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: `/kinichi/craft/${craft.id}`,
      siteName: siteConfig.shortName,
      locale: "ja_JP",
      images: [
        {
          url: kinichiOgImage,
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
      images: [kinichiOgImage],
    },
    other: {
      "twitter:image:alt": title,
    },
  };
}

export default async function KinichiCraftPage({ params, searchParams }: CraftPageProps) {
  const { id } = await Promise.resolve(params);
  const resolvedSearchParams = searchParams ? await Promise.resolve(searchParams) : {};
  const from = normalizeFrom(resolvedSearchParams.from);
  const backLink = getBackLink(from);
  const craft = getCraftById(id);

  if (!craft) {
    notFound();
  }

  const shape = getShapeById(craft.shapeId);
  const viewerTarget =
    craft.id === "tic-tac-craft"
      ? {
          id: craft.id,
          label: craft.nameJa,
          modelKind: "procedural" as const,
          proceduralType: "tic_tac" as const,
        }
      : {
          id: craft.id,
          label: craft.nameJa,
          modelKind: "glb" as const,
          modelPath: craft.modelPath,
        };

  return (
    <main className={styles.page}>
      <section className={styles.detailPage}>
        <div className={styles.detailHero}>
          <KinichiViewer fallbackType={shape?.proceduralType ?? "disk"} target={viewerTarget} />
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
            <p className={styles.sectionKicker}>有名UFOモデル</p>
            <h1>
              {craft.nameJa}
              <span>{craft.nameEn}</span>
            </h1>
            <p>{craft.shortDescription}</p>
            {shape ? (
              <Link className={styles.primaryLink} href={withFrom(`/kinichi/shapes/${shape.id}`, from)}>
                関連形体: {shape.nameJa}
              </Link>
            ) : null}
          </div>
        </div>

        <section className={styles.detailGrid} aria-label={`${craft.nameJa}の詳細`}>
          <article>
            <h2>関連人物</h2>
            <ul>
              <li>{craft.relatedPerson}</li>
            </ul>
          </article>
          <article>
            <h2>関連事件・写真</h2>
            <ul>
              <li>{craft.relatedCase}</li>
            </ul>
          </article>
          <article>
            <h2>年代</h2>
            <ul>
              <li>{craft.year}</li>
            </ul>
          </article>
          <article>
            <h2>形体分類</h2>
            {shape ? (
              <>
                <ShapeSilhouette className={styles.nuforcSilhouette} type={shape.proceduralType} />
                <ul>
                  <li>{shape.nameJa}</li>
                  <li>{shape.nameEn}</li>
                </ul>
              </>
            ) : (
              <ul>
                <li>関連形体未設定</li>
              </ul>
            )}
          </article>
        </section>

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
