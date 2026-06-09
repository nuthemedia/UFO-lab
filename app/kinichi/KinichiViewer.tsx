"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { ProceduralType, ViewerTarget } from "@/data/kinichi/catalog";
import styles from "./kinichi.module.css";

export function ShapeSilhouette({ type, className }: { type: ProceduralType | string; className?: string }) {
  if (type === "sphere" || type === "egg") {
    return (
      <svg className={className} viewBox="0 0 160 90" aria-hidden="true">
        <ellipse cx="80" cy="45" rx={type === "egg" ? 25 : 28} ry={type === "egg" ? 34 : 28} />
        <path d="M52 45h56" />
      </svg>
    );
  }

  if (type === "cigar" || type === "cylinder" || type === "tic_tac") {
    return (
      <svg className={className} viewBox="0 0 160 90" aria-hidden="true">
        <path d="M35 45c0-15 14-23 45-23s45 8 45 23-14 23-45 23-45-8-45-23Z" />
        <path d="M54 45h52" />
      </svg>
    );
  }

  if (type === "triangle" || type === "delta") {
    return (
      <svg className={className} viewBox="0 0 160 90" aria-hidden="true">
        <path d="M80 17 131 68H29Z" />
        <circle cx="80" cy="28" r="3" />
        <circle cx="45" cy="60" r="3" />
        <circle cx="115" cy="60" r="3" />
      </svg>
    );
  }

  if (type === "boomerang" || type === "wide_v") {
    return (
      <svg className={className} viewBox="0 0 160 90" aria-hidden="true">
        <path d="M21 65 80 25l59 40-18 6-41-23-41 23Z" />
        <path d="M80 25v23" />
      </svg>
    );
  }

  if (type === "diamond") {
    return (
      <svg className={className} viewBox="0 0 160 90" aria-hidden="true">
        <path d="M80 13 113 45 80 77 47 45Z" />
        <path d="M47 45h66M80 13v64" />
      </svg>
    );
  }

  if (type === "cone") {
    return (
      <svg className={className} viewBox="0 0 160 90" aria-hidden="true">
        <path d="M80 15 118 70H42Z" />
        <path d="M32 66c20 8 76 8 96 0" />
      </svg>
    );
  }

  if (type === "bell_acorn") {
    return (
      <svg className={className} viewBox="0 0 160 90" aria-hidden="true">
        <path d="M80 18c26 0 42 22 36 43-4 13-18 20-36 20s-32-7-36-20c-6-21 10-43 36-43Z" />
        <path d="M60 73h40M66 21c8-8 20-8 28 0" />
      </svg>
    );
  }

  if (type === "crescent") {
    return (
      <svg className={className} viewBox="0 0 160 90" aria-hidden="true">
        <path d="M24 47c35-22 75-22 112 0-37 10-75 10-112 0Z" />
        <path d="M38 48c28 9 78 9 104 0" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 160 90" aria-hidden="true">
      <ellipse cx="80" cy="50" rx="54" ry="13" />
      <path d="M45 49c10-18 60-18 70 0" />
      <path d="M31 50h98" />
    </svg>
  );
}

function makeLineMaterial(night: boolean) {
  return new THREE.LineBasicMaterial({
    color: night ? "#b7ffce" : "#f4f4f0",
    opacity: 0.52,
    transparent: true,
  });
}

function addEdges(mesh: THREE.Mesh, night: boolean) {
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 22), makeLineMaterial(night));
  edges.renderOrder = 2;
  mesh.add(edges);
}

function makeExtrudedShape(points: Array<[number, number]>, depth: number, material: THREE.Material, night: boolean) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) => {
    if (index === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  });
  shape.closePath();
  const mesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.025 }),
    material,
  );
  mesh.rotation.x = Math.PI / 2;
  mesh.position.z = -depth / 2;
  addEdges(mesh, night);
  return mesh;
}

