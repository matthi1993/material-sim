# Material Sim

A browser-based material simulator built with TypeScript, Lit, and WebGPU.  
It renders and simulates atoms, molecules, ions, and polymers using GPU compute shaders.

Demo:
https://matthi1993.github.io/material-sim/

<img src="src/assets/hero.png" alt="Material Sim app preview" width="320" />

## Run locally

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
npm run preview
```

## Optional local GH Pages deploy

If you use the local script `deploy-github-pages.local.sh`, run it from the `main` branch.
It builds `main` and publishes only the static output to `gh-pages`.
