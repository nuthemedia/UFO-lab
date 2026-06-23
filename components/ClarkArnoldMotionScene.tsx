"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "./clark.module.css";

type FlightMark = {
  mesh: THREE.Mesh;
  baseX: number;
  baseY: number;
  baseZ: number;
  phase: number;
};

function makeSaucerMark() {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    -0.42, 0, 0,
    0, 0.11, -0.16,
    0.42, 0, 0,
    0, -0.08, 0.16,
  ]);
  const indices = [0, 1, 2, 0, 2, 3];
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return new THREE.Mesh(
    geometry,
    new THREE.MeshPhysicalMaterial({
      color: "#eef5ff",
      metalness: 0.46,
      roughness: 0.34,
      side: THREE.DoubleSide,
    }),
  );
}

function makePath(points: THREE.Vector3[]) {
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineDashedMaterial({
      color: "#9fc4ff",
      dashSize: 0.18,
      gapSize: 0.16,
      opacity: 0.48,
      transparent: true,
    }),
  );
}

export function ClarkArnoldMotionScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog("#05070d", 8, 17);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 1.55, 7.2);
    camera.lookAt(0, 0.35, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.domElement.style.pointerEvents = "none";
    renderer.domElement.style.touchAction = "pan-y";
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight("#dbe8ff", 1.25));

    const sun = new THREE.DirectionalLight("#ffffff", 2.2);
    sun.position.set(-3.5, 4.4, 4);
    scene.add(sun);

    const rim = new THREE.DirectionalLight("#8fb8ff", 1.2);
    rim.position.set(4, 2.2, -2);
    scene.add(rim);

    const ridgeMaterial = new THREE.MeshBasicMaterial({ color: "#101b2d", transparent: true, opacity: 0.92 });
    const farRidge = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.1), ridgeMaterial);
    farRidge.position.set(0, -1.35, -3.2);
    farRidge.rotation.x = -0.12;
    scene.add(farRidge);

    const nearRidge = new THREE.Mesh(
      new THREE.PlaneGeometry(9.5, 1.7),
      new THREE.MeshBasicMaterial({ color: "#16253b", transparent: true, opacity: 0.78 }),
    );
    nearRidge.position.set(0, -1.58, -1.1);
    nearRidge.rotation.x = -0.18;
    scene.add(nearRidge);

    const pathPoints = Array.from({ length: 52 }, (_, index) => {
      const t = index / 51;
      const x = -3.5 + t * 7;
      const y = 0.78 + Math.sin(t * Math.PI * 6) * 0.16;
      const z = -1.8 + t * 0.55;
      return new THREE.Vector3(x, y, z);
    });
    const path = makePath(pathPoints);
    path.computeLineDistances();
    scene.add(path);

    const aircraft = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.48, 3),
      new THREE.MeshBasicMaterial({ color: "#8fa4c4", transparent: true, opacity: 0.72 }),
    );
    aircraft.position.set(-3.2, 0.05, 1.8);
    aircraft.rotation.set(0, 0, -Math.PI / 2);
    scene.add(aircraft);

    const marks: FlightMark[] = Array.from({ length: 9 }, (_, index) => {
      const mark = makeSaucerMark();
      const t = index / 8;
      const baseX = -2.7 + t * 5.4;
      const baseY = 0.72 + Math.sin(t * Math.PI * 3) * 0.12;
      const baseZ = -1.15 + t * 0.42;
      mark.position.set(baseX, baseY, baseZ);
      mark.rotation.set(-0.2, 0.3, -0.12);
      mark.scale.setScalar(0.62 + t * 0.12);
      scene.add(mark);
      return { mesh: mark, baseX, baseY, baseZ, phase: index * 0.58 };
    });

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(260, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    let frameId = 0;
    const start = performance.now();

    const render = () => {
      frameId = window.requestAnimationFrame(render);
      const elapsed = reduceMotion ? 2.4 : (performance.now() - start) / 1000;
      marks.forEach((mark, index) => {
        const wave = Math.sin(elapsed * 3.2 + mark.phase) * 0.18;
        const drift = reduceMotion ? 0 : ((elapsed * 0.16 + index * 0.015) % 0.28);
        mark.mesh.position.set(mark.baseX + drift, mark.baseY + wave, mark.baseZ);
        mark.mesh.rotation.z = -0.18 + Math.sin(elapsed * 2.6 + mark.phase) * 0.12;
        mark.mesh.rotation.y = 0.25 + Math.sin(elapsed * 1.8 + mark.phase) * 0.08;
      });
      aircraft.position.y = 0.05 + Math.sin(elapsed * 1.2) * 0.025;
      renderer.render(scene, camera);
    };
    render();

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      resizeObserver.disconnect();
      path.geometry.dispose();
      path.material.dispose();
      farRidge.geometry.dispose();
      farRidge.material.dispose();
      nearRidge.geometry.dispose();
      nearRidge.material.dispose();
      aircraft.geometry.dispose();
      aircraft.material.dispose();
      marks.forEach((mark) => {
        mark.mesh.geometry.dispose();
        if (Array.isArray(mark.mesh.material)) {
          mark.mesh.material.forEach((material) => material.dispose());
        } else {
          mark.mesh.material.dispose();
        }
      });
      renderer.dispose();
      mount.innerHTML = "";
    };
  }, []);

  return (
    <div className={styles.arnoldMotionScene}>
      <div className={styles.arnoldMotionCanvas} ref={mountRef} aria-label="ケネス・アーノルド証言の飛行運動再現" />
      <div className={styles.arnoldMotionOverlay}>
        <span>Three.js motion study</span>
        <strong>隊列が山稜に沿って跳ねるように進む</strong>
      </div>
    </div>
  );
}
