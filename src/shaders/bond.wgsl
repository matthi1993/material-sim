// Intramolecular bonds (each O-H inside a molecule) drawn as line segments.
// One line-list instance per bond; the two endpoints are reconstructed with the
// minimum image so a molecule wrapped across the periodic box still draws one
// short, connected bond. Reads live positions directly (no readback). The line
// opacity fades with the bond stretch force magnitude, matching the attraction
// overlay, so strained bonds read brighter than relaxed ones.

struct Camera {
  viewProj : mat4x4<f32>,
  right    : vec4<f32>,
  up       : vec4<f32>,
};

struct Viz {
  box           : vec3<f32>,
  coulombK      : f32,
  cutoff2       : f32,
  coulombThresh : f32,
  numAtoms      : u32,
  maxSeg        : u32,
  ljThresh      : f32,
  bondThresh    : f32,
  bondR0        : f32,
  bondK         : f32,
};

@group(0) @binding(0) var<uniform> cam: Camera;
@group(0) @binding(1) var<uniform> viz: Viz;
@group(0) @binding(2) var<storage, read> pos: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> bondPairs: array<u32>;

fn minImage(d: vec3<f32>, box: vec3<f32>) -> vec3<f32> {
  return d - box * round(d / box);
}

struct VSOut {
  @builtin(position) clip  : vec4<f32>,
  @location(0)       color : vec3<f32>,
  @location(1)       alpha : f32,
};

@vertex
fn vs(
  @builtin(vertex_index) vi: u32,
  @builtin(instance_index) ii: u32,
) -> VSOut {
  let ia = bondPairs[ii * 2u];
  let ib = bondPairs[ii * 2u + 1u];

  let a = pos[ia].xyz;
  let b = a + minImage(pos[ib].xyz - a, viz.box);

  // Bond stretch force magnitude k*|r - r0|, faded like the attraction overlay.
  let r = length(b - a);
  let fmag = viz.bondK * abs(r - viz.bondR0);
  let alpha = clamp((fmag - viz.bondThresh) / (viz.bondThresh * 1.5), 0.2, 1.0);

  let world = select(b, a, vi == 0u);

  var out: VSOut;
  out.clip = cam.viewProj * vec4<f32>(world, 1.0);
  out.color = vec3<f32>(0.9, 0.9, 0.9); // bonds — grey
  out.alpha = alpha;
  return out;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, in.alpha);
}
