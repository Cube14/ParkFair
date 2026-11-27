"""Build local evaluation scenes without changing the three source models."""
import argparse
import copy
import json
import struct
from pathlib import Path

import numpy as np
import OpenEXR

ARRAYS = ('bufferViews', 'accessors', 'images', 'samplers', 'textures', 'materials', 'meshes', 'nodes')


def load_glb(path):
    raw = path.read_bytes()
    length, = struct.unpack_from('<I', raw, 12)
    if raw[:4] != b'glTF' or raw[16:20] != b'JSON' or raw[24 + length:28 + length] != b'BIN\0':
        raise ValueError(f'Expected a self-contained GLB: {path}')
    doc = json.loads(raw[20:20 + length])
    if len(doc['buffers']) != 1 or doc.get('animations') or doc.get('skins') or doc.get('cameras'):
        raise ValueError(f'Only the static evaluation assets are supported: {path}')
    return doc, raw[28 + length:]


def compose(car, room, output, floor):
    base, car_bin = load_glb(car)
    architecture, room_bin = load_glb(room)
    room_asset = copy.deepcopy(architecture['asset'])
    offsets = {name: len(base.setdefault(name, [])) for name in ARRAYS}

    def shift(obj, name, collection):
        if name in obj:
            obj[name] += offsets[collection]

    def textures(obj):
        for key, value in obj.items():
            if isinstance(value, dict):
                if key.lower().endswith('texture'):
                    shift(value, 'index', 'textures')
                textures(value)

    for view in architecture['bufferViews']:
        view['byteOffset'] = len(car_bin) + view.get('byteOffset', 0)
    for acc in architecture['accessors']:
        shift(acc, 'bufferView', 'bufferViews')
        if 'sparse' in acc:
            raise ValueError('Sparse architecture accessors are outside this tool’s scope.')
    for image in architecture.get('images', []):
        shift(image, 'bufferView', 'bufferViews')
    for texture in architecture.get('textures', []):
        shift(texture, 'source', 'images')
        shift(texture, 'sampler', 'samplers')
    for material in architecture.get('materials', []):
        textures(material)
    for mesh in architecture['meshes']:
        for primitive in mesh['primitives']:
            shift(primitive, 'indices', 'accessors')
            shift(primitive, 'material', 'materials')
            for name in primitive['attributes']:
                shift(primitive['attributes'], name, 'accessors')
    for node in architecture['nodes']:
        shift(node, 'mesh', 'meshes')
        if 'children' in node:
            node['children'] = [index + offsets['nodes'] for index in node['children']]
    for name in ARRAYS:
        base[name].extend(architecture.get(name, []))

    scene = base['scenes'][base.get('scene', 0)]
    car_roots = scene['nodes']
    room_roots = [idx + offsets['nodes'] for idx in architecture['scenes'][architecture.get('scene', 0)]['nodes']]
    car_root = len(base['nodes'])
    # Stock wheel minimum is -0.6325 m. In the derived scene its tyres sit at the room floor.
    base['nodes'].append({'name': 'Porsche floor alignment', 'translation': [0, floor + .633, 0], 'children': car_roots})
    brutalist = 'brutalist' in room.stem
    if brutalist:
        # Move the original hall around the parked car so two real walls frame the bay.
        room_node = len(base['nodes'])
        base['nodes'].append({'name': 'Concrete bay placement', 'translation': [12, 0, 12], 'children': room_roots})
        room_roots = [room_node]
    scene['nodes'] = [*room_roots, car_root]
    base['asset'].setdefault('extras', {})['environmentSource'] = room_asset
    base['extensionsUsed'] = list(dict.fromkeys(base.get('extensionsUsed', []) + architecture.get('extensionsUsed', [])))
    # Warm overhead pools and a neutral rear fill reveal the actual concrete and walls.
    # The spots point down from the ceiling and stay clear of the windshield sightline.
    lighting = 'KHR_lights_punctual'
    base['extensionsUsed'].append(lighting)
    lights = []
    base.setdefault('extensions', {})[lighting] = {'lights': lights}
    ceiling = 3.3 if brutalist else 4.6
    for label, x, z, color, intensity in [
        ('Arrival', -3, 1, [1, .91, .80], 81),
        ('Parking bay', 2.7, -1.4, [1, .93, .84], 72),
        ('Rear passage', -5, -3.6, [1, .95, .87], 87),
        ('Rear wall', 1, -3.6, [1, .92, .85], 74),
        ('Forecourt', .4, 4, [1, .95, .89], 95),
        ('Corner wash', -7, -3, [1, .92, .84], 56),
    ]:
        scene['nodes'].append(len(base['nodes']))
        base['nodes'].append({'name': label, 'translation': [x, ceiling, z],
                              'rotation': [-.7071067812, 0, 0, .7071067812],
                              'extensions': {lighting: {'light': len(lights)}}})
        lights.append({'name': label, 'type': 'spot', 'color': color, 'intensity': intensity,
                       'range': 12, 'spot': {'innerConeAngle': .30, 'outerConeAngle': .77}})
    combined = car_bin + room_bin
    base['buffers'][0]['byteLength'] = len(combined)
    encoded = json.dumps(base, separators=(',', ':')).encode()
    encoded += b' ' * (-len(encoded) % 4)
    output.write_bytes(struct.pack('<4sIIII', b'glTF', 2, 28 + len(encoded) + len(combined),
                                  len(encoded), 0x4E4F534A) +
                       encoded + struct.pack('<I4s', len(combined), b'BIN\0') + combined)


def convert_hdr(source, destination):
    with OpenEXR.File(str(source)) as image:
        pixels = image.channels()['RGB'].pixels[..., :3]
        height, width, _ = pixels.shape
        if width % 1024 or height * 2 != width:
            raise ValueError(f'Expected 2:1 equirectangular EXR: {source}')
        step = width // 1024
        pixels = pixels.reshape(height // step, step, 1024, step, 3).mean(axis=(1, 3))
    pixels = np.maximum(np.nan_to_num(pixels), 0)
    peak = pixels.max(axis=2)
    fraction, exponent = np.frexp(peak)
    scale = np.divide(fraction * 256, peak, out=np.zeros_like(peak), where=peak > 1e-32)
    rgbe = np.dstack((np.clip(pixels * scale[..., None], 0, 255), np.where(peak > 1e-32, exponent + 128, 0))).astype('uint8')
    with destination.open('wb') as f:
        f.write(f'#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y {len(rgbe)} +X 1024\n'.encode())
        for row in rgbe:
            f.write(bytes((2, 2, 4, 0)))
            for channel in row.T:
                for start in range(0, 1024, 128):
                    f.write(b'\x80' + channel[start:start + 128].tobytes())


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--assets', type=Path, required=True)
    parser.add_argument('--porsche', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    for label, file, floor in [
        ('brutalist', 'brutalist_interior.glb', .006),
        ('showroom', 'garageshowroom_vr_ready.glb', .010),
    ]:
        compose(args.porsche, args.assets / 'Environments' / file, args.output / f'garage-{label}.glb', floor)
    for variant in ['04', '08']:
        convert_hdr(args.assets / 'HDRI' / f'studio_small_{variant}_4k.exr', args.output / f'studio-{variant}-1k.hdr')
