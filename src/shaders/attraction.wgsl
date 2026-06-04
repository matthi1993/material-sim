// Draws attractive interactions as line segments. One line-list instance per
// candidate slot; instances beyond the live count (filled by attraction_build)
// are pushed off-screen so they are clipped. Each segment carries a per-pair
// opacity and a "kind" used to pick a color (Coulomb vs Lennard-Jones). The
// second endpoint uses the minimum image of the partner atom so the line stays
// short when the pair interacts across a periodic boundary.

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
  lineOpacity   : f32, // master force/bond line opacity (0..1)
};

@group(0) @binding(0) var<uniform> cam: Camera;
@group(0) @binding(1) var<uniform> viz: Viz;
@group(0) @binding(2) var<storage, read> pos: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> segCount: array<u32>;
@group(0) @binding(4) var<storage, read> segPairs: array<u32>;

fn minImage(d: vec3<f32>, box: vec3<f32>) -> vec3<f32> {
  return d - box * round(d / box);
}

fn kindColor(kind: u32) -> vec3<f32> {
  switch (kind) {
    case 0u:  { return vec3<f32>(0.35, 0.85, 1.00); } // Coulomb — cyan
    case 1u:  { return vec3<f32>(0.10, 0.35, 0.20); } // Lennard-Jones — green
    default:  { return vec3<f32>(0.80, 0.80, 0.80); }
  }
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
  var out: VSOut;
  out.color = vec3<f32>(0.35, 0.85, 1.0);
  out.alpha = 1.0;

  if (ii >= segCount[0]) {
    out.clip = vec4<f32>(10.0, 10.0, 10.0, 1.0); // off-screen -> clipped
    return out;
  }

  let ia = segPairs[ii * 4u];
  let ib = segPairs[ii * 4u + 1u];
  out.alpha = bitcast<f32>(segPairs[ii * 4u + 2u]) * viz.lineOpacity;
  out.color = kindColor(segPairs[ii * 4u + 3u]);
  let a = pos[ia].xyz;
  let b = a - minImage(a - pos[ib].xyz, viz.box); // nearest image of partner

  let world = select(b, a, vi == 0u);
  out.clip = cam.viewProj * vec4<f32>(world, 1.0);
  return out;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, in.alpha);
}
