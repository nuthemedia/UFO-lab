"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent, ReactNode, TouchEvent, WheelEvent } from "react";
import type { ClarkCaseRecord } from "@/data/clark/cases";
import { ClarkAmbientVideo } from "./ClarkAmbientVideo";
import { ClarkArnoldMotionScene } from "./ClarkArnoldMotionScene";
import { ClarkModelViewer } from "./ClarkModelViewer";
import { ClarkSightingWaveChart } from "./ClarkSightingWaveChart";
import styles from "./clark.module.css";

type KennethMobileStep = {
  id: string;
  label: string;
  stage: ReactNode;
};

type FullscreenVideoElement = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
};

type KennethTriviaSnippet = {
  title: string;
  imageSrc: string;
  imageCredit: string;
  content: string;
  detailImageSrc?: string;
  detailImageAlt?: string;
  detailImageCaption?: string;
};

type SwipeStart = {
  x: number;
  y: number;
  time: number;
};

const kennethIntro =
  "1947年の夏、ひとりの民間パイロットが見た奇妙な飛行体は、新聞の言葉を通じて「空飛ぶ円盤」となり、現代UFO文化の入口になった。";

const refinedWhatHappened =
  "1947年6月24日、実業家でパイロットでもあったケネス・アーノルドは、自家用機でワシントン州上空を飛んでいた。レーニア山付近で、山並みに沿うように移動する複数の奇妙な飛行体を目撃したと語っている。それらは普通の飛行機とは違い、強い反射を伴いながら非常に速く動いていた。";

const kennethArnoldTriviaSnippets: KennethTriviaSnippet[] = [
  {
    title: "消火設備セールスマン",
    imageSrc: "/clark/images/kenneth-arnold-press.jpg",
    imageCredit: "Photo: Associated Press / Wikimedia Commons / Public Domain",
    content:
      "ケネス・アーノルドは、神秘家や作家として出発した人物ではなかった。アイダホ州ボイシを拠点に、消火設備の販売・設置を行う実業家であり、経験豊かな民間パイロットだった。UFOを見たいと願って空を飛んでいたのではなく、日常的に仕事で飛行機を使う現実的な人物だった。この背景を知ると、彼の目撃談は『奇人の幻想』ではなく、実務的なパイロットが理解できないものを見てしまった事件として見えてくる。",
  },
  {
    title: "5,000ドルの寄り道",
    imageSrc: "/clark/images/kenneth-trivia-c46.jpg",
    imageCredit: "Photo: U.S. military C-46 / Wikimedia Commons / Public Domain",
    content:
      "1947年6月24日、アーノルドは移動中にレーニア山付近へ寄り道していた。その理由の一つは、行方不明になっていた海兵隊のC-46輸送機を探すためだった。発見者には5,000ドルの報奨金が出るとされていた。つまり、近代UFO史の始まりは、宇宙人探しではなく、遭難機捜索と報奨金という現実的な動機を持った飛行の途中で起きた。",
  },
  {
    title: "哲学名刺",
    imageSrc: "/clark/images/kenneth-trivia-oahspe.jpg",
    imageCredit: "Image: Oahspe first edition title page / Wikimedia Commons / Public Domain",
    detailImageSrc: "/clark/images/kenneth-philosophy-card.jpg",
    detailImageAlt: "ケネス・アーノルドのphilosophy cardとされる資料画像",
    detailImageCaption: "アーノルドが配ったとされる philosophy card の資料画像。左面に三日月状の物体、右面に短い文章が載る。",
    content:
      "アーノルドは、名刺サイズの『philosophy card』を人に配っていたとされる。表には1947年6月24日に見た9機のうちの一つ、丸い円盤ではなく三日月やブーメランに近い形の物体が描かれていた。裏には『信じろ』ではなく、『他人や司祭に考えを預けるな。自分の足で立て』という趣旨の文章が載っていた。この文面は、19世紀の霊的文書『Oahspe: A New Bible』の一節を要約・改変したものと見られる。空飛ぶ円盤の目撃者が配っていたのは、盲信を求めるカードではなく、自分で考えることを促すカードだった。",
  },
  {
    title: "モーリー島への呼び出し",
    imageSrc: "/clark/images/kenneth-trivia-maury-island.jpg",
    imageCredit: "Photo: Maury Island / Wikimedia Commons",
    content:
      "アーノルドは、1947年の目撃後、初期UFO出版文化の中心人物レイ・パーマーと関わるようになった。その流れで、ワシントン州モーリー島で起きたとされる奇妙なUFO事件の調査にも巻き込まれる。モーリー島事件には、落下物、謎の男、軍の調査員、墜落事故など、後のUFO神話を形づくる要素が早くも含まれていた。ただし現在では、事件そのものはかなり疑わしい、あるいは捏造に近いものとして扱われることが多い。ここで重要なのは、アーノルドが単なる目撃者にとどまらず、初期UFO神話の形成現場に引き込まれていったことだ。",
  },
  {
    title: "16ページの証言自費出版",
    imageSrc: "/clark/images/kenneth-arnold-press.jpg",
    imageCredit: "Photo: Associated Press / Wikimedia Commons / Public Domain",
    detailImageSrc: "/clark/images/kenneth-flying-saucer-booklet.jpg",
    detailImageAlt: "The Flying Saucer as I Saw it by Kenneth Arnold の表紙資料画像",
    detailImageCaption: "『The Flying Saucer as I Saw it』の表紙資料画像。目撃者本人が体験を自分の言葉で残そうとした小冊子として扱う。",
    content:
      "1950年、アーノルドは『The Flying Saucer As I Saw It』という16ページの小冊子を自費出版した。新聞や雑誌が『空飛ぶ円盤』という言葉を広める一方で、彼自身もまた、自分が見たものを自分の言葉で残そうとしていた。この小冊子は、単なるUFOブームの商品ではなく、目撃者本人が体験を記録し直すための小さな証言集だった。現在、この資料は University of Wyoming の American Heritage Center にある Richard F. Haines papers に含まれる資料として紹介されている。",
  },
];

