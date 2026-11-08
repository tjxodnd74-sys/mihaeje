import json, re
T = json.load(open('times.json')); TOTAL = 82.75
D = ["하이브리드,/몇 km를 타야/본전일까요?",
"차 살 때/많이들 고민하죠./하이브리드냐,/가솔린이냐.",
"하이브리드가/기름은 덜 먹는데,/차값이 더 비싸거든요.",
"2027 쏘렌토 노블레스,/2WD 5인승 기준으로/볼게요.",
"2.5 가솔린 터보는/3,966만 원,/하이브리드는/세제 혜택 반영해서/4,299만 원.",
"차이는/333만 원이에요.",
"복합연비는/가솔린 터보가/리터당 10.8km,/하이브리드는/15.7km예요.",
"휘발유 전국 평균,/리터당 1,855원으로/계산해 볼게요.",
"1km를 달릴 때/가솔린 터보는/약 172원,/하이브리드는/약 118원.",
"1km마다/54원 정도/아끼는 셈이죠.",
"333만 원을/54원으로 나누면,/약 6만 2천 km.",
"1년에/1만 5천 km를 탄다면,/4년 조금 넘게/타야 본전이에요.",
"그런데/어디를 달리느냐에 따라/확 달라져요.",
"막히는 도심만 달리면,/하이브리드가/전기모터를 자주 써서/약 3만 9천 km면/본전.",
"고속도로만 달리면/연비 차이가 작아서,/약 21만 km까지/늘어나요.",
"대신 가솔린 터보는/281마력으로/힘이 더 넉넉하고,/차값 부담도 적어요.",
"1년에 많이 타고/출퇴근길이 막힌다면,/하이브리드.",
"주말에만 타거나/고속도로 위주라면,/가솔린 터보도/충분히 괜찮아요.",
"보험료나 중고차 값은 빼고,/기름값만 따진/계산이에요.",
"결국 하이브리드는/차값을 먼저 내고,/기름값으로/천천히 돌려받는/선택이에요.",
"내 1년 주행거리부터/확인해 보세요."]

def spoken_len(s):
    n = 0
    for tok in re.findall(r'\d[\d,\.]*|[A-Za-z]+|[가-힣]|.', s):
        if tok[0].isdigit():
            n += sum(1.6 for ch in tok if ch.isdigit()) + tok.count('.')
        elif tok.lower() == 'km': n += 2
        elif tok.upper() == 'WD': n += 3
        elif re.match(r'[가-힣]', tok): n += 1
        elif tok in ',.?': n += 0.6
    return max(n, 1)

def chunks(s):
    return [c.strip().rstrip(',') for c in s.split('/')]
def _old_chunks(s):
    parts = [p.strip() for p in re.split(r'(?<=[,\.\?])\s+', s) if p.strip()]
    out = []
    for p in parts:
        words = p.split(' '); cur = ''
        for w in words:
            if cur and len((cur + ' ' + w).replace(' ', '')) > 11: out.append(cur); cur = w
            else: cur = (cur + ' ' + w).strip()
        if cur: out.append(cur)
    # merge tiny tails
    m = []
    for c in out:
        if m and len(c.replace(' ', '')) <= 3: m[-1] += ' ' + c
        else: m.append(c)
    return [c.rstrip(',.') if c.endswith(',') else c for c in m]

def caps(i, t0):
    a, b = T[i]; cs = chunks(D[i]); w = [spoken_len(c) for c in cs]; tot = sum(w); t = a; r = []
    for c, x in zip(cs, w):
        d = (b - a) * x / tot; r.append([round(t - t0, 3), round(t + d - t0, 3), c]); t += d
    return r

def focus(px, py, k):  # translate so image point (px,py in 1080x1920) is centred at scale k, clamped to avoid edges
    tx = -(px - 540) * k; ty = -(py - 960) * k
    mx, my = (k - 1) * 540, (k - 1) * 960
    return max(-mx, min(mx, tx)), max(-my, min(my, ty))

