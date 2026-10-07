# shashankmishra.bio — The Wind and the Kite

Personal site for Shashank Mishra, live at **https://shashankmishra.bio**.

A single, hand-drawn scrolling story built on Pixar's story spine:
Once upon a time → Every day → One day → But one night → Because of that ×2 →
Until finally → And every day since. Each chapter has its own painted sky,
character vignette and animated scene.

One wind field (`wind(t)` in `src/main.js`) drives the kite, tail, string sag,
grass, sea, smoke, clouds, fireflies and letters. Scrolling gusts the wind.
Everything honours `prefers-reduced-motion`, and only on-screen scenes animate.
The score plays only when the visitor taps the record.

## Stack

- Vite 7, vanilla JS, inline SVG + canvas. No runtime dependencies.
- Fonts: IM Fell English, Alegreya, Kalam (Google Fonts).
- Art comes from [`/design`](../design): Blender-rendered textures, character
  plates and the original score.

## Develop

```bash
cd site
npm install
npm run dev          # http://localhost:5173
npm run build        # → site/dist
npm run preview
```

## Layout

```
site/
├── index.html          The whole story (prologue, chapters I–VI, epilogue)
├── src/
│   ├── main.js         Wind field, kite rig, scene animations, sky, music
│   └── styles.css
├── public/
│   ├── CNAME           shashankmishra.bio
│   ├── tex/            paper overlay, kite, clouds   (from design/redesign/tex)
│   ├── chars/          character plates               (from design/redesign/chars)
│   └── audio/score.mp3 original score                 (from design/redesign/audio)
└── vite.config.ts      base "/" (override with VITE_BASE)
```

To update art, re-export into `design/redesign/` and copy into `public/`.

## Deploy

Pushes to `main` that touch `site/**` build and deploy to GitHub Pages via
`.github/workflows/deploy-site.yml`. The custom domain is configured in the
repo's Pages settings, and DNS for `shashankmishra.bio` is managed in Hostinger:

```bash
# apex → GitHub Pages, www → github.io
hostinger dns records update shashankmishra.bio \
  --zone '[{"name":"@","type":"A","ttl":300,"records":[{"content":"185.199.108.153"},{"content":"185.199.109.153"},{"content":"185.199.110.153"},{"content":"185.199.111.153"}]},{"name":"www","type":"CNAME","ttl":300,"records":[{"content":"shashankswe2020-ux.github.io."}]}]'
hostinger dns records list shashankmishra.bio
```
