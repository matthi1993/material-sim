// Render pass: instanced billboard sphere impostors. One instance per atom,
// six vertices per quad. Reads the live position storage buffer directly (no
// readback). Color/radius by atom type id stored in atomParams.w.

struct Camera {
  viewProj : mat4x4<f32>,
  right    : vec4<f32>, // camera right in world space (xyz)
  up       : vec4<f32>, // camera up in world space (xyz)
};

@group(0) @binding(0) var<uniform> cam: Camera;
@group(0) @binding(1) var<storage, read> pos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> atomParams: array<vec4<f32>>;

struct VSOut {
  @builtin(position) clip  : vec4<f32>,
  @location(0)       uv    : vec2<f32>,
  @location(1)       color : vec3<f32>,
};

// Palette keyed by the global element id stored in atomParams.w. Must match the
// ELEMENTS ids in params.ts. Returns rgb in xyz and the draw radius (nm) in w.
fn elementStyle(id: f32) -> vec4<f32> {
  let e = i32(id + 0.5);
  switch (e) {
    case 0:  { return vec4<f32>(0.91, 0.23, 0.17, 0.020); } // O  oxygen
    case 1:  { return vec4<f32>(0.93, 0.94, 0.97, 0.011); } // H  hydrogen
    case 2:  { return vec4<f32>(0.67, 0.40, 0.95, 0.022); } // Na sodium
    case 3:  { return vec4<f32>(0.36, 0.85, 0.45, 0.030); } // Cl chlorine
    case 4:  { return vec4<f32>(0.45, 0.92, 0.95, 0.030); } // Ar argon
    case 5:  { return vec4<f32>(0.80, 0.52, 0.40, 0.022); } // Fe iron
    case 6:  { return vec4<f32>(0.88, 0.55, 0.30, 0.024); } // Cu copper
    default: { return vec4<f32>(0.70, 0.72, 0.78, 0.020); }
  }
}

@vertex
fn vs(
  @builtin(vertex_index) vi: u32,
  @builtin(instance_index) ii: u32,
) -> VSOut {
  var offs = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 1.0, -1.0),
    vec2<f32>( 1.0,  1.0),
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 1.0,  1.0),
    vec2<f32>(-1.0,  1.0),
  );
  let o = offs[vi];

  let center = pos[ii].xyz;
  let style = elementStyle(atomParams[ii].w);
  let radius = style.w;
  let color = style.xyz;

  let world = center
    + cam.right.xyz * (o.x * radius)
    + cam.up.xyz * (o.y * radius);

  var out: VSOut;
  out.clip = cam.viewProj * vec4<f32>(world, 1.0);
  out.uv = o;
  out.color = color;
  return out;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4<f32> {
  let r2 = dot(in.uv, in.uv);
  if (r2 > 1.0) { discard; }
  let z = sqrt(1.0 - r2);
  let n = vec3<f32>(in.uv, z);
  let light = normalize(vec3<f32>(0.4, 0.6, 0.8));
  let diff = max(dot(n, light), 0.0);
  let shade = 0.25 + 0.75 * diff;
  return vec4<f32>(in.color * shade, 1.0);
}
