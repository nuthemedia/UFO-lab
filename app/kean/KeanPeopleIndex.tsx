"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PersonDetailDialog, usePersonDialogLock } from "@/app/kean/KeanPersonDetail";
import { getKeanPersonIllustration } from "@/lib/keanPortrait";
import {
  getKeanTagLabel,
  keanBeginnerTierLabels,
  keanPersonCategoryLabels,
} from "@/data/kean/labels";
import type { Person, PersonCategory } from "@/data/kean/types";

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

function getPersonInitials(person: Person) {
  const parts = person.name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return person.jaName.slice(0, 2);
}

function PersonIndexCard({
  person,
  onSelect,
}: {
  person: Person;
  onSelect: (person: Person) => void;
}) {
  const illustration = getKeanPersonIllustration(person);

  return (
    <button
      className="kean-index-person-card"
      data-person-id={person.id}
      type="button"
      aria-label={`${person.jaName}の人物詳細を開く`}
      onClick={() => onSelect(person)}
    >
      <span className="kean-index-person-photo" aria-hidden={!illustration}>
        {illustration ? (
          <Image src={illustration.src} alt={illustration.alt} width={illustration.width ?? 1024} height={illustration.height ?? 1024} />
        ) : (
          <span>{getPersonInitials(person)}</span>
        )}
      </span>
      <span className="kean-index-person-body">
        <span className="kean-index-person-meta">
          <span>{keanBeginnerTierLabels[person.beginnerTier]}</span>
        </span>
        <strong>{person.jaName}</strong>
        <span className="kean-index-person-ja">{person.name}</span>
        <span className="kean-index-person-line">{person.oneLine}</span>
      </span>
    </button>
  );
}

export function KeanPeopleIndex({
  people,
  activeTag,
}: {
  people: Person[];
  activeTag?: string;
}) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const closeDialog = useCallback(() => setSelectedPerson(null), []);

  usePersonDialogLock(selectedPerson, closeDialog);

  if (activeTag) {
    const filteredPeople = people.filter((person) => person.tags.includes(activeTag));

    return (
      <div className="kean-people-index">
        <section className="kean-people-section">
          <div className="kean-people-section-head">
            <div>
              <span>タグ検索</span>
              <h2>タグ: {getKeanTagLabel(activeTag)}</h2>
            </div>
            <Link href="/kean/people">人物図鑑へ戻る</Link>
          </div>
          {filteredPeople.length > 0 ? (
            <div className="kean-people-card-grid">
              {filteredPeople.map((person) => (
                <PersonIndexCard person={person} key={person.id} onSelect={setSelectedPerson} />
              ))}
            </div>
          ) : (
            <p className="kean-empty-note">このタグに一致する人物はまだ登録されていません。</p>
          )}
        </section>
        <PersonDetailDialog person={selectedPerson} onClose={closeDialog} />
      </div>
    );
  }

  return (
    <div className="kean-people-index">
      {categoryOrder.map((category) => {
        const categoryPeople = people.filter((person) => person.category === category);

        if (categoryPeople.length === 0) {
          return null;
        }

        return (
          <section className="kean-people-section" key={category}>
            <h2>{keanPersonCategoryLabels[category]}</h2>
            <div className="kean-people-card-grid">
              {categoryPeople.map((person) => (
                <PersonIndexCard person={person} key={person.id} onSelect={setSelectedPerson} />
              ))}
            </div>
          </section>
        );
      })}
      <PersonDetailDialog person={selectedPerson} onClose={closeDialog} />
    </div>
  );
}
