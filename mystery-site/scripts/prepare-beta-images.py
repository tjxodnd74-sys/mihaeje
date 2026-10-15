from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = Path('C:/Users/PC/.codex/generated_images/01a11480-2e41-7ce1-9854-b20029fcd18b')
images = {
    'laundry-entry': '6ccdce15-706b-4be4-991a-e5259602cd52',
    'laundry-inner': '2a763aab-0fe0-4cfa-83b5-e623b988ba48',
    'laundry-tool': '30df8def-1cce-438e-87a4-15c1ca37de32',
    'cat-invite-entry': '72e64b4b-5cdf-4df6-89ba-ea84c1ffe441',
    'cat-invite-inner': '47c172b0-c098-4fef-9f17-d8325776dc0b',
    'cat-invite-tool': '09716260-c7eb-42e7-b3b8-b281998cdc0b',
}
for name, image_id in images.items():
    image = Image.open(source / ('exec-' + image_id + '.png')).convert('RGB')
    if name.endswith('-tool'):
        image.thumbnail((640, 640), Image.Resampling.LANCZOS)
    target = root / 'dist/assets/photoreal' / (name + '-v2.webp')
    image.save(target, quality=85, method=6)
    print(target.name, target.stat().st_size)
    if name.endswith('-entry'):
        case = name.removesuffix('-entry')
        for width, suffix in [(1536, '-v1'), (960, '-960-v2'), (480, '-480-v2')]:
            cover = image.copy()
            cover.thumbnail((width, width), Image.Resampling.LANCZOS)
            target = root / 'dist/assets/covers' / (case + suffix + '.webp')
            cover.save(target, quality=82, method=6)
