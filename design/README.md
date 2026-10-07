# shashankmishra.bio — story redesign

- `redesign/story.html` — the prototype (open in a browser). Story spine from Pixar's rules: Once upon a time → Every day → One day → But one night → Because of that ×2 → Until finally → And every day since.
- `redesign/tex/` — Blender-rendered textures (paper overlay, kite, three clouds), web-ready webp.
- `redesign/audio/score.mp3` — original score, plays only when the visitor taps the record.
- `blender/scene.py` — regenerates every texture: `python blender/scene.py <paper|kite|cloud1|cloud2|cloud3> out.png [res] [samples]` (needs `pip install bpy`).
- Figma: https://www.figma.com/design/G3tTUQIBX8mMhez40jzrnr — audit of AI tells, palette/type, chapter storyboards, wind + kite rig spec.

One wind field (`wind(t)` in story.html) drives the kite, tail, string sag, grass, sea, smoke, clouds, fireflies and letters. It honours prefers-reduced-motion.
