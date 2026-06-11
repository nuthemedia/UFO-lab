"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type KeanTicTacModelViewerProps = {
  modelSrc: string;
  variant?: "compact" | "full";
};

export function KeanTicTacModelViewer({ modelSrc, variant = "full" }: KeanTicTacModelViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const uapPivotRef = useRef<THREE.Group | null>(null);
  const displayRootRef = useRef<THREE.Group | null>(null);
  const displayAutoRotatingRef = useRef(true);
  const userInteractingRef = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#cfe5ef");

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, variant === "compact" ? -0.5 : -0.72, variant === "compact" ? 5.7 : 6.9);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    mount.appendChild(renderer.domElement);

    const keyLight = new THREE.DirectionalLight("#fff9ee", 3.1);
    keyLight.position.set(3.2, 5, 4);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight("#bfefff", 2.1);
    rimLight.position.set(-4, 1.6, 2.4);
    scene.add(rimLight);
    const lowerRimLight = new THREE.DirectionalLight("#ffffff", 1.2);
    lowerRimLight.position.set(0, -3.5, 2);
    scene.add(lowerRimLight);
    scene.add(new THREE.AmbientLight("#eff8fb", 2.15));

    const skyCanvas = document.createElement("canvas");
    skyCanvas.width = 1024;
    skyCanvas.height = 640;
    const skyContext = skyCanvas.getContext("2d");
    if (skyContext) {
      const gradient = skyContext.createLinearGradient(0, 0, 0, skyCanvas.height);
      gradient.addColorStop(0, "#76c0de");
      gradient.addColorStop(0.38, "#d6eef5");
      gradient.addColorStop(0.49, "#74b7c2");
      gradient.addColorStop(0.52, "#23798a");
      gradient.addColorStop(0.72, "#2f91a0");
      gradient.addColorStop(1, "#0f6071");
      skyContext.fillStyle = gradient;
      skyContext.fillRect(0, 0, skyCanvas.width, skyCanvas.height);
      skyContext.fillStyle = "rgba(255,255,255,0.34)";
      skyContext.fillRect(0, skyCanvas.height * 0.485, skyCanvas.width, 4);
      skyContext.strokeStyle = "rgba(226,248,248,0.34)";
      skyContext.lineWidth = 2;
      for (let i = 0; i < 18; i += 1) {
        const y = skyCanvas.height * (0.58 + i * 0.018);
        skyContext.beginPath();
        skyContext.moveTo(0, y);
        skyContext.bezierCurveTo(220, y - 8, 390, y + 6, 590, y - 2);
        skyContext.bezierCurveTo(780, y - 10, 910, y + 5, skyCanvas.width, y - 3);
        skyContext.stroke();
      }
    }
    const skyTexture = new THREE.CanvasTexture(skyCanvas);
    skyTexture.colorSpace = THREE.SRGBColorSpace;
    scene.background = skyTexture;

    const whitewaterCanvas = document.createElement("canvas");
    whitewaterCanvas.width = 256;
    whitewaterCanvas.height = 128;
    const whitewaterContext = whitewaterCanvas.getContext("2d");
    if (whitewaterContext) {
      const gradient = whitewaterContext.createRadialGradient(118, 58, 4, 128, 64, 118);
      gradient.addColorStop(0, "rgba(242,255,252,0.86)");
      gradient.addColorStop(0.42, "rgba(133,211,214,0.38)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      whitewaterContext.fillStyle = gradient;
      whitewaterContext.fillRect(0, 0, whitewaterCanvas.width, whitewaterCanvas.height);
      whitewaterContext.strokeStyle = "rgba(235,255,252,0.54)";
      whitewaterContext.lineWidth = 2.4;
      for (let i = 0; i < 9; i += 1) {
        whitewaterContext.beginPath();
        const y = 36 + i * 6.4;
        whitewaterContext.moveTo(42, y);
        whitewaterContext.bezierCurveTo(78, y - 10, 106, y + 8, 142, y - 1);
        whitewaterContext.bezierCurveTo(176, y - 9, 196, y + 8, 218, y - 2);
        whitewaterContext.stroke();
      }
    }
    const whitewaterTexture = new THREE.CanvasTexture(whitewaterCanvas);
    whitewaterTexture.colorSpace = THREE.SRGBColorSpace;
    const whitewater = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: whitewaterTexture,
        opacity: 0.82,
        transparent: true,
        depthWrite: false,
      }),
    );
    whitewater.position.set(0, variant === "compact" ? -0.85 : -0.9, -1.12);
    whitewater.scale.set(variant === "compact" ? 3.2 : 3.8, variant === "compact" ? 1.25 : 1.48, 1);
    scene.add(whitewater);

    const grid = new THREE.GridHelper(9, 18, "#75c0c9", "#d7efed");
    grid.position.y = variant === "compact" ? -0.72 : -0.8;
    grid.visible = variant !== "compact";
    const gridMaterial = Array.isArray(grid.material) ? grid.material : [grid.material];
    gridMaterial.forEach((material) => {
      material.opacity = 0.18;
      material.transparent = true;
    });
    scene.add(grid);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableRotate = false;
    controls.enablePan = false;
    controls.minDistance = 2.4;
    controls.maxDistance = 8;
    controls.addEventListener("start", () => {
      userInteractingRef.current = true;
    });
    controls.addEventListener("end", () => {
      userInteractingRef.current = false;
    });
    controlsRef.current = controls;

    const displayRoot = new THREE.Group();
    scene.add(displayRoot);
    displayRootRef.current = displayRoot;
    displayAutoRotatingRef.current = !prefersReducedMotion;

    const uapPivot = new THREE.Group();
    uapPivot.rotation.set(0, 0, 0);
    displayRoot.add(uapPivot);
    uapPivotRef.current = uapPivot;
    const environment = new THREE.Group();
    displayRoot.add(environment);
    const animatedWaveMeshes: THREE.Mesh[] = [];
    const waveBaseScales = new WeakMap<THREE.Mesh, THREE.Vector3>();
    const pointerState = {
      active: false,
      pointerId: -1,
      x: 0,
      y: 0,
    };

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

    const handlePointerDown = (event: PointerEvent) => {
      displayAutoRotatingRef.current = false;
      pointerState.active = true;
      pointerState.pointerId = event.pointerId;
      pointerState.x = event.clientX;
      pointerState.y = event.clientY;
      userInteractingRef.current = true;
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!pointerState.active || event.pointerId !== pointerState.pointerId) {
        return;
      }

      const deltaX = event.clientX - pointerState.x;
      const deltaY = event.clientY - pointerState.y;
      pointerState.x = event.clientX;
      pointerState.y = event.clientY;
      uapPivot.rotation.y += deltaX * 0.008;
      uapPivot.rotation.x = clamp(uapPivot.rotation.x + deltaY * 0.006, -0.55, 0.55);
    };

    const stopPointerInteraction = (event: PointerEvent) => {
      if (event.pointerId !== pointerState.pointerId) {
        return;
      }

      pointerState.active = false;
      pointerState.pointerId = -1;
      userInteractingRef.current = false;
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerup", stopPointerInteraction);
    renderer.domElement.addEventListener("pointercancel", stopPointerInteraction);

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      const safeHeight = Math.max(variant === "compact" ? 220 : 260, height);
      camera.aspect = Math.max(1, width) / safeHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(Math.max(1, width), safeHeight, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const loader = new GLTFLoader();
    loader.load(
      modelSrc,
      (gltf) => {
        const model = gltf.scene;
        const meshes: THREE.Mesh[] = [];

        model.updateMatrixWorld(true);
        model.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) {
            return;
          }
          object.geometry.computeBoundingBox();
          meshes.push(object);
        });

        const bodyMesh = meshes.find((mesh) => mesh.name === "Object_3") ?? meshes[1] ?? null;
        const waveMesh = meshes.find((mesh) => mesh.name === "Object_2") ?? meshes.find((mesh) => mesh !== bodyMesh) ?? null;

        if (!bodyMesh) {
          setStatus("error");
          return;
        }

        const materialTexture = (mesh: THREE.Mesh) => {
          const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
            return material.map;
          }
          return null;
        };

        meshes.forEach((mesh) => {
          const map = materialTexture(mesh);
          const isBody = mesh === bodyMesh;
          mesh.material = isBody
            ? new THREE.MeshPhysicalMaterial({
                clearcoat: 1,
                clearcoatRoughness: 0.08,
                color: "#fff8e8",
                envMapIntensity: 0.95,
                map,
                metalness: 0.02,
                roughness: 0.24,
                wireframe: false,
              })
            : new THREE.MeshPhysicalMaterial({
                color: "#4ba9b6",
                depthWrite: false,
                emissive: "#117f91",
                emissiveIntensity: 0.15,
                map,
                metalness: 0,
                opacity: 0.38,
                roughness: 0.16,
                side: THREE.DoubleSide,
                transparent: true,
                transmission: 0.12,
                wireframe: false,
              });
          mesh.castShadow = isBody;
          mesh.receiveShadow = true;
          mesh.visible = true;
          if (isBody) {
            const edgeLines = new THREE.LineSegments(
              new THREE.EdgesGeometry(mesh.geometry, 28),
              new THREE.LineBasicMaterial({
                color: "#6f756b",
                opacity: 0.34,
                transparent: true,
              }),
            );
            edgeLines.renderOrder = 2;
            mesh.add(edgeLines);
          }
        });

        const bodyBox = new THREE.Box3().setFromObject(bodyMesh);
        const bodyCenter = bodyBox.getCenter(new THREE.Vector3());
        const bodySize = bodyBox.getSize(new THREE.Vector3());
        const bodyMaxAxis = Math.max(bodySize.x, bodySize.y, bodySize.z) || 1;
        const modelScale = (variant === "compact" ? 2.35 : 2.75) / bodyMaxAxis;

        const bodyLocalBox = bodyMesh.geometry.boundingBox ?? new THREE.Box3().setFromObject(bodyMesh);
        const bodyLocalSize = bodyLocalBox.getSize(new THREE.Vector3());
        const footRadius = Math.max(bodyLocalSize.y, bodyLocalSize.z) * 0.04;
        const footDrop = Math.max(bodyLocalSize.y, bodyLocalSize.z) * 0.18;
        const footSweep = bodyLocalSize.x * 0.085;
        const footMaterial = new THREE.MeshPhysicalMaterial({
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          color: "#eee4d0",
          metalness: 0.03,
          roughness: 0.26,
        });
        const footY = bodyLocalBox.min.y - footDrop * 0.36;
        const footZ = bodyLocalBox.min.z - footRadius * 0.62;
        [0.42, 0.64].forEach((ratio) => {
          const x = bodyLocalBox.min.x + bodyLocalSize.x * ratio;
          const footGroup = new THREE.Group();
          footGroup.position.set(x, footY, footZ);

          const vertical = new THREE.Mesh(new THREE.CapsuleGeometry(footRadius, footDrop, 8, 16), footMaterial);
          vertical.position.set(0, -footDrop * 0.2, 0);

          const sweep = new THREE.Mesh(new THREE.CapsuleGeometry(footRadius, footSweep, 8, 16), footMaterial);
          sweep.position.set(-footSweep * 0.38, -footDrop * 0.64, -bodyLocalSize.z * 0.05);
          sweep.rotation.z = Math.PI / 2;
          sweep.rotation.y = 0.16;

          footGroup.add(vertical);
          footGroup.add(sweep);
          bodyMesh.add(footGroup);
        });

        model.scale.setScalar(modelScale);
        model.position.copy(bodyCenter.clone().multiplyScalar(-modelScale));
        model.rotation.set(0, -0.34, 0.085);
        uapPivot.add(model);
        model.updateMatrixWorld(true);
        if (waveMesh) {
          environment.attach(waveMesh);
          animatedWaveMeshes.push(waveMesh);
          waveBaseScales.set(waveMesh, waveMesh.scale.clone());
        }
        controls.target.set(0, 0, 0);
        controls.update();
        setStatus("ready");
      },
      undefined,
      () => setStatus("error"),
    );

    let animationFrame = 0;
    const animate = () => {
      animationFrame = window.requestAnimationFrame(animate);
      const time = performance.now() * 0.001;
      if (!prefersReducedMotion) {
        if (displayAutoRotatingRef.current) {
          displayRoot.rotation.y += 0.0022;
        }
        animatedWaveMeshes.forEach((mesh, index) => {
          const baseScale = waveBaseScales.get(mesh);
          if (!baseScale) {
            return;
          }
          const pulse = 1 + Math.sin(time * 2.4 + index) * 0.035;
          mesh.scale.set(baseScale.x * pulse, baseScale.y * (1 + Math.cos(time * 2.1) * 0.026), baseScale.z * pulse);
          const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          if (material instanceof THREE.MeshPhysicalMaterial) {
            material.opacity = 0.32 + Math.sin(time * 2.2 + index) * 0.06;
          }
        });
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", stopPointerInteraction);
      renderer.domElement.removeEventListener("pointercancel", stopPointerInteraction);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      skyTexture.dispose();
      whitewaterTexture.dispose();
      whitewater.material.dispose();
      const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
      gridMaterials.forEach((material) => material.dispose());
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
        if (object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      uapPivotRef.current = null;
      displayRootRef.current = null;
    };
  }, [modelSrc, variant]);

  function resetView() {
    cameraRef.current?.position.set(0, variant === "compact" ? -0.5 : -0.72, variant === "compact" ? 5.7 : 6.9);
    uapPivotRef.current?.rotation.set(0, 0, 0);
    displayRootRef.current?.rotation.set(0, 0, 0);
    displayAutoRotatingRef.current = true;
    controlsRef.current?.reset();
  }

  return (
    <section className={`kean-model-viewer kean-model-viewer--${variant}`} aria-label="Tic Tac 3Dモデル">
      <div className="kean-model-canvas" ref={mountRef}>
        {status === "loading" ? <p>3Dモデルを読み込み中</p> : null}
        {status === "error" ? <p>3Dモデルを読み込めませんでした。</p> : null}
      </div>
      <div className="kean-model-controls">
        {variant === "compact" ? (
          <Link href="/kean/uap/tic-tac">Tic Tacページへ</Link>
        ) : (
          <>
            <span>ドラッグでUAPを回転、スクロールで拡大縮小</span>
            <button type="button" onClick={resetView}>
              表示をリセット
            </button>
          </>
        )}
      </div>
    </section>
  );
}