function createProceduralModel(type: ProceduralType, material: THREE.Material, night: boolean) {
  const group = new THREE.Group();
  const addMesh = (mesh: THREE.Mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    addEdges(mesh, night);
    group.add(mesh);
  };

  if (type === "sphere") {
    addMesh(new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), material));
  } else if (type === "disk") {
    addMesh(new THREE.Mesh(new THREE.CylinderGeometry(1.48, 1.48, 0.2, 80), material));
  } else if (type === "dome_saucer") {
    addMesh(new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.25, 0.2, 80), material));
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.72, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), material);
    dome.position.y = 0.09;
    addMesh(dome);
  } else if (type === "sport_saucer") {
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.55, 0.26, 96), material);
    lower.scale.y = 0.75;
    addMesh(lower);
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.58, 48, 12, 0, Math.PI * 2, 0, Math.PI / 2.4), material);
    top.position.y = 0.11;
    top.scale.set(1.15, 0.45, 1.15);
    addMesh(top);
  } else if (type === "cigar") {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), material);
    mesh.scale.set(2.35, 0.4, 0.4);
    addMesh(mesh);
  } else if (type === "cylinder") {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 2.65, 48), material);
    mesh.rotation.z = Math.PI / 2;
    addMesh(mesh);
  } else if (type === "tic_tac") {
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.46, 1.9, 12, 32), material);
    mesh.rotation.z = Math.PI / 2;
    addMesh(mesh);
  } else if (type === "egg") {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), material);
    mesh.scale.set(0.82, 1.22, 0.82);
    mesh.position.y = 0.06;
    addMesh(mesh);
  } else if (type === "cone") {
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(0.96, 1.9, 64), material);
    mesh.rotation.z = Math.PI;
    addMesh(mesh);
  } else if (type === "diamond") {
    const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.08, 0), material);
    mesh.scale.set(1, 1.18, 1);
    addMesh(mesh);
  } else if (type === "bell_acorn") {
    const points = [
      new THREE.Vector2(0.08, 1.02),
      new THREE.Vector2(0.52, 0.78),
      new THREE.Vector2(0.82, 0.28),
      new THREE.Vector2(0.72, -0.5),
      new THREE.Vector2(0.36, -0.9),
      new THREE.Vector2(0.16, -1.05),
    ];
    addMesh(new THREE.Mesh(new THREE.LatheGeometry(points, 64), material));
  } else if (type === "triangle") {
    group.add(makeExtrudedShape([[0, 1.18], [-1.28, -0.95], [1.28, -0.95]], 0.16, material, night));
  } else if (type === "delta") {
    group.add(makeExtrudedShape([[0, 1.22], [-1.35, -0.92], [-0.32, -0.58], [0, -0.76], [0.32, -0.58], [1.35, -0.92]], 0.14, material, night));
  } else if (type === "boomerang") {
    group.add(makeExtrudedShape([[-1.48, -0.45], [0, 0.74], [1.48, -0.45], [0.72, -0.62], [0, -0.08], [-0.72, -0.62]], 0.12, material, night));
  } else if (type === "wide_v") {
    group.add(makeExtrudedShape([[-1.7, -0.5], [0, 0.82], [1.7, -0.5], [1.1, -0.74], [0, -0.1], [-1.1, -0.74]], 0.1, material, night));
  } else if (type === "crescent") {
    const shape = new THREE.Shape();
    shape.moveTo(-1.5, -0.08);
    shape.quadraticCurveTo(0, 0.78, 1.5, -0.08);
    shape.quadraticCurveTo(0, 0.18, -1.5, -0.08);
    const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 }), material);
    mesh.rotation.x = Math.PI / 2;
    addEdges(mesh, night);
    group.add(mesh);
  }

  if (night && ["triangle", "delta", "wide_v", "diamond"].includes(type)) {
    const lightPositions: Array<[number, number, number]> =
      type === "diamond"
        ? [[0, 0.9, 0], [0, -0.9, 0]]
        : [[0, 0.03, -1.12], [-1.0, 0.03, 0.72], [1.0, 0.03, 0.72]];
    lightPositions.forEach(([x, y, z]) => {
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 8), new THREE.MeshBasicMaterial({ color: "#b7ffce" }));
      glow.position.set(x, y, z);
      group.add(glow);
    });
  }

  return group;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
      child.geometry.dispose();
      const material = child.material;
      const materials = Array.isArray(material) ? material : [material];
      materials.forEach((item) => item.dispose());
    }
  });
}

function normalizeModel(model: THREE.Object3D, scaleTarget = 2.5) {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxAxis = Math.max(size.x, size.y, size.z) || 1;
  model.position.sub(center);
  model.scale.setScalar(scaleTarget / maxAxis);
}

