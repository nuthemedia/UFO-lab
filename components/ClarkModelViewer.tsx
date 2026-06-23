"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import styles from "./clark.module.css";

function normalizeModel(model: THREE.Object3D, scaleTarget = 2.7) {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxAxis = Math.max(size.x, size.y, size.z) || 1;
  model.position.sub(center);
  model.scale.setScalar(scaleTarget / maxAxis);
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
      child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => material.dispose());
    }
  });
}

type ClarkModelViewerProps = {
  modelPath: string;
  label: string;
  variant?: "stage" | "inline";
  activeSceneIndex?: number;
  interactionMode?: "display" | "inspect";
  presentationPreset?: "museum";
};

const stageCameraPositions = [
  new THREE.Vector3(0, 0.5, 6.1),
  new THREE.Vector3(0.64, 0.46, 6.55),
  new THREE.Vector3(-0.68, 0.76, 6.25),
  new THREE.Vector3(0.1, 1, 6.7),
  new THREE.Vector3(0, 0.66, 5.95),
];

export function ClarkModelViewer({
  modelPath,
  label,
  variant = "inline",
  activeSceneIndex = 0,
  interactionMode = "inspect",
}: ClarkModelViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneIndexRef = useRef(activeSceneIndex);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    sceneIndexRef.current = activeSceneIndex;
  }, [activeSceneIndex]);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog("#05070d", 8, 14);

    const camera = new THREE.PerspectiveCamera(variant === "stage" ? 34 : 38, 1, 0.1, 100);
    camera.position.copy(variant === "stage" ? stageCameraPositions[0] : new THREE.Vector3(0, 0.8, 6));

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.domElement.style.touchAction = interactionMode === "display" ? "pan-y" : "none";
    renderer.domElement.style.pointerEvents = interactionMode === "display" ? "none" : "auto";
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight("#dfe8ff", 1.6));

    const keyLight = new THREE.DirectionalLight("#ffffff", variant === "stage" ? 2.7 : 2.4);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight("#b5d3ff", 1.6);
    fillLight.position.set(-4, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight("#ebf3ff", 1.25);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(3.8, 64),
      new THREE.ShadowMaterial({ color: "#000000", opacity: 0.32 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.6;
    scene.add(floor);

    const halo = new THREE.Mesh(
      new THREE.CircleGeometry(4.2, 64),
      new THREE.MeshBasicMaterial({ color: "#7ea4ff", opacity: 0.08, transparent: true }),
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = -1.59;
    scene.add(halo);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = interactionMode === "inspect";
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 3.2;
    controls.maxDistance = 8.2;
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = variant === "stage" ? 0.42 : 0.65;

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(280, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const loader = new GLTFLoader();
    let modelRoot: THREE.Object3D | null = null;
    let frameId = 0;

    loader.load(
      modelPath,
      (gltf) => {
        modelRoot = gltf.scene;
        normalizeModel(modelRoot, variant === "stage" ? (isMobile ? 2.35 : 2.75) : 2.7);
        modelRoot.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) {
            return;
          }

          const original = Array.isArray(object.material) ? object.material[0] : object.material;
          const map =
            original instanceof THREE.MeshStandardMaterial || original instanceof THREE.MeshPhysicalMaterial
              ? original.map
              : null;
          object.material = new THREE.MeshPhysicalMaterial({
            color: "#edf2ff",
            metalness: 0.64,
            roughness: 0.32,
            clearcoat: 0.12,
            map: map ?? null,
          });
        });
        scene.add(modelRoot);
        setStatus("ready");
      },
      undefined,
      () => {
        setStatus("error");
      },
    );

    const render = () => {
      frameId = window.requestAnimationFrame(render);
      if (!reduceMotion && variant === "stage") {
        const target = stageCameraPositions[Math.min(stageCameraPositions.length - 1, sceneIndexRef.current)];
        camera.position.lerp(target, 0.035);
        camera.lookAt(0, 0, 0);
        keyLight.intensity += (2.15 + sceneIndexRef.current * 0.18 - keyLight.intensity) * 0.04;
        if (modelRoot) {
          modelRoot.rotation.z += ((sceneIndexRef.current - 2) * 0.04 - modelRoot.rotation.z) * 0.04;
        }
      }
      controls.update();
      renderer.render(scene, camera);
    };
    render();

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (modelRoot) {
        disposeObject(modelRoot);
      }
      mount.innerHTML = "";
    };
  }, [interactionMode, modelPath, variant]);

  return (
    <div
      aria-label={`${label} 3Dモデル`}
      className={`${styles.modelCanvas}${variant === "stage" ? ` ${styles.modelCanvasStage}` : ""}`}
      ref={mountRef}
    >
      <div className={styles.modelStatus}>
        {status === "loading" ? "3Dモデルを読み込み中" : null}
        {status === "ready" ? (interactionMode === "display" ? "3D展示プレビュー" : "ドラッグ / ホイールで操作") : null}
        {status === "error" ? "3Dモデルを読み込めませんでした" : null}
      </div>
    </div>
  );
}
