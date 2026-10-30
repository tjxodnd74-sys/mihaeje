import json
V=json.load(open('voice.json'))['lines']
ORDER=['hook','zero','mission','try1','formula','try2','fix','mobile','tips','share','limit','end','outro']
def L(sc,i):return [l for l in V if l[3]==sc and l[4]==i][0][0]
def first(sc):return min(l[0] for l in V if l[3]==sc)
def end(sc):i=ORDER.index(sc);return first(ORDER[i+1])-0.35-0.65
D=dict(x=360,y=151,w=1200,h=750,kind='desk')
S=[dict(sc='hook',t0=L('hook',1)-0.3,t1=end('hook'),url='bomnal-flower.html',clips=[['final',0]],**D),
   dict(sc='try1',t0=L('try1',2)-0.2,t1=end('try1'),url='flower-shop.html  ·  1차 결과',clips=[['v1',0]],**D),
   dict(sc='try2',t0=L('try2',4)-0.2,t1=end('try2'),url='bomnal-flower.html  ·  2차 결과',clips=[['v2',0]],**D),
   dict(sc='fix',t0=L('fix',2)-0.2,t1=end('fix'),url='bomnal-flower.html  ·  수정 중',clips=[['price',0],['warm',L('fix',3)-0.3],['form',L('fix',4)-0.3]],**D),
   dict(sc='mobile',t0=first('mobile')+0.3,t1=end('mobile'),x=1250,y=150,w=340,h=736,kind='phone',url='',clips=[['mobile',0]])]
for s in S:
    s['clips'][0][1]=s['t0']
open('slots.js','w').write('window.SLOTS='+json.dumps(S,ensure_ascii=False)+';')
json.dump(S,open('slots.json','w'),ensure_ascii=False)
for s in S:print(s['sc'],round(s['t0'],2),round(s['t1'],2),[(c,round(t,2)) for c,t in s['clips']])
