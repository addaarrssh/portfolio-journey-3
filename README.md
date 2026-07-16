# Adarsh Sahu — Portfolio

A dark, automotive-themed developer portfolio built with React, Vite, Tailwind CSS v4, GSAP + ScrollTrigger, and Three.js. Content (projects, skills, education) is data-driven from `src/data/`.

## Setup

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build     # production build to dist/
npm run preview   # preview the production build
```

## Project structure

```
src/
  components/       # one file per section/UI piece
  data/             # projects.js, skills.js, experience.js — edit these for content changes
  hooks/            # useGsapAnimation, useMouseParallax, usePrefersReducedMotion, useIsLowPower
  config/           # animations.js — central durations/easings
  styles/globals.css
```

## Replacing placeholders with your own content

- **Profile photo**: `src/components/About.jsx` has a placeholder box (`Profile Photo` label) inside a `.glass-card`. Replace it with an `<img>` pointing at a file you add under `src/assets/`.
- **Project preview images**: `src/components/ProjectCard.jsx` renders a gradient placeholder (`Project Preview` label) instead of a screenshot. Swap in real screenshots per project, or extend the `projects` data shape in `src/data/projects.js` with an `image` field and use it here.
- **Projects/skills/education content**: all real content lives in `src/data/projects.js`, `src/data/skills.js`, and `src/data/experience.js`. Nothing else in the codebase should need to change to update copy.
- **Contact form backend**: `src/components/Contact.jsx` currently only simulates a successful submission (see the `// TODO` comment in `handleSubmit`). Wire it to a real service (Formspree, EmailJS, or your own API route) before relying on it — right now no message is actually sent anywhere.

## Replacing the Sketchfab iframe with a licensed `.glb`

The hero and 3D showcase currently use two different approaches:

- **Hero** (`src/components/SketchfabViewer.jsx`): the official Sketchfab iframe embed for the [muscle car low-poly model](https://sketchfab.com/3d-models/muscle-car-low-poly-fa144705edf340fe977ef83ee9d2e908). This must stay an iframe embed unless you have a **legally purchased/downloaded** `.glb` — do not scrape the model. The component keeps Sketchfab's own attribution/watermark fully visible; don't add any overlay on top of it. The hero background is `src/components/LiquidEther.jsx`, a mouse-reactive WebGL fluid simulation (lazy-loaded, pointer-events-none, with a static-glow fallback on reduced-motion/low-power devices).
- **3D Showcase** (`src/components/Model3DScene.jsx`): a raw Three.js `.glb` viewer (`GLTFLoader` + `OrbitControls`) currently rendering `public/models/astronaut.glb`, with camera auto-framing from the model's bounding box, resize handling, capped pixel ratio, and full dispose-on-unmount cleanup.

To swap in a different licensed `.glb` (e.g. a car for the hero):

1. Drop the file at `public/models/car.glb`. It must live under `public/` — that's copied verbatim into `dist/`, so `/models/car.glb` works in both `vite dev` and the production build (a path under `src/` would 404 in production).
2. In `src/components/Showcase3D.jsx`, change the `glbPath`:
   ```jsx
   <Model3DScene useGlb glbPath="/models/car.glb" />
   ```
3. That's it — the camera auto-fits whatever model loads. With `useGlb` false, `Model3DScene` falls back to a placeholder rotating shape.

You can do the same in `Hero.jsx` if you'd rather use `Model3DScene` there too instead of the Sketchfab iframe once you have a licensed model.

## Known limitations (by design, not bugs)

- The contact form has no backend — see the TODO above.
- The "Journey" timeline only includes real, dated facts (education + projects with a confirmed year); most projects don't have a public build date, so they live in the Projects grid instead, not the timeline.
- "Currently Learning" skill groups are visually marked distinct and never given a numeric score — they're in-progress skills, not claimed proficiencies.
