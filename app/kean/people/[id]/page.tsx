import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { KeanPageHeader } from "@/components/KeanPageHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  getKeanTagLabel,
  keanBeginnerTierLabels,
  keanPersonCategoryLabels,
} from "@/data/kean/labels";
import { people, peopleById } from "@/data/kean/people";
import { timelineEvents } from "@/data/kean/timeline";
import type { Person, SourceLink } from "@/data/kean/types";
import { getKeanPersonIllustration } from "@/lib/keanPortrait";
import { siteConfig } from "@/lib/site";

type KeanPersonPageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export const dynamicParams = false;

function getPersonSeoDescription(person: Person) {
  return `${person.jaName}（${person.name}）とは。${person.oneLine} 現代UFO・UAPディスクロージャー上の役割、確認済み事実、主張・立場、注意点を分けて整理します。`;
}

function getPersonSeoKeywords(person: Person) {
  return Array.from(
    new Set([
      `${person.jaName}とは`,
      person.jaName,
      person.name,
      ...person.aliases,
      keanPersonCategoryLabels[person.category],
      keanBeginnerTierLabels[person.beginnerTier],
      ...person.tags.map(getKeanTagLabel),
      ...person.searchQueries,
      "UFOディスクロージャー",
      "UAP",
      "UAP開示",
    ]),
  );
}

export function generateStaticParams() {
  return people.map((person) => ({ id: person.id }));
}

export async function generateMetadata({ params }: KeanPersonPageProps): Promise<Metadata> {
  const { id } = await Promise.resolve(params);
  const person = peopleById.get(id);

  if (!person) {
    return {};
  }

  const title = `${person.jaName}とは`;
  const description = getPersonSeoDescription(person);
  const imageUrl = `/kean/people/${person.id}/opengraph-image`;

  return {
    title: `${title} | Kean UFO・UAP人物図鑑`,
    description,
    keywords: getPersonSeoKeywords(person),
    alternates: {
      canonical: `/kean/people/${person.id}`,
    },
    openGraph: {
      title: `${title} | Kean UFO・UAP人物図鑑`,
      description,
      url: `/kean/people/${person.id}`,
      siteName: siteConfig.shortName,
      locale: "ja_JP",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${person.jaName}とは | Kean`,
          type: "image/png",
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Kean UFO・UAP人物図鑑`,
      description,
      images: [imageUrl],
    },
    other: {
      "twitter:image:alt": `${person.jaName}とは | Kean`,
    },
  };
}

