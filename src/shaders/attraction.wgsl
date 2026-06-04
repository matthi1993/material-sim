// Draws strong electrostatic attractions as line segments. One line-list
// instance per candidate slot; instances beyond the live count (filled by
// attraction_build) are pushed off-screen so they are clipped. The second
// endpoint uses the minimum image of the partner atom so the line stays short
// when the pair interacts across a periodic boundary.

struct Camera {
  viewProj : mat4x4<f32>,
  right    : vec4<f32>,
  up       : vec4<f32>,
};

struct Viz {
  box       : vec3<f32>,
  coulombK  : f32,
  cutoff2   : f32,
  threshold : f32,
  numAtoms  : u32,
  maxSeg    : u32,
};

@group(0) @binding(0) var<uniform> cam: Camera;
@group(0) @binding(1) var<uniform> viz: Viz;
@group(0) @binding(2) var<storage, read> pos: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> segCount: array<u32>;
@group(0) @binding(4) var<storage, read> segPairs: array<u32>;

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
  var out: VSOut;
  out.color = vec3<f32>(0.35, 0.85, 1.0);
  out.alpha = 1.0;

  if (ii >= segCount[0]) {
    out.clip = vec4<f32>(10.0, 10.0, 10.0, 1.0); // off-screen -> clipped
    return out;
  }

  let ia = segPairs[ii * 3u];
  let ib = segPairs[ii * 3u + 1u];
  out.alpha = bitcast<f32>(segPairs[ii * 3u + 2u]);
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
