// Map the same drawing coordinates used by the native plan into the study's local world.
export function studyCoordinates(layout) {
  const { drawing, metresPerUnit, baySize } = layout;
  const x = value => (value - drawing.width / 2) * metresPerUnit.x;
  const z = value => (value - drawing.height / 2) * metresPerUnit.z;
  const bays = layout.rows.flatMap(row => row.names.map((name, index) => ({
    name, area: row.area, x: row.x + index * row.spacing, y: row.y,
    ...baySize,
  })));
  return { x, z, bays };
}

const toLinear = hex => hex.match(/\w{2}/g).map(pair => {
  const value = parseInt(pair, 16) / 255;
  return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
});

export function createStudyModel(layout, palette) {
  const { x, z, bays } = studyCoordinates(layout);
  const groups = new Map();
  const blend = (first, second, amount) => {
    const target = toLinear(second);
    return toLinear(first).map((value, i) => value * (1 - amount) + target[i] * amount);
  };
  const define = (name, color, roughnessFactor, metallicFactor = 0) => {
    const rgba = [...(typeof color === 'string' ? toLinear(color) : color), 1];
    groups.set(name, { positions: [], normals: [], pbrMetallicRoughness: { baseColorFactor: rgba, roughnessFactor, metallicFactor } });
  };
  define('foundation', blend(palette.rule, palette.muted, .65), .87);
  define('edge', blend(palette.plate, palette.muted, .27), .78);
  define('plaza', blend(palette.stone, palette.muted, .09), .96);
  define('bay', palette.paper, .84);
  define('column', blend(palette.plate, palette.muted, .45), .72);
  define('beam', blend(palette.rule, palette.muted, .59), .61, .13);
  define('stripe', palette.muted, .78);
  define('joint', palette.rule, 1);
  define('accent', blend(palette.gold, palette.plate, .21), .59, .17);
  define('canopy', blend(palette.stone, palette.muted, .32), .68);
  define('contact', blend(palette.stone, palette.muted, .25), 1);

  function top(group, a, b, c, d) {
    const mesh = groups.get(group);
    mesh.positions.push(...a, ...b, ...c, ...a, ...c, ...d);
    for (let vertex = 0; vertex < 6; vertex++) mesh.normals.push(0, 1, 0);
  }

  function box(group, left, front, right, back, bottom, height) {
    const a = [x(left), bottom, z(front)], b = [x(right), bottom, z(front)];
    const c = [x(right), bottom, z(back)], d = [x(left), bottom, z(back)];
    const e = [a[0], height, a[2]], f = [b[0], height, b[2]], g = [c[0], height, c[2]], h = [d[0], height, d[2]];
    top(group, e, h, g, f);
    const mesh = groups.get(group);
    for (const [p, q, r, s, normal] of [[a,b,f,e,[0,0,-1]], [b,c,g,f,[1,0,0]], [c,d,h,g,[0,0,1]], [d,a,e,h,[-1,0,0]]]) {
      mesh.positions.push(...p, ...r, ...q, ...p, ...s, ...r);
      for (let vertex = 0; vertex < 6; vertex++) mesh.normals.push(...normal);
    }
  }

  function rectangle(group, shape, base, height) {
    box(group, shape.x, shape.y, shape.x + shape.width, shape.y + shape.depth, base, height);
  }

  const inset = (shape, horizontal, vertical) => ({ x: shape.x + horizontal, y: shape.y + vertical,
    width: shape.width - 2 * horizontal, depth: shape.depth - 2 * vertical });
  rectangle('foundation', layout.plinth, -.66, -.22);
  rectangle('edge', inset(layout.plinth, 3, 4), -.22, -.08);
  rectangle('plaza', inset(layout.plinth, 6, 7), -.08, 0);
  rectangle('plaza', layout.covered, 0, .035);
  rectangle('edge', layout.outdoor, 0, .027);
  rectangle('edge', layout.aisle, 0, .032);
  rectangle('edge', layout.connector, 0, .022);

  // Long control joints and lifted edges describe the model as a cutaway building study.
  for (const pos of layout.pavingJoints.x) {
    for (const [start, stop] of layout.pavingJoints.runs) box('joint', pos, start, pos + .65, stop, .008, .012);
  }
  for (const curb of layout.curbs) rectangle('edge', curb, .035, .18);
  for (const planter of layout.planters) {
    rectangle('column', planter, .13, .44);
    rectangle('bay', inset(planter, 3, 1), .44, .47);
  }

  for (const bay of bays) {
    const y = bay.area === 'Outdoor' ? .03 : .043;
    rectangle('bay', bay, y, y + .013);
    const end = bay.y + bay.depth;
    for (const edge of [bay.x, bay.x + bay.width - 1.05]) box('stripe', edge, bay.y, edge + 1.05, end, y + .014, y + .02);
    const stop = bay.y === layout.rows[0].y ? bay.y + 3 : end - 5;
    box('column', bay.x + 9, stop, bay.x + bay.width - 9, stop + 2, y + .012, .15);
  }

  for (const column of layout.columnXs) {
    for (const row of layout.columnYs) {
      box('contact', column - 5, row - 3.4, column + 7.7, row + 5.2, .037, .039);
      box('foundation', column - 5, row - 3.6, column + 5, row + 3.6, .038, .145);
      box('column', column - 3.1, row - 2.15, column + 3.1, row + 2.15, .145, 2.69);
      box('beam', column - 4.1, row - 2.9, column + 4.1, row + 2.9, 2.57, 2.8);
    }
  }
  const leftColumn = Math.min(...layout.columnXs), rightColumn = Math.max(...layout.columnXs);
  for (const row of layout.columnYs) box('beam', leftColumn - 7, row - 2.4, rightColumn + 7, row + 2.4, 2.68, 2.93);
  for (const column of layout.columnXs) {
    for (const [i, row] of layout.columnYs.entries()) {
      const next = layout.columnYs[i + 1];
      if (next && (next < layout.aisle.y || row > layout.aisle.y + layout.aisle.depth)) {
        box('beam', column - 2.5, row - 6, column + 2.5, next + 6, 2.78, 3.03);
      }
    }
  }
  // A partial roof and perimeter fascia leave the bays visible under both cameras.
  for (const strip of layout.roofStrips) {
    rectangle('canopy', strip, 2.91, 3.10);
    box('beam', strip.x - 2, strip.y - 2, strip.x + strip.width + 2, strip.y + 1, 2.82, 3.19);
  }
  const centre = layout.aisle.y + layout.aisle.depth / 2;
  for (const fraction of [.045, .24, .43, .625, .82]) {
    const pos = layout.aisle.x + layout.aisle.width * fraction;
    box('stripe', pos, centre - .6, pos + 21, centre + .6, .034, .043);
    const points = [[pos + 19, centre - 3.3], [pos + 19, centre + 3.3], [pos + 25, centre]];
    const mesh = groups.get('stripe');
    for (const [px, pz] of points) { mesh.positions.push(x(px), .044, z(pz)); mesh.normals.push(0, 1, 0); }
  }

  // A separate mesh for each bay lets selection change material without reloading the scene.
  for (const bay of bays) {
    const background = groups.get('bay').pbrMetallicRoughness;
    groups.set('select:' + bay.name, { positions: [], normals: [], pbrMetallicRoughness: background });
    box('select:' + bay.name, bay.x + 1.4, bay.y + 9, bay.x + bay.width - 1.4, bay.y + bay.depth - 8, .061, .064);
  }

  const document = { asset: { version: '2.0', generator: 'ParkFair architectural study' }, scene: 0,
    scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }], meshes: [{ primitives: [] }],
    materials: [], accessors: [], bufferViews: [], buffers: [{ byteLength: 0 }] };
  const chunks = [];
  let offset = 0;
  function accessor(values, bounds) {
    const floats = Float32Array.from(values);
    const view = document.bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: floats.byteLength, target: 34962 }) - 1;
    offset += floats.byteLength;
    chunks.push(new Uint8Array(floats.buffer));
    const entry = { bufferView: view, componentType: 5126, count: values.length / 3, type: 'VEC3' };
    if (bounds) {
      entry.min = [Infinity, Infinity, Infinity]; entry.max = [-Infinity, -Infinity, -Infinity];
      values.forEach((value, i) => {
        const axis = i % 3;
        entry.min[axis] = Math.min(entry.min[axis], value);
        entry.max[axis] = Math.max(entry.max[axis], value);
      });
    }
    return document.accessors.push(entry) - 1;
  }
  let triangles = 0;
  for (const [name, mesh] of groups) {
    if (!mesh.positions.length) continue;
    triangles += mesh.positions.length / 9;
    const material = document.materials.push({ name, pbrMetallicRoughness: mesh.pbrMetallicRoughness }) - 1;
    document.meshes[0].primitives.push({ material, attributes: { POSITION: accessor(mesh.positions, true), NORMAL: accessor(mesh.normals, false) } });
  }
  document.buffers[0].byteLength = offset;
  const manifest = new TextEncoder().encode(JSON.stringify(document));
  const jsonLength = (manifest.length + 3) & ~3;
  const header = new Uint32Array([0x46546c67, 2, 28 + jsonLength + offset, jsonLength, 0x4e4f534a]);
  const padding = new Uint8Array(jsonLength - manifest.length).fill(32);
  const bin = new Uint32Array([offset, 0x004e4942]);
  const model = new Blob([header, manifest, padding, bin, ...chunks], { type: 'model/gltf-binary' });
  return { model, triangles, bayColor: groups.get('bay').pbrMetallicRoughness.baseColorFactor,
    accentColor: groups.get('accent').pbrMetallicRoughness.baseColorFactor };
}
