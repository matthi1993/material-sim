---
description: coding rules for app
---

# RULES.md

## Non-negotiable rules

## File size and structure
keep files under ~300 lines. If it grows beyond that, split it up.
seperate by domain (e.g. sim logic vs UI) and layer (e.g. backend vs engine).
put files in subfolders if it helps keep things organized, but avoid deep nesting.

### Physics belongs in shaders
Never write force, velocity, or position math in TypeScript.
If it touches atoms, it lives in a `.wgsl` file.

### WebGPU stays behind the interface
Only `WebGPUBackend.ts` imports WebGPU types.
Everything else uses `IGPUBackend`.

### One shader per compute pass
One `.wgsl` file per kernel. No inline shader strings. No combined mega-shaders.

### Structs defined once
All shared data structures live in `types.ts`.
WGSL structs must match exactly — same fields, same order, same types.

### No GPU readback in the sim loop
Never copy GPU data to CPU between simulation steps.
Readback is only allowed for export, logging, or debug builds.

---

## GPU rules

- Use `f32` for everything in shaders. No `f64`.
- Use `vec4` not `vec3` for positions, velocities, forces.
- Always compare `d²` vs `r²`. Never call `sqrt` in inner loops.
- Struct of Arrays layout always. Never Array of Structs.
- Rebuild neighbor list every ~20 steps, not every step.

---

## TypeScript rules

- `SimParams` is immutable during a run. To change params: pause → destroy → reinit.
- Hot-swappable settings (e.g. target temperature) go in `RuntimeConfig`, not `SimParams`.
- Topology is always loaded from data. Never hardcode atom parameters.
- No physics logic. No simulation state in UI components.

---

## UI rules

- Every UI element is a Lit component.
- Components fire events. They never call the backend directly.
- All colors, spacing, and fonts come from CSS variables in `theme.css`.
- No hardcoded values anywhere in component styles.
- Dark theme. Minimal. No decorative elements.

---

## Never do

- Euler integration — use Velocity Verlet
- O(N²) force loops without cutoffs
- Hardcode water or any molecule — use topology files
- Array of Structs on GPU
- `sqrt` in inner loops
- `f64` in shaders
- WebGPU types outside `WebGPUBackend.ts`
- Simulation math in TypeScript
- Hardcoded colors or spacing in components