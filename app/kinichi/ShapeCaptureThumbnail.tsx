"use client";

import type { ProceduralType } from "@/data/kinichi/catalog";
import { ShapeSilhouette } from "./KinichiViewer";
import styles from "./kinichi.module.css";

function getCaptureShape(type: ProceduralType | string) {
  if (type === "sphere" || type === "egg") {
    return "orb";
  }

  if (type === "cigar" || type === "cylinder" || type === "tic_tac") {
    return "capsule";
  }

  if (type === "triangle" || type === "delta") {
    return "triangle";
  }

  if (type === "boomerang" || type === "wide_v") {
    return "v";
  }

  if (type === "diamond" || type === "cone" || type === "bell_acorn" || type === "crescent") {
    return type;
  }

  return "saucer";
}

export function ShapeCaptureThumbnail({ label, type }: { label: string; type: ProceduralType | string }) {
  return (
    <div className={styles.captureThumbnail} data-shape={getCaptureShape(type)} aria-hidden="true">
      <span className={styles.captureGlow} />
      <ShapeSilhouette className={styles.captureSilhouette} type={type} />
      <span className={styles.captureShadow} />
      <span className={styles.captureLabel}>{label}</span>
    </div>
  );
}
