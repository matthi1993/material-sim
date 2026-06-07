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

@group(0) @binding(0) var<uniform> cam: Camera;
@group(0) @binding(1) var<uniform> viz: Viz;
@group(0) @binding(2) var<storage, read> pos: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> segCount: array<u32>;
@group(0) @binding(4) var<storage, read> segPairs: array<u32>;
@group(0) @binding(5) var<storage, read> vel: array<vec4<f32>>;

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
  let tileX = max(1u, u32(cam.tileGrid.x + 0.5));
  let tileY = max(1u, u32(cam.tileGrid.y + 0.5));
  let tileZ = max(1u, u32(cam.tileGrid.z + 0.5));
  let tileCount = tileX * tileY * tileZ;
  let segIndex = ii % viz.maxSeg;
  let tileIndex = ii / viz.maxSeg;

  var out: VSOut;
  out.color = vec3<f32>(0.35, 0.85, 1.0);
  out.alpha = 1.0;

  if (tileIndex >= tileCount || segIndex >= segCount[0]) {
    out.clip = vec4<f32>(10.0, 10.0, 10.0, 1.0); // off-screen -> clipped
    return out;
  }

  let ia = segPairs[segIndex * 4u];
  let ib = segPairs[segIndex * 4u + 1u];
  if (vel[ia].w <= 0.0 || vel[ib].w <= 0.0) {
    out.clip = vec4<f32>(10.0, 10.0, 10.0, 1.0);
    out.alpha = 0.0;
    return out;
  }
  out.alpha = bitcast<f32>(segPairs[segIndex * 4u + 2u]) * viz.lineOpacity;
  out.color = kindColor(segPairs[segIndex * 4u + 3u]);
  let tx = tileIndex % tileX;
  let ty = (tileIndex / tileX) % tileY;
  let tz = tileIndex / (tileX * tileY);
  let tileOffset = vec3<f32>(
    (f32(tx) - 0.5 * f32(tileX - 1u)) * cam.boxSize.x,
    (f32(ty) - 0.5 * f32(tileY - 1u)) * cam.boxSize.y,
    (f32(tz) - 0.5 * f32(tileZ - 1u)) * cam.boxSize.z,
  );
  let aBase = pos[ia].xyz;
  let bBase = aBase - minImage(aBase - pos[ib].xyz, viz.box); // nearest image of partner
  let a = aBase + tileOffset;
  let b = bBase + tileOffset;

  let world = select(b, a, vi == 0u);
  out.clip = cam.viewProj * vec4<f32>(world, 1.0);
  return out;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, in.alpha);
}
