# CMPM 170 — Isometric Panopticon Prototype

A Phaser 4 + Vite starter for an isometric game built around a central
panopticon tower.

## Play online

**[Launch the game](https://woolendoolen-panopticon.renner.chatgpt.site/)**

The hosted build is generated from the same source tracked on `main`.

The current prototype includes:

- an isometric projection and circular prison ring;
- a raised observation tower that demonstrates height and occlusion;
- depth-sorted cell blocks and player rendering;
- continuous WASD and arrow-key movement constrained to the ring; and
- procedural placeholder art, so no external assets are required.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Use **WASD** or the **arrow keys** to move.

## Production build

```bash
npm run build
```

Vite writes the deployable game to `dist/`.

## Project layout

```text
src/
  main.js                         Phaser game configuration
  styles.css                      Full-screen canvas styling
  scenes/PanopticonScene.js       Isometric scene and movement prototype
```

Phaser is installed as an npm dependency. The framework source is intentionally
not vendored into this repository.
