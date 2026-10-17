"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { CONSUMER_NODE, INDUSTRIES } from "./industries";

const NODE_RADIUS = 0.45;
const CENTER_RADIUS = 0.75;
const ORBIT_RADIUS = 5.5;
const DEFAULT_CAMERA_DISTANCE = 11;
const FOCUS_CAMERA_DISTANCE = 3.2;

// Damping rates (higher = snappier). Shared by every animated value so
// focus transitions feel like one coherent motion instead of several
// independently-timed tweens.
const CAMERA_DAMP = 4.5;
const VISUAL_DAMP = 7;

interface NodeEntry {
  id: string;
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
  label: CSS2DObject;
  basePosition: THREE.Vector3;
  targetOpacity: number;
  targetIntensity: number;
  targetScale: number;
  targetLabelOpacity: number;
}

function fibonacciSpherePoint(index: number, total: number, radius: number) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (index / Math.max(total - 1, 1)) * 2;
  const r = Math.sqrt(Math.max(1 - y * y, 0));
  const theta = goldenAngle * index;
  return new THREE.Vector3(
    Math.cos(theta) * r * radius,
    y * radius * 0.65,
    Math.sin(theta) * r * radius,
  );
}

function makeLabel(text: string, accent: string): CSS2DObject {
  const el = document.createElement("div");
  el.textContent = text;
  el.style.fontFamily = "var(--font-geist-sans), sans-serif";
  el.style.fontSize = "13px";
  el.style.fontWeight = "600";
  el.style.color = "#f5f7ff";
  el.style.textShadow = `0 0 10px ${accent}, 0 2px 4px rgba(0,0,0,0.8)`;
  el.style.pointerEvents = "none";
  el.style.whiteSpace = "nowrap";
  el.style.transform = "translate(-50%, 14px)";
  el.style.transition = "opacity 0.25s ease";
  const object = new CSS2DObject(el);
  object.layers.set(0);
  return object;
}

