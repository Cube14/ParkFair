// Map the same drawing coordinates used by the native plan into the study's local world.
export function studyCoordinates(layout) {
  const { drawing, worldScale, positions } = layout;
  const x = value => (value - drawing.width / 2) * worldScale.x;
  const z = value => (value - drawing.height / 2) * worldScale.z;
  return { x, z, bays: positions };
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

  rectangle('column', layout.building, 0, 4.4);
  rectangle('canopy', inset(layout.building, 4, 4), 4.4, 4.7);
  for (const line of [.26, .52, .78]) {
    const zLine = layout.building.y + layout.building.depth * line;
    box('joint', layout.building.x, zLine, layout.building.x + layout.building.width, zLine + 1, 4.7, 4.72);
  }

  for (const bay of layout.bays) {
    const y = .046;
    rectangle('bay', bay, y, y + .011);
    const right = bay.x + bay.width, end = bay.y + bay.depth;
    for (const edge of [bay.y, end - 1.1]) box('stripe', bay.x, edge, right, edge + 1.1, y + .012, y + .023);
    for (const edge of [bay.x, right - 1.1]) box('stripe', edge, bay.y, edge + 1.1, end, y + .012, y + .023);
    if (bay.flex) {
      const mid = bay.x + bay.width / 2;
      for (const part of [.16, .40, .64]) box('stripe', mid, bay.y + bay.depth * part, mid + .8,
        bay.y + bay.depth * (part + .12), y + .012, y + .023);
    }
  }

  for (const column of layout.columns) {
    box('contact', column.x - 5, column.y - 4, column.x + 8, column.y + 5, .038, .041);
    box('foundation', column.x - 4, column.y - 3, column.x + 4, column.y + 3, .041, .16);
    box('column', column.x - 2.5, column.y - 2.1, column.x + 2.5, column.y + 2.1, .16, 2.69);
  }
  for (const beam of layout.beams) rectangle('beam', beam, 2.62, 2.92);
  for (const strip of layout.roofStrips) rectangle('canopy', strip, 2.89, 3.08);

  // The divided aisle has opposing arrow markings; it conveys no driving directions for the real site.
  const { aisle } = layout;
  for (const fraction of [.16, .32, .49, .66, .84]) {
    const zLine = aisle.y + aisle.depth * fraction;
    const centre = aisle.x + aisle.width / 2;
    box('joint', centre, zLine - 10, centre + 1, zLine + 10, .035, .042);
    for (const direction of [-1, 1]) {
      const lane = centre + direction * aisle.width / 4;
      box('stripe', lane - .7, zLine - 7, lane + .7, zLine + 7, .035, .042);
      const leads = direction === 1 ? [[lane - 3, zLine + 5], [lane, zLine + 13], [lane + 3, zLine + 5]]
        : [[lane + 3, zLine - 5], [lane, zLine - 13], [lane - 3, zLine - 5]];
      const mesh = groups.get('stripe');
      for (const [px, pz] of leads) { mesh.positions.push(x(px), .045, z(pz)); mesh.normals.push(0, 1, 0); }
    }
  }

  for (const bay of bays) {
    const background = groups.get('bay').pbrMetallicRoughness;
    groups.set('select:' + bay.name, { positions: [], normals: [], pbrMetallicRoughness: background });
    const insetBay = inset(bay, 2.5, 3);
    const level = ["A", "B"].includes(bay.position) ? .073 : .065;
    rectangle('select:' + bay.name, insetBay, level, level + .003);
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
    accentColor: groups.get('accent').pbrMetallicRoughness.baseColorFactor, selectionColor: [...blend(palette.paper, palette.gold, .28), 1] };
}
