---
description: core concept of the app, load when questions about app purpose
# applyTo: 'Describe when these instructions should be loaded by the agent based on task context' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

# CONCEPT.md

## What this app is

A molecular simulation engine that runs entirely on the GPU.
The user loads or defines a molecule, sets parameters, and watches the physics play out in real time.

MVP simulates water molecules. Later expands to proteins, polymers, and materials.

---

## The core idea

The GPU does all the physics. TypeScript only tells it what to do and when.

Every frame the simulation runs through the same loop on the GPU:

```
build neighbor list → calculate forces → integrate positions → render
```

Nothing in this loop touches the CPU. The CPU sets things up, dispatches the loop, and handles UI.

---

## What the user can do

- Load a molecule or system (water to start)
- Set parameters: temperature, pressure, timestep, box size
- Watch the simulation run in real time
- Read live stats: energy, temperature, pressure, FPS
- Ask the LLM to explain results or set up a simulation in plain language
- Export snapshots or trajectory data

---

## Two layers, clear boundary

```
UI + TypeScript     what the user sees and controls
─────────────────── this line must never blur
GPU + WGSL          where all physics happens
```

If you are writing simulation math in TypeScript, it is in the wrong place.
If you are writing UI logic in a shader, it is in the wrong place.

---

## Built to grow

The engine does not know about water specifically.
It knows about particles with mass, charge, and force field parameters.
Water is just one set of parameters loaded in.
Swapping to a protein means loading different parameters — not changing the engine.

---

## Built to migrate

The code will eventually move to C++. Every decision should make that easier, not harder.
Keep WebGPU behind an interface. Keep physics in shaders. Keep data structures clean and flat.