/**
 * Portfolio entry point.
 *
 * Wires together:
 *  - Barba.js  : page transitions across Home / Work / Projects / Contact
 *  - Three.js  : WebGPU hero scene (with WebGL fallback)
 *  - Theatre.js: choreographs the hero intro sequence
 *  - GSAP      : transitions + scroll reveals + fallback hero timeline
 *  - Anime.js v4: modular spring physics for skill chips
 */
import './styles.css';
import { initBarba } from './transitions';
import { initHero, type HeroHandle } from './three/hero';
import { createIntroChoreography } from './theatre/intro';
import { initReveals } from './animations/reveal';
import { animateChips } from './animations/chips';
import { prepareHeroIntro } from './animations/hero-intro';

let currentHero: HeroHandle | null = null;
let currentRevealsCleanup: (() => void) | null = null;

function initAmbientPointer() {
  if (matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener(
    'pointermove',
    (event) => {
      document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
    },
    { passive: true },
  );
}

function setYear(scope: ParentNode) {
  scope.querySelectorAll<HTMLElement>('#year').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

async function setupHome(container: HTMLElement) {
  const canvas = container.querySelector<HTMLCanvasElement>('#hero-canvas');
  if (!canvas) return;

  // Tear down any previous instance (defensive — Barba reuses scripts).
  currentHero?.destroy();
  currentHero = null;

  try {
    currentHero = await initHero(canvas);
  } catch (err) {
    console.warn('Hero scene failed to initialize:', err);
  }

  const intro = prepareHeroIntro(container);
  if (!intro) return;

  try {
    const choreo = await createIntroChoreography((v) => {
      intro.apply(v);
      currentHero?.setTime(v.cameraTime);
    });
    await choreo.play();
  } catch (err) {
    console.warn('Theatre.js intro failed; using GSAP fallback:', err);
    intro.fallbackPlay();
  }
}

async function enterPage(container: HTMLElement, namespace: string) {
  setYear(container);

  // Tear down previous page's reveals before binding new ones.
  currentRevealsCleanup?.();
  currentRevealsCleanup = initReveals(container);

  // Three.js hero is only on the home page.
  if (namespace === 'home') {
    await setupHome(container);
  } else {
    currentHero?.destroy();
    currentHero = null;
  }

  // Skill chips appear on /work — and the function is a no-op elsewhere.
  animateChips(container);
}

initAmbientPointer();

initBarba({
  onInit: (container, namespace) => enterPage(container, namespace),
  onEnter: (container, namespace) => enterPage(container, namespace),
});
