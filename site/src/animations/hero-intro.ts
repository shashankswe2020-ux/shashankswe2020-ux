/**
 * Hero text intro driven by GSAP, but timing-synced to the
 * Theatre.js sequence so the visual director controls the show.
 */
import { gsap } from 'gsap';
import type { IntroValues } from '../theatre/intro';

export interface HeroIntro {
  apply: (v: IntroValues) => void;
  fallbackPlay: () => void;
}

export function prepareHeroIntro(scope: ParentNode = document): HeroIntro | null {
  const title = scope.querySelector<HTMLElement>('.hero-title[data-split]');
  const eyebrow = scope.querySelector<HTMLElement>('.hero-eyebrow');
  const sub = scope.querySelector<HTMLElement>('.hero-sub');
  const cta = scope.querySelector<HTMLElement>('.hero-cta');

  if (!title) return null;

  // Split title into word spans (idempotent).
  if (!title.dataset.split_done) {
    const words = (title.textContent ?? '').trim().split(/\s+/);
    title.textContent = '';
    for (const w of words) {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = w;
      title.appendChild(span);
    }
    title.dataset.split_done = '1';
  }

  const wordEls = Array.from(title.querySelectorAll<HTMLElement>('.word'));

  return {
    apply(v: IntroValues) {
      // Map titleProgress 0..1 across word indices, with each word having
      // its own little fade window for a stagger effect.
      const n = wordEls.length;
      wordEls.forEach((el, i) => {
        const start = i / (n + 2);
        const end = start + 2 / (n + 2);
        const local = Math.min(1, Math.max(0, (v.titleProgress - start) / (end - start)));
        el.style.opacity = String(local);
        el.style.transform = `translateY(${(1 - local) * 28}px)`;
      });
      if (eyebrow) eyebrow.style.opacity = String(v.titleProgress);
      if (sub) sub.style.opacity = String(v.subProgress);
      if (cta) cta.style.opacity = String(v.ctaProgress);
    },
    fallbackPlay() {
      // Used if Theatre.js fails for any reason — pure GSAP timeline.
      const tl = gsap.timeline();
      tl.to(eyebrow, { opacity: 1, duration: 0.4, ease: 'power2.out' });
      tl.to(
        wordEls,
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.06,
        },
        '<0.1',
      );
      tl.to(sub, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.4');
      tl.to(cta, { opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=0.3');
    },
  };
}
