"""앱 아이콘·스플래시·스토어 그림 만들기 (PIL)

쓰는 법:  python3 scripts/make-icons.py   (mystery-app 폴더에서)

- ../mystery-site/web/assets/app-icons/icon-foreground.png (투명 배경, 정사각) 가 있으면 그걸 쓴다
- 없으면 임시로 로고(mihaeje-logo-v1.png)의 문 모양을 잘라 밝은 색으로 칠해 쓴다
색은 app-info.json 의 backgroundColor 와 아래 FG 를 쓴다
"""
import json
import os
import sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.dirname(HERE)
SITE = os.path.join(APP, '..', 'mystery-site', 'web')
RES = os.path.join(APP, 'android', 'app', 'src', 'main', 'res')
STORE = os.path.join(APP, 'store')

info = json.load(open(os.path.join(APP, 'app-info.json'), encoding='utf-8'))
BG = info.get('iconBackground', '#1e2422')   # 사이트 favicon 과 같은 바탕
FG = (245, 236, 222)                         # favicon 의 #f5ecde
SPLASH_BG = info.get('backgroundColor', '#141a22')


def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def door_mark():
    """투명 배경에 밝은 색 문 모양 (정사각, 여백 없음)"""
    custom = os.path.join(SITE, 'assets', 'app-icons', 'icon-foreground.png')
    if os.path.exists(custom):
        print('app-icons/icon-foreground.png 사용')
        im = Image.open(custom).convert('RGBA')
        return im.crop(im.getbbox()), True
    print('app-icons 가 없어 로고의 문 모양으로 임시 아이콘을 만듭니다')
    logo = Image.open(os.path.join(SITE, 'assets', 'mihaeje-logo-v1.png')).convert('RGBA')
    alpha = logo.split()[3]
    left = alpha.crop((0, 0, 620, logo.height))   # 왼쪽 문 모양만 (글자 '미해제' 앞)
    box = left.getbbox()
    mask = left.crop(box)
    mark = Image.new('RGBA', mask.size, FG + (0,))
    mark.putalpha(mask)
    return mark, False


def square(mark, size, fill_ratio, bg=None):
    """size 정사각 캔버스 가운데에 mark 를 긴 변이 size*fill_ratio 가 되게"""
    canvas = Image.new('RGBA', (size, size), hex_rgb(bg) + (255,) if bg else (0, 0, 0, 0))
    scale = size * fill_ratio / max(mark.size)
    m = mark.resize((max(1, round(mark.width * scale)), max(1, round(mark.height * scale))), Image.LANCZOS)
    canvas.alpha_composite(m, ((size - m.width) // 2, (size - m.height) // 2))
    return canvas


def rounded(img, radius_ratio):
    mask = Image.new('L', img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, img.width - 1, img.height - 1), radius=round(img.width * radius_ratio), fill=255)
    out = Image.new('RGBA', img.size, (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def circle(img):
    mask = Image.new('L', img.size, 0)
    ImageDraw.Draw(mask).ellipse((0, 0, img.width - 1, img.height - 1), fill=255)
    out = Image.new('RGBA', img.size, (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def save(img, *parts):
    path = os.path.join(*parts)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, optimize=True)


def main():
    mark, _ = door_mark()
    dens = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
    for d, k in dens.items():
        legacy = round(48 * k)
        # 옛 안드로이드(8 미만)용: 둥근 사각 / 원
        full = square(mark, legacy, 0.62, BG)
        save(rounded(full, 0.18), RES, f'mipmap-{d}', 'ic_launcher.png')
        save(circle(full), RES, f'mipmap-{d}', 'ic_launcher_round.png')
        # 적응형 아이콘 앞면: 108dp 중 안전 영역 66dp 안에 들어가게 (긴 변 52dp)
        fg = round(108 * k)
        save(square(mark, fg, 52 / 108), RES, f'mipmap-{d}', 'ic_launcher_foreground.png')

    # 스플래시(안드로이드 11 이하): 어두운 바탕 가운데 문 모양
    port = {'mdpi': (320, 480), 'hdpi': (480, 800), 'xhdpi': (720, 1280), 'xxhdpi': (960, 1600), 'xxxhdpi': (1280, 1920)}
    for d, (w, h) in port.items():
        for orient, (W, H) in (('port', (w, h)), ('land', (h, w))):
            img = Image.new('RGBA', (W, H), hex_rgb(SPLASH_BG) + (255,))
            s = round(min(W, H) * 0.28)
            m = square(mark, s, 1.0)
            img.alpha_composite(m, ((W - s) // 2, (H - s) // 2))
            save(img.convert('RGB'), RES, f'drawable-{orient}-{d}', 'splash.png')
    base = Image.new('RGB', (480, 320), hex_rgb(SPLASH_BG))
    m = square(mark, 96, 1.0)
    base.paste(m, ((480 - 96) // 2, (320 - 96) // 2), m)
    save(base, RES, 'drawable', 'splash.png')

    # 안드로이드 12 이상 스플래시 아이콘 (240dp 중 가운데 160dp 원 안)
    for d, k in dens.items():
        s = round(240 * k)
        save(square(mark, s, 96 / 240), RES, f'drawable-{d}', 'splash_icon.png')

    # 스토어용: 아이콘 512, 그래픽 이미지 1024x500
    save(square(mark, 512, 0.62, BG).convert('RGB'), STORE, 'play-icon-512.png')
    feat = Image.new('RGBA', (1024, 500), hex_rgb(SPLASH_BG) + (255,))
    logo = Image.open(os.path.join(SITE, 'assets', 'mihaeje-logo-v1.png')).convert('RGBA')
    a = logo.split()[3]
    a = a.crop(a.getbbox())
    lw = 640
    a = a.resize((lw, round(a.height * lw / a.width)), Image.LANCZOS)
    tint = Image.new('RGBA', a.size, FG + (0,))
    tint.putalpha(a)
    feat.alpha_composite(tint, ((1024 - lw) // 2, (500 - a.height) // 2))
    save(feat.convert('RGB'), STORE, 'feature-graphic-1024x500.png')
    print('완료: android/app/src/main/res, store/')


if __name__ == '__main__':
    sys.exit(main())
