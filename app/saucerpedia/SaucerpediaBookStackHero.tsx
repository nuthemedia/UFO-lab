"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import { CanvasTexture, Group, LinearFilter, MathUtils, MeshBasicMaterial } from "three";
import styles from "./saucerpedia.module.css";

export type SaucerpediaBookStackItem = {
  body: string;
  count: string;
  href: string;
  kicker: string;
  title: string;
};

type BookPalette = {
  accent: string;
  cover: string;
  font: string;
  ink: string;
  motif: "index" | "portrait" | "case" | "timeline" | "observer" | "stamp" | "archive" | "wave";
  page: string;
  pageDark: string;
  shadow: string;
  spine: string;
};

const bookPalettes: BookPalette[] = [
  { accent: "#9ed6d2", cover: "#4c9a9b", font: "900 86px system-ui, sans-serif", ink: "#123f42", motif: "index", spine: "#2f686b", page: "#efe5d2", pageDark: "#d5c8ad", shadow: "#25484a" },
  { accent: "#aeb6ea", cover: "#5964a3", font: "800 80px serif", ink: "#171f55", motif: "portrait", spine: "#333d73", page: "#ece4d5", pageDark: "#d1c5ad", shadow: "#293053" },
  { accent: "#f1cf76", cover: "#c99635", font: "950 78px Arial Narrow, system-ui, sans-serif", ink: "#503710", motif: "case", spine: "#8d661f", page: "#f0e4c9", pageDark: "#d4c49d", shadow: "#5d4417" },
  { accent: "#abc3ef", cover: "#4d75bb", font: "700 76px system-ui, sans-serif", ink: "#183c78", motif: "timeline", spine: "#2e4e86", page: "#ede6d6", pageDark: "#d3c7ad", shadow: "#253a62" },
  { accent: "#b8d7a6", cover: "#5d9360", font: "850 78px system-ui, sans-serif", ink: "#234f28", motif: "observer", spine: "#37643a", page: "#eee5d2", pageDark: "#d1c5a7", shadow: "#263f28" },
  { accent: "#e7a7ad", cover: "#b36573", font: "950 76px Impact, system-ui, sans-serif", ink: "#672c38", motif: "stamp", spine: "#7a3b48", page: "#efe3d7", pageDark: "#d2c0b2", shadow: "#572c35" },
  { accent: "#a6d4e1", cover: "#4e94b0", font: "800 74px ui-monospace, SFMono-Regular, Menlo, monospace", ink: "#1d5165", motif: "archive", spine: "#2f6379", page: "#ede7d8", pageDark: "#d2c7ae", shadow: "#264858" },
  { accent: "#ceb0dd", cover: "#81609c", font: "700 78px serif", ink: "#4a285f", motif: "wave", spine: "#533867", page: "#eee4d6", pageDark: "#d2c4af", shadow: "#3c294d" },
];

const ease = (value: number) => value * value * (3 - 2 * value);

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const units = Array.from(text);
  const lines: string[] = [];
  let line = "";

  units.forEach((unit) => {
    const testLine = `${line}${unit}`;
    if (context.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = unit;
    } else {
      line = testLine;
    }
  });

  if (line) {
    lines.push(line);
  }

  return lines.slice(0, 4);
}

