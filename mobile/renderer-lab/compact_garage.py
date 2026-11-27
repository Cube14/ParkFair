"""Build an optional local garage derivative with smaller architecture maps."""
import argparse
import io
import json
import struct
from pathlib import Path

from PIL import Image


def compact(source, output):
    raw = source.read_bytes()
    length, = struct.unpack_from('<I', raw, 12)
    if raw[:4] != b'glTF' or raw[16:20] != b'JSON' or raw[24 + length:28 + length] != b'BIN\0':
        raise ValueError('Expected an embedded GLB with one binary chunk')
    doc = json.loads(raw[20:20 + length])
    if len(doc['buffers']) != 1 or any(view.get('extensions') for view in doc['bufferViews']):
        raise ValueError('Compressed buffer views cannot be repacked by this tool')
    car_data = memoryview(raw)[28 + length:]
    maps = {image['bufferView']: image['mimeType'] for image in doc['images'][10:]}
    if len(maps) != 4 or 'environmentSource' not in doc['asset'].get('extras', {}):
        raise ValueError('Expected the composed Porsche and Brutalist scene with four concrete maps')
    updated = bytearray()
    for index, view in enumerate(doc['bufferViews']):
        start = view.get('byteOffset', 0)
        data = car_data[start:start + view['byteLength']]
        if index in maps:
            with Image.open(io.BytesIO(data)) as image:
                image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
                buffer = io.BytesIO()
                if maps[index] == 'image/jpeg':
                    image.save(buffer, format='JPEG', quality=92, optimize=True)
                elif maps[index] == 'image/png':
                    image.save(buffer, format='PNG', optimize=True)
                else:
                    raise ValueError('Unexpected concrete texture format')
                data = buffer.getvalue()
        updated.extend(b'\0' * (-len(updated) % 4))
        view.update(byteOffset=len(updated), byteLength=len(data))
        updated.extend(data)
    updated.extend(b'\0' * (-len(updated) % 4))
    doc['buffers'][0]['byteLength'] = len(updated)
    doc['asset']['extras']['evaluationChange'] = 'Concrete maps reduced to at most 1024 pixels. Porsche data and geometry preserved.'
    manifest = json.dumps(doc, separators=(',', ':')).encode()
    manifest += b' ' * (-len(manifest) % 4)
    with output.open('wb') as destination:
        destination.write(struct.pack('<4sIIII', b'glTF', 2, 28 + len(manifest) + len(updated), len(manifest), 0x4E4F534A))
        destination.write(manifest)
        destination.write(struct.pack('<I4s', len(updated), b'BIN\0'))
        destination.write(updated)
    print(f'{source.stat().st_size:,} -> {output.stat().st_size:,} bytes')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    if args.source.resolve() == args.output.resolve() or args.output.exists() and args.output.samefile(args.source):
        parser.error('Use a separate output path for the texture study')
    compact(args.source, args.output)
