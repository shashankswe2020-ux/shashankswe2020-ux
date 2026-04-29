/**
 * Barba.js page transitions.
 *
 * The overlay slides up to cover the page, Barba swaps the container,
 * then the overlay slides off-screen revealing the new page. We re-run
 * page-scoped initializers on every `afterEnter`.
 */
import barba from '@barba/core';
import { gsap } from 'gsap';

export interface PageHooks {
  /** Called for the initial page on first load. */
  onInit: (container: HTMLElement, namespace: string) => Promise<void> | void;
  /** Called every time a new container enters (after the transition). */
  onEnter: (container: HTMLElement, namespace: string) => Promise<void> | void;
  /** Called on the leaving container (before the transition completes). */
  onLeave?: (container: HTMLElement, namespace: string) => void;
}

export function initBarba(hooks: PageHooks): void {
  const overlay = document.querySelector<HTMLElement>('.transition-overlay');

  // Mark active nav link based on namespace.
  const syncNav = (namespace: string) => {
    document.querySelectorAll<HTMLAnchorElement>('.nav-links a').forEach((a) => {
      a.classList.toggle('active', a.dataset.page === namespace);
    });
  };

  barba.init({
    // GitHub Pages can serve under a sub-path; let Barba follow the natural URL.
    transitions: [
      {
        name: 'cover-slide',
        async leave(data) {
          hooks.onLeave?.(data.current.container as HTMLElement, data.current.namespace);
          if (!overlay) return;
          await gsap.to(overlay, {
            yPercent: -100,
            duration: 0.55,
            ease: 'power3.inOut',
            startAt: { yPercent: 100 },
          });
        },
        async enter(data) {
          if (overlay) {
            // Reset overlay below view for the next transition.
            gsap.set(overlay, { yPercent: 100 });
          }
          window.scrollTo(0, 0);
          syncNav(data.next.namespace);
          await hooks.onEnter(data.next.container as HTMLElement, data.next.namespace);
        },
      },
    ],
  });

  // Initial load — Barba doesn't fire enter for the first page.
  const first = document.querySelector<HTMLElement>('[data-barba="container"]');
  if (first) {
    const ns = first.dataset.barbaNamespace ?? '';
    syncNav(ns);
    void hooks.onInit(first, ns);
  }
}
