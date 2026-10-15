import pathlib,wave,struct,math,json,shutil
root=pathlib.Path(__file__).resolve().parents[1]; originals=root.parent/'foley-originals'; output=root/'dist/assets/sounds'; effects=[]
for source,name in [('turn_page.wav','paper-turn-v23'),('drawer_open.wav','drawer-open-v23'),('door_open.wav','door-open-v23'),('door_creak_open.wav','door-creak-v23'),('door_close.wav','door-close-v24'),('door_creak_close.wav','door-creak-close-v24'),('pickup_keys.wav','keys-v24'),('switch_on.wav','switch-on-v24'),('switch_off.wav','switch-off-v24'),('lock.wav','lock-v24')]:
 p=next((originals/'various').rglob(source))
 with wave.open(str(p),'rb') as w:
  assert w.getnchannels()==1 and w.getsampwidth()==2
  rate=w.getframerate();data=[v/32768 for v in struct.unpack('<'+'h'*w.getnframes(),w.readframes(w.getnframes()))]
 alpha=math.exp(-2*math.pi*45/rate);last_in=0;last_out=0;filtered=[]
 for v in data:
  y=alpha*(last_out+v-last_in);filtered.append(y);last_in=v;last_out=y
 peak=max(abs(v) for v in filtered);threshold=peak*.015
 start=next(i for i,v in enumerate(filtered) if abs(v)>threshold);end=len(filtered)-next(i for i,v in enumerate(reversed(filtered)) if abs(v)>threshold)
 filtered=filtered[max(0,start-int(rate*.018)):min(len(filtered),end+int(rate*.05))]
 rms=math.sqrt(sum(v*v for v in filtered)/len(filtered));gain=min(.07/max(rms,.001),.65/max(abs(v) for v in filtered))
 target_rate=24000;count=int(len(filtered)*target_rate/rate);result=[]
 for i in range(count):
  pos=i*rate/target_rate;j=int(pos);f=pos-j;v=filtered[j]*(1-f)+filtered[min(j+1,len(filtered)-1)]*f
  fade=min(1,i/(target_rate*.008),(count-1-i)/(target_rate*.015));result.append(round(v*gain*max(0,fade)*32767))
 target=output/(name+'.wav')
 with wave.open(str(target),'wb') as w:
  w.setnchannels(1);w.setsampwidth(2);w.setframerate(target_rate);w.writeframes(struct.pack('<'+'h'*count,*result))
 effects.append({'file':target.name,'recording':source,'seconds':round(count/target_rate,3),'bytes':target.stat().st_size,'source':'laleksic'})
shutil.copyfile(originals/'paper2.mp3',output/'paper-turn-alt-v23.mp3');effects.append({'file':'paper-turn-alt-v23.mp3','recording':'paper_sound_-_2.mp3','source':'Luckius'})
manifest={'kind':'Real object recordings replacing retired procedural effects','license':'CC0','sources':[{'author':'laleksic','url':'https://opengameart.org/node/143670'},{'author':'Luckius','url':'https://opengameart.org/content/various-paper-sound-effects'}],'processing':'45Hz rumble reduction, level matching, edge fades, 24kHz mono WAV; alternate MP3 unmodified','effects':effects}
(root/'design/foley.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8')
(output/'CREDITS.txt').write_text('CC0 recordings by laleksic: https://opengameart.org/node/143670\nCC0 paper recording by Luckius: https://opengameart.org/content/various-paper-sound-effects\nWAV edits: rumble reduction, level matching, edge fades, sample rate conversion\n',encoding='utf8');print(json.dumps(effects))
