/**
 * Three.js hero scene.
 * Tries WebGPURenderer first (the WebGPU era); falls back to WebGLRenderer.
 * The scene is a low-poly, shader-shaded "distributed flow" — points orbit
 * in two interleaved rings to evoke nodes & flow control.
 */
import * as THREE from 'three';

type AnyRenderer = {
  setPixelRatio: (n: number) => void;
  setSize: (w: number, h: number) => void;
  render: (scene: THREE.Scene, camera: THREE.Camera) => unknown;
  dispose?: () => void;
  domElement: HTMLCanvasElement;
};

export interface HeroHandle {
  /** Drive the time uniform from outside (e.g. Theatre.js). */
  setTime: (t: number) => void;
  /** Stop the RAF loop and release GPU resources. */
  destroy: () => void;
  /** Renderer label, useful for logging. */
  rendererLabel: 'webgpu' | 'webgl';
}

const POINT_COUNT = 1800;

async function createRenderer(canvas: HTMLCanvasElement): Promise<{
  renderer: AnyRenderer;
  label: 'webgpu' | 'webgl';
}> {
  // Feature-detect WebGPU. Fall back to WebGL if anything goes wrong.
  if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
    try {
      const mod = await import('three/webgpu');
      const WebGPURenderer = (mod as unknown as { WebGPURenderer: new (opts: object) => AnyRenderer & { init: () => Promise<void> } })
        .WebGPURenderer;
      const r = new WebGPURenderer({ canvas, antialias: true, alpha: true });
      await r.init();
      return { renderer: r, label: 'webgpu' };
    } catch {
      // fall through to WebGL
    }
  }
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  return { renderer: r as unknown as AnyRenderer, label: 'webgl' };
}

export async function initHero(canvas: HTMLCanvasElement): Promise<HeroHandle> {
  const { renderer, label } = await createRenderer(canvas);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.4, 5);

  // Build interleaved point rings.
  const positions = new Float32Array(POINT_COUNT * 3);
  const seeds = new Float32Array(POINT_COUNT);
  for (let i = 0; i < POINT_COUNT; i++) {
    const ring = i % 2 === 0 ? 1.4 : 2.1;
    const a = (i / POINT_COUNT) * Math.PI * 2 * 7;
    positions[i * 3 + 0] = Math.cos(a) * ring;
    positions[i * 3 + 1] = Math.sin(a * 0.5) * 0.4;
    positions[i * 3 + 2] = Math.sin(a) * ring;
    seeds[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));

  // PointsMaterial keeps things compatible with both WebGL and WebGPU
  // (the WebGPURenderer supports the legacy material set as of three r184).
  const material = new THREE.PointsMaterial({
    size: 0.035,
    color: 0x6ee7ff,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // A subtle accent ring of larger, warmer points.
  const accentPositions = new Float32Array(POINT_COUNT / 6 * 3);
  for (let i = 0; i < POINT_COUNT / 6; i++) {
    const a = (i / (POINT_COUNT / 6)) * Math.PI * 2;
    accentPositions[i * 3 + 0] = Math.cos(a) * 2.6;
    accentPositions[i * 3 + 1] = 0;
    accentPositions[i * 3 + 2] = Math.sin(a) * 2.6;
  }
  const accentGeo = new THREE.BufferGeometry();
  accentGeo.setAttribute('position', new THREE.BufferAttribute(accentPositions, 3));
  const accentMat = new THREE.PointsMaterial({
    size: 0.06,
    color: 0xb794ff,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const accent = new THREE.Points(accentGeo, accentMat);
  scene.add(accent);

  let externalTime: number | null = null;
  const start = performance.now();

  const resize = () => {
    const { clientWidth, clientHeight } = canvas;
    if (clientWidth === 0 || clientHeight === 0) return;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  let raf = 0;
  let alive = true;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const tick = () => {
    if (!alive) return;
    const t = externalTime ?? (performance.now() - start) / 1000;
    if (!reduced) {
      points.rotation.y = t * 0.12;
      points.rotation.x = Math.sin(t * 0.15) * 0.18;
      accent.rotation.y = -t * 0.08;
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  tick();

  return {
    rendererLabel: label,
    setTime(t: number) {
      externalTime = t;
    },
    destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      geometry.dispose();
      accentGeo.dispose();
      material.dispose();
      accentMat.dispose();
      renderer.dispose?.();
    },
  };
}
