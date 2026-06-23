"use client";

import Link from "next/link";
import { useState } from "react";
import type { ClarkCaseRecord } from "@/data/clark/cases";
import { ClarkAmbientVideo } from "./ClarkAmbientVideo";
import { ClarkArnoldMotionScene } from "./ClarkArnoldMotionScene";
import { ClarkKennethMobileExperience } from "./ClarkKennethMobileExperience";
import { ClarkModelViewer } from "./ClarkModelViewer";
import { ClarkScrollMotion } from "./ClarkScrollMotion";
import { ClarkSightingWaveChart } from "./ClarkSightingWaveChart";
import styles from "./clark.module.css";

const railItems = [
  { href: "#scene", label: "Scene" },
  { href: "#story", label: "Story" },
  { href: "#full-video", label: "Video" },
  { href: "#model", label: "3D" },
  { href: "#views", label: "Views" },
];

function ClarkExhibitRail({ activeIndex }: { activeIndex: number }) {
  return (
    <nav className={styles.exhibitRail} aria-label="Clark exhibit navigation">
      {railItems.map((item, index) => (
        <a className={index === activeIndex ? styles.exhibitRailActive : undefined} href={item.href} key={item.href}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

function ClarkCaseStage({
  record,
  activeSceneIndex,
}: {
  record: ClarkCaseRecord;
  activeSceneIndex: number;
}) {
  return (
    <section className={styles.caseStage} id="scene" aria-label={`${record.displayTitleJa} opening scene`}>
      <div className={styles.stageAmbient}>
        <ClarkAmbientVideo
          autoPauseOnHidden
          className={styles.stageAmbientVideo}
          mobileSrc={record.heroVideoMobile}
          mobileSrcMp4={record.heroVideoMobileMp4}
          poster={record.heroPoster}
          src={record.heroVideo}
          srcMp4={record.heroVideoMp4}
        />
      </div>
      <div className={styles.stageShade} />
      <div className={styles.stageModel}>
        <ClarkModelViewer
          activeSceneIndex={activeSceneIndex}
          interactionMode="display"
          label={record.displayTitleJa}
          modelPath={record.modelPath}
          presentationPreset="museum"
          variant="stage"
        />
      </div>
      <div className={styles.stageCaption}>
        <div className={styles.heroMeta}>
          <span>{record.yearLabel}</span>
          <span>{record.placeLabel}</span>
        </div>
        <div className={styles.heroEnglishTitle}>{record.displayTitleEn}</div>
        <h1 className={styles.heroTitle}>{record.displayTitleJa}</h1>
        <p className={styles.heroSubtitle}>{record.subtitle}</p>
      </div>
    </section>
  );
}

function ClarkStoryArtifact({ record, scene }: { record: ClarkCaseRecord; scene: ClarkCaseRecord["scrollScenes"][number] }) {
  const artifactTone =
    scene.title.includes("報道") || scene.title.includes("写真")
      ? "news"
      : scene.title.includes("論争") || scene.title.includes("疑")
        ? "doubt"
        : scene.title.includes("砂漠")
          ? "desert"
          : "route";

  return (
    <div className={`${styles.storyArtifact} ${styles[`storyArtifact${artifactTone}`]}`}>
      <div className={styles.artifactSky}>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.artifactBody}>
        <div className={styles.artifactMeta}>
          <span>{record.yearLabel}</span>
          <span>{scene.eyebrow}</span>
        </div>
        <h4>{artifactTone === "news" ? "報道資料" : artifactTone === "doubt" ? "検証メモ" : "証言スケッチ"}</h4>
        <p>{scene.quote ?? scene.title}</p>
      </div>
      <div className={styles.artifactGround} aria-hidden="true" />
    </div>
  );
}

function ClarkSceneVisualCaption({ scene }: { scene: ClarkCaseRecord["scrollScenes"][number] }) {
  if (!scene.visualTitle && !scene.visualCaption && !scene.visualCredit) {
    return null;
  }

  return (
    <div className={styles.sceneVisualCaption}>
      {scene.visualTitle ? <strong>{scene.visualTitle}</strong> : null}
      {scene.visualCaption ? <p>{scene.visualCaption}</p> : null}
      {scene.visualCredit && scene.visualCreditUrl ? (
        <a href={scene.visualCreditUrl} rel="noreferrer" target="_blank">
          {scene.visualCredit}
        </a>
      ) : null}
      {scene.visualCredit && !scene.visualCreditUrl ? <span>{scene.visualCredit}</span> : null}
    </div>
  );
}

function ClarkFullVideoSection({ record }: { record: ClarkCaseRecord }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section
      className={`${styles.fullVideoSection}${isPlaying ? ` ${styles.fullVideoSectionPlaying}` : ""}`}
      id="full-video"
      aria-label={`${record.displayTitleJa} full video`}
    >
      <div className={styles.fullVideoHeader}>
        <span className={styles.sectionLabel}>Full Video</span>
        <h2>動画を資料として見る</h2>
        <p>
          ここでは環境演出ではなく、映像そのものを確認する。再生、停止、シーク、全画面表示を使って、見たい部分まで戻れる。
        </p>
      </div>
      <div className={styles.fullVideoFrame}>
        <ClarkAmbientVideo
          className={styles.fullVideo}
          mode="full"
          onPlayStateChange={setIsPlaying}
          poster={record.videoPoster}
          src={record.heroVideo}
          srcMp4={record.heroVideoMp4}
        />
      </div>
      <p className={styles.fullVideoNote}>
        モバイルでは見やすさを優先して中央を大きく表示しています。全体の構図を確認する場合は全画面表示を使えます。
      </p>
    </section>
  );
}

export function ClarkCaseExperience({ record, nextCase }: { record: ClarkCaseRecord; nextCase: ClarkCaseRecord }) {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  if (record.slug === "kenneth-arnold") {
    return <ClarkKennethMobileExperience nextCase={nextCase} record={record} />;
  }

  return (
    <main className={styles.page}>
      <article className={styles.detailPage}>
        <ClarkCaseStage activeSceneIndex={activeSceneIndex} record={record} />
        <ClarkExhibitRail activeIndex={Math.min(railItems.length - 1, activeSceneIndex)} />

        <div className={styles.content}>
          <section className={styles.section} id="story">
            <header className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>What Happened</span>
              <h2>{record.overviewHeading ?? "何が起きたとされているのか"}</h2>
            </header>
            <p className={styles.leadBody}>{record.whatHappened}</p>
          </section>

          <section className={styles.section}>
            <header className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Scroll Story</span>
              <h2>場面ごとに、事件の空気を歩く</h2>
            </header>
            <ClarkScrollMotion onActiveSceneChange={setActiveSceneIndex}>
              <div className={styles.storyShell}>
                {record.scrollScenes.map((scene) => (
                  <section className={styles.storySection} data-clark-scene key={scene.id}>
                    <div className={styles.storyCopy}>
                      <span className={styles.sceneLabel}>{scene.eyebrow}</span>
                      <h3>{scene.title}</h3>
                      <p>{scene.body}</p>
                      {scene.quote ? <div className={styles.storyQuote}>{scene.quote}</div> : null}
                    </div>

                    <div className={styles.storyVisual}>
                      {scene.visualMode === "video" && scene.videoSrc ? (
                        <div className={styles.ambientInline}>
                          <ClarkAmbientVideo poster={record.heroPoster} src={scene.videoSrc} srcMp4={scene.videoSrcMp4} />
                        </div>
                      ) : null}
                      {scene.visualMode === "image" && scene.imageSrc ? (
                        <img alt="" aria-hidden="true" className={styles.storyImage} src={scene.imageSrc} />
                      ) : null}
                      {scene.visualMode === "text" ? (
                        <ClarkStoryArtifact record={record} scene={scene} />
                      ) : null}
                      {scene.visualMode === "arnold-motion" ? <ClarkArnoldMotionScene /> : null}
                      {scene.visualMode === "sighting-wave" ? <ClarkSightingWaveChart /> : null}
                      <ClarkSceneVisualCaption scene={scene} />
                    </div>
                  </section>
                ))}
              </div>
            </ClarkScrollMotion>
          </section>
        </div>

        <ClarkFullVideoSection record={record} />

        <section className={styles.modelStageSection} id="model" aria-label={`${record.displayTitleJa} 3D model`}>
          <div className={styles.modelStageCopy}>
            <span className={styles.sectionLabel}>Object / 3D Model</span>
            <h2>展示室の中心で、物体像を観察する</h2>
            <p>
              目撃証言や有名写真と結びついた UFO 像を、概念モデルとして観察する。答えを断定する場所ではなく、この形がなぜ記憶に残ったのかを見る場所。
            </p>
          </div>
          <div className={styles.modelStageFrame}>
            <ClarkModelViewer
              activeSceneIndex={4}
              interactionMode="inspect"
              label={record.displayTitleJa}
              modelPath={record.modelPath}
              presentationPreset="museum"
              variant="stage"
            />
          </div>
        </section>

        <div className={styles.content}>
          <section className={styles.section}>
            <div className={styles.splitGrid}>
              <article className={styles.personCard}>
                <span className={styles.sectionLabel}>Person</span>
                <h3>{record.person.name}</h3>
                <div className={styles.personMeta}>{record.person.role}</div>
                <p className={styles.cardText}>{record.person.bio}</p>
                <p className={styles.cardText}>{record.person.testimony}</p>
                <p className={styles.cardText}>{record.person.impact}</p>
              </article>

              <article className={styles.personCard}>
                <span className={styles.sectionLabel}>Why It Matters</span>
                <h3>なぜこの事件が残り続けるのか</h3>
                <p className={styles.cardText}>{record.whyItMatters}</p>
              </article>
            </div>
          </section>

          <section className={styles.section} id="views">
            <header className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Believer / Skeptic</span>
              <h2>信じられた理由と、疑われた理由を並べる</h2>
            </header>
            <div className={styles.viewSheet}>
              <article>
                <h3>信じる側の見方</h3>
                <p>{record.believerView}</p>
              </article>
              <article>
                <h3>疑う側の見方</h3>
                <p>{record.skepticView}</p>
              </article>
              <article>
                <h3>Clark の中立的整理</h3>
                <p>{record.neutralSummary}</p>
              </article>
            </div>
          </section>

          <section className={styles.section}>
            <article className={styles.nextCard}>
              <span className={styles.sectionLabel}>Next Case</span>
              <h3>{nextCase.title}</h3>
              <p className={styles.cardText}>{nextCase.summary}</p>
              <div className={styles.nextActions}>
                <Link className={styles.nextLink} href={`/clark/${nextCase.slug}`}>
                  次の事件へ
                </Link>
                <Link className={styles.nextLinkSecondary} href="/clark">
                  Clark トップへ戻る
                </Link>
              </div>
            </article>
          </section>
        </div>
      </article>
    </main>
  );
}
