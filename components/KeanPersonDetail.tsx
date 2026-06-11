"use client";

import Image from "next/image";
import { useEffect } from "react";
import { getKeanPersonIllustration } from "@/lib/keanPortrait";
import {
  getKeanTagLabel,
  keanBeginnerTierLabels,
  keanPersonCategoryLabels,
} from "@/data/kean/labels";
import type { Person, SourceLink } from "@/data/kean/types";

export { keanPersonCategoryLabels };

export function getPersonInitials(person: Person) {
  const parts = person.name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return person.jaName.slice(0, 2);
}

export function PersonPortrait({
  person,
  size,
  showBadge = false,
}: {
  person: Person;
  size: "small" | "large";
  showBadge?: boolean;
}) {
  const image = getKeanPersonIllustration(person);

  return (
    <span className={`kean-person-avatar kean-person-avatar--${size}`}>
      {image ? (
        <>
          <Image src={image.src} alt={image.alt} width={image.width ?? 1024} height={image.height ?? 1024} />
          {showBadge ? <span className="kean-person-avatar-badge">図版</span> : null}
        </>
      ) : (
        <span aria-hidden="true">{getPersonInitials(person)}</span>
      )}
    </span>
  );
}

export function SourceList({ sources }: { sources: SourceLink[] }) {
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

function isInternalKeanGeneratedPortrait(sourceUrl: string) {
  return sourceUrl.startsWith("/kean/images/people/illustrations/");
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

export function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="kean-detail-block">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export function usePersonDialogLock(
  selectedPerson: Person | null,
  onClose: () => void,
) {
  useEffect(() => {
    if (!selectedPerson) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPerson, onClose]);
}

export function PersonDetailDialog({
  person,
  onClose,
}: {
  person: Person | null;
  onClose: () => void;
}) {
  if (!person) {
    return null;
  }

  const image = getKeanPersonIllustration(person);
  const shouldLinkImageCredit = image ? !isInternalKeanGeneratedPortrait(image.sourceUrl) : false;

  return (
    <div className="kean-person-dialog-layer" onClick={onClose}>
      <article
        className="kean-person-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kean-person-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="kean-person-dialog-close"
          type="button"
          aria-label="人物詳細を閉じる"
          onClick={onClose}
        >
          ×
        </button>
        <header className="kean-person-dialog-header">
          <div className="kean-person-dialog-media">
            <PersonPortrait person={person} size="large" />
            {image ? (
              <p>
                {image.credit} / {image.license} /{" "}
                {shouldLinkImageCredit ? (
                  <a href={image.sourceUrl} target="_blank" rel="noreferrer noopener">
                    {image.sourceName}
                  </a>
                ) : (
                  <span>{image.sourceName}</span>
                )}
              </p>
            ) : (
              <p>生成図版を読み込めない場合は、確認でき次第追加します。</p>
            )}
          </div>
          <div>
            <span className="kean-person-category">{keanPersonCategoryLabels[person.category]}</span>
            <h2 id="kean-person-dialog-title">{person.jaName}</h2>
            <p className="kean-person-dialog-ja">{person.name}</p>
            <p className="kean-person-dialog-tier">{keanBeginnerTierLabels[person.beginnerTier]}</p>
            <p className="kean-person-dialog-lead">{person.oneLine}</p>
          </div>
        </header>

        <div className="kean-person-dialog-sections">
          <DetailBlock title="何をした？">
            <TextList items={person.whatTheyDid} />
          </DetailBlock>
          <DetailBlock title="なぜ重要？">
            <p>{person.whyImportant}</p>
          </DetailBlock>
          <DetailBlock title="確認済み事実">
            <TextList items={person.verifiedFacts} />
          </DetailBlock>
          <DetailBlock title="主張・立場">
            <TextList items={person.claimsOrPositions} />
          </DetailBlock>
          <DetailBlock title="注意点">
            <TextList items={person.cautions} />
          </DetailBlock>
          <DetailBlock title="関連タグ">
            {person.tags.length > 0 ? (
              <div className="kean-tag-list">
                {person.tags.map((tag) => (
                  <span key={tag}>{getKeanTagLabel(tag)}</span>
                ))}
              </div>
            ) : (
              <p className="kean-empty-note">タグは追加準備中です。</p>
            )}
          </DetailBlock>
          <DetailBlock title="出典リンク">
            <SourceList sources={person.sources} />
          </DetailBlock>
        </div>
      </article>
    </div>
  );
}
