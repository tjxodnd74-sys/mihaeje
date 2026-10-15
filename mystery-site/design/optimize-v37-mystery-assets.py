import json
from pathlib import Path
from PIL import Image

repo = Path(__file__).resolve().parent.parent
manifest = json.loads((repo / 'design/v37-assets-mystery.json').read_text(encoding='utf-8'))
for theme in manifest['themes']:
    for asset in theme['assets']:
        source = Path(asset['source'])
        target = repo / asset['path']
        with Image.open(source) as img:
            img = img.convert('RGB')
            img.thumbnail((1440, 960), Image.Resampling.LANCZOS)
            img.save(target, 'WEBP', quality=83, method=6)
        with Image.open(target) as check:
            assert check.width == 1440 and check.height == 960
        print(f'{target.name}: {target.stat().st_size} bytes')
