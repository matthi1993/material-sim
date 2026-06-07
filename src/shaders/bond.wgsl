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
  tileGrid : vec4<f32>,
  boxSize  : vec4<f32>,
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
  boundaryMode  : u32, // 0 = periodic, 1 = open, 2 = open-top
};

struct MolBond {
  ij  : vec2<u32>,
  par : vec2<f32>, // r0, k
};

@group(0) @binding(0) var<uniform> cam: Camera;
@group(0) @binding(1) var<uniform> viz: Viz;
@group(0) @binding(2) var<storage, read> pos: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> bonds: array<MolBond>;
@group(0) @binding(4) var<storage, read> vel: array<vec4<f32>>;

fn minImage(d: vec3<f32>, box: vec3<f32>) -> vec3<f32> {
  if (viz.boundaryMode == 1u) { return d; }
  if (viz.boundaryMode == 2u) {
    return vec3<f32>(
      d.x - box.x * round(d.x / box.x),
      d.y,
      d.z - box.z * round(d.z / box.z),
    );
  }
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
  let tileX = max(1u, u32(cam.tileGrid.x + 0.5));
  let tileY = max(1u, u32(cam.tileGrid.y + 0.5));
  let tileZ = max(1u, u32(cam.tileGrid.z + 0.5));
  let tileCount = tileX * tileY * tileZ;
  let bondsPerTile = arrayLength(&bonds);
  let bondIndex = ii % bondsPerTile;
  let tileIndex = ii / bondsPerTile;
  let bond = bonds[bondIndex];
  let ia = bond.ij.x;
  let ib = bond.ij.y;
  if (tileIndex >= tileCount || vel[ia].w <= 0.0 || vel[ib].w <= 0.0) {
    var dead: VSOut;
    dead.clip = vec4<f32>(2.0, 2.0, 2.0, 1.0);
    dead.color = vec3<f32>(0.0);
    dead.alpha = 0.0;
    return dead;
  }
  let r0 = bond.par.x;
  let kb = bond.par.y;

  let tx = tileIndex % tileX;
  let ty = (tileIndex / tileX) % tileY;
  let tz = tileIndex / (tileX * tileY);
  let tileOffset = vec3<f32>(
    (f32(tx) - 0.5 * f32(tileX - 1u)) * cam.boxSize.x,
    (f32(ty) - 0.5 * f32(tileY - 1u)) * cam.boxSize.y,
    (f32(tz) - 0.5 * f32(tileZ - 1u)) * cam.boxSize.z,
  );
  let aBase = pos[ia].xyz;
  let bBase = aBase + minImage(pos[ib].xyz - aBase, viz.box);
  let a = aBase + tileOffset;
  let b = bBase + tileOffset;

  // Bond stretch force magnitude k*|r - r0|, faded like the attraction overlay.
  let r = length(b - a);
  let fmag = kb * abs(r - r0);
  let alpha = clamp((fmag - viz.bondThresh) / (viz.bondThresh * 1.5), 0.2, 1.0);

  let world = select(b, a, vi == 0u);

  var out: VSOut;
  out.clip = cam.viewProj * vec4<f32>(world, 1.0);
  out.color = vec3<f32>(0.9, 0.9, 0.9); // bonds — grey
  out.alpha = alpha * viz.lineOpacity;
  return out;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, in.alpha);
}