function shouldIgnoreSwipe(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(target.closest("video[controls], input, button, a, textarea, select, [role='button'], [data-swipe-ignore='true']"))
  );
}

function shouldIgnoreTriviaSwipe(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("input, button, a, textarea, select, [role='button']"));
}

function getVerticalSwipeDirection(start: SwipeStart, x: number, y: number) {
  const dx = x - start.x;
  const dy = y - start.y;
  const age = Date.now() - start.time;
  if (age > 900 || Math.abs(dy) < 70 || Math.abs(dy) < Math.abs(dx) * 1.15) {
    return null;
  }

  return dy < 0 ? 1 : -1;
}

function getHorizontalSwipeDirection(start: SwipeStart, x: number, y: number) {
  const dx = x - start.x;
  const dy = y - start.y;
  const age = Date.now() - start.time;
  if (age > 900 || Math.abs(dx) < 52 || Math.abs(dx) < Math.abs(dy) * 1.18) {
    return null;
  }

  return dx < 0 ? 1 : -1;
}

function GlassPanel({
  eyebrow,
  title,
  children,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${styles.kennethGlassPanel}${className ? ` ${className}` : ""}`}>
      {eyebrow ? <span className={styles.kennethMobileEyebrow}>{eyebrow}</span> : null}
      <h1>{title}</h1>
      <div className={styles.kennethMobileBody}>{children}</div>
    </div>
  );
}

export function ClarkKennethMobileExperience({ record }: { record: ClarkCaseRecord; nextCase: ClarkCaseRecord }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeTriviaIndex, setActiveTriviaIndex] = useState(0);
  const [showInputHintText, setShowInputHintText] = useState(true);
  const [activeTriviaImage, setActiveTriviaImage] = useState<KennethTriviaSnippet | null>(null);
  const [waveInfoOpen, setWaveInfoOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const shellRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<FullscreenVideoElement | null>(null);
  const pointerStartRef = useRef<SwipeStart | null>(null);
  const touchStartRef = useRef<SwipeStart | null>(null);
  const triviaPointerStartRef = useRef<SwipeStart | null>(null);
  const triviaTouchStartRef = useRef<SwipeStart | null>(null);
  const lastStepChangeRef = useRef(0);
  const [motionScene, reportScene, waveScene] = record.scrollScenes;

  useEffect(() => {
    shellRef.current?.focus();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowInputHintText(false), 4200);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!activeTriviaImage) {
      return;
    }

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveTriviaImage(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [activeTriviaImage]);

  const playFullVideo = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    setVideoPlaying(true);
    void video.play().catch(() => {});
    if (video.requestFullscreen) {
      void video.requestFullscreen().catch(() => {});
      return;
    }

    video.webkitEnterFullscreen?.();
  };

  const activeTrivia = kennethArnoldTriviaSnippets[activeTriviaIndex];
  const changeTrivia = (direction: 1 | -1) => {
    setActiveTriviaIndex((index) => Math.max(0, Math.min(kennethArnoldTriviaSnippets.length - 1, index + direction)));
  };

  const handleTriviaPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") {
      triviaPointerStartRef.current = null;
      return;
    }

    if (shouldIgnoreTriviaSwipe(event.target)) {
      triviaPointerStartRef.current = null;
      return;
    }

    triviaPointerStartRef.current = { x: event.clientX, y: event.clientY, time: Date.now() };
  };

  const handleTriviaSwipeEnd = (start: SwipeStart | null, x: number, y: number) => {
    if (!start) {
      return;
    }

    const lastTriviaIndex = kennethArnoldTriviaSnippets.length - 1;
    const verticalDirection = getVerticalSwipeDirection(start, x, y);
    if (verticalDirection) {
      if (verticalDirection === 1 && activeTriviaIndex === lastTriviaIndex) {
        setActiveStepIndex((index) => Math.min(index + 1, 8));
      }

      if (verticalDirection === -1 && activeTriviaIndex === 0) {
        setActiveStepIndex((index) => Math.max(index - 1, 0));
      }

      return;
    }

    const horizontalDirection = getHorizontalSwipeDirection(start, x, y);
    if (horizontalDirection) {
      changeTrivia(horizontalDirection);
    }
  };

  const handleTriviaPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") {
      triviaPointerStartRef.current = null;
      return;
    }

    const start = triviaPointerStartRef.current;
    triviaPointerStartRef.current = null;
    if (shouldIgnoreTriviaSwipe(event.target)) {
      return;
    }

    handleTriviaSwipeEnd(start, event.clientX, event.clientY);
  };

  const handleTriviaTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (shouldIgnoreTriviaSwipe(event.target)) {
      triviaTouchStartRef.current = null;
      return;
    }

    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    triviaTouchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  };

  const handleTriviaTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = triviaTouchStartRef.current;
    triviaTouchStartRef.current = null;
    if (shouldIgnoreTriviaSwipe(event.target)) {
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }

    handleTriviaSwipeEnd(start, touch.clientX, touch.clientY);
  };

  const handleTriviaTouchCancel = () => {
    triviaTouchStartRef.current = null;
  };

  const steps = useMemo<KennethMobileStep[]>(
    () => [
      {
        id: "opening",
        label: "01",
        stage: (
          <section className={styles.kennethVerticalSlide}>
            <ClarkAmbientVideo
              autoPauseOnHidden
              className={styles.kennethCoverVideo}
              mobileSrc={record.heroVideoMobile}
              mobileSrcMp4={record.heroVideoMobileMp4}
              poster={record.heroPoster}
              src={record.heroVideo}
              srcMp4={record.heroVideoMp4}
            />
            <div className={styles.kennethDarkScrim} />
            <GlassPanel eyebrow="01 Opening" title={record.displayTitleJa} className={styles.kennethCoverPanel}>
              <p className={styles.kennethSubtitle}>{record.subtitle}</p>
              <p>{kennethIntro}</p>
            </GlassPanel>
          </section>
        ),
      },
      {
        id: "what-happened",
        label: "02",
        stage: (
          <section className={styles.kennethVerticalSlide}>
            <img alt="" className={styles.kennethRainierImage} src="/clark/images/kenneth-rainier.jpg" />
            <div className={styles.kennethDarkScrim} />
            <GlassPanel eyebrow="02 What Happened" title="何が起きたのか" className={styles.kennethMiddlePanel}>
              <p>{refinedWhatHappened}</p>
              <p className={styles.kennethCredit}>Photo: Caleb Riston / Wikimedia Commons / CC0</p>
            </GlassPanel>
          </section>
        ),
      },
      {
        id: "motion",
        label: "03",
        stage: (
          <section className={styles.kennethVerticalSlide}>
            <div className={styles.kennethVisualFill}>
              <ClarkArnoldMotionScene />
            </div>
            <GlassPanel
              eyebrow={motionScene?.eyebrow ?? "Scene 01"}
              title={motionScene?.title ?? "飛行運動を見る"}
              className={`${styles.kennethBottomPanel} ${styles.kennethSceneTopPanel}`}
            >
              <p>{motionScene?.body}</p>
              {motionScene?.quote ? <blockquote>{motionScene.quote}</blockquote> : null}
            </GlassPanel>
          </section>
        ),
      },
      {
        id: "report",
        label: "04",
        stage: (
          <section className={styles.kennethVerticalSlide}>
            <img alt="" className={styles.kennethArnoldPressImage} src="/clark/images/kenneth-arnold-press.jpg" />
            <div className={styles.kennethDarkScrim} />
            <GlassPanel
              eyebrow={reportScene?.eyebrow ?? "Scene 02"}
              title={reportScene?.title ?? "報道の言葉を見る"}
              className={`${styles.kennethBottomPanel} ${styles.kennethSceneTopPanel} ${styles.kennethSceneReportPanel}`}
            >
              <p>{reportScene?.body}</p>
              <p className={styles.kennethCredit}>Photo: Associated Press, July 8, 1947 / Wikimedia Commons / Public Domain</p>
            </GlassPanel>
          </section>
        ),
      },
      {
        id: "sighting-wave",
        label: "05",
        stage: (
          <section className={styles.kennethVerticalSlide}>
            <button
              aria-expanded={waveInfoOpen}
              aria-label="データ説明を開く"
              className={styles.kennethInfoButton}
              data-swipe-ignore="true"
              type="button"
              onClick={() => setWaveInfoOpen((open) => !open)}
            >
              i
            </button>
            <div className={styles.kennethChartStage}>
              <ClarkSightingWaveChart showDescription={false} />
            </div>
            <GlassPanel
              eyebrow={waveScene?.eyebrow ?? "Scene 03"}
              title={waveScene?.title ?? "目撃報告の波を見る"}
              className={`${styles.kennethChartTitlePanel} ${styles.kennethSceneTopPanel}`}
            >
              <p>{waveScene?.body}</p>
            </GlassPanel>
            {waveInfoOpen ? (
              <div className={styles.kennethInfoSheet} data-swipe-ignore="true">
                <button type="button" onClick={() => setWaveInfoOpen(false)}>
                  閉じる
                </button>
                <h2>データの説明</h2>
                <p>
                  データは米空軍の UFO Fact Sheet にある `TOTAL UFO SIGHTINGS, 1947-1969`
                  から、アーノルド事件後の初期6年を抜粋したもの。棒は各年の総報告数、白い小点は同表の `UNIDENTIFIED`
                  数を示す。1952年は Project Blue Book の開始、Washington D.C. UFO事件、新聞報道の集中、空軍への報告集中が重なった年であり、このグラフは現象そのものの発生数ではなく、米空軍に記録された報告数の波を読むための資料である。
                </p>
                <p>Source: U.S. Air Force UFO Fact Sheet / National Archives</p>
              </div>
            ) : null}
          </section>
        ),
      },
      {
        id: "full-video",
        label: "06",
        stage: (
          <section className={`${styles.kennethVerticalSlide} ${videoPlaying ? styles.kennethVideoPlaying : ""}`}>
            <video
              ref={videoRef}
              className={styles.kennethFullscreenVideo}
              controls={videoPlaying}
              onPause={() => setVideoPlaying(false)}
              onPlay={() => setVideoPlaying(true)}
              playsInline
              poster={record.videoPoster}
              preload="metadata"
              data-swipe-ignore="true"
            >
              {record.heroVideoMp4 ? <source src={record.heroVideoMp4} type="video/mp4" /> : null}
              <source src={record.heroVideo} type="video/quicktime" />
            </video>
            {!videoPlaying ? (
              <>
                <div className={styles.kennethDarkScrim} />
                <button className={styles.kennethPlayButton} data-swipe-ignore="true" type="button" onClick={playFullVideo}>
                  <span>再生</span>
                </button>
                <GlassPanel eyebrow="06 Full Video" title="動画を資料として見る" className={styles.kennethBottomPanel}>
                  <p>ボタンを押して動画を再生</p>
                </GlassPanel>
              </>
            ) : null}
          </section>
        ),
      },
      {
        id: "model",
        label: "07",
        stage: (
          <section className={styles.kennethVerticalSlide}>
            <div className={styles.kennethMobileInspectStage} data-swipe-ignore="true">
              <ClarkModelViewer
                activeSceneIndex={4}
                interactionMode="inspect"
                label={record.displayTitleJa}
                modelPath={record.modelPath}
                presentationPreset="museum"
                variant="stage"
              />
            </div>
            <GlassPanel eyebrow="07 3D Exhibit" title="展示室の中心で観察する" className={`${styles.kennethBottomPanel} ${styles.kennethModelPanel}`}>
              <p>ここだけ3D操作ができる。ドラッグで角度を変え、形の記憶がどのように作られるかを見る。</p>
            </GlassPanel>
          </section>
        ),
      },
      {
        id: "trivia",
        label: "08",
        stage: (
          <section className={styles.kennethVerticalSlide}>
            <div
              className={styles.kennethTriviaCarousel}
              data-swipe-ignore="true"
              onPointerDown={handleTriviaPointerDown}
              onPointerUp={handleTriviaPointerUp}
              onTouchCancel={handleTriviaTouchCancel}
              onTouchEnd={handleTriviaTouchEnd}
              onTouchStart={handleTriviaTouchStart}
            >
              <button aria-label="前のトリビア" type="button" onClick={() => changeTrivia(-1)} disabled={activeTriviaIndex === 0}>
                ←
              </button>
              <article
                className={styles.kennethTriviaCard}
                key={activeTrivia.title}
                style={{ "--trivia-bg": `url(${activeTrivia.imageSrc})` } as CSSProperties}
              >
                <span>
                  {String(activeTriviaIndex + 1).padStart(2, "0")} / {String(kennethArnoldTriviaSnippets.length).padStart(2, "0")}
                </span>
                <h2>{activeTrivia.title}</h2>
                {activeTrivia.detailImageSrc ? (
                  <button
                    className={styles.kennethTriviaImageButton}
                    data-swipe-ignore="true"
                    type="button"
                    onClick={() => setActiveTriviaImage(activeTrivia)}
                  >
                    <img alt="" src={activeTrivia.detailImageSrc} />
                    <span>資料画像を見る</span>
                  </button>
                ) : null}
                <p>{activeTrivia.content}</p>
                <small>{activeTrivia.imageCredit}</small>
              </article>
              <button
                aria-label="次のトリビア"
                type="button"
                onClick={() => changeTrivia(1)}
                disabled={activeTriviaIndex === kennethArnoldTriviaSnippets.length - 1}
              >
                →
              </button>
              <div className={styles.kennethTriviaDots} aria-hidden="true">
                {kennethArnoldTriviaSnippets.map((snippet, index) => (
                  <span className={index === activeTriviaIndex ? styles.isActiveTriviaDot : ""} key={snippet.title} />
                ))}
              </div>
            </div>
            <GlassPanel eyebrow="08 Trivia" title="ケネス・アーノルドのトリビア" className={styles.kennethTriviaPanel}>
              <p>上のカードを左右にスワイプして読む。事件の周辺には、報道だけでは見えにくい人物像と初期UFO文化の断片が残っている。</p>
            </GlassPanel>
          </section>
        ),
      },
      {
        id: "return",
        label: "09",
        stage: (
          <section className={styles.kennethVerticalSlide}>
            <div className={styles.kennethReturnStage}>
              <span>Clark</span>
              <h1>Podcastで聴く</h1>
              <div className={styles.kennethPodcastLinks}>
                <a
                  href="https://open.spotify.com/episode/0ZOxNEYwo1jS8hUy9oc42u?si=KHK0hO7ATh6ydFzCfU3Wfg"
                  data-swipe-ignore="true"
                  rel="noreferrer"
                  target="_blank"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M7.5 9.6c3.4-1 6.7-.7 9.2.8" />
                    <path d="M8.2 12.2c2.7-.8 5.2-.5 7.2.6" />
                    <path d="M9 14.7c1.9-.5 3.7-.4 5.2.4" />
                  </svg>
                  Spotifyで聴く
                </a>
                <a
                  href="https://podcasts.apple.com/ch/podcast/6%E6%9C%8824%E6%97%A5%E3%81%AF-ufo%E3%81%AE%E6%97%A5-%E3%82%B1%E3%83%8D%E3%82%B9-%E3%82%A2%E3%83%BC%E3%83%8E%E3%83%AB%E3%83%89%E3%81%A8%E7%A9%BA%E9%A3%9B%E3%81%B6%E5%86%86%E7%9B%A4%E3%81%AE%E8%AA%95%E7%94%9F/id1896928404?i=1000773853578"
                  data-swipe-ignore="true"
                  rel="noreferrer"
                  target="_blank"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="10" r="2.2" />
                    <path d="M8.5 10a3.5 3.5 0 0 1 7 0" />
                    <path d="M10.2 14.6c.3 2.5.8 3.8 1.8 3.8s1.5-1.3 1.8-3.8" />
                  </svg>
                  Apple Podcastsで聴く
                </a>
                <a
                  aria-label="YouTubeで聴く"
                  href="https://youtu.be/ZUYALa8pP-0?si=iG_UN_gt08KZmDCG"
                  data-swipe-ignore="true"
                  rel="noreferrer"
                  target="_blank"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M4.8 7.4c.2-1 1-1.8 2-2 1.8-.4 5.2-.4 5.2-.4s3.4 0 5.2.4c1 .2 1.8 1 2 2 .3 1.7.3 4.6.3 4.6s0 2.9-.3 4.6c-.2 1-1 1.8-2 2-1.8.4-5.2.4-5.2.4s-3.4 0-5.2-.4c-1-.2-1.8-1-2-2-.3-1.7-.3-4.6-.3-4.6s0-2.9.3-4.6Z" />
                    <path d="m10.4 9 4.2 3-4.2 3V9Z" />
                  </svg>
                  YouTubeで聴く
                </a>
              </div>
              <Link className={styles.kennethReturnLink} href="/clark" data-swipe-ignore="true">
                Clark トップへ戻る
              </Link>
            </div>
          </section>
        ),
      },
    ],
    [activeTrivia, activeTriviaIndex, motionScene, record, reportScene, videoPlaying, waveInfoOpen, waveScene],
  );

  const activeStep = steps[activeStepIndex];
  const progress = ((activeStepIndex + 1) / steps.length) * 100;

  const changeStep = (direction: 1 | -1, throttle = false) => {
    const now = Date.now();
    if (throttle && now - lastStepChangeRef.current < 650) {
      return;
    }

    lastStepChangeRef.current = now;
    setActiveStepIndex((index) => Math.max(0, Math.min(steps.length - 1, index + direction)));
  };

  const goNext = (throttle = false) => changeStep(1, throttle);
  const goPrevious = (throttle = false) => changeStep(-1, throttle);

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") {
      pointerStartRef.current = null;
      return;
    }

    if (shouldIgnoreSwipe(event.target)) {
      pointerStartRef.current = null;
      return;
    }

    pointerStartRef.current = { x: event.clientX, y: event.clientY, time: Date.now() };
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") {
      pointerStartRef.current = null;
      return;
    }

    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start || shouldIgnoreSwipe(event.target)) {
      return;
    }

    const direction = getVerticalSwipeDirection(start, event.clientX, event.clientY);
    if (!direction) {
      return;
    }

    if (direction === 1) {
      goNext();
      return;
    }

    goPrevious();
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    if (shouldIgnoreSwipe(event.target)) {
      touchStartRef.current = null;
      return;
    }

    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || shouldIgnoreSwipe(event.target)) {
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }

    const direction = getVerticalSwipeDirection(start, touch.clientX, touch.clientY);
    if (!direction) {
      return;
    }

    if (direction === 1) {
      goNext();
      return;
    }

    goPrevious();
  };

  const handleTouchCancel = () => {
    touchStartRef.current = null;
  };

  const handleWheel = (event: WheelEvent<HTMLElement>) => {
    if (shouldIgnoreSwipe(event.target)) {
      return;
    }

    if (Math.abs(event.deltaY) < 24 || Math.abs(event.deltaY) < Math.abs(event.deltaX) * 1.1) {
      return;
    }

    event.preventDefault();
    if (event.deltaY > 0) {
      goNext(true);
      return;
    }

    goPrevious(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (shouldIgnoreSwipe(event.target)) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      goNext();
      return;
    }

    if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      goPrevious();
    }
  };

  return (
    <main
      ref={shellRef}
      className={styles.kennethMobileShell}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onTouchCancel={handleTouchCancel}
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onWheel={handleWheel}
    >
      <header className={styles.kennethMobileTopBar}>
        <Link href="/clark" data-swipe-ignore="true">
          Clark トップへ
        </Link>
        <div>
          <span>{activeStep.label}</span>
          <strong>
            {String(activeStepIndex + 1).padStart(2, "0")}/{String(steps.length).padStart(2, "0")}
          </strong>
        </div>
      </header>
      <div className={styles.kennethMobileProgress} aria-hidden="true">
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
      {!videoPlaying ? (
        <div className={`${styles.kennethInputHint} ${showInputHintText ? styles.isShowingHintText : ""}`} aria-hidden="true">
          <span>上へスワイプ / ホイールで進む</span>
        </div>
      ) : null}
      <div className={styles.kennethVerticalTrack} key={activeStep.id}>
        {activeStep.stage}
      </div>
      {activeTriviaImage?.detailImageSrc ? (
        <div
          aria-modal="true"
          className={styles.kennethTriviaLightbox}
          data-swipe-ignore="true"
          role="dialog"
          onClick={() => setActiveTriviaImage(null)}
        >
          <div className={styles.kennethTriviaLightboxPanel} onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setActiveTriviaImage(null)}>
              閉じる
            </button>
            <img alt={activeTriviaImage.detailImageAlt ?? activeTriviaImage.title} src={activeTriviaImage.detailImageSrc} />
            <p>{activeTriviaImage.detailImageCaption}</p>
          </div>
        </div>
      ) : null}
    </main>
  );
}
