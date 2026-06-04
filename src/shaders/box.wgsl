// Periodic simulation-box wireframe. Draws the 12 edges of the [0,box] cuboid
// as faint line segments so the user can see the cell the atoms live in. One
// line-list instance per edge; the two endpoints are the box corners. Reads
// only the camera and the box extents (from the shared Viz uniform).

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
  lineOpacity   : f32,
};

@group(0) @binding(0) var<uniform> cam: Camera;
@group(0) @binding(1) var<uniform> viz: Viz;

// Corner index -> unit cuboid corner (0 or 1 per axis).
fn corner(c: u32) -> vec3<f32> {
  return vec3<f32>(
    f32(c & 1u),
    f32((c >> 1u) & 1u),
    f32((c >> 2u) & 1u),
  );
}

@vertex
fn vs(
  @builtin(vertex_index) vi: u32,
  @builtin(instance_index) ii: u32,
) -> @builtin(position) vec4<f32> {
  // 12 edges as pairs of corner indices.
  var edges = array<u32, 24>(
    0u, 1u,  1u, 3u,  3u, 2u,  2u, 0u, // bottom face
    4u, 5u,  5u, 7u,  7u, 6u,  6u, 4u, // top face
    0u, 4u,  1u, 5u,  2u, 6u,  3u, 7u, // verticals
  );
  let cIdx = edges[ii * 2u + vi];
  let world = corner(cIdx) * viz.box;
  return cam.viewProj * vec4<f32>(world, 1.0);
}

@fragment
fn fs() -> @location(0) vec4<f32> {
  return vec4<f32>(0.40, 0.46, 0.60, 0.45);
}
