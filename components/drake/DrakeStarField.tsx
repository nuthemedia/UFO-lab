"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import styles from "./DrakeApp.module.css";

type StarFieldSignals = {
  planetSignal: number;
  lifeSignal: number;
  intelligenceSignal: number;
  civilizationSignal: number;
  visitSignal: number;
  evidenceSignal: number;
};

type DrakeStarFieldProps = StarFieldSignals & {
  mode?: "ambient" | "interactive" | "result";
};

type StarData = {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  seeds: Float32Array;
  lifeScores: Float32Array;
  intelligenceScores: Float32Array;
  civilizationScores: Float32Array;
  survivalScores: Float32Array;
  visitScores: Float32Array;
};

const STAR_COUNT = 3600;
const WHITE = new THREE.Color("#dce8ff");
const LIFE = new THREE.Color("#61f0a7");
const INTELLIGENCE = new THREE.Color("#74b8ff");
const CIVILIZATION = new THREE.Color("#ffd978");
const VISIT = new THREE.Color("#fff7e8");
const EVIDENCE = new THREE.Color("#ff8d78");

function makeSeededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function createStars(): StarData {
  const random = makeSeededRandom(1977);
  const positions = new Float32Array(STAR_COUNT * 3);
  const colors = new Float32Array(STAR_COUNT * 3);
  const sizes = new Float32Array(STAR_COUNT);
  const seeds = new Float32Array(STAR_COUNT);
  const lifeScores = new Float32Array(STAR_COUNT);
  const intelligenceScores = new Float32Array(STAR_COUNT);
  const civilizationScores = new Float32Array(STAR_COUNT);
  const survivalScores = new Float32Array(STAR_COUNT);
  const visitScores = new Float32Array(STAR_COUNT);

  for (let index = 0; index < STAR_COUNT; index += 1) {
    const radius = Math.pow(random(), 0.7) * 7.8;
    const angle = random() * Math.PI * 2;
    const depth = (random() - 0.5) * 3.8;
    const armWave = Math.sin(angle * 2.15 + radius * 0.55) * 0.54;
    const x = Math.cos(angle + armWave * 0.08) * radius;
    const y = (random() - 0.5) * 3.8 + Math.sin(radius + angle) * 0.16;
    const z = Math.sin(angle) * radius * 0.38 + depth;
    const colorOffset = index * 3;

    positions[colorOffset] = x;
    positions[colorOffset + 1] = y;
    positions[colorOffset + 2] = z;
    colors[colorOffset] = WHITE.r;
    colors[colorOffset + 1] = WHITE.g;
    colors[colorOffset + 2] = WHITE.b;
    sizes[index] = 0.028 + random() * 0.06;
    seeds[index] = random();
    lifeScores[index] = random();
    intelligenceScores[index] = random();
    civilizationScores[index] = random();
    survivalScores[index] = random();
    visitScores[index] = random();
  }

  return {
    positions,
    colors,
    sizes,
    seeds,
    lifeScores,
    intelligenceScores,
    civilizationScores,
    survivalScores,
    visitScores,
  };
}

function blendStarColor(target: THREE.Color, source: THREE.Color, amount: number) {
  target.r += (source.r - target.r) * amount;
  target.g += (source.g - target.g) * amount;
  target.b += (source.b - target.b) * amount;
}

