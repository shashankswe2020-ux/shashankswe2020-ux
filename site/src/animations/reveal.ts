/**
 * GSAP-driven scroll reveals for any element marked with [data-reveal].
 * Uses ScrollTrigger so reveals fire as the user scrolls into the section.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initReveals(scope: ParentNode = document): () => void {
  const sections = Array.from(
    scope.querySelectorAll<HTMLElement>('[data-reveal]'),
  );
  const triggers: ScrollTrigger[] = [];

  for (const section of sections) {
    const items = section.querySelectorAll<HTMLElement>(
      '.timeline-item, .project, .contact-card',
    );
    const targets: HTMLElement[] = items.length > 0 ? Array.from(items) : [section];

    const tween = gsap.fromTo(
      targets,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: section,
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      },
    );

    if (tween.scrollTrigger) {
      triggers.push(tween.scrollTrigger);
    }
  }

  return () => {
    for (const t of triggers) t.kill();
  };
}
