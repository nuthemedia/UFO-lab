import type { Metadata } from "next";
import Link from "next/link";
import { KeanPageHeader } from "@/components/KeanPageHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { people } from "@/data/kean/people";
import type { Person, PersonCategory } from "@/data/kean/types";
import { siteConfig } from "@/lib/site";

const title = "UFO・UAPディスクロージャー人物図鑑";
const description =
  "David Grusch、Luis Elizondo、Leslie Kean、議員、記者、検証系など、現代UFO・UAPディスクロージャーに関わる人物をカテゴリ別に整理します。";

const categoryLabels: Record<PersonCategory, string> = {
  journalist: "記者",
  whistleblower: "告発者・証言者",
  pilot: "パイロット",
  government: "元政府関係者・議員",
  senator: "政治家・上院",
  researcher: "研究者・民間活動",
  skeptic: "懐疑・検証系",
  filmmaker: "メディア関係者",
  "japan-politics": "日本の政治家",
  "public-figure": "公的発信",
  "controversial-claimant": "要注意の主張者",
};

const categoryOrder: PersonCategory[] = [
  "whistleblower",
  "government",
  "senator",
  "journalist",
  "pilot",
  "researcher",
  "skeptic",
  "filmmaker",
  "japan-politics",
  "public-figure",
  "controversial-claimant",
];

export const metadata: Metadata = {
  title: `${title} | Kean`,
  description,
  alternates: {
    canonical: "/kean/people",
  },
  openGraph: {
    title: `${title} | Kean`,
    description,
    url: "/kean/people",
    siteName: siteConfig.shortName,
    locale: "ja_JP",
    type: "website",
  },
};

function getInitials(person: Person) {
  const parts = person.name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return person.jaName.slice(0, 2);
}

export default function KeanPeoplePage() {
  const getPersonImage = (person: Person) => person.illustration ?? person.portrait;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    url: "https://ufolab.tokyo/kean/people",
    inLanguage: "ja-JP",
    description,
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
        eyebrow="Kean People"
        title={title}
        subtitle="主要人物を知る"
        description={description}
      />

      <div className="kean-people-index">
        {categoryOrder.map((category) => {
          const categoryPeople = people.filter((person) => person.category === category);

          if (categoryPeople.length === 0) {
            return null;
          }

          return (
            <section className="kean-people-section" key={category}>
              <h2>{categoryLabels[category]}</h2>
              <div className="kean-people-card-grid">
                {categoryPeople.map((person) => (
                  <article className="kean-index-person-card" data-person-id={person.id} key={person.id}>
                    <div className="kean-index-person-photo" aria-hidden={!getPersonImage(person)}>
                      {getPersonImage(person) ? (
                        <img src={getPersonImage(person)!.src} alt={getPersonImage(person)!.alt} loading="lazy" />
                      ) : (
                        <span>{getInitials(person)}</span>
                      )}
                    </div>
                    <div>
                      <span>{person.beginnerTier}</span>
                      <h3>{person.name}</h3>
                      <p className="kean-index-person-ja">{person.jaName}</p>
                      <p>{person.oneLine}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="kean-next-links" aria-label="次に読む">
        <Link href="/kean/about">基本解説を読む</Link>
        <Link href="/kean/history">歴史で読む</Link>
      </section>

      <SiteFooter className="ohtsuki-footer" />
    </section>
  );
}
