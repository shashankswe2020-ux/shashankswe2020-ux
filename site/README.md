# Portfolio site

Personal portfolio for Shashank Mishra — a real, animated multi-page site that
genuinely uses the libraries called out in the brief:

| Library                            | Where it shows up                                                        |
| ---------------------------------- | ------------------------------------------------------------------------ |
| **Anime.js v4** (modular physics)  | Skill-chip entrance + hover springs (`createSpring`) on the Work page    |
| **Barba.js**                       | Smooth slide-cover transitions between Home / Work / Projects / Contact  |
| **Three.js (WebGPU)**              | Hero scene; uses `WebGPURenderer` when available, falls back to WebGL    |
| **GSAP** (+ ScrollTrigger)         | Page-transition cover animation, scroll reveals, hero fallback timeline  |
| **Theatre.js**                     | Choreographs the hero intro sequence (Studio loaded only in dev)         |

## Stack

- Vite 7 + TypeScript (strict)
- Plain HTML pages so Barba can do real cross-document transitions
- Deployed to GitHub Pages via `.github/workflows/deploy-site.yml`

## Develop

```bash
cd site
npm install
npm run dev          # http://localhost:5173 — Theatre.js Studio is enabled
```

In dev mode, the Theatre.js Studio panel appears on the bottom of the screen so
you can author the hero intro sequence visually. The authored state lives in
the project (the sheet name is `Hero Intro`).

## Build

```bash
npm run build        # tsc --noEmit then vite build → site/dist
npm run preview
```

The build is configured with `base: '/shashankswe2020-ux/'` because GitHub
Pages serves this repo at `https://shashankswe2020-ux.github.io/shashankswe2020-ux/`.
Override with `VITE_BASE=/ npm run build` if you deploy elsewhere.

## Deploy

Pushes to `main` that touch `site/**` automatically build and deploy to
GitHub Pages via the workflow. Enable Pages once in repo settings:

1. Settings → Pages → Build and deployment → Source: **GitHub Actions**.

## Layout

```
site/
├── index.html              Home (Three.js hero + Theatre.js intro)
├── work.html               Work (timeline + Anime.js v4 chips)
├── projects.html           Projects (GSAP scroll reveals)
├── contact.html            Contact
├── src/
│   ├── main.ts             Wires everything together
│   ├── transitions.ts      Barba.js setup + GSAP overlay
│   ├── three/hero.ts       WebGPURenderer w/ WebGL fallback
│   ├── theatre/intro.ts    Theatre.js sheet object + sequence
│   ├── animations/
│   │   ├── reveal.ts       GSAP ScrollTrigger reveals
│   │   ├── chips.ts        Anime.js v4 createSpring physics
│   │   └── hero-intro.ts   Hero text driven by Theatre values (GSAP fallback)
│   └── styles.css
└── vite.config.ts
```