function drawBookMotif(context: CanvasRenderingContext2D, palette: BookPalette, width: number, height: number) {
  context.save();
  context.strokeStyle = palette.accent;
  context.fillStyle = palette.accent;
  context.globalAlpha = 0.55;
  context.lineWidth = 8;

  if (palette.motif === "index") {
    for (let x = 130; x < width - 120; x += 120) {
      for (let y = 220; y < height - 150; y += 130) {
        context.strokeRect(x, y, 70, 82);
      }
    }
  } else if (palette.motif === "portrait") {
    context.strokeRect(230, 265, width - 460, height - 480);
    context.beginPath();
    context.ellipse(width / 2, 455, 92, 118, 0, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.arc(width / 2, 690, 160, Math.PI, 0);
    context.stroke();
  } else if (palette.motif === "case") {
    for (let y = 250; y < height - 180; y += 92) {
      context.beginPath();
      context.moveTo(170, y);
      context.lineTo(width - 170, y + 24);
      context.stroke();
    }
  } else if (palette.motif === "timeline") {
    context.beginPath();
    context.moveTo(width / 2, 220);
    context.lineTo(width / 2, height - 180);
    context.stroke();
    for (let y = 300; y < height - 220; y += 130) {
      context.beginPath();
      context.arc(width / 2, y, 22, 0, Math.PI * 2);
      context.fill();
      context.moveTo(width / 2, y);
      context.lineTo(y % 260 === 0 ? 230 : width - 230, y + 50);
      context.stroke();
    }
  } else if (palette.motif === "observer") {
    for (let radius = 90; radius < 360; radius += 86) {
      context.beginPath();
      context.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
      context.stroke();
    }
    context.beginPath();
    context.moveTo(width / 2, 260);
    context.lineTo(width / 2, height - 250);
    context.moveTo(240, height / 2);
    context.lineTo(width - 240, height / 2);
    context.stroke();
  } else if (palette.motif === "stamp") {
    context.translate(width / 2, height / 2);
    context.rotate(-0.18);
    context.strokeRect(-210, -120, 420, 240);
    context.font = "900 92px Impact, system-ui, sans-serif";
    context.textAlign = "center";
    context.fillText("CHECK", 0, 32);
  } else if (palette.motif === "archive") {
    for (let y = 250; y < height - 180; y += 76) {
      context.fillRect(180, y, width - 360, 7);
    }
    context.strokeRect(155, 220, width - 310, height - 390);
  } else {
    context.beginPath();
    for (let x = 110; x < width - 100; x += 22) {
      const y = height / 2 + Math.sin(x / 54) * 92;
      if (x === 110) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.stroke();
  }

  context.restore();
}

function createCoverTexture(item: SaucerpediaBookStackItem, palette: BookPalette) {
  if (typeof document === "undefined") {
    return null;
  }

  const canvas = document.createElement("canvas");
  const width = 1024;
  const height = 1152;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  context.fillStyle = palette.cover;
  context.fillRect(0, 0, width, height);

  context.globalAlpha = 0.16;
  for (let y = 0; y < height; y += 11) {
    context.fillStyle = y % 22 === 0 ? "#ffffff" : "#000000";
    context.fillRect(0, y, width, 1);
  }
  context.globalAlpha = 0.18;
  for (let x = 0; x < width; x += 19) {
    context.fillStyle = "#ffffff";
    context.fillRect(x, 0, 1, height);
  }
  context.globalAlpha = 1;

  context.fillStyle = "rgba(255,255,255,0.22)";
  context.fillRect(70, 70, width - 140, height - 140);
  context.strokeStyle = palette.accent;
  context.lineWidth = 10;
  context.strokeRect(78, 78, width - 156, height - 156);

  drawBookMotif(context, palette, width, height);

  context.fillStyle = palette.ink;
  context.font = "900 34px system-ui, sans-serif";
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillText(item.kicker.toUpperCase(), 118, 118);

  context.font = palette.font;
  const titleLines = wrapText(context, item.title, width - 236);
  titleLines.forEach((line, lineIndex) => {
    context.fillText(line, 118, 270 + lineIndex * 98);
  });

  context.fillStyle = palette.accent;
  context.fillRect(118, height - 190, width - 236, 12);
  context.fillStyle = palette.ink;
  context.font = "800 34px system-ui, sans-serif";
  context.fillText(item.count, 118, height - 155);

  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function getScrollProgress(section: HTMLElement | null) {
  if (!section) {
    return 0;
  }

  const rect = section.getBoundingClientRect();
  const scrollable = Math.max(1, rect.height - window.innerHeight);
  return Math.max(0, Math.min(1, -rect.top / scrollable));
}

function BookObject({ index, item, palette, progressRef, reducedMotionRef }: {
  index: number;
  item: SaucerpediaBookStackItem;
  palette: BookPalette;
  progressRef: RefObject<number>;
  reducedMotionRef: RefObject<boolean>;
}) {
  const groupRef = useRef<Group>(null);
  const coverTexture = useMemo(() => createCoverTexture(item, palette), [item, palette]);
  const materials = useMemo(
    () => ({
      cover: new MeshBasicMaterial({ color: palette.cover }),
      coverFace: coverTexture
        ? new MeshBasicMaterial({ map: coverTexture })
        : new MeshBasicMaterial({ color: palette.cover }),
      coverBack: new MeshBasicMaterial({ color: palette.cover }),
      page: new MeshBasicMaterial({ color: palette.page }),
      pageDark: new MeshBasicMaterial({ color: palette.pageDark }),
      shadow: new MeshBasicMaterial({ color: palette.shadow, opacity: 0.18, transparent: true }),
      spine: new MeshBasicMaterial({ color: palette.spine }),
    }),
    [coverTexture, palette]
  );

  useFrame(() => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    if (reducedMotionRef.current) {
      const staticLayer = index;
      group.position.set(-0.016 * staticLayer, -0.16 + staticLayer * 0.18, 0.2 - staticLayer * 0.1);
      group.rotation.set(0.31 + staticLayer * 0.01, -0.14, -0.024);
      group.scale.setScalar(1.08 - staticLayer * 0.006);
      return;
    }

    const bookCount = bookPalettes.length;
    const scrollIndex = progressRef.current * (bookCount - 1);
    const rawLayer = index - scrollIndex;
    const layer = Math.max(-6, Math.min(2.2, rawLayer));
    const distance = Math.abs(layer);
    const nextAmount = Math.max(0, layer);
    const pastAmount = Math.max(0, -layer);
    const targetX = -0.016 * layer;
    const targetY = -0.16 + nextAmount * 0.18 + pastAmount * 0.14;
    const targetZ = 0.22 - distance * 0.1;
    const targetScale = 1.09 - Math.min(0.05, distance * 0.008);
    const targetRotateX = 0.31 + Math.max(-0.025, Math.min(0.035, layer * 0.012));
    const targetRotateY = -0.15 + Math.max(-0.014, Math.min(0.014, -layer * 0.004));
    const targetRotateZ = -0.024 + Math.max(-0.014, Math.min(0.012, layer * 0.004));

    const lerp = 0.12;
    group.position.x = MathUtils.lerp(group.position.x, targetX, lerp);
    group.position.y = MathUtils.lerp(group.position.y, targetY, lerp);
    group.position.z = MathUtils.lerp(group.position.z, targetZ, lerp);
    group.rotation.x = MathUtils.lerp(group.rotation.x, targetRotateX, lerp);
    group.rotation.y = MathUtils.lerp(group.rotation.y, targetRotateY, lerp);
    group.rotation.z = MathUtils.lerp(group.rotation.z, targetRotateZ, lerp);
    group.scale.setScalar(MathUtils.lerp(group.scale.x, targetScale, lerp));
  });

  return (
    <group ref={groupRef}>
      <mesh material={materials.shadow} position={[0.08, -1.55, -0.24]} rotation={[0, 0, -0.035]} scale={[1, 0.2, 1]}>
        <boxGeometry args={[3.02, 0.24, 0.05]} />
      </mesh>
      <mesh material={materials.pageDark} position={[0.1, -0.04, -0.16]}>
        <boxGeometry args={[2.56, 2.82, 0.34]} />
      </mesh>
      <mesh material={materials.page} position={[1.36, -0.04, -0.02]}>
        <boxGeometry args={[0.22, 2.78, 0.46]} />
      </mesh>
      <mesh material={materials.page} position={[0.08, -1.46, -0.02]}>
        <boxGeometry args={[2.68, 0.26, 0.46]} />
      </mesh>
      <mesh material={materials.page} position={[0.08, 1.38, -0.06]}>
        <boxGeometry args={[2.56, 0.18, 0.34]} />
      </mesh>
      <mesh material={materials.spine} position={[-1.35, -0.02, 0.01]}>
        <boxGeometry args={[0.34, 2.98, 0.48]} />
      </mesh>
      <mesh material={materials.coverBack} position={[0, 0, -0.32]}>
        <boxGeometry args={[2.7, 2.94, 0.08]} />
      </mesh>
      <mesh material={materials.cover} position={[-0.03, 0.02, 0.12]}>
        <boxGeometry args={[2.62, 2.86, 0.06]} />
      </mesh>
      <mesh material={materials.coverFace} position={[-0.03, 0.02, 0.154]}>
        <planeGeometry args={[2.58, 2.82]} />
      </mesh>
    </group>
  );
}

function BookStackScene({ items, progressRef, reducedMotionRef }: {
  items: SaucerpediaBookStackItem[];
  progressRef: RefObject<number>;
  reducedMotionRef: RefObject<boolean>;
}) {
  return (
    <>
      <ambientLight intensity={1.4} />
      <group position={[0, -0.34, 0]} rotation={[0.14, 0, 0]} scale={0.64}>
        {bookPalettes.map((palette, index) => (
          <BookObject
            index={index}
            item={items[index]}
            key={palette.cover}
            palette={palette}
            progressRef={progressRef}
            reducedMotionRef={reducedMotionRef}
          />
        ))}
      </group>
    </>
  );
}

export function SaucerpediaBookStackHero({ items }: { items: SaucerpediaBookStackItem[] }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isWebGlReady, setIsWebGlReady] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const hasWebGl = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
      setIsWebGlReady(hasWebGl);
    } catch {
      setIsWebGlReady(false);
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReducedMotion = () => {
      reducedMotionRef.current = media.matches;
    };
    const updateProgress = () => {
      const progress = getScrollProgress(sectionRef.current);
      progressRef.current = progress;
      setActiveIndex(Math.round(progress * (items.length - 1)));
    };

    updateReducedMotion();
    updateProgress();
    media.addEventListener("change", updateReducedMotion);
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      media.removeEventListener("change", updateReducedMotion);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [items.length]);

  const activeItem = items[Math.max(0, Math.min(items.length - 1, activeIndex))] ?? items[0];

  return (
    <section className={styles.bookStackHero} ref={sectionRef} aria-labelledby="saucerpedia-book-stack-title">
      <div className={styles.bookStackSticky}>
        <div className={styles.bookStackCopy}>
          <p className={styles.kicker}>UFO Encyclopedia</p>
          <h1 id="saucerpedia-book-stack-title">空飛ぶ円盤辞典</h1>
          <p className={styles.heroLead}>
            <span>UFOについて知っておきたいことを</span>
            <span>ジャンル別に調べられます</span>
          </p>
        </div>
        <div className={styles.bookStackCanvas} aria-hidden="true">
          {isWebGlReady ? (
            <Canvas
              camera={{ fov: 45, position: [0, -0.12, 6.9] }}
              dpr={[1, 1.5]}
              gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
              onCreated={({ gl }) => {
                gl.setClearColor(0x000000, 0);
              }}
            >
              <BookStackScene items={items} progressRef={progressRef} reducedMotionRef={reducedMotionRef} />
            </Canvas>
          ) : (
            <div className={styles.bookStackFallback}>
              {items.map((item, index) => (
                <span key={item.href} style={{ "--fallback-index": index } as CSSProperties} />
              ))}
            </div>
          )}
        </div>
        <div className={styles.bookStackActiveCard}>
          <span>{activeItem.kicker}</span>
          <strong>{activeItem.title}</strong>
          <p>{activeItem.body}</p>
          <Link href={activeItem.href}>{activeItem.title}へ</Link>
        </div>
      </div>
    </section>
  );
}
