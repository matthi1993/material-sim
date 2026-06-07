// Render pass: instanced billboard sphere impostors. One instance per atom,
// six vertices per quad. Reads the live position storage buffer directly (no
// readback). Color/radius by atom type id stored in atomParams.w.

struct Camera {
  viewProj : mat4x4<f32>,
  right    : vec4<f32>, // camera right in world space (xyz), atom-size scale (w)
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
// Radii are roughly proportional to real atomic size (relative, not exact).
fn elementStyle(id: f32) -> vec4<f32> {
  let e = i32(id + 0.5);
  switch (e) {
    case 0:  { return vec4<f32>(0.91, 0.23, 0.17, 0.020); } // O  oxygen
    case 1:  { return vec4<f32>(0.93, 0.94, 0.97, 0.012); } // H  hydrogen
    case 2:  { return vec4<f32>(0.67, 0.40, 0.95, 0.024); } // Na sodium
    case 3:  { return vec4<f32>(0.36, 0.85, 0.45, 0.030); } // Cl chlorine
    case 4:  { return vec4<f32>(0.45, 0.92, 0.95, 0.030); } // Ar argon
    case 5:  { return vec4<f32>(0.80, 0.52, 0.40, 0.024); } // Fe iron
    case 6:  { return vec4<f32>(0.88, 0.55, 0.30, 0.024); } // Cu copper
    case 7:  { return vec4<f32>(0.56, 0.25, 0.83, 0.032); } // K  potassium
    case 8:  { return vec4<f32>(0.65, 0.26, 0.18, 0.033); } // Br bromine
    case 9:  { return vec4<f32>(0.70, 0.89, 0.96, 0.026); } // Ne neon
    case 10: { return vec4<f32>(1.00, 0.82, 0.14, 0.026); } // Au gold
    case 11: { return vec4<f32>(0.78, 0.80, 0.84, 0.026); } // Ag silver
    case 12: { return vec4<f32>(0.46, 0.62, 0.55, 0.023); } // Ni nickel
    case 13: { return vec4<f32>(0.44, 0.46, 0.50, 0.017); } // C  carbon
    case 14: { return vec4<f32>(0.29, 0.42, 1.00, 0.018); } // N  nitrogen
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
  let radius = style.w * max(cam.right.w, 0.0001);
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
  // Blinn-Phong specular highlight (view direction ~ +z for a billboard).
  let h = normalize(light + vec3<f32>(0.0, 0.0, 1.0));
  let spec = pow(max(dot(n, h), 0.0), 28.0);
  // Soft rim term for depth separation against the dark background.
  let rim = pow(1.0 - z, 2.0) * 0.18;
  let shade = 0.22 + 0.78 * diff;
  let col = in.color * shade + vec3<f32>(spec * 0.35 + rim);
  return vec4<f32>(col, 1.0);
}