function StarPoints({
  planetSignal,
  lifeSignal,
  intelligenceSignal,
  civilizationSignal,
  visitSignal,
  evidenceSignal,
  mode = "interactive",
}: DrakeStarFieldProps) {
  const pointsRef = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const reduceMotionRef = useRef(false);
  const previousModeRef = useRef(mode);
  const modeStartTimeRef = useRef(0);
  const stars = useMemo(() => createStars(), []);
  const baseSizes = useMemo(() => new Float32Array(stars.sizes), [stars]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        opacity: 0.78,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          attribute float size;
          varying vec3 vColor;

          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (900.0 / max(2.0, -mvPosition.z));
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;

          void main() {
            vec2 center = gl_PointCoord - vec2(0.5);
            float distanceFromCenter = length(center);
            if (distanceFromCenter > 0.5) {
              discard;
            }
            float alpha = smoothstep(0.5, 0.08, distanceFromCenter);
            gl_FragColor = vec4(vColor, alpha);
          }
        `,
        vertexColors: true,
      }),
    [mode],
  );

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => {
      material.dispose();
    };
  }, [material]);

  useFrame(({ clock }) => {
    const geometry = geometryRef.current;
    const points = pointsRef.current;
    if (!geometry || !points) {
      return;
    }

    const rawElapsed = clock.elapsedTime;
    if (previousModeRef.current !== mode) {
      previousModeRef.current = mode;
      modeStartTimeRef.current = rawElapsed;
    }

    const elapsed = reduceMotionRef.current ? 1.5 : rawElapsed;
    const modeElapsed = reduceMotionRef.current ? 0 : rawElapsed - modeStartTimeRef.current;
    const colorAttribute = geometry.getAttribute("color") as THREE.BufferAttribute;
    const sizeAttribute = geometry.getAttribute("size") as THREE.BufferAttribute | undefined;
    const colors = colorAttribute.array as Float32Array;
    const sizes = sizeAttribute?.array as Float32Array | undefined;
    const target = new THREE.Color();
    const ambientLife = mode === "ambient" ? 0.26 : lifeSignal;
    const ambientIntelligence = mode === "ambient" ? 0.12 : mode === "result" ? Math.max(intelligenceSignal, 0.14) : intelligenceSignal;
    const ambientCivilization = mode === "ambient" ? 0.07 : mode === "result" ? Math.max(civilizationSignal, 0.24) : civilizationSignal;
    const ambientVisit = mode === "ambient" ? 0.025 : mode === "result" ? Math.max(visitSignal, 0.75) : visitSignal;
    const ambientEvidence = mode === "result" ? Math.max(evidenceSignal, 0.55) : evidenceSignal;
    const ambientPlanet = mode === "ambient" ? 0.58 : planetSignal;
    const focus = {
      civilizationCount: 0,
      civilizationX: 0,
      civilizationY: 0,
      evidenceCount: 0,
      evidenceX: 0,
      evidenceY: 0,
      visitCount: 0,
      visitX: 0,
      visitY: 0,
    };

    for (let index = 0; index < STAR_COUNT; index += 1) {
      const offset = index * 3;
      const twinkle =
        reduceMotionRef.current
          ? 0.9
          : mode === "result"
            ? 0.74 + Math.sin(elapsed * 1.12 + stars.seeds[index] * 12) * 0.26
            : 0.78 + Math.sin(elapsed * 0.95 + stars.seeds[index] * 12) * 0.22;
      const planetOn = stars.lifeScores[index] < ambientPlanet;
      const lifeOn = stars.lifeScores[index] < ambientLife;
      const intelligenceOn = lifeOn && stars.intelligenceScores[index] < ambientIntelligence;
      const civilizationOn = intelligenceOn && stars.civilizationScores[index] < ambientCivilization;
      const visitOn = civilizationOn && stars.visitScores[index] < ambientVisit;
      const evidenceOn = visitOn && stars.survivalScores[index] < ambientEvidence;
      const x = stars.positions[offset];
      const y = stars.positions[offset + 1];
      target.copy(WHITE);

      if (planetOn) {
        blendStarColor(target, WHITE, 0.36);
      }
      if (lifeOn) {
        blendStarColor(target, LIFE, 0.82);
      }
      if (intelligenceOn) {
        blendStarColor(target, INTELLIGENCE, 0.76);
      }
      if (civilizationOn) {
        blendStarColor(target, CIVILIZATION, 0.78);
        focus.civilizationCount += 1;
        focus.civilizationX += x;
        focus.civilizationY += y;
      }
      if (visitOn) {
        blendStarColor(target, VISIT, 0.92);
        blendStarColor(target, EVIDENCE, mode === "interactive" ? 0.42 : 0.56);
        focus.visitCount += 1;
        focus.visitX += x;
        focus.visitY += y;
      }
      if (evidenceOn) {
        blendStarColor(target, EVIDENCE, mode === "result" ? 0.88 : 0.72);
        focus.evidenceCount += 1;
        focus.evidenceX += x;
        focus.evidenceY += y;
      }

      const power =
        (evidenceOn && mode === "result"
          ? 2.82
          : visitOn
            ? mode === "result"
              ? 2.48
              : 2.22
            : civilizationOn
              ? 1.48
              : intelligenceOn
                ? 1.22
                : lifeOn
                  ? 1.05
                  : planetOn
                    ? 0.96
                    : 0.66) * twinkle;
      colors[offset] += (target.r * power - colors[offset]) * 0.055;
      colors[offset + 1] += (target.g * power - colors[offset + 1]) * 0.055;
      colors[offset + 2] += (target.b * power - colors[offset + 2]) * 0.055;
      if (sizes) {
        const targetSize =
          baseSizes[index] *
          (evidenceOn && mode === "result"
            ? 3.08
            : visitOn
              ? mode === "result"
                ? 2.56
                : 2.34
              : civilizationOn
                ? 1.55
                : intelligenceOn
                  ? 1.24
                  : lifeOn
                    ? 1.12
                    : planetOn
                      ? 1.05
                      : 0.86);
        sizes[index] += (targetSize - sizes[index]) * 0.08;
      }
    }

    colorAttribute.needsUpdate = true;
    if (sizeAttribute) {
      sizeAttribute.needsUpdate = true;
    }

    if (!reduceMotionRef.current) {
      if (mode === "ambient") {
        const loop = ((elapsed % 26) / 26) * Math.PI * 2;
        points.rotation.y = Math.sin(loop) * 0.038;
        points.rotation.x = Math.cos(loop) * 0.018;
        points.position.x += (0 - points.position.x) * 0.12;
        points.position.y += (0 - points.position.y) * 0.12;
        points.scale.setScalar(0.985 + Math.sin(loop) * 0.026);
      } else if (mode === "result") {
        const progress = Math.min(1, modeElapsed / 7.5);
        const eased = 1 - Math.pow(1 - progress, 3);
        const targetFocus =
          focus.evidenceCount >= 3
            ? { count: focus.evidenceCount, x: focus.evidenceX, y: focus.evidenceY }
            : focus.visitCount >= 3
              ? { count: focus.visitCount, x: focus.visitX, y: focus.visitY }
              : focus.civilizationCount >= 3
                ? { count: focus.civilizationCount, x: focus.civilizationX, y: focus.civilizationY }
                : null;
        const focusX = targetFocus ? targetFocus.x / targetFocus.count : 0;
        const focusY = targetFocus ? targetFocus.y / targetFocus.count : 0;
        const drift = 0.08 + Math.sin(elapsed * 0.32) * 0.012;
        const zoom = 1.02 + eased * 0.32 + Math.sin(elapsed * 0.38) * 0.01;

        points.rotation.y = 0.025 + eased * 0.045 + Math.sin(elapsed * 0.15) * 0.01;
        points.rotation.x = -0.015 + eased * 0.02 + Math.sin(elapsed * 0.12) * 0.008;
        points.position.x += (THREE.MathUtils.clamp(-focusX * 0.34, -2.25, 2.25) * eased - points.position.x) * drift;
        points.position.y += (THREE.MathUtils.clamp(-focusY * 0.34, -1.25, 1.25) * eased - points.position.y) * drift;
        points.scale.setScalar(zoom);
      } else {
        points.rotation.y = Math.sin(elapsed * 0.024) * 0.026;
        points.rotation.x = Math.sin(elapsed * 0.018) * 0.012;
        points.position.x += (0 - points.position.x) * 0.12;
        points.position.y += (0 - points.position.y) * 0.12;
        points.scale.setScalar(1);
      }
    } else {
      points.position.x += (0 - points.position.x) * 0.12;
      points.position.y += (0 - points.position.y) * 0.12;
    }
  });

  return (
    <points ref={pointsRef} material={material}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute attach="attributes-position" args={[stars.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[stars.colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[stars.sizes, 1]} />
      </bufferGeometry>
    </points>
  );
}

export function DrakeStarField(props: DrakeStarFieldProps) {
  const [canUseWebgl, setCanUseWebgl] = useState(true);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    setCanUseWebgl(Boolean(context));
  }, []);

  if (!canUseWebgl) {
    return <div className={styles.starFallback} aria-label="静的な星空背景" />;
  }

  return (
    <div className={styles.starField} aria-label="あなたの前提に連動する星空">
      <Canvas
        camera={{ position: [0, 0, 8.8], fov: 52 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#02040d"]} />
        <fog attach="fog" args={["#02040d", 7, 17]} />
        <StarPoints {...props} />
      </Canvas>
    </div>
  );
}
