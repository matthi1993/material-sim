---
description: architecture overview, load when creating new features or changes
# applyTo: 'Describe when these instructions should be loaded by the agent based on task context' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

# ARCHITECTURE.md

## Folder structure

```
/src
  /sim
    /backend
      IGPUBackend.ts        ← interface only, no WebGPU imports
      WebGPUBackend.ts      ← only file allowed to use WebGPU
    /managers
      NeighborListManager.ts
      ThermostatManager.ts
    SimulationEngine.ts     ← orchestrator, uses IGPUBackend only
    types.ts                ← all shared structs and enums
    params.ts               ← default parameter values
    topology.ts             ← Topology type and loaders

  /shaders
    neighbor_list.wgsl
    force_lj.wgsl
    force_coulomb.wgsl
    integrate.wgsl
    render.wgsl

  /ui
    /components             ← Lit components only
    /styles
      theme.css             ← all CSS variables, touch nothing else
    renderer.ts             ← reads GPU buffer, zero sim logic
    stats.ts                ← displays FPS, energy, temperature

  main.ts                   ← wires everything together
```

---

## Layers and what they own

| Layer | Owns | Never touches |
|---|---|---|
| `IGPUBackend` | GPU interface contract | WebGPU types |
| `WebGPUBackend` | WebGPU implementation | Simulation logic |
| `SimulationEngine` | Dispatch loop, state | WebGPU directly |
| Lit components | UI, user input | Backend, sim state |
| WGSL shaders | All physics math | TypeScript world |

---

## Key interfaces

```typescript
// IGPUBackend.ts
interface IGPUBackend {
  initialize(params: SimParams, topology: Topology): Promise<void>
  stepSimulation(steps: number): void
  readbackPositions(): Promise<Float32Array>
  destroy(): void
}

// types.ts
interface SimParams {
  dt:           number   // f32 - timestep in picoseconds
  numAtoms:     number   // u32
  cutoffRadius: number   // f32 - angstroms
  boxSize:      number   // f32 - cubic box side
}

interface Topology {
  atomTypes:  AtomType[]
  bonds:      Bond[]
  angles:     Angle[]
  dihedrals:  Dihedral[]
}
```

---

## GPU memory layout

Always Struct of Arrays. Never Array of Structs.

```wgsl
// correct
@binding(0) var<storage, read_write> positions:  array<vec4<f32>>;
@binding(1) var<storage, read_write> velocities: array<vec4<f32>>;
@binding(2) var<storage, read_write> forces:     array<vec4<f32>>;

// forbidden
struct Atom { pos: vec4<f32>, vel: vec4<f32>, force: vec4<f32> }
var<storage> atoms: array<Atom>;
```

Use `vec4` not `vec3`. Store charge or mass in the W component.

---

## Sim loop

```typescript
// SimulationEngine.ts — fire and forget, no awaiting in the hot loop
function tick(stepsPerFrame: number) {
  const encoder = device.createCommandEncoder()
  const pass = encoder.beginComputePass()

  pass.setPipeline(neighborListPipeline)
  pass.dispatchWorkgroups(Math.ceil(N / 64))

  pass.setPipeline(forcePipeline)
  pass.dispatchWorkgroups(Math.ceil(N / 64))

  pass.setPipeline(integratePipeline)
  pass.dispatchWorkgroups(Math.ceil(N / 64))

  pass.end()
  device.queue.submit([encoder.finish()])
}
```

---

## UI components

Components fire events. They do not call the backend.

```typescript
// correct
this.dispatchEvent(new CustomEvent('params-changed', { detail: newParams }))

// forbidden
backend.updateParams(newParams)
simEngine.step()
```

All styles use CSS variables from `theme.css`. No hardcoded colors or sizes anywhere.