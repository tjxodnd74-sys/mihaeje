#!/usr/bin/env python3
"""넥서스 TTS 귀 검사기 — 사람이 듣기 전에 기계로 먼저 '들어 보는' 검사.

사용:
  python3 tts_check.py --audio voice.wav --script lines.txt [--mixed] [--out report_dir]
  - voice.wav : 배경음 섞기 전 목소리(권장). 이미 섞인 영상/음성이면 --mixed (기준을 조금 낮춤)
  - lines.txt : 한 줄 = 한 문장, '읽히는 그대로'(챗GPT → 챗지피티, 2분 → 이 분)

검사 항목(줄마다):
  1) 발음: whisper로 받아 적어 대본과 글자 비교(CER) → 틀린 단어 표시
  2) 자연스러움: UTMOS(합성 음성 MOS 예측, 1~5)
  3) 억양: 피치 범위(반음) — 너무 좁으면 '로봇 같은 한 톤'
  4) 문장 끝: 평서문인데 끝이 들리면/의문문인데 끝이 처지면 표시
  5) 속도: 초당 음절 수, 줄 사이 쉼
결과: report.txt(한국어), report.json, pitch.png(줄별 억양 그래프). 종료코드 0=통과, 1=다시 녹음 필요.
"""
import argparse, json, os, re, sys, difflib
import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
UTMOS = os.path.join(HERE, "utmos22_strong.onnx")
UTMOS_URL = "https://huggingface.co/TigreGotico/utmos-onnx/resolve/main/utmos22_strong.onnx"


def load16k(path):
    import subprocess, tempfile
    tmp = tempfile.mktemp(suffix=".wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", tmp], check=True)
    a, sr = sf.read(tmp, dtype="float32"); os.remove(tmp)
    return a, sr


def hangul(s):
    return re.sub(r"[^가-힣0-9A-Za-z]", "", s)


def cer(ref, hyp):
    r, h = hangul(ref), hangul(hyp)
    if not r: return 0.0
    sm = difflib.SequenceMatcher(None, r, h)
    return 1 - sm.ratio()


def diff_words(ref, hyp):
    """띄어쓰기·문장부호는 무시하고 글자 단위로 다른 곳만 앞뒤 2글자와 함께 보여 줌."""
    r, h = hangul(ref), hangul(hyp)
    bad = []
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, r, h).get_opcodes():
        if tag != "equal":
            bad.append(f"'{r[max(0,i1-2):i2+2]}' → 들린 말 '{h[max(0,j1-2):j2+2]}'")
    return bad