export default function NetworkMindmap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 2.5, DEFAULT_CAMERA_DISTANCE);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.touchAction = "none";
    container.appendChild(renderer.domElement);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(container.clientWidth, container.clientHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0";
    labelRenderer.domElement.style.left = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    container.appendChild(labelRenderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(6, 8, 6);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x6c8cff, 1.2, 30);
    rimLight.position.set(-6, -3, -4);
    scene.add(rimLight);

    // Controls must attach to the actual canvas: an overlay with
    // pointer-events: none (the label renderer's DOM node) never
    // receives pointer events, so OrbitControls would silently do nothing.
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.5;
    controls.maxDistance = 16;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.target.set(0, 0.3, 0);

    const centerColor = new THREE.Color(CONSUMER_NODE.color);
    const centerMaterial = new THREE.MeshStandardMaterial({
      color: centerColor,
      emissive: centerColor,
      emissiveIntensity: 0.7,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 1,
    });
    const centerMesh = new THREE.Mesh(
      new THREE.SphereGeometry(CENTER_RADIUS, 32, 32),
      centerMaterial,
    );
    scene.add(centerMesh);
    const centerLabel = makeLabel(CONSUMER_NODE.label, CONSUMER_NODE.color);
    centerLabel.position.set(0, CENTER_RADIUS + 0.1, 0);
    centerMesh.add(centerLabel);
    let centerTargetOpacity = 1;
    let centerTargetLabelOpacity = 1;

    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const linePositions = new Float32Array(INDUSTRIES.length * 6);
    const lineColors = new Float32Array(INDUSTRIES.length * 6);
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
    });
    let lineTargetOpacity = 0.55;

    const nodes: NodeEntry[] = INDUSTRIES.map((industry, index) => {
      const position = fibonacciSpherePoint(
        index,
        INDUSTRIES.length,
        ORBIT_RADIUS,
      );
      const color = new THREE.Color(industry.color);

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(NODE_RADIUS, 24, 24),
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.45,
          roughness: 0.4,
          metalness: 0.1,
          transparent: true,
          opacity: 1,
        }),
      );
      mesh.position.copy(position);
      mesh.userData.id = industry.id;
      nodeGroup.add(mesh);

      const label = makeLabel(industry.label, industry.color);
      label.position.set(0, NODE_RADIUS + 0.08, 0);
      mesh.add(label);

      const base = index * 6;
      linePositions[base] = 0;
      linePositions[base + 1] = 0;
      linePositions[base + 2] = 0;
      linePositions[base + 3] = position.x;
      linePositions[base + 4] = position.y;
      linePositions[base + 5] = position.z;
      lineColors[base] = centerColor.r;
      lineColors[base + 1] = centerColor.g;
      lineColors[base + 2] = centerColor.b;
      lineColors[base + 3] = color.r;
      lineColors[base + 4] = color.g;
      lineColors[base + 5] = color.b;

      return {
        id: industry.id,
        mesh,
        label,
        basePosition: position,
        targetOpacity: 1,
        targetIntensity: 0.45,
        targetScale: 1,
        targetLabelOpacity: 1,
      };
    });

    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositions, 3),
    );
    lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));
    const linePosAttr = lineGeometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    const starGeometry = new THREE.BufferGeometry();
    const starCount = 400;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 20 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3),
    );
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0x8899ff, size: 0.05, opacity: 0.5, transparent: true }),
    );
    scene.add(stars);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const dragPlane = new THREE.Plane();
    const dragPoint = new THREE.Vector3();
    const cameraDirection = new THREE.Vector3();

    let pointerDownPos: { x: number; y: number } | null = null;
    let draggedNode: NodeEntry | null = null;
    let focusedId: string | null = null;
    // Only true while a focus-change camera flight is in progress. Outside
    // of that window OrbitControls owns the camera completely, so idle
    // free-orbiting is never fought by a forced snap-back.
    let cameraAnimating = false;
    const cameraTargetPos = camera.position.clone();
    const controlsTargetPos = controls.target.clone();

    function setPointerNDC(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function updateNodeLinePosition(node: NodeEntry) {
      const index = nodes.indexOf(node);
      linePosAttr.setXYZ(
        index * 2 + 1,
        node.mesh.position.x,
        node.mesh.position.y,
        node.mesh.position.z,
      );
      linePosAttr.needsUpdate = true;
    }

    function applyFocus(id: string | null) {
      focusedId = id;
      setSelected(id);

      for (const node of nodes) {
        const isFocused = id === null || node.id === id;
        node.targetOpacity = isFocused ? 1 : 0.15;
        node.targetIntensity = node.id === id ? 1.1 : 0.45;
        node.targetScale = node.id === id ? 1.25 : 1;
        // Fade the non-focused labels fully out so they can never visually
        // overlap the zoomed-in node (CSS2D labels ignore 3D depth testing).
        node.targetLabelOpacity = isFocused ? 1 : 0;
      }
      centerTargetOpacity = id === null ? 1 : 0.15;
      centerTargetLabelOpacity = id === null ? 1 : 0;
      lineTargetOpacity = id === null ? 0.55 : 0.18;

      if (id === null) {
        cameraTargetPos.set(0, 2.5, DEFAULT_CAMERA_DISTANCE);
        controlsTargetPos.set(0, 0.3, 0);
      } else {
        const node = nodes.find((n) => n.id === id);
        if (node) {
          const length = node.mesh.position.length();
          const direction =
            length > 0.0001
              ? node.mesh.position.clone().normalize()
              : new THREE.Vector3(0, 0, 1);
          cameraTargetPos
            .copy(node.mesh.position)
            .add(direction.multiplyScalar(FOCUS_CAMERA_DISTANCE));
          controlsTargetPos.copy(node.mesh.position);
        }
      }
      cameraAnimating = true;
    }

    function handlePointerDown(event: PointerEvent) {
      pointerDownPos = { x: event.clientX, y: event.clientY };
      setPointerNDC(event);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(
        nodes.map((n) => n.mesh),
        false,
      );
      if (hits.length > 0) {
        const hit = nodes.find((n) => n.mesh === hits[0].object) ?? null;
        if (hit) {
          draggedNode = hit;
          controls.enabled = false;
          camera.getWorldDirection(cameraDirection);
          dragPlane.setFromNormalAndCoplanarPoint(
            cameraDirection,
            hit.mesh.position,
          );
        }
      }
    }

    function handlePointerMove(event: PointerEvent) {
      if (!draggedNode) return;
      setPointerNDC(event);
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(dragPlane, dragPoint)) {
        draggedNode.mesh.position.copy(dragPoint);
        updateNodeLinePosition(draggedNode);
      }
    }

    function handlePointerUp(event: PointerEvent) {
      if (!pointerDownPos) return;
      const dx = event.clientX - pointerDownPos.x;
      const dy = event.clientY - pointerDownPos.y;
      const moved = Math.hypot(dx, dy) > 6;
      pointerDownPos = null;

      if (draggedNode) {
        const node = draggedNode;
        draggedNode = null;
        controls.enabled = true;
        if (!moved) applyFocus(node.id === focusedId ? null : node.id);
        return;
      }

      if (!moved) applyFocus(null);
    }

    const domElement = renderer.domElement;
    domElement.addEventListener("pointerdown", handlePointerDown);
    domElement.addEventListener("pointermove", handlePointerMove);
    domElement.addEventListener("pointerup", handlePointerUp);

    let frameId = 0;
    const timer = new THREE.Timer();
    timer.connect(document);

    function animate() {
      frameId = requestAnimationFrame(animate);
      timer.update();
      const delta = timer.getDelta();

      controls.autoRotate = focusedId === null && !draggedNode && !cameraAnimating;
      if (cameraAnimating) {
        const cameraLerp = 1 - Math.exp(-CAMERA_DAMP * delta);
        camera.position.lerp(cameraTargetPos, cameraLerp);
        controls.target.lerp(controlsTargetPos, cameraLerp);
        if (
          camera.position.distanceToSquared(cameraTargetPos) < 0.0004 &&
          controls.target.distanceToSquared(controlsTargetPos) < 0.0004
        ) {
          cameraAnimating = false;
        }
      }
      controls.update();

      const visualLerp = 1 - Math.exp(-VISUAL_DAMP * delta);
      for (const node of nodes) {
        const material = node.mesh.material;
        material.opacity += (node.targetOpacity - material.opacity) * visualLerp;
        material.emissiveIntensity +=
          (node.targetIntensity - material.emissiveIntensity) * visualLerp;
        const scale = node.mesh.scale.x;
        node.mesh.scale.setScalar(scale + (node.targetScale - scale) * visualLerp);
        const label = node.label.element;
        const currentLabelOpacity = Number(label.style.opacity || "1");
        label.style.opacity = String(
          currentLabelOpacity +
            (node.targetLabelOpacity - currentLabelOpacity) * visualLerp,
        );
      }
      centerMaterial.opacity +=
        (centerTargetOpacity - centerMaterial.opacity) * visualLerp;
      const centerLabelEl = centerLabel.element;
      const currentCenterLabelOpacity = Number(centerLabelEl.style.opacity || "1");
      centerLabelEl.style.opacity = String(
        currentCenterLabelOpacity +
          (centerTargetLabelOpacity - currentCenterLabelOpacity) * visualLerp,
      );
      lineMaterial.opacity += (lineTargetOpacity - lineMaterial.opacity) * visualLerp;

      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      labelRenderer.setSize(width, height);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(frameId);
      } else {
        animate();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      domElement.removeEventListener("pointerdown", handlePointerDown);
      domElement.removeEventListener("pointermove", handlePointerMove);
      domElement.removeEventListener("pointerup", handlePointerUp);
      timer.dispose();
      controls.dispose();
      renderer.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      starGeometry.dispose();
      for (const node of nodes) {
        node.mesh.geometry.dispose();
        node.mesh.material.dispose();
      }
      centerMesh.geometry.dispose();
      centerMaterial.dispose();
      container.removeChild(renderer.domElement);
      container.removeChild(labelRenderer.domElement);
    };
  }, []);

  const selectedIndustry = INDUSTRIES.find((industry) => industry.id === selected);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#05070f]">
      <div ref={containerRef} className="absolute inset-0" />

      {selectedIndustry && (
        <div className="pointer-events-none absolute bottom-0 left-0 p-6 sm:p-8">
          <div
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur"
            style={{ boxShadow: `0 0 24px ${selectedIndustry.color}33` }}
          >
            <p
              className="text-sm font-semibold"
              style={{ color: selectedIndustry.color }}
            >
              {selectedIndustry.label}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
