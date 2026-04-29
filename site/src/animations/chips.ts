/**
 * Anime.js v4 modular physics for skill chips.
 *
 * v4 ships a `createSpring` easing factory you can pass straight to `animate`,
 * giving each chip a real spring response instead of canned cubic-béziers.
 */
import { animate, createSpring, stagger } from 'animejs';

export function animateChips(scope: ParentNode = document): void {
  const containers = scope.querySelectorAll<HTMLElement>('[data-chips]');
  for (const container of containers) {
    const chips = container.querySelectorAll<HTMLElement>('.chip');
    if (chips.length === 0) continue;

    animate(chips, {
      scale: [0, 1],
      opacity: [0, 1],
      delay: stagger(40, { start: 120 }),
      ease: createSpring({ stiffness: 180, damping: 12, mass: 1 }),
    });

    // Hover wobble — modular physics on each chip individually.
    chips.forEach((chip) => {
      const onEnter = () => {
        animate(chip, {
          scale: [1, 1.08, 1],
          ease: createSpring({ stiffness: 300, damping: 8 }),
          duration: 600,
        });
      };
      chip.addEventListener('mouseenter', onEnter);
    });
  }
}
