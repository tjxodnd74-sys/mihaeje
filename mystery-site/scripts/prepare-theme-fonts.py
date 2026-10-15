"""Download only public font files; subset all site text locally without uploading it."""
import pathlib,re,json,urllib.request,io,sys
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[2]/'mystery-font-tools'))
from fontTools import subset
from fontTools.ttLib import TTFont
root=pathlib.Path(__file__).resolve().parent.parent
corpus=''.join(p.read_text(encoding='utf-8') for p in (root/'dist').rglob('*') if p.suffix in ('.js','.html','.json'))
text=''.join(sorted(set(c for c in corpus if '\uac00'<=c<='\ud7a3' or 32<=ord(c)<127 or c in '“”‘’·↗←→✓')))
assets=root/'dist/assets/fonts';assets.mkdir(exist_ok=True)
specs=[('Gowun Dodum','MihaejePet',400,'gowundodum'),('Gowun Batang','MihaejeLetter',400,'gowunbatang'),('Gowun Batang','MihaejeLetter',700,'gowunbatang'),('Nanum Myeongjo','MihaejeArchive',400,'nanummyeongjo'),('Nanum Myeongjo','MihaejeArchive',700,'nanummyeongjo')]
css=[];report=[]
for family,alias,weight,folder in specs:
 filename_source=family.replace(' ','')+('-Bold.ttf' if weight==700 else '-Regular.ttf')
 url='https://raw.githubusercontent.com/google/fonts/main/ofl/'+folder+'/'+filename_source
 data=urllib.request.urlopen(url,timeout=45).read()
 font=TTFont(io.BytesIO(data));options=subset.Options();options.layout_features=['*'];options.name_IDs=['*'];options.name_legacy=True
 subsetter=subset.Subsetter(options=options);subsetter.populate(text=text);subsetter.subset(font)
 for record in font['name'].names:
  if record.nameID in (1,3,4,6,16):record.string=(alias+'Subset'+str(weight)).encode(record.getEncoding(),errors='replace')
 filename=alias+'-'+str(weight)+'.woff2';font.flavor='woff2';font.save(assets/filename)
 data=(assets/filename).read_bytes();fmt='woff2'
 css.append("@font-face{font-family:"+alias+";src:url('assets/fonts/"+filename+"') format('"+fmt+"');font-weight:"+str(weight)+";font-display:swap}")
 license_path=assets/(folder+'-OFL.txt')
 if not license_path.exists():license_path.write_bytes(urllib.request.urlopen('https://raw.githubusercontent.com/google/fonts/main/ofl/'+folder+'/OFL.txt',timeout=45).read())
 report.append({'family':family,'weight':weight,'characters':len(text),'bytes':len(data),'file':filename})
(root/'dist/theme-fonts.css').write_text('\n'.join(css)+'\n',encoding='utf-8')
(root/'design/theme-fonts.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