export function KinichiViewer({
  target,
  compact = false,
  preview = false,
  fallbackType,
}: {
  target: ViewerTarget;
  compact?: boolean;
  preview?: boolean;
  fallbackType?: ProceduralType | string;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRootRef = useRef<THREE.Group | null>(null);
  const frameRef = useRef<number | null>(null);
  const loadTokenRef = useRef(0);
  const autoRotateRef = useRef(preview);
  const nightRef = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [autoRotate, setAutoRotate] = useState(preview);
  const [wireframe, setWireframe] = useState(false);
  const [silhouette, setSilhouette] = useState(false);
  const [night, setNight] = useState(false);
  const [resetTick, setResetTick] = useState(0);
  const resolvedFallbackType = fallbackType ?? target.proceduralType ?? "disk";

  const resetViewer = () => {
    setAutoRotate(preview);
    setWireframe(false);
    setSilhouette(false);
    setNight(false);
    setResetTick((value) => value + 1);
  };

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    nightRef.current = night;
  }, [night]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#050505");
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(preview ? 34 : 38, 1, 0.1, 100);
    camera.position.set(0, 0.35, preview ? 6.3 : compact ? 6.1 : 5.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, preview ? 1.25 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);
    modelRootRef.current = root;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = !preview;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.6;
    controls.maxDistance = 8;
    controls.autoRotateSpeed = 1.15;
    controls.target.set(0, 0, 0);
    controls.saveState();
    controlsRef.current = controls;

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      const safeWidth = Math.max(1, width);
      const safeHeight = Math.max(preview ? 148 : compact ? 220 : 300, height);
      camera.aspect = safeWidth / safeHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(safeWidth, safeHeight, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    let previousTime = performance.now();
    const animate = () => {
      const now = performance.now();
      const delta = Math.min((now - previousTime) / 1000, 0.05);
      previousTime = now;
      const currentRoot = modelRootRef.current;
      if (currentRoot && autoRotateRef.current) {
        currentRoot.rotation.y += delta * (preview ? 0.55 : 0.42);
      }
      if (currentRoot && nightRef.current && target.proceduralType === "sphere") {
        currentRoot.scale.setScalar(1 + Math.sin(performance.now() * 0.002) * 0.015);
      }
      controls.update();
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      disposeObject(scene);
      mount.removeChild(renderer.domElement);
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      modelRootRef.current = null;
    };
  }, [compact, preview, target.proceduralType]);

  useEffect(() => {
    const scene = sceneRef.current;
    const root = modelRootRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (!scene || !root || !camera || !controls) {
      return;
    }

    loadTokenRef.current += 1;
    const loadToken = loadTokenRef.current;
    setStatus(target.modelKind === "glb" ? "loading" : "ready");
    const scaleTarget = preview ? 2.05 : compact ? 2.25 : 2.65;

    while (root.children.length) {
      const child = root.children[0];
      root.remove(child);
      disposeObject(child);
    }

    scene.background = new THREE.Color(night ? "#020402" : "#050505");
    scene.children.filter((child) => child.userData.kinichiLight).forEach((child) => scene.remove(child));

    const keyLight = new THREE.DirectionalLight(night ? "#b7ffce" : "#fffdf0", night ? 2.2 : 3.4);
    keyLight.position.set(3, 4, 4);
    keyLight.userData.kinichiLight = true;
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(night ? "#f2d16b" : "#b7ffce", night ? 2.3 : 1.45);
    rimLight.position.set(-4, 1.5, 2);
    rimLight.userData.kinichiLight = true;
    scene.add(rimLight);
    const ambientLight = new THREE.AmbientLight(night ? "#40584a" : "#f4f4f0", night ? 0.92 : 1.7);
    ambientLight.userData.kinichiLight = true;
    scene.add(ambientLight);

    const grid = new THREE.GridHelper(6, 12, night ? "#b7ffce" : "#e8e8dc", "#333630");
    grid.position.y = -1.25;
    grid.userData.kinichiLight = true;
    const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
    gridMaterials.forEach((gridMaterial) => {
      gridMaterial.opacity = 0.16;
      gridMaterial.transparent = true;
    });
    scene.add(grid);

    const material = silhouette
      ? new THREE.MeshBasicMaterial({
          color: night ? "#b7ffce" : "#f4f4f0",
          transparent: true,
          opacity: 0.2,
          wireframe,
        })
      : new THREE.MeshPhysicalMaterial({
          color: night ? "#b7ffce" : "#f4f4f0",
          metalness: night ? 0.2 : 0.5,
          roughness: 0.34,
          clearcoat: 0.75,
          clearcoatRoughness: 0.18,
          emissive: night ? "#163b27" : "#000000",
          emissiveIntensity: night ? 0.45 : 0,
          wireframe,
        });

    controls.reset();
    camera.position.set(0, 0.35, preview ? 6.3 : compact ? 6.1 : 5.2);
    controls.target.set(0, 0, 0);
    controls.saveState();
    root.rotation.set(0, 0, 0);
    root.scale.setScalar(1);

    if (target.modelKind === "procedural" && target.proceduralType) {
      root.add(createProceduralModel(target.proceduralType, material, night));
      normalizeModel(root, scaleTarget);
      setStatus("ready");
      return;
    }

    if (target.modelKind === "glb" && target.modelPath) {
      const fallbackModel = createProceduralModel(resolvedFallbackType as ProceduralType, material, night);
      normalizeModel(fallbackModel, scaleTarget);
      root.add(fallbackModel);
      setStatus("ready");

      const loader = new GLTFLoader();
      loader.load(
        target.modelPath,
        (gltf) => {
          if (loadTokenRef.current !== loadToken) {
            disposeObject(gltf.scene);
            return;
          }
          const model = gltf.scene;
          model.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) {
              return;
            }
            object.material = silhouette
              ? new THREE.MeshBasicMaterial({
                  color: night ? "#b7ffce" : "#f4f4f0",
                  transparent: true,
                  opacity: 0.22,
                  wireframe,
                })
              : new THREE.MeshPhysicalMaterial({
                  color: night ? "#b7ffce" : "#f4f4f0",
                  metalness: night ? 0.26 : 0.46,
                  roughness: night ? 0.38 : 0.28,
                  clearcoat: 0.72,
                  clearcoatRoughness: 0.2,
                  emissive: night ? "#173d28" : "#10100f",
                  emissiveIntensity: night ? 0.38 : 0.08,
                  wireframe,
                });
            object.castShadow = true;
            object.receiveShadow = true;
            addEdges(object, night);
          });

          while (root.children.length) {
            const child = root.children[0];
            root.remove(child);
            disposeObject(child);
          }

          normalizeModel(model, scaleTarget);
          root.add(model);
          setStatus("ready");
        },
        undefined,
        () => {
          if (loadTokenRef.current === loadToken) {
            setStatus("ready");
          }
        },
      );
    }
  }, [compact, night, preview, resetTick, silhouette, target, wireframe]);

  return (
    <section className={preview ? styles.viewerShellPreview : compact ? styles.viewerShellCompact : styles.viewerShell} aria-label={`${target.label} 3Dビューア`}>
      {status === "error" ? (
        <div className={styles.viewerStatus} data-status={status}>
          モデルを読み込めません
        </div>
      ) : null}
      {status === "error" ? (
        <div className={styles.viewerFallback} aria-hidden="true">
          <ShapeSilhouette className={styles.viewerFallbackSilhouette} type={resolvedFallbackType} />
        </div>
      ) : null}
      <div className={styles.viewerCanvas} ref={mountRef} />
      {!compact && !preview ? (
        <div className={styles.viewerControls} aria-label="3D表示の操作">
          <button className={autoRotate ? styles.activeControl : undefined} onClick={() => setAutoRotate((value) => !value)} type="button">
            自動回転
          </button>
          <button className={wireframe ? styles.activeControl : undefined} onClick={() => setWireframe((value) => !value)} type="button">
            線画
          </button>
          <button className={silhouette ? styles.activeControl : undefined} onClick={() => setSilhouette((value) => !value)} type="button">
            シルエット
          </button>
          <button className={night ? styles.activeControl : undefined} onClick={() => setNight((value) => !value)} type="button">
            夜間
          </button>
          <button onClick={resetViewer} type="button">
            リセット
          </button>
        </div>
      ) : null}
    </section>
  );
}
