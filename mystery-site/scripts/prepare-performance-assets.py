"""Encoding-only derivatives; retain the original photographs and font shapes."""
import json, pathlib, re, sys
from fontTools import subset
from fontTools.ttLib import TTFont
from PIL import Image

root = pathlib.Path(__file__).resolve().parents[1]
web = root / 'web'
text = ''.join(p.read_text(encoding='utf-8') for p in web.rglob('*') if p.suffix in {'.js','.html','.json','.css'} and 'game-bundles' not in p.parts)
unicodes = set(map(ord, text)) | set(range(32, 127))
font = TTFont(web/'assets/SUIT-Variable.woff2')
available = set(font.getBestCmap())
options = subset.Options(); options.flavor='woff2'; options.layout_features=['*']; options.name_IDs=['*']; options.name_legacy=True; options.name_languages=['*']
s = subset.Subsetter(options=options); s.populate(unicodes=unicodes & available); s.subset(font)
font.flavor='woff2'; font.save(web/'assets/SUIT-Game-v53.woff2')
assert set(TTFont(web/'assets/SUIT-Game-v53.woff2').getBestCmap()) >= unicodes & available
remaining=sorted(available-unicodes);ranges=[]
for number in remaining:
    if ranges and number==ranges[-1][1]+1:ranges[-1][1]=number
    else:ranges.append([number,number])
cssrange=','.join('U+%X'%a if a==b else 'U+%X-%X'%(a,b) for a,b in ranges)
(web/'font-fallback-v53.css').write_text("@font-face{font-family:SUIT;src:url('../assets/SUIT-Variable.woff2') format('woff2');font-weight:100 900;font-display:swap;unicode-range:"+cssrange+'}',encoding='utf-8')
if '--font-only' in sys.argv:
    print('Font subset and lazy full-font fallback prepared; all authored glyphs preserved.');sys.exit()
assets={}
for p in (web/'assets/photoreal').glob('*.webp'):
    if re.search(r'-\d+-perf53$',p.stem): continue
    with Image.open(p) as original:
        if original.width <= 960: continue
        variants=[]
        for width in [480,960]:
            target=p.with_name(p.stem+'-'+str(width)+'-perf53.webp')
            size=(width,round(original.height*width/original.width))
            original.resize(size,Image.Resampling.LANCZOS).save(target,'WEBP',quality=88,method=6)
            variants.append([target.relative_to(web).as_posix(),width,target.stat().st_size])
        assets[p.relative_to(web).as_posix()]={'width':original.width,'height':original.height,'variants':variants,'originalBytes':p.stat().st_size}
(web/'responsive-assets-v53.js').write_text('window.MihaejeImageVariants='+json.dumps(assets,separators=(',',':'))+';\n',encoding='utf-8')
(root/'design/performance-assets-v53.json').write_text(json.dumps({'font':{'originalBytes':(web/'assets/SUIT-Variable.woff2').stat().st_size,'subsetBytes':(web/'assets/SUIT-Game-v53.woff2').stat().st_size,'glyphs':len(unicodes & available)},'images':assets},ensure_ascii=False,indent=2),encoding='utf-8')
print('Preserved all',len(unicodes & available),'used font characters;',len(assets),'photographs now have responsive encoding variants.')
