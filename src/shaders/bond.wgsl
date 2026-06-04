// Cylinder impostors for intramolecular bonds (each O-H inside a molecule).
// One instance per bond; six vertices form a camera-facing ribbon stretched
// between the two bonded atoms and the fragment shader rounds the cross-section
// so it reads as a lit 3D cylinder. Reads live positions directly (no readback).
// Endpoints are reconstructed with the minimum image so a molecule wrapped
// across the periodic box still draws one short, connected bond.

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
@group(0) @binding(3) var<storage, read> bondPairs: array<u32>;

fn minImage(d: vec3<f32>, box: vec3<f32>) -> vec3<f32> {
  return d - box * round(d / box);
}

struct VSOut {
  @builtin(position) clip  : vec4<f32>,
  @location(0)       cross : f32, // -1..1 across the cylinder width
};

const BOND_RADIUS = 0.003; // nm

@vertex
fn vs(
  @builtin(vertex_index) vi: u32,
  @builtin(instance_index) ii: u32,
) -> VSOut {
  let ia = bondPairs[ii * 2u];
  let ib = bondPairs[ii * 2u + 1u];

  let a = pos[ia].xyz;
  let b = a + minImage(pos[ib].xyz - a, viz.box);
  let axis = b - a;

  // View direction (eye -> scene) from the camera basis.
  let viewDir = normalize(cross(cam.up.xyz, cam.right.xyz));
  // Screen-perpendicular offset so the ribbon always faces the camera.
  var side = cross(normalize(axis), viewDir);
  let sl = length(side);
  side = select(cam.right.xyz, side / sl, sl > 1e-6);

  var ts = array<vec2<f32>, 6>(
    vec2<f32>(0.0, -1.0),
    vec2<f32>(1.0, -1.0),
    vec2<f32>(1.0,  1.0),
    vec2<f32>(0.0, -1.0),
    vec2<f32>(1.0,  1.0),
    vec2<f32>(0.0,  1.0),
  );
  let p = ts[vi];
  let world = a + axis * p.x + side * (p.y * BOND_RADIUS);

  var out: VSOut;
  out.clip = cam.viewProj * vec4<f32>(world, 1.0);
  out.cross = p.y;
  return out;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4<f32> {
  // Curve the cross-section to fake a cylindrical surface normal.
  let nz = sqrt(max(0.0, 1.0 - in.cross * in.cross));
  let shade = 0.35 + 0.65 * nz;
  let color = vec3<f32>(0.78, 0.80, 0.85);
  return vec4<f32>(color * shade, 1.0);
}
