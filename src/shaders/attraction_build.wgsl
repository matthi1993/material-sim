// Builds the list of strong electrostatic attractions to visualize. One thread
// per atom; only positive charges scan (so each H...O pair is emitted once and
// never duplicated). For every oppositely-charged atom in a different molecule
// within the cutoff, the Coulomb attraction magnitude k*|qi*qj|/r^2 is compared
// against a threshold; pairs above it are appended (atomic counter) as index
// pairs the line render pass reads back without any CPU readback. A per-segment
// opacity (0..1) is also stored so the render pass can fade weak bonds in/out.

struct Viz {
  box       : vec3<f32>,
  coulombK  : f32,
  cutoff2   : f32,
  threshold : f32,
  numAtoms  : u32,
  maxSeg    : u32,
};

@group(0) @binding(0) var<uniform> viz: Viz;
@group(0) @binding(1) var<storage, read> pos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> atomParams: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read_write> segCount: atomic<u32>;
@group(0) @binding(4) var<storage, read_write> segPairs: array<u32>;

fn minImage(d: vec3<f32>, box: vec3<f32>) -> vec3<f32> {
  return d - box * round(d / box);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= viz.numAtoms) { return; }

  let qi = pos[i].w;
  if (qi <= 0.0) { return; }          // emit from positive charges only (dedup)

  let pi = pos[i].xyz;
  let molI = atomParams[i].z;

  for (var j: u32 = 0u; j < viz.numAtoms; j = j + 1u) {
    if (atomParams[j].z == molI) { continue; } // skip same molecule
    let qj = pos[j].w;
    if (qj >= 0.0) { continue; }       // need opposite sign (attractive)

    let d = minImage(pi - pos[j].xyz, viz.box);
    let r2 = dot(d, d);
    if (r2 > viz.cutoff2 || r2 < 1e-8) { continue; }

    let fmag = viz.coulombK * (-qi * qj) / r2; // attraction magnitude
    if (fmag < viz.threshold) { continue; }

    // Fade from the emission threshold up to ~2.5x threshold (fully opaque).
    let alpha = clamp((fmag - viz.threshold) / (viz.threshold * 1.5), 0.06, 1.0);

    let idx = atomicAdd(&segCount, 1u);
    if (idx < viz.maxSeg) {
      segPairs[idx * 3u] = i;
      segPairs[idx * 3u + 1u] = j;
      segPairs[idx * 3u + 2u] = bitcast<u32>(alpha);
    }
  }
}
