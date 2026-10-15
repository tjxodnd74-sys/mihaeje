"""Prepare attributed, quiet circular music beds from the official artist catalog."""
import concurrent.futures, json, pathlib, subprocess, sys, urllib.request
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[2]/'music-tools'))
import imageio_ffmpeg
ROOT=pathlib.Path(__file__).resolve().parents[1]
SPEC=json.loads((ROOT/'design/music-v33.json').read_text(encoding='utf-8'))
ORIGINALS=ROOT.parent/'music-originals-v33'; ORIGINALS.mkdir(exist_ok=True)
OUT=ROOT/'dist/assets/music'; OUT.mkdir(parents=True,exist_ok=True)
FFMPEG=imageio_ffmpeg.get_ffmpeg_exe()
def prepare(track):
    source='https://incompetech.com/music/royalty-free/mp3-royaltyfree/'+urllib.parse.quote(track['filename'])
    raw=ORIGINALS/track['filename']
    if not raw.exists():
        req=urllib.request.Request(source,headers={'User-Agent':'Mihaeje music asset preparation'})
        with urllib.request.urlopen(req,timeout=90) as response,raw.open('wb') as dest:
            while chunk:=response.read(1024*1024): dest.write(chunk)
    n=track['seconds']; overlap=4; output=OUT/(track['case']+'-v33.mp3')
    # Tail overlaps the beginning; the final middle sample then joins the next start.
    # The steady-state crossfade occurs at the loop boundary without inserting silence.
    graph=(f'[0:a]atrim=0:{n},asetpts=PTS-STARTPTS,asplit=3[h][m][t];'
           f'[h]atrim=0:{overlap},asetpts=PTS-STARTPTS,apad=whole_dur={overlap},atrim=duration={overlap},afade=t=in:st=0:d={overlap}[head];'
           f'[m]atrim={overlap}:{n-overlap},asetpts=PTS-STARTPTS[mid];'
           f'[t]atrim={n-overlap}:{n},asetpts=PTS-STARTPTS,apad=whole_dur={overlap},atrim=duration={overlap},afade=t=out:st=0:d={overlap}[tail];'
           '[tail][head]amix=inputs=2:normalize=0:duration=longest[seam];'
           '[seam][mid]concat=n=2:v=0:a=1,loudnorm=I=-22:TP=-2:LRA=7[a]')
    subprocess.run([FFMPEG,'-hide_banner','-loglevel','error','-y','-i',str(raw),'-filter_complex',graph,
                    '-map','[a]','-ar','44100','-ac','2','-codec:a','libmp3lame','-b:a','80k',
                    '-metadata','title='+track['title'],'-metadata','artist=Kevin MacLeod',
                    '-metadata','comment=CC BY 4.0; excerpt, circular crossfade and loudness normalization',str(output)],check=True)
    track.update(source=source,file='assets/music/'+output.name,duration=n-overlap,bytes=output.stat().st_size)
    print(track['case']+': '+str(track['bytes'])+' bytes',flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool: list(pool.map(prepare,SPEC['tracks']))
(ROOT/'dist/assets/music/catalog-v33.json').write_text(json.dumps(SPEC,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
credits=['Music by Kevin MacLeod (incompetech.com)','Licensed under Creative Commons: By Attribution 4.0','https://creativecommons.org/licenses/by/4.0/','Changes: '+SPEC['processing'],'']
credits += [t['case']+' — "'+t['title']+'" / '+t['isrc']+'\n'+t['source']+'\n' for t in SPEC['tracks']]
(OUT/'CREDITS.txt').write_text('\n'.join(credits),encoding='utf-8')