def img(n, frac=1, s0=1.0, s1=1.06, fx=None, fy=None, blur=0):
    d = dict(src=f'img/s{n:02d}.jpg', frac=frac, s0=s0, s1=s1)
    if fx is not None:
        d['x'], d['y'] = focus(fx, fy, s0); d['x1'], d['y1'] = focus(fx, fy, s1)
    if blur: d['blur'] = blur
    return d
def vid(n, frac=1, s0=1.0, s1=1.03, rate=1, v0=0):
    return dict(src=f'clips/c{n:02d}.webm', frac=frac, s0=s0, s1=s1, rate=rate, v0=v0)

starts = [0] + [T[i][0] - 0.12 for i in range(1, 21)]
durs = [(starts[i + 1] if i < 20 else TOTAL) - starts[i] for i in range(21)]
R = lambda i, f=1: min(1, 3.9 / (durs[i] * f))
SH = {
 0: ([vid(0, rate=R(0))], None),
 1: ([img(1, .55, 1.04, 1.1), img(0, .45, 1.55, 1.62, 500, 1110)], None),
 2: ([img(2, .6, 1.0, 1.07), img(2, .4, 1.35, 1.4, 540, 700)], None),
 3: ([img(3, 1, 1.0, 1.07)], dict(type='chip', top=250, text='2027 쏘렌토 노블레스', small='2WD · 5인승 기준')),
 4: ([img(3, 1, 1.12, 1.16, blur=14)], dict(type='prices')),
 5: ([img(2, 1, 1.12, 1.16, blur=14)], dict(type='diff')),
 6: ([img(0, 1, 1.12, 1.16, blur=14)], dict(type='mpg')),
 7: ([vid(4, .6), img(4, .4, 1.5, 1.56, 230, 760)], dict(type='chip', top=250, text='휘발유 전국 평균 1,855원/L', small='오피넷 11.6')),
 8: ([img(4, 1, 1.12, 1.16, blur=14)], dict(type='perkm')),
 9: ([img(4, 1, 1.12, 1.16, blur=14)], dict(type='save')),
 10: ([img(0, 1, 1.12, 1.16, blur=16)], dict(type='gauge')),
 11: ([vid(5, rate=R(11))], dict(type='years')),
 12: ([img(6, 1, 1.0, 1.14)], dict(type='chip', top=250, text='도심 vs 고속도로')),
 13: ([vid(7, .55), img(7, .45, 1.45, 1.52, 830, 560)], dict(type='badge', label='막히는 도심만 달리면', value='약 3만 9천 km', bg='#16a34a', fg='#fff', top=260)),
 14: ([vid(8, rate=R(14))], dict(type='badge', label='고속도로만 달리면', value='약 21만 km', bg='#ef6c3a', fg='#fff', top=260)),
 15: ([vid(9, .6), img(9, .4, 1.4, 1.46, 620, 1080)], dict(type='badge', label='2.5 가솔린 터보 최고출력', value='281마력', top=260)),
 16: ([img(10, 1, 1.0, 1.08)], dict(type='verdict', label='많이 타고, 출퇴근길이 막힌다면', value='하이브리드', color='#16a34a')),
 17: ([img(11, .55, 1.0, 1.06), img(11, .45, 1.5, 1.56, 400, 1210)], dict(type='verdict', label='주말·고속도로 위주라면', value='가솔린 터보', color='#ef6c3a')),
 18: ([img(12, 1, 1.0, 1.08)], dict(type='note', text='보험료·중고차 값은 빼고<br>기름값만 계산했어요')),
 19: ([vid(13, rate=R(19))], None),
 20: ([vid(14, rate=R(20))], dict(type='end')),
}
segs = []
for i in range(21):
    shots, o = SH[i]
    segs.append(dict(t0=round(starts[i], 3), speakEnd=T[i][1], shots=shots, ov=o, caps=caps(i, starts[i])))
json.dump(dict(total=TOTAL, segs=segs), open('spec_full.json', 'w'), ensure_ascii=False, indent=1)
for s in segs: print(round(s['t0'], 2), [c[2] for c in s['caps']])