function TextList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="kean-empty-note">追加準備中です。</p>;
  }

  return (
    <ul className="kean-text-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function SourceList({ sources }: { sources: SourceLink[] }) {
  if (sources.length === 0) {
    return <p className="kean-empty-note">出典リンクは追加準備中です。</p>;
  }

  return (
    <ul className="kean-source-list">
      {sources.map((source) => (
        <li key={source.url}>
          <a href={source.url} target="_blank" rel="noreferrer noopener">
            {source.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="kean-detail-block">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function getPersonInitials(person: Person) {
  const parts = person.name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return person.jaName.slice(0, 2);
}

export default async function KeanPersonPage({ params }: KeanPersonPageProps) {
  const { id } = await Promise.resolve(params);
  const person = peopleById.get(id);

  if (!person) {
    notFound();
  }

  const image = getKeanPersonIllustration(person);
  const relatedPeople = person.relatedPeople
    .map((relatedPersonId) => peopleById.get(relatedPersonId))
    .filter((item): item is Person => Boolean(item));
  const relatedEvents = person.relatedEvents
    .map((eventId) => timelineEvents.find((event) => event.id === eventId))
    .filter((item): item is (typeof timelineEvents)[number] => Boolean(item));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${person.jaName} - ${person.name}`,
    url: `https://ufolab.tokyo/kean/people/${person.id}`,
    inLanguage: "ja-JP",
    description: getPersonSeoDescription(person),
    mainEntityOfPage: `https://ufolab.tokyo/kean/people/${person.id}`,
    mainEntity: {
      "@type": "Person",
      name: person.jaName,
      alternateName: [person.name, ...person.aliases],
      description: getPersonSeoDescription(person),
      image: image ? `https://ufolab.tokyo${image.src}` : undefined,
      knowsAbout: getPersonSeoKeywords(person),
      mainEntityOfPage: `https://ufolab.tokyo/kean/people/${person.id}`,
    },
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.shortName,
      url: siteConfig.url,
    },
  };

  return (
    <section className="checker-page kean-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <KeanPageHeader
        activeHref="/kean/people"
        eyebrow="Kean People"
        title={person.jaName}
        subtitle={person.name}
        description={person.oneLine}
      />

      <article className="kean-person-profile">
        <header className="kean-person-profile-hero">
          <div className="kean-person-profile-media">
            <span className="kean-person-profile-image">
              {image ? (
                <img src={image.src} alt={image.alt} />
              ) : (
                <span>{getPersonInitials(person)}</span>
              )}
            </span>
            {image ? (
              <p>
                {image.credit} / {image.license} / {image.sourceName}
              </p>
            ) : null}
          </div>
          <div className="kean-person-profile-summary">
            <span className="kean-person-category">{keanPersonCategoryLabels[person.category]}</span>
            <h2>{person.jaName}</h2>
            <p>{person.oneLine}</p>
            <div className="kean-person-profile-meta">
              <span>{keanBeginnerTierLabels[person.beginnerTier]}</span>
              {person.aliases.map((alias) => (
                <span key={alias}>{alias}</span>
              ))}
            </div>
          </div>
        </header>

        <div className="kean-person-profile-grid">
          <DetailSection title="何をした？">
            <TextList items={person.whatTheyDid} />
          </DetailSection>
          <DetailSection title="なぜ重要？">
            <p>{person.whyImportant}</p>
          </DetailSection>
          <DetailSection title="確認済み事実">
            <TextList items={person.verifiedFacts} />
          </DetailSection>
          <DetailSection title="主張・立場">
            <TextList items={person.claimsOrPositions} />
          </DetailSection>
          <DetailSection title="注意点">
            <TextList items={person.cautions} />
          </DetailSection>
          <DetailSection title="関連タグ">
            {person.tags.length > 0 ? (
              <div className="kean-tag-list">
                {person.tags.map((tag) => (
                  <Link href={`/kean/people?tag=${encodeURIComponent(tag)}`} key={tag}>
                    {getKeanTagLabel(tag)}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="kean-empty-note">タグは追加準備中です。</p>
            )}
          </DetailSection>
          <DetailSection title="関連人物">
            {relatedPeople.length > 0 ? (
              <div className="kean-related-link-list">
                {relatedPeople.map((relatedPerson) => (
                  <Link href={`/kean/people/${relatedPerson.id}`} key={relatedPerson.id}>
                    <strong>{relatedPerson.jaName}</strong>
                    <span>{relatedPerson.name}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="kean-empty-note">関連人物は追加準備中です。</p>
            )}
          </DetailSection>
          <DetailSection title="関連イベント">
            {relatedEvents.length > 0 ? (
              <ul className="kean-source-list">
                {relatedEvents.map((event) => (
                  <li key={event.id}>
                    <Link href={`/kean/history#kean-event-${event.id}`}>
                      {event.yearLabel} / {event.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="kean-empty-note">関連イベントは追加準備中です。</p>
            )}
          </DetailSection>
          <DetailSection title="出典リンク">
            <SourceList sources={person.sources} />
          </DetailSection>
        </div>
      </article>

      <section className="kean-next-links" aria-label="次に読む">
        <Link href="/kean/people">人物図鑑へ戻る</Link>
        <Link href="/kean/history">歴史で読む</Link>
      </section>

      <SiteFooter className="ohtsuki-footer" />
    </section>
  );
}
