"""Extract single-character Korean readings and definitions, then split for lazy loading."""
import hashlib
import json
from pathlib import Path
import re
import sys
from zipfile import ZipFile

dictionary, archive, unicode_license = (Path(arg) for arg in sys.argv[1:])
destination = Path(__file__).resolve().parents[1] / 'dist' / 'data'
destination.mkdir(exist_ok=True)
source = dictionary.read_text(encoding='utf-8')
notice = source.split('\n\n', 1)[0]
(destination / 'libhangul-LICENSE.txt').write_text(
    '\n'.join(line.removeprefix('#').removeprefix(' ') for line in notice.splitlines()) + '\n',
    encoding='utf-8',
)
(destination / 'unicode-LICENSE.txt').write_bytes(unicode_license.read_bytes())

entries = {}
for line in source.splitlines():
    if line.startswith('#'):
        continue
    parts = line.split(':', 2)
    if len(parts) != 3:
        continue
    reading, char, gloss = parts
    if not re.fullmatch('[가-힣]', reading) or len(char) != 1:
        continue
    readings, _, _ = entries.setdefault(char, [{}, None, []])
    if gloss.strip() or reading not in readings:
        readings[reading] = gloss.strip()

with ZipFile(archive) as bundle:
    for line in bundle.read('Unihan_Readings.txt').decode().splitlines():
        if '\tkHangul\t' not in line:
            continue
        cp, _, values = line.split('\t', 2)
        char = chr(int(cp[2:], 16))
        readings, _, _ = entries.setdefault(char, [{}, None, []])
        for sound in re.findall('[가-힣]', values):
            readings.setdefault(sound, '')

    for filename in bundle.namelist():
        if filename not in ('Unihan_IRGSources.txt', 'Unihan_DictionaryLikeData.txt', 'Unihan_Variants.txt'):
            continue
        for line in bundle.read(filename).decode().splitlines():
            if '\tkTotalStrokes\t' not in line and '\tkCompatibilityVariant\t' not in line:
                continue
            cp, key, value = line.split('\t', 2)
            char = chr(int(cp[2:], 16))
            if char in entries:
                if key == 'kTotalStrokes':
                    entries[char][1] = int(value.split()[0])
                elif re.fullmatch(r'U\+[0-9A-F]+', value):
                    entries[char][2].append(chr(int(value[2:], 16)))

shards = [{} for _ in range(8)]
for char, (readings, strokes, variants) in sorted(entries.items()):
    if readings:
        shards[ord(char) % len(shards)][char] = [list(readings.items()), strokes, variants]

for number, shard in enumerate(shards):
    data = json.dumps(shard, ensure_ascii=False, separators=(',', ':'))
    (destination / f'hanja-{number}.js').write_text(
        f'window.SajuName.install({number},{data});\n', encoding='utf-8',
    )

manifest = {'count': sum(map(len, shards)), 'parts': len(shards), 'unihan': '17.0.0',
            'libhangul_sha256': hashlib.sha256(dictionary.read_bytes()).hexdigest()}
(destination / 'hanja-meta.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
print(manifest)
