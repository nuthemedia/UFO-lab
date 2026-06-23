"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { ClarkCaseRecord } from "@/data/clark/cases";
import styles from "./clark.module.css";

export function ClarkCaseCard({ record }: { record: ClarkCaseRecord }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPreviewReady, setIsPreviewReady] = useState(false);

  function playPreview() {
    const video = videoRef.current;

    if (!video || window.matchMedia("(hover: none)").matches) {
      return;
    }

    video.currentTime = 0;
    void video.play().catch(() => {});
  }

  function stopPreview() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.pause();
    video.currentTime = 0;
  }

  return (
    <Link
      href={`/clark/${record.slug}`}
      aria-label={`${record.displayTitleJa}を開く`}
      className={styles.caseCard}
      onMouseEnter={playPreview}
      onMouseLeave={stopPreview}
      onFocus={playPreview}
      onBlur={stopPreview}
    >
      <div className={styles.cardMedia}>
        <img alt="" aria-hidden="true" className={styles.cardPoster} src={record.heroPoster} />
        <video
          ref={videoRef}
          aria-hidden="true"
          autoPlay
          className={`${styles.cardPreview}${isPreviewReady ? ` ${styles.cardPreviewReady}` : ""}`}
          loop
          muted
          onCanPlay={() => setIsPreviewReady(true)}
          onError={() => setIsPreviewReady(false)}
          playsInline
          preload="metadata"
          poster={record.heroPoster}
        >
          {record.heroVideoMp4 ? <source src={record.heroVideoMp4} type="video/mp4" /> : null}
          <source src={record.heroVideo} type="video/quicktime" />
        </video>
        <div className={styles.cardMediaLabel}>
          <span>{record.displayTitleJa}</span>
        </div>
        <div className={styles.cardMediaOverlay} />
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <span>{record.yearLabel}</span>
          <span>{record.placeLabel}</span>
        </div>
        <div className={styles.cardEnglishName}>{record.displayTitleEn}</div>
        <h2 className={styles.cardTitle}>{record.displayTitleJa}</h2>
        <p className={styles.cardSubtitle}>{record.subtitle}</p>
        <p className={styles.cardSummary}>{record.summary}</p>
        <div className={styles.tagRow}>
          {record.tags.map((tag) => (
            <span className={styles.tag} key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
