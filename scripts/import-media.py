"""Rebuild approved original card images and audio from the fixed upstream backup.
Usage: python3 scripts/import-media.py /path/to/godfield-flash
Requires Pillow; the Flash file is parsed as data, never executed.
"""
from pathlib import Path
import csv, hashlib, io, json, math, shutil, struct, sys, zlib
from PIL import Image

root = Path(__file__).resolve().parent.parent
upstream = Path(sys.argv[1]).resolve()
static = upstream / 'client-files/static.godfield.net'
raw = (upstream / 'client-files/www.godfield.net/game/godfield.swf').read_bytes()
assert raw[:3] == b'CWS', 'Expected fixed compressed SWF backup'
body = zlib.decompress(raw[8:])
pos = (5 + 4 * (body[0] >> 3) + 7) // 8 + 4
binaries, symbols = {}, {}
while pos < len(body):
    header = struct.unpack_from('<H', body, pos)[0]; pos += 2
    tag, length = header >> 6, header & 63
    if length == 63:
        length = struct.unpack_from('<I', body, pos)[0]; pos += 4
    data = body[pos:pos+length]; pos += length
    if tag == 87:
        binaries[struct.unpack_from('<H', data)[0]] = data[6:]
    elif tag == 76:
        offset = 2
        for _ in range(struct.unpack_from('<H', data)[0]):
            char_id = struct.unpack_from('<H', data, offset)[0]; offset += 2
            end = data.index(0, offset)
            symbols[data[offset:end].decode()] = char_id; offset = end + 1
    if tag == 0: break

def embedded(suffix):
    matches = [char_id for name, char_id in symbols.items() if name.endswith(suffix)]
    assert len(matches) == 1, suffix
    return binaries[matches[0]]
def rows(data):
    return list(csv.reader(data.decode('utf-8-sig').splitlines()))
def sha(data): return hashlib.sha256(data).hexdigest()
def dump(path, data): path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

rule_bytes = embedded('game.ItemData_CSV')
assert rows(rule_bytes) == rows((upstream / 'server-src/ItemData.CSV').read_bytes())
rules = rows(rule_bytes)
display_bytes = embedded('client.data.EnglishData_Item')
display = rows(display_bytes)
assistant_bytes = embedded('client.data.EnglishData_AssistantItem')
assistant_display = rows(assistant_bytes)
assert len(rules) == len(display) == 364
assert len(assistant_display) == 42
source_files = sorted((static/'images/card').rglob('*.png'))
assert len(source_files) == 317
cell = 80
output = root/'client/public/assets/original'; output.mkdir(parents=True, exist_ok=True)
old_atlas = output/'card-atlas.webp'
if old_atlas.exists(): old_atlas.unlink()
entries = {}
for index, file in enumerate(source_files):
    image = Image.open(file).convert('RGBA')
    assert image.width <= cell and image.height <= cell
    canvas = Image.new('RGBA', (cell, cell))
    canvas.paste(image, ((cell-image.width)//2, (cell-image.height)//2))
    target = output/(str(index).zfill(3)+'.webp')
    canvas.save(target, 'WEBP', lossless=True, exact=True, method=6)
    assert Image.open(target).convert('RGBA').tobytes() == canvas.tobytes()
    key = str(file.relative_to(static/'images/card'))
    entries[key] = {'url':'/assets/original/'+target.name,
                    'sha256':sha(target.read_bytes()), 'bytes':target.stat().st_size,
                    'source': 'client-files/static.godfield.net/images/card/'+key,
                    'sourceSha256': sha(file.read_bytes()), 'originalSize': list(image.size),
                    'sprite': {'x': 0, 'y': 0, 'width': cell, 'height': cell,
                               'atlasWidth': cell, 'atlasHeight': cell}}
approved, unavailable = {}, []
for card_id, (rule, data) in enumerate(zip(rules, display)):
    key = rule[0].lower()+'/'+data[0]+'.png'
    if key not in entries:
        unavailable.append({'cardId': card_id, 'expectedSource': key,
                            'randomDraw': bool(rule[10] and int(rule[10]) > 0)})
        continue
    approved[str(card_id)] = {'permissionConfirmed': True, **entries[key]}
assert len(approved) == 246 and not any(x['randomDraw'] for x in unavailable)
assistant_actions = {}
for index, data in enumerate(assistant_display):
    key = 'assistant/'+data[0]+'.png'
    assert key in entries, key
    assistant_actions[str(1000+index)] = {**entries[key]}
portraits = {}
for name in ['MARS','MERCURY','JUPITER','SATURN','URANUS','PLUTO','NEPTUNE','VENUS','EARTH','MOON']:
    portraits[name] = {**entries['assistant/'+name.lower()+'.png']}
manifest = {'default': {'url':'/assets/card-placeholder.svg','origin':'new-code-native-vector','reuse':'project-original'},
            'permission': {'basis':'user-confirmation','date':'2026-10-17',
                           'statement':'사용자가 이 프로젝트의 원본 카드 이미지·사운드 사용 허가를 받았다고 확인함',
                           'independentDocumentVerification':False,'mediaRelicensedUnderAGPL':False},
            'sourceCommit':'fcc83740a3d3cd9968e6e5cd2b7ed781f53abe80',
            'mappingEvidence': {'method':'SWF SymbolClass/DefineBinaryData extraction; ItemData list index + ItemImage path constructor',
                                'embeddedRulesMatchServerCSV':True,'displayDataSha256':sha(display_bytes),
                                'assistantDataSha256':sha(assistant_bytes)},
            'originalCardMappingsVerified':True, 'approvedOriginalAssets':approved,
            'unavailableOriginalCards':unavailable, 'assistantActions':assistant_actions,
            'summonPortraits':portraits,
            'imageFiles':entries,
            'conversion':'RGBA centered in 80x80 without scaling; lossless exact WebP'}
dump(root/'data/asset-manifest.json',manifest)
sounds_dir = root/'client/public/sounds/original'; sounds_dir.mkdir(parents=True, exist_ok=True)
sounds = {}
for file in sorted((static/'sounds').glob('*.mp3')):
    shutil.copyfile(file, sounds_dir/file.name)
    sounds[file.stem] = {'url':'/sounds/original/'+file.name,'bytes':file.stat().st_size,
                         'sha256':sha(file.read_bytes()),'source':'client-files/static.godfield.net/sounds/'+file.name}
assert len(sounds) == 46
dump(root/'data/sound-assets.json', {'permissionBasis':'user-confirmation-2026-10-17','clips':sounds,
                                   'originalBackgroundMusicPresent':False})
print(json.dumps({'mappedCards':len(approved),'unavailableWeightZeroCards':len(unavailable),
                  'assistantActions':len(assistant_actions),'images':len(entries),'imageBytes':sum(x['bytes'] for x in entries.values()),
                  'sounds':len(sounds),'soundBytes':sum(x['bytes'] for x in sounds.values())}))
