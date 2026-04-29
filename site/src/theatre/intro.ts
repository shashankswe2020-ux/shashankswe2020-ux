/**
 * Theatre.js choreography for the hero intro sequence.
 *
 * Theatre.js is the "visual director": we declare an animatable object
 * (a "sheet object" with timed properties), and Theatre drives those values.
 * In dev, Studio is initialized so the sequence can be authored visually;
 * in production, Studio is excluded from the bundle.
 */
import { getProject, types, type ISheetObject } from '@theatre/core';

export interface IntroValues {
  cameraTime: number;
  titleProgress: number;
  subProgress: number;
  ctaProgress: number;
}

export interface IntroChoreography {
  play: () => Promise<void>;
  obj: ISheetObject<{
    cameraTime: number;
    titleProgress: number;
    subProgress: number;
    ctaProgress: number;
  }>;
}

export async function createIntroChoreography(
  onUpdate: (v: IntroValues) => void,
): Promise<IntroChoreography> {
  // Initialize Studio only in development — never ship it in production.
  if (import.meta.env.DEV) {
    try {
      const studio = (await import('@theatre/studio')).default;
      studio.initialize();
    } catch {
      // Studio is optional; ignore failures so the site still works.
    }
  }

  const project = getProject('shashank-portfolio');
  const sheet = project.sheet('Hero Intro');

  const obj = sheet.object('Intro', {
    cameraTime: types.number(0, { range: [0, 4] }),
    titleProgress: types.number(0, { range: [0, 1] }),
    subProgress: types.number(0, { range: [0, 1] }),
    ctaProgress: types.number(0, { range: [0, 1] }),
  });

  obj.onValuesChange((v) => {
    onUpdate({
      cameraTime: v.cameraTime,
      titleProgress: v.titleProgress,
      subProgress: v.subProgress,
      ctaProgress: v.ctaProgress,
    });
  });

  return {
    obj,
    async play() {
      // Drive the sequence in production. In dev, the user can scrub it.
      await sheet.sequence.play({ iterationCount: 1, range: [0, 2.6] });
    },
  };
}