def align(lines, words):
    """whisper 단어 시퀀스를 대본 줄에 순서대로 배분(글자 수 누적 기준 + 유사도 보정)."""
    out, wi = [], 0
    for li, line in enumerate(lines):
        target = hangul(line)
        best = None
        acc = ""
        for wj in range(wi, len(words) + 1):
            if wj > wi:
                acc += hangul(words[wj - 1].word)
            if wj == wi: continue
            score = difflib.SequenceMatcher(None, target, acc).ratio()
            if best is None or score > best[0] + 1e-6:
                best = (score, wj)
            if len(acc) > len(target) * 1.6 + 4: break
        if best is None:
            out.append((line, "", None, None)); continue
        seg = words[wi:best[1]]
        hyp = " ".join(w.word.strip() for w in seg)
        out.append((line, hyp, seg[0].start, seg[-1].end))
        wi = best[1]
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True); ap.add_argument("--script", required=True)
    ap.add_argument("--mixed", action="store_true"); ap.add_argument("--out", default="tts_report")
    ap.add_argument("--model", default="small")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    lines = [l.strip() for l in open(a.script, encoding="utf-8-sig") if l.strip()]
    audio, sr = load16k(a.audio)

    from faster_whisper import WhisperModel
    wm = WhisperModel(a.model, device="cpu", compute_type="int8")
    segs, _ = wm.transcribe(audio, language="ko", word_timestamps=True)
    words = [w for s in segs for w in (s.words or [])]
    al = align(lines, words)

    import onnxruntime as ort
    if not os.path.exists(UTMOS):
        os.system(f"curl -sL -o '{UTMOS}' '{UTMOS_URL}'")
    mos_s = ort.InferenceSession(UTMOS, providers=["CPUExecutionProvider"])
    mos = lambda w: float(mos_s.run(None, {"wave": w[None].astype(np.float32)})[0][0])

    import parselmouth
    snd = parselmouth.Sound(audio.astype(np.float64), sampling_frequency=sr)
    pitch = snd.to_pitch(time_step=0.01, pitch_floor=70, pitch_ceiling=500)
    f0 = pitch.selected_array["frequency"]; tt = pitch.xs()
    st = lambda x: 12 * np.log2(np.maximum(x, 1) / 100)

    TH = dict(cer=0.12, mos=2.6 if a.mixed else 3.0, rng=4.0, rate_hi=7.8, rate_lo=3.2, gap_hi=1.0)
    rows, fails = [], []
    prev_end = None
    for i, (line, hyp, s, e) in enumerate(al, 1):
        r = dict(no=i, script=line, heard=hyp)
        prob = []
        if s is None:
            prob.append("이 줄이 안 들림(통째로 빠졌거나 뭉개짐)"); r.update(start=None)
        else:
            s0, e0 = max(0, s - 0.05), e + 0.15
            r.update(start=round(s, 2), end=round(e, 2))
            c = cer(line, hyp); r["cer"] = round(c, 3)
            dw = diff_words(line, hyp)
            if c > TH["cer"] or dw:
                prob.append("발음/단어 다르게 들림: " + "; ".join(dw[:3]) + " (발음 고치기: 띄어 쓰기·풀어 쓰기·다른 말로 바꾸기)")
            seg = audio[int(s0 * sr):int(e0 * sr)]
            if len(seg) > sr * 0.6:
                m = mos(seg); r["mos"] = round(m, 2)
                if m < TH["mos"]: prob.append(f"부자연스러움(MOS {m:.2f} < {TH['mos']})")
            msk = (tt >= s) & (tt <= e) & (f0 > 0)
            v = st(f0[msk])
            if len(v) > 10:
                rng = float(np.percentile(v, 90) - np.percentile(v, 10)); r["pitch_range"] = round(rng, 1)
                if rng < TH["rng"]: prob.append(f"억양이 한 톤(피치 폭 {rng:.1f}반음 < {TH['rng']})")
                tail = st(f0[(tt >= e - 0.35) & (tt <= e) & (f0 > 0)])
                body = np.median(v)
                if len(tail) > 3:
                    d = float(np.mean(tail) - body); r["end_vs_body"] = round(d, 1)
                    q = line.rstrip().endswith("?")
                    if q and d < -1.0: prob.append("질문인데 끝이 처짐")
                    if (not q) and d > 3.0: prob.append(f"평서문인데 끝이 들림(+{d:.1f}반음) — 어색한 올림")
            syl = len(re.findall(r"[가-힣]", line)) + len(re.findall(r"[0-9A-Za-z]", line))
            dur = max(0.3, e - s); rate = syl / dur; r["syll_per_sec"] = round(rate, 1)
            if rate > TH["rate_hi"]: prob.append(f"너무 빠름({rate:.1f}음절/초)")
            if rate < TH["rate_lo"]: prob.append(f"너무 느림({rate:.1f}음절/초)")
            if prev_end is not None and s - prev_end > TH["gap_hi"]:
                prob.append(f"앞 줄과 쉼이 김({s - prev_end:.1f}초)")
            prev_end = e
        r["problems"] = prob
        if prob: fails.append(i)
        rows.append(r)

    total = mos(audio) if len(audio) < sr * 60 else None
    verdict = "통과" if not fails else "다시 녹음 필요"
    rep = [f"TTS 귀 검사: {verdict}  (전체 MOS {total:.2f})" if total else f"TTS 귀 검사: {verdict}"]
    for r in rows:
        tag = "❌" if r["problems"] else "✅"
        rep.append(f"{tag} {r['no']:>2}. {r['script']}")
        rep.append(f"      들린 말: {r['heard']}")
        rep.append(f"      MOS {r.get('mos','-')} · 피치폭 {r.get('pitch_range','-')}반음 · 끝 {r.get('end_vs_body','-')} · 속도 {r.get('syll_per_sec','-')}음절/초")
        for p in r["problems"]: rep.append(f"      → {p}")
    txt = "\n".join(rep)
    open(os.path.join(a.out, "report.txt"), "w", encoding="utf-8").write(txt)
    json.dump(dict(verdict=verdict, total_mos=total, rows=rows, fail_lines=fails), open(os.path.join(a.out, "report.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    try:
        import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
        fig, ax = plt.subplots(figsize=(14, 3.5))
        m = f0 > 0; ax.plot(tt[m], st(f0[m]), ".", ms=2)
        for r in rows:
            if r.get("start") is not None:
                ax.axvspan(r["start"], r["end"], color="red" if r["problems"] else "green", alpha=.08)
                ax.text(r["start"], ax.get_ylim()[1] if False else 30, str(r["no"]), fontsize=8)
        ax.set_xlabel("sec"); ax.set_ylabel("semitone"); fig.tight_layout(); fig.savefig(os.path.join(a.out, "pitch.png"), dpi=90)
    except Exception as ex:
        print("plot skip", ex)
    print(txt)
    sys.exit(0 if not fails else 1)


if __name__ == "__main__":
    main()
